package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/real-time-forum/backend/logger"
	"github.com/real-time-forum/backend/utils"
	"github.com/real-time-forum/database/models"
)

func Comment(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		createComment(w, r)
	} else if r.Method == http.MethodGet {
		getComment(w, r)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func createComment(w http.ResponseWriter, r *http.Request) {
	var comment models.Comment
	comment.ID = uuid.New().String()

	user, ok := utils.GetUserFromSession(r)
	if !ok {
		logger.ErrorLogger.Println("User not found in session")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err := json.NewDecoder(r.Body).Decode(&comment)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to decode comment from request body: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	validationErrors := utils.ValidateCommentInput(comment)
	if len(validationErrors) > 0 {
		logger.WarnLogger.Println("Comment input validation failed")
		w.WriteHeader(http.StatusBadRequest)
		if err := json.NewEncoder(w).Encode(validationErrors); err != nil {
			logger.ErrorLogger.Printf("Failed to encode validation errors: %v", err)
		}
		return
	}

	_, err = models.CreateComment(comment, user)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to create comment: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	data, err := json.Marshal(comment)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to marshal comment: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if _, err := w.Write(data); err != nil {
		logger.ErrorLogger.Printf("Failed to write response data: %v", err)
	}
}

func getComment(w http.ResponseWriter, r *http.Request) {
	postID := r.Header.Get("X-Requested-With")

	comment, err := models.GetCommentsByPostID(postID)
	if err != nil {
		if err == sql.ErrNoRows {
			logger.WarnLogger.Printf("No comments found for post ID %s", postID)
			http.NotFound(w, r)
			return
		}
		logger.ErrorLogger.Printf("Failed to fetch comments for post ID %s: %v", postID, err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	data, err := json.Marshal(comment)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to marshal comments: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if _, err := w.Write(data); err != nil {
		logger.ErrorLogger.Printf("Failed to write response data: %v", err)
	}
}
