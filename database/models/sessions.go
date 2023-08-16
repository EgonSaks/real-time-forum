package models

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

type Session struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	OTP       string    `json:"otp"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}

func CreateSession(db *sql.DB, session Session) (string, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "INSERT INTO sessions (id, user_id, otp, created_at, expires_at) VALUES (?, ?, ?, ?, ?)"
	statement, err := db.PrepareContext(context, query)
	if err != nil {
		return session.ID, fmt.Errorf("failed to prepare session statement: %v", err)
	}

	_, err = statement.ExecContext(context, session.ID, session.UserID, session.OTP, time.Now(), session.ExpiresAt)
	if err != nil {
		fmt.Printf("failed to create session: %v", err)
		return session.ID, err
	}

	return session.ID, nil
}

func GetSessionByID(db *sql.DB, id string) (Session, error) {
	var session Session
	query := "SELECT id, user_id, otp, created_at, expires_at FROM sessions WHERE id = ?"
	err := db.QueryRow(query, id).Scan(&session.ID, &session.UserID, &session.OTP, &session.CreatedAt, &session.ExpiresAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return Session{}, nil
		}
		fmt.Printf("failed to get session: %v", err)
		return Session{}, err
	}
	return session, nil
}

func UpdateSession(db *sql.DB, session Session) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "UPDATE sessions SET user_id=?, expires_at=? WHERE id=?"
	stmt, err := db.PrepareContext(ctx, query)
	if err != nil {
		fmt.Printf("failed to prepare update session statement: %v", err)
		return err
	}

	_, err = stmt.ExecContext(ctx, &session.UserID, &session.ExpiresAt, &session.ID)
	if err != nil {
		fmt.Printf("failed to update session: %v", err)
		return err
	}

	return nil
}

func DeleteSession(db *sql.DB, id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "DELETE FROM sessions WHERE id = ?"
	stmt, err := db.PrepareContext(ctx, query)
	if err != nil {
		fmt.Printf("failed to prepare delete session statement: %v", err)
		return err
	}

	_, err = stmt.ExecContext(ctx, id)
	if err != nil {
		fmt.Printf("failed to delete session: %v", err)
		return err
	}

	return nil
}
