package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/real-time-forum/database/models"
	"github.com/real-time-forum/database/sqlite"
)

func Session(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		getSession(w, r)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func getSession(w http.ResponseWriter, r *http.Request) {
	sessionID := r.Header.Get("X-Requested-With")
	if sessionID == "" {
		http.NotFound(w, r)
		return
	}

	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	session, err := models.GetSessionByID(database.DB, sessionID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.NotFound(w, r)
			return
		}

		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	data, err := json.Marshal(session)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}
