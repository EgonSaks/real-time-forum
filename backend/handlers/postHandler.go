package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/real-time-forum/backend/logger"
	"github.com/real-time-forum/backend/utils"
	"github.com/real-time-forum/database/models"

	"github.com/google/uuid"
)

func Post(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		createPost(w, r)
	} else if r.Method == http.MethodPut {
		updatePost(w, r)
	} else if r.Method == http.MethodDelete {
		deletePost(w, r)
	} else if r.Method == http.MethodGet {
		getPost(w, r)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func Posts(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		getPosts(w, r)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func createPost(w http.ResponseWriter, r *http.Request) {
	var post models.Post
	post.ID = uuid.New().String()

	err := json.NewDecoder(r.Body).Decode(&post)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to decode request body: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	user, ok := utils.GetUserFromSession(r)
	if !ok {
		logger.WarnLogger.Println("User not found in session.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	validationErrors := utils.ValidatePostInput(post)
	if len(validationErrors) > 0 {
		logger.WarnLogger.Printf("Validation errors: %v", validationErrors)
		w.WriteHeader(http.StatusBadRequest)
		if err := json.NewEncoder(w).Encode(validationErrors); err != nil {
			logger.ErrorLogger.Printf("Failed to encode validation errors: %v", err)
		}
		return
	}

	_, err = models.CreatePost(post, user)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to create post: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	data, err := json.Marshal(post)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to marshal post data: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if _, err := w.Write(data); err != nil {
		logger.ErrorLogger.Printf("Failed to write response data: %v", err)
	}
}

func getPosts(w http.ResponseWriter, r *http.Request) {
	posts, err := models.GetAllPosts()
	if err != nil {
		logger.ErrorLogger.Printf("Failed to fetch posts: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	data, err := json.Marshal(posts)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to marshal posts: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if _, err := w.Write(data); err != nil {
		logger.ErrorLogger.Printf("Failed to write response data: %v", err)
	}
}

func getPost(w http.ResponseWriter, r *http.Request) {
	postID := strings.TrimPrefix(r.URL.Path, "/api/post/")

	if postID == "" {
		logger.WarnLogger.Println("Invalid or empty post ID provided.")
		http.NotFound(w, r)
		return
	}

	post, err := models.GetPostByID(postID)
	if err != nil {
		if err == sql.ErrNoRows {
			logger.WarnLogger.Printf("No post found with ID: %s", postID)
			http.NotFound(w, r)
			return
		}
		logger.ErrorLogger.Printf("Failed to fetch post with ID: %s, Error: %v", postID, err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	data, err := json.Marshal(post)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to marshal post with ID: %s, Error: %v", postID, err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if _, err := w.Write(data); err != nil {
		logger.ErrorLogger.Printf("Failed to write response data: %v", err)
	}
}

func updatePost(w http.ResponseWriter, r *http.Request) {
	var post models.Post

	err := json.NewDecoder(r.Body).Decode(&post)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to decode JSON payload: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	validationErrors := utils.ValidateUpdatedData(post)
	if len(validationErrors) > 0 {
		logger.WarnLogger.Printf("Validation errors: %v", validationErrors)
		w.WriteHeader(http.StatusBadRequest)
		if err := json.NewEncoder(w).Encode(validationErrors); err != nil {
			logger.ErrorLogger.Printf("Failed to encode validation errors: %v", err)
		}
		return
	}

	err = models.UpdatePost(post)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to update post: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	data, err := json.Marshal(post)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to marshal updated post: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if _, err := w.Write(data); err != nil {
		logger.ErrorLogger.Printf("Failed to write response data: %v", err)
	}
}

func deletePost(w http.ResponseWriter, r *http.Request) {
	var data struct {
		PostID string `json:"postId"`
	}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to decode JSON payload: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	postID := data.PostID

	err = models.DeletePost(postID)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to delete post with ID: %s, Error: %v", postID, err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Post deleted successfully")
}
