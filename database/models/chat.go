package models

import (
	"context"
	"database/sql"
	"fmt"
	"sort"
	"time"
)

type UserWithLastMessage struct {
	User        User
	LastMessage Message
}

func GetAllUsersWithLastMessages(db *sql.DB) ([]UserWithLastMessage, error) {
	context, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	tx, err := db.BeginTx(context, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	query := "SELECT * FROM users"
	rows, err := db.QueryContext(context, query)
	if err != nil {
		fmt.Printf("failed to fetch users: %v", err)
		return nil, fmt.Errorf("failed to fetch users: %v", err)
	}
	defer rows.Close()

	var usersWithLastMessages []UserWithLastMessage

	for rows.Next() {
		var user User
		err := rows.Scan(&user.ID, &user.Username, &user.FirstName, &user.LastName, &user.Email, &user.Age, &user.Gender, &user.Password, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			fmt.Printf("failed to scan user row: %v", err)
			return nil, fmt.Errorf("failed to scan user row: %v", err)
		}

		var lastMessage Message
		lastMessageQuery := `
            SELECT * FROM messages
            WHERE (sender = ? OR receiver = ?)
            ORDER BY sent_at DESC
            LIMIT 1
        `
		err = db.QueryRowContext(context, lastMessageQuery, user.Username, user.Username).
			Scan(&lastMessage.ID, &lastMessage.Message, &lastMessage.Sender, &lastMessage.Receiver, &lastMessage.Sent)

		if err != nil {
			if err == sql.ErrNoRows {
				lastMessage = Message{}
			} else {
				fmt.Printf("failed to fetch last message: %v", err)
				return nil, fmt.Errorf("failed to fetch last message: %v", err)
			}
		}

		usersWithLastMessages = append(usersWithLastMessages, UserWithLastMessage{
			User:        user,
			LastMessage: lastMessage,
		})
	}

	if err := rows.Err(); err != nil {
		fmt.Printf("error while iterating through rows: %v", err)
		return nil, fmt.Errorf("error while iterating through rows: %v", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return usersWithLastMessages, nil
}

// Sort users based on last message or alphabetical order
func SortUsers(usersWithLastMessages []UserWithLastMessage) []UserWithLastMessage {
	// Separate users with last messages and users without messages
	usersWithMessages := make([]UserWithLastMessage, 0)
	usersWithoutMessages := make([]UserWithLastMessage, 0)

	for _, userWithLastMessage := range usersWithLastMessages {
		if userWithLastMessage.LastMessage.ID != "" {
			usersWithMessages = append(usersWithMessages, userWithLastMessage)
		} else {
			usersWithoutMessages = append(usersWithoutMessages, userWithLastMessage)
		}
	}

	// Sort users with messages based on last message timestamp
	sort.SliceStable(usersWithMessages, func(i, j int) bool {
		return usersWithMessages[i].LastMessage.Sent.After(usersWithMessages[j].LastMessage.Sent)
	})

	// Sort users without messages alphabetically by username
	sort.SliceStable(usersWithoutMessages, func(i, j int) bool {
		return usersWithoutMessages[i].User.Username < usersWithoutMessages[j].User.Username
	})

	// Combine the sorted lists
	sortedUsers := append(usersWithMessages, usersWithoutMessages...)

	return sortedUsers
}

// Use GetAllUsersWithLastMessages and SortUsers to display chats in the desired order
func OrganizeChats(db *sql.DB) ([]UserWithLastMessage, error) {
	usersWithLastMessages, err := GetAllUsersWithLastMessages(db)
	if err != nil {
		return nil, err
	}

	sortedUsers := SortUsers(usersWithLastMessages)
	return sortedUsers, nil
}
