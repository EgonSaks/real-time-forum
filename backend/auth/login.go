package auth

import (
	"encoding/json"
	"net/http"

	"github.com/real-time-forum/backend/logger"
	"github.com/real-time-forum/backend/utils"
	"github.com/real-time-forum/backend/websockets"
	"github.com/real-time-forum/database/models"
)

type LoginResponse struct {
	Message string `json:"message"`
}

func Login(manager *websockets.Manager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			logger.ErrorLogger.Println("Invalid request method")
			return
		}

		var creds models.Credentials
		err := json.NewDecoder(r.Body).Decode(&creds)
		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			logger.ErrorLogger.Printf("Error decoding request body: %v", err)
			return
		}

		usernameOrEmail := creds.Username
		if usernameOrEmail == "" {
			usernameOrEmail = creds.Email
		}

		validationErrors := utils.ValidateLoginFormInput(usernameOrEmail, creds.Password)
		if len(validationErrors) > 0 {
			http.Error(w, "Invalid form input", http.StatusBadRequest)
			logger.ErrorLogger.Printf("Validation errors: %v", validationErrors)
			return
		}

		user, err := models.GetUserDetails(creds)
		if err != nil {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			logger.ErrorLogger.Println("Invalid credentials")
			return
		}

		if (user.Username == creds.Username || user.Email == creds.Email) && utils.ComparePasswords(user.Password, creds.Password) {
			_, err := utils.SetSession(w, r, user.UserID)
			if err != nil {
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				logger.ErrorLogger.Printf("Error setting session: %v", err)
				return
			}

			response := LoginResponse{
				Message: "Login successful",
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			err = json.NewEncoder(w).Encode(response)
			if err != nil {
				http.Error(w, "Error encoding JSON response", http.StatusInternalServerError)
				logger.ErrorLogger.Printf("Error encoding JSON: %v", err)
				return
			}
		} else {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			logger.ErrorLogger.Println("Invalid credentials")
			return
		}
	}
}
