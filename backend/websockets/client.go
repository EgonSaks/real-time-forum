package websockets

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
	"github.com/real-time-forum/backend/logger"
	"github.com/real-time-forum/database/sqlite"
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

	return client
}

func (client *Client) readMessages() {
	defer func() {
		client.manager.removeClient(client)
	}()

	client.connection.SetReadLimit(maxMessageSize)
	if err := client.connection.SetReadDeadline(time.Now().Add(pongWait)); err != nil {
		logger.ErrorLogger.Println(err)
		return
	}
	client.connection.SetPongHandler(client.pongHandler)

	for {
		_, message, err := client.connection.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				logger.ErrorLogger.Printf("error reading message: %v", err)
			}
			break
		}

		var request Event
		if err := json.Unmarshal(message, &request); err != nil {
			logger.ErrorLogger.Printf("error marshalling message: %v", err)
			break
		}

		database := sqlite.GetDatabaseInstance()
		if database == nil || database.DB == nil {
			logger.ErrorLogger.Printf("Database connection error")
			log.Fatal("Database connection error")
			return
		}

		if err := client.manager.routeEvent(request, client); err != nil {
			logger.ErrorLogger.Println("Error handling Message: ", err)
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
					logger.ErrorLogger.Println("connection closed: ", err)
				}
				return
			}

			data, err := json.Marshal(message)
			if err != nil {
				logger.ErrorLogger.Println(err)
				return
			}
			if err := client.connection.WriteMessage(websocket.TextMessage, data); err != nil {
				logger.ErrorLogger.Println(err)
			}
		case <-ticker.C:
			client.manager.RLock()
			_, clientExists := client.manager.Clients[client]
			client.manager.RUnlock()

			if !clientExists {
				return
			}
			if err := client.connection.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				logger.ErrorLogger.Println(err)
				return
			}
		}
	}
}

func (client *Client) pongHandler(pongMsg string) error {
	err := client.connection.SetReadDeadline(time.Now().Add(pongWait))
	if err != nil {
		logger.ErrorLogger.Printf("Failed to set read deadline: %v", err)
	}
	return err
}
