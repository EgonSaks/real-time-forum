package models

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/real-time-forum/backend/logger"
	"github.com/real-time-forum/database/sqlite"
)

type Message struct {
	ID       string    `json:"id"`
	Message  string    `json:"message"`
	Sender   string    `json:"sender"`
	Receiver string    `json:"receiver"`
	IsRead   bool      `json:"is_read"`
	Sent     time.Time `json:"sent_at"`
}

func CreateMessage(message Message) (string, error) {
	database := sqlite.GetDatabaseInstance()
	if database == nil || database.DB == nil {
		logger.ErrorLogger.Printf("Database connection error")
		log.Fatal("Database connection error")
		return message.ID, fmt.Errorf("database connection error")
	}

	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "INSERT INTO messages (id, message, sender, receiver, is_read, sent_at) VALUES (?, ?, ?, ?, ?, ?)"
	statement, err := database.DB.PrepareContext(context, query)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to prepare create message statement for sender: %s, receiver: %s. Error: %v", message.Sender, message.Receiver, err)
		return message.ID, fmt.Errorf("failed to prepare create message statement: %v", err)
	}

	_, err = statement.ExecContext(context, &message.ID, &message.Message, &message.Sender, &message.Receiver, &message.IsRead, time.Now().UTC())
	if err != nil {
		logger.ErrorLogger.Printf("Failed to create message for sender: %s, receiver: %s. Error: %v", message.Sender, message.Receiver, err)
		return message.ID, fmt.Errorf("failed to create message: %v", err)
	}

	return message.ID, nil
}

func GetMessages(sender, receiver string, limit, offset int) ([]Message, error) {
	database := sqlite.GetDatabaseInstance()
	if database == nil || database.DB == nil {
		logger.ErrorLogger.Printf("Database connection error")
		log.Fatal("Database connection error")
		return nil, fmt.Errorf("database connection error")
	}
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

	rows, err := database.DB.QueryContext(context, query, sender, receiver, receiver, sender, limit, offset)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to execute query between sender: %s and receiver: %s. Error: %v", sender, receiver, err)
		return nil, fmt.Errorf("failed to execute query: %v", err)
	}
	defer rows.Close()

	messages := make([]Message, 0)
	for rows.Next() {
		var message Message
		err := rows.Scan(&message.ID, &message.Message, &message.Sender, &message.Receiver, &message.IsRead, &message.Sent)
		if err != nil {
			logger.ErrorLogger.Printf("Failed to scan row between sender: %s and receiver: %s. Error: %v", sender, receiver, err)
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}
		messages = append([]Message{message}, messages...)
	}

	if err := rows.Err(); err != nil {
		logger.ErrorLogger.Printf("Failed to retrieve rows between sender: %s and receiver: %s. Error: %v", sender, receiver, err)
		return nil, fmt.Errorf("failed to retrieve rows: %v", err)
	}

	return messages, nil
}

func GetTotalMessageCount(sender, receiver string) (int, error) {
	database := sqlite.GetDatabaseInstance()
	if database == nil || database.DB == nil {
		logger.ErrorLogger.Printf("Database connection error")
		log.Fatal("Database connection error")
		return 0, fmt.Errorf("database connection error")
	}

	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
        SELECT COUNT(id) FROM messages
        WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?)
    `

	var totalCount int
	err := database.DB.QueryRowContext(context, query, sender, receiver, receiver, sender).Scan(&totalCount)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to get total message count between sender: %s and receiver: %s. Error: %v", sender, receiver, err)
		return 0, fmt.Errorf("failed to get total message count: %v", err)
	}

	return totalCount, nil
}

func UpdateMessageReadStatus(messageID string, isRead bool, receiver string) error {
	database := sqlite.GetDatabaseInstance()
	if database == nil || database.DB == nil {
		logger.ErrorLogger.Printf("Database connection error")
		log.Fatal("Database connection error")
		return fmt.Errorf("database connection error")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "UPDATE messages SET is_read = ? WHERE id = ? AND is_read = false AND receiver = ?"
	statement, err := database.DB.PrepareContext(ctx, query)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to prepare update message statement for message ID: %s. Error: %v", messageID, err)
		return fmt.Errorf("failed to prepare update message statement: %v", err)
	}
	defer statement.Close()

	_, err = statement.ExecContext(ctx, isRead, messageID, receiver)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to update read status for message ID: %s. Error: %v", messageID, err)
		return fmt.Errorf("failed to update message: %v", err)
	}

	return nil
}
