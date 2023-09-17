package auth

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/real-time-forum/backend/logger"
	"github.com/real-time-forum/backend/utils"
	"github.com/real-time-forum/database/models"
)

func Register(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		createUser(w, r)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func createUser(w http.ResponseWriter, r *http.Request) {
	var user models.User
	user.ID = uuid.New().String()

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		logger.ErrorLogger.Printf("Failed to decode request body: %v", err)
		return
	}

	validationErrors := utils.ValidateRegisterFormData(user)
	if len(validationErrors) > 0 {
		w.WriteHeader(http.StatusBadRequest)
		logger.WarnLogger.Println("Validation errors in user registration form")
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(validationErrors); err != nil {
			logger.ErrorLogger.Printf("Failed to encode validation errors: %v", err)
		}
		return
	}

	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		logger.ErrorLogger.Printf("Failed to hash the password: %v", err)
		return
	}

	user.Password = string(hashedPassword)

	_, err = models.CreateUser(user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		logger.ErrorLogger.Printf("Username or email already exists: %v", err)
		w.Header().Set("Content-Type", "application/json")
		errorMsg := map[string]string{"error": "Username or email already exists."}
		if err := json.NewEncoder(w).Encode(errorMsg); err != nil {
			logger.ErrorLogger.Printf("Failed to encode error message: %v", err)
		}
		return
	}

	data, err := json.Marshal(user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		logger.ErrorLogger.Printf("Failed to marshal user data: %v", err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if _, err := w.Write(data); err != nil {
		logger.ErrorLogger.Printf("Failed to write response data: %v", err)
	}
}
