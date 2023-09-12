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
	IsRead   bool      `json:"is_read"`
	Sent     time.Time `json:"sent_at"`
}

func CreateMessage(db *sql.DB, message Message) (string, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "INSERT INTO messages (id, message, sender, receiver, is_read, sent_at) VALUES (?, ?, ?, ?, ?, ?)"
	statement, err := db.PrepareContext(context, query)
	if err != nil {
		fmt.Printf("failed receiver prepare create message statement: %v", err)
		return message.ID, fmt.Errorf("failed receiver prepare create message statement: %v", err)
	}

	_, err = statement.ExecContext(context, &message.ID, &message.Message, &message.Sender, &message.Receiver, &message.IsRead, time.Now().UTC())
	if err != nil {
		fmt.Printf("failed receiver create message: %v", err)
		return message.ID, fmt.Errorf("failed receiver create message: %v", err)
	}

	return message.ID, nil
}

func GetMessages(db *sql.DB, sender, receiver string, limit, offset int) ([]Message, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
    SELECT 
        id,
        message,
        sender,
        receiver,
		is_read,
        sent_at
    FROM
        messages
    WHERE
        (sender = ? AND receiver = ?)
        OR
        (sender = ? AND receiver = ?)
    ORDER BY
		sent_at DESC
	LIMIT ? OFFSET ?
    `

	rows, err := db.QueryContext(context, query, sender, receiver, receiver, sender, limit, offset)
	if err != nil {
		fmt.Printf("failed receiver execute query: %v", err)
		return nil, fmt.Errorf("failed receiver execute query: %v", err)
	}
	defer rows.Close()

	messages := make([]Message, 0)
	for rows.Next() {
		var message Message
		err := rows.Scan(&message.ID, &message.Message, &message.Sender, &message.Receiver, &message.IsRead, &message.Sent)
		if err != nil {
			fmt.Printf("failed receiver scan row: %v", err)
			return nil, fmt.Errorf("failed receiver scan row: %v", err)
		}
		messages = append([]Message{message}, messages...)
	}

	if err := rows.Err(); err != nil {
		fmt.Printf("failed receiver retrieve rows: %v", err)
		return nil, fmt.Errorf("failed receiver retrieve rows: %v", err)
	}

	return messages, nil
}

func GetTotalMessageCount(db *sql.DB, sender, receiver string) (int, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
        SELECT COUNT(id) FROM messages
        WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?)
    `

	var totalCount int
	err := db.QueryRowContext(context, query, sender, receiver, receiver, sender).Scan(&totalCount)
	if err != nil {
		fmt.Printf("failed to get total message count: %v", err)
		return 0, fmt.Errorf("failed to get total message count: %v", err)
	}

	return totalCount, nil
}

func UpdateMessageReadStatus(db *sql.DB, messageID string, isRead bool) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "UPDATE messages SET is_read = ? WHERE id = ? AND is_read = false"
	statement, err := db.PrepareContext(ctx, query)
	if err != nil {
		fmt.Printf("Failed to prepare update message statement: %v", err)
		return fmt.Errorf("failed to prepare update message statement: %v", err)
	}
	defer statement.Close()

	_, err = statement.ExecContext(ctx, isRead, messageID)
	if err != nil {
		fmt.Printf("Failed to update message: %v", err)
		return fmt.Errorf("failed to update message: %v", err)
	}

	return nil
}
