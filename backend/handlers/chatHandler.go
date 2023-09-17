package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/real-time-forum/backend/logger"
	"github.com/real-time-forum/backend/utils"
	"github.com/real-time-forum/database/models"
)

func Chats(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		getChats(w, r)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func getChats(w http.ResponseWriter, r *http.Request) {
	currentUser, ok := utils.GetUserFromSession(r)
	if !ok {
		logger.WarnLogger.Println("Unauthorized request for chat list")
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	users, err := models.GetChatInfo(currentUser.Username)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to fetch chat info: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	data, err := json.Marshal(users)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to marshal chat info: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if _, err = w.Write(data); err != nil {
		logger.ErrorLogger.Printf("Failed to write data to response: %v", err)
	}
}
