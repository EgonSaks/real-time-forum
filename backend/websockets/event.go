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

type MorePastMessages struct {
	MoreMessages bool   `json:"extraMessages"`
	Sender       string `json:"sender"`
	Receiver     string `json:"receiver"`
}

type ChangeChatEvent struct {
	Name string `json:"username"`
}

type UsersStatusUpdateEvent struct {
	Username string    `json:"username"`
	Status   bool      `json:"status"`
	LastSeen time.Time `json:"last_seen"`
}

type EventHandler func(event Event, client *Client, database *sqlite.Database) error

const (
	EventSendMessage      = "send_message"
	EventNewMessage       = "new_message"
	EventPastMessages     = "past_messages"
	EventChatListUpdate   = "chat_list_update"
	EventChangeChat       = "change_chat"
	EventUserStatusUpdate = "status_update"
)

func SendMessageHandler(event Event, client *Client, database *sqlite.Database) error {
	var chatMessage *models.Message
	if err := json.Unmarshal(event.Payload, &chatMessage); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}
	chatMessage.ID = uuid.New().String()
	chatMessage.Sent = time.Now().UTC()

	_, err := models.CreateMessage(database.DB, *chatMessage)
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

	err = client.manager.UpdateChatsOrder(chatMessage.Sender, chatMessage.Receiver)
	if err != nil {
		log.Printf("Failed to update chats order: %v", err)
	}

	return nil
}

func ChangeChatHandler(event Event, client *Client, database *sqlite.Database) error {
	// Get the username from the payload for the change chat
	var changeChat ChangeChatEvent
	if err := json.Unmarshal(event.Payload, &changeChat); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	// Send the username back to the client as a response
	response := ChangeChatEvent{
		Name: changeChat.Name,
	}

	responseData, err := json.Marshal(response)
	if err != nil {
		return fmt.Errorf("failed to marshal response: %v", err)
	}

	responseEvent := Event{
		Type:    EventChangeChat,
		Payload: responseData,
	}

	client.egress <- responseEvent

	err = GetPastMessagesHandler(event, client, database)
	if err != nil {
		log.Printf("Failed to send previous messages: %v", err)
	}

	return nil
}

func GetPastMessagesHandler(event Event, client *Client, database *sqlite.Database) error {
	var changeChat ChangeChatEvent
	if err := json.Unmarshal(event.Payload, &changeChat); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}
	sender, receiver := client.username, changeChat.Name

	var morePastMessages MorePastMessages
	if err := json.Unmarshal(event.Payload, &morePastMessages); err != nil {
		return fmt.Errorf("failed to unmarshal payload: %v", err)
	}

	fmt.Println("More past messages: ", morePastMessages)

	extraMessages := morePastMessages.MoreMessages

	fmt.Println("Extra messages: ", extraMessages)

	if extraMessages {
		fmt.Println("Fetching extra messages")
		fmt.Println("Sender: ", sender)
		fmt.Println("Receiver: ", receiver)
		messages, err := models.GetMessages(database.DB, morePastMessages.Sender, morePastMessages.Receiver)
		if err != nil {
			return fmt.Errorf("failed to fetch previous messages: %v", err)
		}

		fmt.Println("Extra messages: ", messages)

		extraPastMessages := PastMessages{
			Messages: messages,
		}

		fmt.Println("Extra extraPastMessages: ", extraPastMessages)

		extraPastMessagesJSON, err := json.Marshal(extraPastMessages)
		if err != nil {
			return fmt.Errorf("failed to marshal previous payload: %v", err)
		}

		pastMessages := Event{
			Type:    EventPastMessages,
			Payload: json.RawMessage(extraPastMessagesJSON),
		}

		fmt.Println("Sending extra messages")

		client.egress <- pastMessages
	} else {
		// Fetch the initial batch of messages
		fmt.Println("Fetching initial 10 messages")
		fmt.Println("Sender: ", sender)
		fmt.Println("Receiver: ", receiver)
		messages, err := models.GetMessages(database.DB, sender, receiver)
		if err != nil {
			return fmt.Errorf("failed to fetch previous messages: %v", err)
		}

		pastMessages := PastMessages{
			Messages: messages,
		}

		pastMessagesJSON, err := json.Marshal(pastMessages)
		if err != nil {
			return fmt.Errorf("failed to marshal previous payload: %v", err)
		}

		previousMessages := Event{
			Type:    EventPastMessages,
			Payload: json.RawMessage(pastMessagesJSON),
		}

		client.egress <- previousMessages
	}

	return nil
}

func UpdateUserStatus(client *Client, online bool) {
	userStatus := models.UserStatus{
		Username: client.username,
		Status:   online,
		LastSeen: time.Now().UTC(),
	}

	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	_, err = models.UpdateUserStatus(database.DB, userStatus)
	if err != nil {
		fmt.Printf("failed to update user status: %v", err)
		return
	}
}
