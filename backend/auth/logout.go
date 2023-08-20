package auth

import (
	"encoding/json"
	"net/http"

	"github.com/real-time-forum/backend/utils"
	"github.com/real-time-forum/backend/websockets"
)

func Logout(manager *websockets.Manager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		// Get the user from the session
		user, ok := utils.GetUserFromSession(r)
		if !ok {
			http.Error(w, "User not found", http.StatusUnauthorized)
			return
		}

		manager.CloseWebSocket(user.Username)
		utils.DeleteSession(w, r)

		response := map[string]string{"message": "Logout successful"}
		json.NewEncoder(w).Encode(response)
	}
}
