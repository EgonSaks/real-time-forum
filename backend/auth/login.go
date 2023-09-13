package auth

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/real-time-forum/backend/utils"
	"github.com/real-time-forum/backend/websockets"
	"github.com/real-time-forum/database/models"
	"github.com/real-time-forum/database/sqlite"
)

type LoginResponse struct {
	Message  string `json:"message"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Session  string `json:"session"`
}

func Login(manager *websockets.Manager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		var creds models.Credentials
		err := json.NewDecoder(r.Body).Decode(&creds)
		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		database, err := sqlite.OpenDatabase()
		if err != nil {
			log.Fatal(err)
		}
		defer database.DB.Close()

		usernameOrEmail := creds.Username
		if usernameOrEmail == "" {
			usernameOrEmail = creds.Email
		}

		validationErrors := utils.ValidateLoginFormInput(usernameOrEmail, creds.Password)
		if len(validationErrors) > 0 {
			http.Error(w, "Invalid form input", http.StatusBadRequest)
			return
		}

		user, err := models.GetUserDetails(database.DB, creds)
		if err != nil {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}

		if (user.Username == creds.Username || user.Email == creds.Email) && utils.ComparePasswords(user.Password, creds.Password) {

			session, err := utils.SetSession(w, r, user.UserID)
			if err != nil {
				fmt.Println("Error setting session:", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}

			response := LoginResponse{
				Message:  "Login successful",
				Username: user.Username,
				Email:    user.Email,
				Session:  session.Value,
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			err = json.NewEncoder(w).Encode(response)
			if err != nil {
				http.Error(w, "Error encoding JSON response", http.StatusInternalServerError)
				return
			}
		} else {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}
	}
}
