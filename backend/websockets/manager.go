package websockets

import (
	"context"
	"errors"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

/*
*
websocketUpgrader is used to upgrade incoming HTTP requests into a persistent websocket connection
*/
var websocketUpgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
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
	m := &Manager{
		Clients:  make(ClientList),
		Handlers: make(map[string]EventHandler),
		Otps:     NewRetentionMap(ctx, 5*time.Second),
	}
	m.setupEventHandlers()
	return m
}

// func (m *Manager) setupEventHandlers() {
// 	m.Handlers[EventSendMessage] = func(e Event, c *Client) error {
// 		fmt.Println(e)
// 		return nil
// 	}
// }

func (m *Manager) setupEventHandlers() {
	m.Handlers[EventSendMessage] = SendMessageHandler
}

func (m *Manager) ServeWS(w http.ResponseWriter, r *http.Request) {
	otp := r.URL.Query().Get("otp")
	if otp == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	if !m.Otps.VerifyOTP(otp) {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	log.Println("OTP verified")
	log.Println("Connection established")
	conn, err := websocketUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := NewClient(conn, m)
	m.addClient(client)
	go client.readMessages()
	go client.writeMessages()
}

func (m *Manager) addClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	m.Clients[client] = true
}

func (m *Manager) removeClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	if _, ok := m.Clients[client]; ok {
		client.connection.Close()
		delete(m.Clients, client)
	}
}

func (m *Manager) routeEvent(event Event, c *Client) error {
	if handler, ok := m.Handlers[event.Type]; ok {
		if err := handler(event, c); err != nil {
			return err
		}
		return nil
	} else {
		return ErrEventNotSupported
	}
}
