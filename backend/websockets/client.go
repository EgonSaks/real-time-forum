package websockets

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	pongWait       = 10 * time.Second
	pingInterval   = (pongWait * 9) / 10
	maxMessageSize = 10000
)

type ClientList map[*Client]bool

type Client struct {
	connection *websocket.Conn
	manager    *Manager
	egress     chan Event
	chat       string
	username   string
	online     bool
	lastSeen   time.Time
}

func NewClient(connection *websocket.Conn, manager *Manager, username string) *Client {
	client := &Client{
		connection: connection,
		manager:    manager,
		egress:     make(chan Event),
		username:   username,
		online:     true,
		lastSeen:   time.Now(),
	}

	log.Println("New client created:", client.username)

	return client
}

func (client *Client) readMessages() {
	defer func() {
		client.manager.removeClient(client)
		client.online = false
	}()

	client.connection.SetReadLimit(maxMessageSize)
	if err := client.connection.SetReadDeadline(time.Now().Add(pongWait)); err != nil {
		log.Println(err)
		return
	}
	client.connection.SetPongHandler(client.pongHandler)

	client.lastSeen = time.Now()

	for {
		_, payload, err := client.connection.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error reading message: %v", err)
			}
			break
		}
		var request Event
		if err := json.Unmarshal(payload, &request); err != nil {
			log.Printf("error marshalling message: %v", err)
			break
		}
		if err := client.manager.routeEvent(request, client); err != nil {
			log.Println("Error handling Message: ", err)
		}
	}
}

func (client *Client) writeMessages() {
	ticker := time.NewTicker(pingInterval)
	defer func() {
		ticker.Stop()
		client.manager.removeClient(client)
	}()

	for {
		select {
		case message, ok := <-client.egress:
			if !ok {
				if err := client.connection.WriteMessage(websocket.CloseMessage, nil); err != nil {
					log.Println("connection closed: ", err)
				}
				return
			}

			data, err := json.Marshal(message)
			if err != nil {
				log.Println(err)
				return
			}
			if err := client.connection.WriteMessage(websocket.TextMessage, data); err != nil {
				log.Println(err)
			}
			log.Println("sent message")
		case <-ticker.C:

			client.manager.RLock()
			_, clientExists := client.manager.Clients[client]
			client.manager.RUnlock()

			if clientExists {
				client.online = true
				client.lastSeen = time.Now()
			} else {
				client.online = false
				return
			}
			// Send the Ping message to the client
			// log.Println("ping")
			if err := client.connection.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				log.Println("write message: ", err)
				return
			}
		}
	}
}

func (client *Client) pongHandler(pongMsg string) error {
	// log.Println("pong")
	return client.connection.SetReadDeadline(time.Now().Add(pongWait))
}
