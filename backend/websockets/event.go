package websockets

import (
	"encoding/json"
	"fmt"
	"time"
)

type Event struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type EventHandler func(event Event, removeClient *Client) error

const (
	EventSendMessage = "send_message"
	EventNewMessage  = "new_message"
	EventChangeChat  = "change_chat"
)

type SendMessageEvent struct {
	Message string `json:"message"`
	From    string `json:"from"`
	To      string `json:"to"`
}
type NewMessageEvent struct {
	SendMessageEvent
	Sent time.Time `json:"sent"`
}

func SendMessageHandler(event Event, client *Client) error {
	var chatEvent SendMessageEvent
	if err := json.Unmarshal(event.Payload, &chatEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	var broadMessage NewMessageEvent

	broadMessage.Sent = time.Now()
	broadMessage.Message = chatEvent.Message
	broadMessage.From = chatEvent.From
	broadMessage.To = chatEvent.To

	data, err := json.Marshal(broadMessage)
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}

	var outgoingEvent Event
	outgoingEvent.Payload = data
	outgoingEvent.Type = EventNewMessage
	for c := range client.manager.Clients {

		fmt.Println("client.username: ", client.username)
		fmt.Println("chatEvent.From: ", chatEvent.From)
		fmt.Println("chatEvent.To: ", chatEvent.To)

		if c.username == chatEvent.To || c.username == chatEvent.From {
			c.egress <- outgoingEvent
		}
	}
	return nil
}

type ChangeChatEvent struct {
	Name string `json:"name"`
}

func ChatHandler(event Event, client *Client) error {
	var changeChatEvent ChangeChatEvent
	if err := json.Unmarshal(event.Payload, &changeChatEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	client.chat = changeChatEvent.Name

	return nil
}
