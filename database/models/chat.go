package models

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"fmt"
	"log"
	"time"

	"github.com/real-time-forum/backend/logger"
	"github.com/real-time-forum/database/sqlite"
)

type NullTime struct {
	Time  time.Time
	Valid bool
}

func (nt *NullTime) Scan(value interface{}) error {
	nt.Time, nt.Valid = value.(time.Time)
	return nil
}

func (nt NullTime) Value() (driver.Value, error) {
	if !nt.Valid {
		return nil, nil
	}
	return nt.Time, nil
}

type UserChatInfo struct {
	Sender              string         `json:"username"`
	LastMessageSent     NullTime       `json:"last_message_sent"`
	Receiver            sql.NullString `json:"receiver"`
	CountUnreadMessages int            `json:"unread_messages"`
}

func GetChatInfo(currentUser string) ([]UserChatInfo, error) {
	database := sqlite.GetDatabaseInstance()
	if database == nil || database.DB == nil {
		logger.ErrorLogger.Printf("Database connection error")
		log.Fatal("Database connection error")
		return nil, fmt.Errorf("database connection error")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var chatInfo []UserChatInfo

	query := `
    SELECT u.username,
           MAX(m.sent_at) as last_message_sent,
           m.receiver,
           (SELECT COUNT(*) FROM messages WHERE (sender = u.username AND receiver = ? AND is_read = false)) as unread_messages
    FROM users u
    LEFT JOIN messages m ON (u.username = m.sender AND m.receiver = ?) OR (u.username = m.receiver AND m.sender = ?)
    WHERE u.username != ?
    GROUP BY u.username
    ORDER BY 
        CASE 
            WHEN MAX(m.sent_at) IS NULL THEN 1
            ELSE 0
        END,
        MAX(m.sent_at) DESC NULLS LAST,
        u.username ASC;
    `

	rows, err := database.DB.QueryContext(ctx, query, currentUser, currentUser, currentUser, currentUser, currentUser)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to execute query: %v", err)
		return nil, fmt.Errorf("failed to execute query: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var info UserChatInfo
		err := rows.Scan(&info.Sender, &info.LastMessageSent, &info.Receiver, &info.CountUnreadMessages)
		if err != nil {
			logger.ErrorLogger.Printf("Failed to scan row: %v", err)
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		chatInfo = append(chatInfo, info)
	}

	if err := rows.Err(); err != nil {
		logger.ErrorLogger.Printf("Error while iterating through rows: %v", err)
		return nil, fmt.Errorf("error while iterating through rows: %v", err)
	}

	return chatInfo, nil
}
