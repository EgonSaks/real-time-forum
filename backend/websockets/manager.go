package websockets

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
	"github.com/real-time-forum/backend/logger"
	"github.com/real-time-forum/backend/utils"
	"github.com/real-time-forum/database/models"
)

var websocketUpgrader = websocket.Upgrader{
	ReadBufferSize:  4096,
	WriteBufferSize: 4096,
	CheckOrigin:     checkOrigin,
}

const UserStatusesRoutineInterval = 10 * time.Millisecond

func checkOrigin(r *http.Request) bool {
	origin := r.Header.Get("Origin")

	switch origin {
	case "http://localhost:8080":
		fallthrough
	case "https://localhost:8080":
		return true
	default:
		return false
	}
}

var ErrEventNotSupported = errors.New("this event type is not supported")

type Manager struct {
	Clients  ClientList
	Handlers map[string]EventHandler
	sync.RWMutex
}

func NewManager() *Manager {
	manager := &Manager{
		Clients:  make(ClientList),
		Handlers: make(map[string]EventHandler),
	}
	manager.setupEventHandlers()
	return manager
}

func (manager *Manager) setupEventHandlers() {
	manager.Handlers[EventSendMessage] = SendMessageHandler
	manager.Handlers[EventUpdateReadStatus] = UpdateMessageReadStatusHandler
	manager.Handlers[EventPastMessages] = GetPastMessagesHandler
	manager.Handlers[EventChangeChat] = ChangeChatHandler
}

func (manager *Manager) ServeWS(w http.ResponseWriter, r *http.Request) {
	user, ok := utils.GetUserFromSession(r)
	if !ok {
		return
	}

	connection, err := websocketUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := NewClient(connection, manager, user.Username)
	manager.addClient(client)

	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		sig := <-sigs
		log.Printf("Received signal %s. Cleaning up and shutting down.", sig)
		manager.CleanupAndShutdown()
		os.Exit(0)
	}()

	go manager.GetUserStatusesRoutine(user.Username)
	go client.readMessages()
	go client.writeMessages()
}

func (manager *Manager) addClient(client *Client) {
	manager.Lock()
	defer manager.Unlock()

	manager.Clients[client] = true
	UpdateUserStatus(client, true)
}

func (manager *Manager) removeClient(client *Client) {
	manager.Lock()
	defer manager.Unlock()

	if _, ok := manager.Clients[client]; ok {
		client.connection.Close()
		delete(manager.Clients, client)
	}
}

func (manager *Manager) routeEvent(event Event, client *Client) error {
	if handler, ok := manager.Handlers[event.Type]; ok {
		if err := handler(event, client); err != nil {
			logger.ErrorLogger.Printf("Failed to handle event: %v", err)
			return err
		}
		return nil
	} else {
		return ErrEventNotSupported
	}
}

func (manager *Manager) GetUserStatuses(currentUsername string) error {
	userStatuses, err := models.GetAllUserStatuses(currentUsername)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to get user statuses: %v", err)
		return fmt.Errorf("failed to get user statuses: %v", err)
	}

	// Check user activity and set status offline if inactive for a certain period
	threshold := time.Now().Add(-time.Minute * 15) // Example: 15 minutes of inactivity
	for _, userStatus := range userStatuses {
		if userStatus.LastSeen.Before(threshold) && userStatus.Status {
			UpdateUserStatus(&Client{username: userStatus.Username}, false) // Update status to offline
		}
	}

	userStatusesJSON, err := json.Marshal(userStatuses)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to marshal user statuses: %v", err)
		return fmt.Errorf("failed to marshal user statuses: %v", err)
	}

	statusUpdateEvent := Event{
		Type:    EventUserStatusUpdate,
		Payload: json.RawMessage(userStatusesJSON),
	}

	manager.RLock()
	defer manager.RUnlock()

	for c := range manager.Clients {
		c.egress <- statusUpdateEvent
	}

	return nil
}

func (manager *Manager) GetUserStatusesRoutine(currentUsername string) {
	ticker := time.NewTicker(UserStatusesRoutineInterval)
	defer ticker.Stop()

	for range ticker.C {
		if err := manager.GetUserStatuses(currentUsername); err != nil {
			logger.ErrorLogger.Printf("Failed to get and update user statuses: %v", err)
			log.Printf("Failed to get and update user statuses: %v", err)
		}
	}
}

func (manager *Manager) UpdateChatsOrder(sender, receiver string) error {
	_, err := models.GetChatInfo(sender)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to get user statuses: %v", err)
		return fmt.Errorf("failed to get user statuses: %v", err)
	}

	chatsOrderEvent := Event{
		Type: EventChatListUpdate,
	}

	manager.RLock()
	defer manager.RUnlock()

	for client := range manager.Clients {
		if client.username == sender || client.username == receiver {
			client.egress <- chatsOrderEvent
		}
	}

	return nil
}

func (manager *Manager) CleanupAndShutdown() {
	manager.Lock()
	defer manager.Unlock()

	for client := range manager.Clients {
		UpdateUserStatus(client, false)
	}
}

func (manager *Manager) CloseWebSocket(username string) {
	manager.Lock()
	defer manager.Unlock()

	for client := range manager.Clients {
		if client.username == username {
			client.connection.Close()

			UpdateUserStatus(client, false)

			delete(manager.Clients, client)
		}
	}
}
