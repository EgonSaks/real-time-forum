package models

import (
	"database/sql"
	"fmt"
)

type Credentials struct {
	UserID   string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// GetUserDetails retrieves the user credentials from the database based on the provided username or email.
func GetUserDetails(db *sql.DB, credentials Credentials) (storedCredentials Credentials, err error) {
	fmt.Println("credentials in login, before getting from the database", credentials)

	// Check if the username or email is provided.
	var identifier string
	if credentials.Username != "" {
		identifier = credentials.Username
	} else if credentials.Email != "" {
		identifier = credentials.Email
	} else {
		return storedCredentials, fmt.Errorf("both username and email are empty")
	}

	query := "SELECT id, username, email, password FROM users WHERE username = ? OR email = ?"
	row := db.QueryRow(query, identifier, identifier)

	err = row.Scan(&storedCredentials.UserID, &storedCredentials.Username, &storedCredentials.Email, &storedCredentials.Password)
	if err != nil {
		return storedCredentials, err
	}

	fmt.Println("storedCredentials", storedCredentials)

	return storedCredentials, nil
}