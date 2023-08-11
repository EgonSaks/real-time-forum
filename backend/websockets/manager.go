package websockets

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/real-time-forum/backend/utils"
)

/*
*
websocketUpgrader is used to upgrade incoming HTTP requests into a persistent websocket connection
*/
var websocketUpgrader = websocket.Upgrader{
	ReadBufferSize:  4096,
	WriteBufferSize: 4096,
	CheckOrigin:     checkOrigin,
}

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
	Clients ClientList
	sync.RWMutex
	Handlers map[string]EventHandler
	Otps     RetentionMap
}

func NewManager(ctx context.Context) *Manager {
	manager := &Manager{
		Clients:  make(ClientList),
		Handlers: make(map[string]EventHandler),
		Otps:     NewRetentionMap(ctx, 5*time.Second),
	}
	manager.setupEventHandlers()
	return manager
}

func (manager *Manager) setupEventHandlers() {
	manager.Handlers[EventSendMessage] = SendMessageHandler
	manager.Handlers[EventChangeChat] = ChatHandler
}

func (manager *Manager) ServeWS(w http.ResponseWriter, r *http.Request) {
	otp := r.URL.Query().Get("otp")
	if otp == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	if !manager.Otps.VerifyOTP(otp) {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	log.Println("OTP verified")
	log.Println("Connection established")
	connection, err := websocketUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	user, ok := utils.GetUserFromSession(r)
	if !ok {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("User not found in session")
		return
	}

	client := NewClient(connection, manager, user.Username)
	manager.addClient(client)
	go client.readMessages()
	go client.writeMessages()
}

func (manager *Manager) addClient(client *Client) {
	manager.Lock()
	defer manager.Unlock()

	manager.Clients[client] = true
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
			return err
		}
		return nil
	} else {
		return ErrEventNotSupported
	}
}
