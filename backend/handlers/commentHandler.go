package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/real-time-forum/database/models"
	"github.com/real-time-forum/database/sqlite"
)

// The function `Comments` handles different HTTP methods for creating, updating, deleting, and retrieving comments.
func Comments(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		createComment(w, r)
	} else if r.Method == http.MethodPut {
		updateComment(w, r)
	} else if r.Method == http.MethodDelete {
		deleteComment(w, r)
	} else if r.Method == http.MethodGet {
		getComments(w, r)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// The createComment function creates a new comment, saves it to a database, and returns the created comment as
// JSON.
func createComment(w http.ResponseWriter, r *http.Request) {
	var comment models.Comment
	comment.ID = uuid.New().String()

	err := json.NewDecoder(r.Body).Decode(&comment)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	_, err = models.CreateComment(database.DB, comment)
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

// The function retrieves all comments from a database and returns them as a JSON response.
func getComments(w http.ResponseWriter, r *http.Request) {
	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	comments, err := models.GetAllComments(database.DB)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	data, err := json.Marshal(comments)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

func updateComment(w http.ResponseWriter, r *http.Request) {
	var comment models.Comment

	err := json.NewDecoder(r.Body).Decode(&comment)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	// Open the database connection
	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	// Update the comment in the database
	err = models.UpdateComment(database.DB, comment)
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


func deleteComment(w http.ResponseWriter, r *http.Request) {
	var data struct {
		CommentID string `json:"commentId"`
	}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Println(err)
		return
	}

	commentID := data.CommentID

	// Open the database connection
	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	// Delete the comment from the database
	err = models.DeleteComment(database.DB, commentID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Comment deleted successfully")
}

// Function to get a single comment by its ID
func GetComment(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Hello from get comment")
	// Get the comment ID from the URL query parameter
	commentID := r.URL.Query().Get("commentId")

	// Open the database connection
	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	// Retrieve the comment from the database by its ID
	comment, err := models.GetCommentByID(database.DB, commentID)
	if err != nil {
		// If the comment is not found, return a 404 Not Found response
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
