package models

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/real-time-forum/backend/logger"
	"github.com/real-time-forum/database/sqlite"
)

type UserStatus struct {
	Username string    `json:"username"`
	Status   bool      `json:"status"`
	LastSeen time.Time `json:"last_seen"`
}

func UpdateUserStatus(user UserStatus) (UserStatus, error) {
	database := sqlite.GetDatabaseInstance()
	if database == nil || database.DB == nil {
		logger.ErrorLogger.Printf("Database connection error")
		log.Fatal("Database connection error")
		return UserStatus{}, fmt.Errorf("database connection error")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "INSERT OR REPLACE INTO user_status (username, status, last_seen) VALUES (?, ?, ?)"
	statement, err := database.DB.PrepareContext(ctx, query)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to prepare update user status statement for username: %s. Error: %v", user.Username, err)
		return UserStatus{}, err
	}

	_, err = statement.ExecContext(ctx, user.Username, user.Status, user.LastSeen)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to update status for username: %s. Error: %v", user.Username, err)
		return UserStatus{}, err
	}

	return user, nil
}

func GetAllUserStatuses(currentUsername string) ([]UserStatus, error) {
	database := sqlite.GetDatabaseInstance()
	if database == nil || database.DB == nil {
		logger.ErrorLogger.Printf("Database connection error")
		log.Fatal("Database connection error")
		return nil, fmt.Errorf("database connection error")
	}
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var statuses []UserStatus
	// Modifying the SQL query to exclude the current user
	query := "SELECT username, status, last_seen FROM user_status WHERE username != ?"
	rows, err := database.DB.QueryContext(context, query, currentUsername)
	if err != nil {
		logger.ErrorLogger.Printf("failed to fetch user statuses: %v", err)
		return nil, fmt.Errorf("failed to fetch user statuses: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var status UserStatus
		err := rows.Scan(&status.Username, &status.Status, &status.LastSeen)
		if err != nil {
			logger.ErrorLogger.Printf("failed to scan user status row: %v", err)
			return nil, fmt.Errorf("failed to scan user status row: %v", err)
		}
		statuses = append(statuses, status)
	}

	if err := rows.Err(); err != nil {
		logger.ErrorLogger.Printf("error while iterating through status rows: %v", err)
		return nil, fmt.Errorf("error while iterating through status rows: %v", err)
	}

	return statuses, nil
}
