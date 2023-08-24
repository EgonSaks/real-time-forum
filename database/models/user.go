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
	Gender    string    `json:"gender"`
	Password  string    `json:"password"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UserStatus struct {
	Username string    `json:"username"`
	Status   bool      `json:"status"`
	LastSeen time.Time `json:"last_seen"`
}

func CreateUser(db *sql.DB, user User) (string, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "INSERT INTO users (id, username, first_name, last_name, email, age, gender, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	statement, err := db.PrepareContext(context, query)
	if err != nil {
		fmt.Printf("failed to prepare create user statement: %v", err)
		return "", fmt.Errorf("failed to prepare create user statement: %v", err)
	}

	_, err = statement.ExecContext(context, user.ID, user.Username, user.FirstName, user.LastName, user.Email, user.Age, user.Gender, user.Password, time.Now().UTC(), time.Now().UTC())
	if err != nil {
		fmt.Printf("failed to create user: %v", err)
		return "", fmt.Errorf("failed to create user: %v", err)
	}

	return user.ID, nil
}

func GetUser(db *sql.DB, userID string) (User, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var user User
	query := "SELECT * FROM users WHERE id = ?"
	err := db.QueryRowContext(context, query, userID).Scan(&user.ID, &user.Username, &user.FirstName, &user.LastName, &user.Email, &user.Age, &user.Gender, &user.Password, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return User{}, fmt.Errorf("user not found")
		}
		fmt.Printf("failed to read user: %v", err)
		return User{}, fmt.Errorf("failed to read user: %v", err)
	}

	return user, nil
}

func GetAllUsers(db *sql.DB) ([]User, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var users []User
	query := "SELECT * FROM users"
	rows, err := db.QueryContext(context, query)
	if err != nil {
		fmt.Printf("failed to fetch users: %v", err)
		return nil, fmt.Errorf("failed to fetch users: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var user User
		err := rows.Scan(&user.ID, &user.Username, &user.FirstName, &user.LastName, &user.Email, &user.Age, &user.Gender, &user.Password, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			fmt.Printf("failed to scan user row: %v", err)
			return nil, fmt.Errorf("failed to scan user row: %v", err)
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		fmt.Printf("error while iterating through rows: %v", err)
		return nil, fmt.Errorf("error while iterating through rows: %v", err)
	}

	return users, nil
}

func UpdateUser(db *sql.DB, user User) error {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "UPDATE users SET username=?, first_name=?, last_name=?, email=?, age=?, gender=?, password=?,updated_at=? WHERE id=?"
	statement, err := db.PrepareContext(context, query)
	if err != nil {
		fmt.Printf("failed to prepare update user statement: %v", err)
		return fmt.Errorf("failed to prepare update user statement: %v", err)
	}

	_, err = statement.ExecContext(context, user.Username, user.FirstName, user.LastName, user.Email, user.Age, user.Gender, user.Password, time.Now().UTC(), user.ID)
	if err != nil {
		fmt.Printf("failed to update user: %v", err)
		return fmt.Errorf("failed to update user: %v", err)
	}

	return nil
}

func DeleteUser(db *sql.DB, userID string) error {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "DELETE FROM users WHERE id=?"
	statement, err := db.PrepareContext(context, query)
	if err != nil {
		fmt.Printf("failed to prepare delete user statement: %v", err)
		return fmt.Errorf("failed to prepare delete user statement: %v", err)
	}

	_, err = statement.ExecContext(context, userID)
	if err != nil {
		fmt.Printf("failed to delete user: %v", err)
		return fmt.Errorf("failed to delete user: %v", err)
	}

	return nil
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

