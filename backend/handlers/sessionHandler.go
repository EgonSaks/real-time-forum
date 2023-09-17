package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/real-time-forum/backend/logger"
	"github.com/real-time-forum/database/models"
)

func Session(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		getSession(w, r)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func getSession(w http.ResponseWriter, r *http.Request) {
	sessionID := r.Header.Get("X-Requested-With")
	if sessionID == "" {
		logger.WarnLogger.Printf("Missing session ID in request header")
		http.NotFound(w, r)
		return
	}

	session, err := models.GetSessionByID(sessionID)
	if err != nil {
		if err == sql.ErrNoRows {
			logger.WarnLogger.Printf("Session not found for ID: %s", sessionID)
			http.NotFound(w, r)
			return
		}
		logger.ErrorLogger.Printf("Failed to get session by ID: %s, Error: %v", sessionID, err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	data, err := json.Marshal(session)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to marshal session data: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if _, err := w.Write(data); err != nil {
		logger.ErrorLogger.Printf("Failed to write response data: %v", err)
	}
}
