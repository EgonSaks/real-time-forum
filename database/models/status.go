package models

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

type UserStatus struct {
	Username string    `json:"username"`
	Status   bool      `json:"status"`
	LastSeen time.Time `json:"last_seen"`
}

func UpdateUserStatus(db *sql.DB, user UserStatus) (UserStatus, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "INSERT OR REPLACE INTO user_status (username, status, last_seen) VALUES (?, ?, ?)"
	statement, err := db.PrepareContext(context, query)
	if err != nil {
		fmt.Printf("failed to prepare update user status statement: %v", err)
		return UserStatus{}, fmt.Errorf("failed to prepare update user status statement: %v", err)
	}

	_, err = statement.ExecContext(context, user.Username, user.Status, user.LastSeen)
	if err != nil {
		fmt.Printf("failed to update user status: %v", err)
		return UserStatus{}, fmt.Errorf("failed to update user status: %v", err)
	}

	return user, nil
}

func GetAllUserStatuses(db *sql.DB) ([]UserStatus, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var statuses []UserStatus
	query := "SELECT username, status, last_seen FROM user_status"
	rows, err := db.QueryContext(context, query)
	if err != nil {
		fmt.Printf("failed to fetch user statuses: %v", err)
		return nil, fmt.Errorf("failed to fetch user statuses: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var status UserStatus
		err := rows.Scan(&status.Username, &status.Status, &status.LastSeen)
		if err != nil {
			fmt.Printf("failed to scan user status row: %v", err)
			return nil, fmt.Errorf("failed to scan user status row: %v", err)
		}
		statuses = append(statuses, status)
	}

	if err := rows.Err(); err != nil {
		fmt.Printf("error while iterating through status rows: %v", err)
		return nil, fmt.Errorf("error while iterating through status rows: %v", err)
	}

	return statuses, nil
}
