package auth

import (
	"encoding/json"
	"net/http"

	"github.com/real-time-forum/backend/logger"
	"github.com/real-time-forum/backend/utils"
	"github.com/real-time-forum/backend/websockets"
)

func Logout(manager *websockets.Manager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			logger.ErrorLogger.Println("Invalid request method")
			return
		}

		user, ok := utils.GetUserFromSession(r)
		if !ok {
			http.Error(w, "User not found", http.StatusUnauthorized)
			logger.ErrorLogger.Println("User not found in session")
			return
		}

		manager.CloseWebSocket(user.Username)
		if _, err := utils.DeleteSession(w, r); err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			logger.ErrorLogger.Printf("Error deleting session: %v", err)
			return
		}

		response := map[string]string{"message": "Logout successful"}
		if err := json.NewEncoder(w).Encode(response); err != nil {
			logger.ErrorLogger.Printf("Error encoding JSON response: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	}
}
