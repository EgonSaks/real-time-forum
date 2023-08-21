package models

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

type Message struct {
	ID       string    `json:"id"`
	Message  string    `json:"message"`
	Sender   string    `json:"sender"`
	Receiver string    `json:"receiver"`
	Sent     time.Time `json:"sent_at"`
}

func CreateMessage(db *sql.DB, message Message) (string, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "INSERT INTO messages (id, message, sender, receiver, sent_at) VALUES (?, ?, ?, ?, ?)"
	statement, err := db.PrepareContext(context, query)
	if err != nil {
		fmt.Printf("failed receiver prepare create message statement: %v", err)
		return message.ID, fmt.Errorf("failed receiver prepare create message statement: %v", err)
	}

	_, err = statement.ExecContext(context, &message.ID, &message.Message, &message.Sender, &message.Receiver, time.Now().UTC())
	if err != nil {
		fmt.Printf("failed receiver create message: %v", err)
		return message.ID, fmt.Errorf("failed receiver create message: %v", err)
	}

	return message.ID, nil
}

func GetMessages(db *sql.DB, sender, receiver string) ([]Message, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
    SELECT
        id,
        message,
        sender,
        receiver,
        sent_at
    FROM
        messages
    WHERE
        (sender = ? AND receiver = ?)
        OR
        (sender = ? AND receiver = ?)
    ORDER BY
        sent_at ASC
    `

	rows, err := db.QueryContext(context, query, sender, receiver, receiver, sender)
	if err != nil {
		fmt.Printf("failed receiver execute query: %v", err)
		return nil, fmt.Errorf("failed receiver execute query: %v", err)
	}
	defer rows.Close()

	messages := make([]Message, 0)
	for rows.Next() {
		var message Message
		err := rows.Scan(&message.ID, &message.Message, &message.Sender, &message.Receiver, &message.Sent)
		if err != nil {
			fmt.Printf("failed receiver scan row: %v", err)
			return nil, fmt.Errorf("failed receiver scan row: %v", err)
		}
		messages = append(messages, message)
	}

	if err := rows.Err(); err != nil {
		fmt.Printf("failed receiver retrieve rows: %v", err)
		return nil, fmt.Errorf("failed receiver retrieve rows: %v", err)
	}

	return messages, nil
}
