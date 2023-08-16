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

		utils.DeleteSession(w, r)

		response := map[string]string{"message": "Logout successful"}
		json.NewEncoder(w).Encode(response)
	}
}
