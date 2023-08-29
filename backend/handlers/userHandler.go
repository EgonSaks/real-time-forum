package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/real-time-forum/database/models"
	"github.com/real-time-forum/database/sqlite"
)

func User(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		getUser(w, r)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func Users(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		getUsers(w, r)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func getUser(w http.ResponseWriter, r *http.Request) {
	userID := strings.TrimPrefix(r.URL.Path, "/api/user/")
	if userID == "" {
		http.NotFound(w, r)
		return
	}

	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	user, err := models.GetUser(database.DB, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.NotFound(w, r)
			return
		}

		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	data, err := json.Marshal(user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

func getUsers(w http.ResponseWriter, r *http.Request) {
	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	users, err := models.GetAllUsers(database.DB)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	data, err := json.Marshal(users)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}
