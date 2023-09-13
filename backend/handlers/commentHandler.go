package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/real-time-forum/backend/utils"
	"github.com/real-time-forum/database/models"
	"github.com/real-time-forum/database/sqlite"
)

func Comment(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		createComment(w, r)
	} else if r.Method == http.MethodGet {
		getComment(w, r)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func createComment(w http.ResponseWriter, r *http.Request) {
	var comment models.Comment
	comment.ID = uuid.New().String()

	user, ok := utils.GetUserFromSession(r)
	if !ok {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("User not found in session")
		return
	}

	err := json.NewDecoder(r.Body).Decode(&comment)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	validationErrors := utils.ValidateCommentInput(comment)
	if len(validationErrors) > 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(validationErrors)
		return
	}

	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	_, err = models.CreateComment(database.DB, comment, user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	data, err := json.Marshal(comment)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

func getComment(w http.ResponseWriter, r *http.Request) {
	postID := r.Header.Get("X-Requested-With")

	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	comment, err := models.GetCommentsByPostID(database.DB, postID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.NotFound(w, r)
			return
		}

		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	data, err := json.Marshal(comment)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}
