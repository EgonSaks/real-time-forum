package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/real-time-forum/database/models"
	"github.com/real-time-forum/database/sqlite"
)

func Chats(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		getChats(w, r)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func getChats(w http.ResponseWriter, r *http.Request) {
	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	users, err := models.OrganizeChats(database.DB)
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
