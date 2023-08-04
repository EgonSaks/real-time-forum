package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/real-time-forum/backend/utils"
)

func Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	utils.DeleteSession(w, r)

	response := map[string]string{"message": "Logout successful"}
	json.NewEncoder(w).Encode(response)
}
