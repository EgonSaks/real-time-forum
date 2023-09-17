package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/real-time-forum/backend/logger"
	"github.com/real-time-forum/database/models"
)

func User(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		getUser(w, r)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func Users(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		getUsers(w, r)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func getUser(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get("X-Requested-With")

	if userID == "" {
		logger.WarnLogger.Printf("Missing userID in request header")
		http.NotFound(w, r)
		return
	}

	user, err := models.GetUser(userID)
	if err != nil {
		if err == sql.ErrNoRows {
			logger.WarnLogger.Printf("User not found for ID: %s", userID)
			http.NotFound(w, r)
			return
		}
		logger.ErrorLogger.Printf("Failed to get user by ID: %s, Error: %v", userID, err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	data, err := json.Marshal(user)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to marshal user data: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if _, err := w.Write(data); err != nil {
		logger.ErrorLogger.Printf("Failed to write response data: %v", err)
	}
}

func getUsers(w http.ResponseWriter, r *http.Request) {
	users, err := models.GetAllUsers()
	if err != nil {
		logger.ErrorLogger.Printf("Failed to retrieve all users: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	data, err := json.Marshal(users)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to marshal users data: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if _, err := w.Write(data); err != nil {
		logger.ErrorLogger.Printf("Failed to write response data: %v", err)
	}
}
