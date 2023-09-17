package models

import (
	"fmt"
	"log"

	"github.com/real-time-forum/backend/logger"
	"github.com/real-time-forum/database/sqlite"
)

type Credentials struct {
	UserID   string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func GetUserDetails(credentials Credentials) (storedCredentials Credentials, err error) {
	database := sqlite.GetDatabaseInstance()
	if database == nil || database.DB == nil {
		logger.ErrorLogger.Printf("Database connection error")
		log.Fatal("Database connection error")
		return
	}
	var identifier string
	if credentials.Username != "" {
		identifier = credentials.Username
	} else if credentials.Email != "" {
		identifier = credentials.Email
	} else {
		logger.WarnLogger.Printf("Both username and email are empty")
		return storedCredentials, fmt.Errorf("both username and email are empty")
	}

	query := "SELECT id, username, email, password FROM users WHERE username = ? OR email = ?"
	row := database.DB.QueryRow(query, identifier, identifier)

	err = row.Scan(&storedCredentials.UserID, &storedCredentials.Username, &storedCredentials.Email, &storedCredentials.Password)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to scan row for identifier %s: %v", identifier, err)
		return storedCredentials, err
	}

	return storedCredentials, nil
}
