package models

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

type Message struct {
	ID       int       `json:"id"`
	Message  string    `json:"message"`
	Sender   string    `json:"sender"`
	Receiver string    `json:"receiver"`
	Sent     time.Time `json:"sent_at"`
}

func CreateMessage(db *sql.DB, message Message) (int, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "INSERT INTO messages (message, sender, receiver, sent_at) VALUES (?, ?, ?, ?)"
	statement, err := db.PrepareContext(context, query)
	if err != nil {
		fmt.Printf("failed to prepare create message statement: %v", err)
		return message.ID, fmt.Errorf("failed to prepare create message statement: %v", err)
	}

	res, err := statement.ExecContext(context, &message.Message, &message.Sender, &message.Receiver, time.Now().UTC())
	if err != nil {
		fmt.Printf("failed to create message: %v", err)
		return message.ID, fmt.Errorf("failed to create message: %v", err)
	}

	lastInsertedID, err := res.LastInsertId()
	if err != nil {
		fmt.Printf("failed to get last inserted ID: %v", err)
		return message.ID, fmt.Errorf("failed to get last inserted ID: %v", err)
	}

	return int(lastInsertedID), nil
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
		sent_at DESC
	LIMIT 10 OFFSET 0
    `

	rows, err := db.QueryContext(context, query, sender, receiver, receiver, sender)
	if err != nil {
		fmt.Printf("failed to execute query: %v", err)
		return nil, fmt.Errorf("failed to execute query: %v", err)
	}
	defer rows.Close()

	messages := make([]Message, 0)
	for rows.Next() {
		var message Message
		err := rows.Scan(&message.ID, &message.Message, &message.Sender, &message.Receiver, &message.Sent)
		if err != nil {
			fmt.Printf("failed to scan row: %v", err)
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}
		messages = append(messages, message)
	}

	if err := rows.Err(); err != nil {
		fmt.Printf("failed to retrieve rows: %v", err)
		return nil, fmt.Errorf("failed to retrieve rows: %v", err)
	}

	return messages, nil
}

func GetMessagesAfterID(db *sql.DB, sender, receiver string, lastMessageID int) ([]Message, error) {
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
            ((sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?))
            AND
            id < ?
        ORDER BY
            sent_at DESC
        LIMIT 10
    `

	rows, err := db.QueryContext(context, query, sender, receiver, receiver, sender, lastMessageID)
	if err != nil {
		fmt.Printf("failed to execute query: %v", err)
		return nil, fmt.Errorf("failed to execute query: %v", err)
	}
	defer rows.Close()

	messages := make([]Message, 0)
	for rows.Next() {
		var message Message
		err := rows.Scan(&message.ID, &message.Message, &message.Sender, &message.Receiver, &message.Sent)
		if err != nil {
			fmt.Printf("failed to scan row: %v", err)
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}
		messages = append(messages, message)
	}

	if err := rows.Err(); err != nil {
		fmt.Printf("failed to retrieve rows: %v", err)
		return nil, fmt.Errorf("failed to retrieve rows: %v", err)
	}

	return messages, nil
}
