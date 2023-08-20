package websockets

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/real-time-forum/database/models"
	"github.com/real-time-forum/database/sqlite"
)

type Event struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type PastMessages struct {
	Messages []models.Message `json:"messages"`
}

type ChangeChatEvent struct {
	Name string `json:"username"`
}

type EventHandler func(event Event, removeClient *Client) error

const (
	EventSendMessage = "send_message"
	EventNewMessage  = "new_message"
	EventChangeChat  = "change_chat"
)

func SendMessage(event Event, client *Client) error {
	var chatMessage *models.Message
	if err := json.Unmarshal(event.Payload, &chatMessage); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}
	chatMessage.ID = uuid.New().String()
	chatMessage.Sent = time.Now().UTC()

	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	_, err = models.CreateMessage(database.DB, *chatMessage)
	if err != nil {
		return fmt.Errorf("failed to create message: %v", err)
	}

	data, err := json.Marshal(chatMessage)
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}

	var outgoingEvent Event
	outgoingEvent.Type = EventNewMessage
	outgoingEvent.Payload = data

	for c := range client.manager.Clients {
		if c.username == chatMessage.Receiver || c.username == chatMessage.Sender {
			c.egress <- outgoingEvent
		}
	}
	return nil
}

func GetPastMessages(client *Client, database *sqlite.Database, sender, receiver string) error {
	messages, err := models.GetMessages(database.DB, sender, receiver)
	if err != nil {
		return fmt.Errorf("failed to fetch previous messages: %v", err)
	}

	pastMessages := PastMessages{Messages: messages}
	pastMessagesJSON, err := json.Marshal(pastMessages)
	if err != nil {
		return fmt.Errorf("failed to marshal previous payload: %v", err)
	}

	previousMessages := Event{
		Type:    EventNewMessage,
		Payload: json.RawMessage(pastMessagesJSON),
	}

	client.egress <- previousMessages
	return nil
}

func ChangeChat(event Event, client *Client) error {
	var changeChat ChangeChatEvent
	if err := json.Unmarshal(event.Payload, &changeChat); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}
	client.chat = changeChat.Name

	database, err := sqlite.OpenDatabase()
	if err != nil {
		return fmt.Errorf("failed to open database: %v", err)
	}
	defer database.DB.Close()

	err = GetPastMessages(client, database, client.username, changeChat.Name)
	if err != nil {
		log.Printf("Failed to send previous messages: %v", err)
	}

	return nil
}
