package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/real-time-forum/backend/utils"
	"github.com/real-time-forum/database/models"
	"github.com/real-time-forum/database/sqlite"
)

func Register(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		createUser(w, r)
	} else if r.Method == http.MethodPut {
		updateUser(w, r)
	} else if r.Method == http.MethodDelete {
		deleteUser(w, r)
	} else if r.Method == http.MethodGet {
		getUser(w, r)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func createUser(w http.ResponseWriter, r *http.Request) {

	var user models.User
	user.ID = uuid.New().String()

	fmt.Println("Creating user...")

	// if err := validateUser(user); err != nil {
	// 	w.WriteHeader(http.StatusBadRequest)
	// 	fmt.Println("Invalid user data:", err)
	// 	return
	// }

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Println("Failed to decode request body:", err)
		return
	}

	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("Failed to hash the password:", err)
		return
	}

	user.Password = string(hashedPassword)

	database, err := sqlite.OpenDatabase()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("Failed to open database:", err)
		return
	}
	defer database.DB.Close()

	_, err = models.CreateUser(database.DB, user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Header().Set("Content-Type", "application/json")
		errorMsg := map[string]string{"error": "Username or email already exists."}
		json.NewEncoder(w).Encode(errorMsg)
		return
	}

	data, err := json.Marshal(user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("Failed to marshal user data:", err)
		return
	}

	fmt.Println("User created successfully!")
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(data)
}

func getUser(w http.ResponseWriter, r *http.Request) {
}

func updateUser(w http.ResponseWriter, r *http.Request) {
}

func deleteUser(w http.ResponseWriter, r *http.Request) {
}
