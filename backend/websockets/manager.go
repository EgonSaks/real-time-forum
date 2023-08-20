package websockets

import (
	"errors"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/real-time-forum/backend/utils"
)

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
	manager.Handlers[EventSendMessage] = SendMessage
	manager.Handlers[EventChangeChat] = ChangeChat
}

func (manager *Manager) ServeWS(w http.ResponseWriter, r *http.Request) {
	user, ok := utils.GetUserFromSession(r)
	if !ok {
		return
	}

	log.Println("Connection established")
	connection, err := websocketUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	log.Printf("Connection from %s\n", connection.RemoteAddr().String())

	client := NewClient(connection, manager, user.Username)
	manager.addClient(client)

	go client.readMessages()
	go client.writeMessages()
}

func (manager *Manager) addClient(client *Client) {
	manager.Lock()
	defer manager.Unlock()

	manager.Clients[client] = true
	log.Printf("%v is online\n", client.username)
}

func (manager *Manager) removeClient(client *Client) {
	manager.Lock()
	defer manager.Unlock()

	if _, ok := manager.Clients[client]; ok {
		client.connection.Close()
		delete(manager.Clients, client)
		log.Printf("%v is offline\n", client.username)
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

func (manager *Manager) CloseWebSocket(username string) {
	manager.Lock()
	defer manager.Unlock()

	for client := range manager.Clients {
		if client.username == username {
			client.connection.Close()
			delete(manager.Clients, client)
			log.Printf("%v is offline\n", client.username)
		}
	}
}