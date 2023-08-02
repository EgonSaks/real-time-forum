package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/real-time-forum/backend/utils"
	"github.com/real-time-forum/database/models"
	"github.com/real-time-forum/database/sqlite"
)

func Login(w http.ResponseWriter, r *http.Request) {
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

	user, err := models.GetUserDetails(database.DB, creds)
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	fmt.Println(user)

	// Check if either username or email matches and compare passwords.
	if (user.Username == creds.Username || user.Email == creds.Email) && utils.ComparePasswords(user.Password, creds.Password) {

		_, err := utils.SetSession(w, r, user.UserID)
		if err != nil {
			// Handle error if necessary
			fmt.Println("Error setting session:", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		response := map[string]string{"message": "Login successful"}
		json.NewEncoder(w).Encode(response)
	} else {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

}

func Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	response := map[string]string{"message": "Logout successful"}
	json.NewEncoder(w).Encode(response)
}
