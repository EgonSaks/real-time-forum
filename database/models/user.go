package models

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Email     string    `json:"email"`
	Age       string    `json:"age"`
	Password  string    `json:"password"`
	Gender    string    `json:"gender"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func CreateUser(db *sql.DB, user User) (string, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "INSERT INTO users (id, username, first_name, last_name, email, age, password, gender, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	statement, err := db.PrepareContext(context, query)
	if err != nil {
		fmt.Printf("failed to prepare create user statement: %v", err)
		return "", fmt.Errorf("failed to prepare create user statement: %v", err)
	}

	_, err = statement.ExecContext(context, user.ID, user.Username, user.FirstName, user.LastName, user.Email, user.Age, user.Password, user.Gender, time.Now().UTC(), time.Now().UTC())
	if err != nil {
		fmt.Printf("failed to create user: %v", err)
		return "", fmt.Errorf("failed to create user: %v", err)
	}

	return user.ID, nil
}

