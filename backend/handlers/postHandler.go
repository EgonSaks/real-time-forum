package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/real-time-forum/database/models"
	"github.com/real-time-forum/database/sqlite"

	"github.com/google/uuid"
)

func Posts(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		createPost(w, r)
	} else if r.Method == http.MethodPut {
		updatePost(w, r)
	} else if r.Method == http.MethodDelete {
		deletePost(w, r)
	} else if r.Method == http.MethodGet {
		getPosts(w, r)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func createPost(w http.ResponseWriter, r *http.Request) {
	var post models.Post
	post.ID = uuid.New().String()

	err := json.NewDecoder(r.Body).Decode(&post)
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

	_, err = models.CreatePost(database.DB, post)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	data, err := json.Marshal(post)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

func getPosts(w http.ResponseWriter, r *http.Request) {
	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	posts, err := models.GetAllPosts(database.DB)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	data, err := json.Marshal(posts)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

func updatePost(w http.ResponseWriter, r *http.Request) {
	var post models.Post

	err := json.NewDecoder(r.Body).Decode(&post)
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

	// Update the post in the database
	err = models.UpdatePost(database.DB, post)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	data, err := json.Marshal(post)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

func deletePost(w http.ResponseWriter, r *http.Request) {
	var data struct {
		PostID string `json:"postId"`
	}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Println(err)
		return
	}

	postID := data.PostID

	// Open the database connection
	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	// Delete the post from the database
	err = models.DeletePost(database.DB, postID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Post deleted successfully")
}

// Function to get a single post by its ID
func GetPost(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Hello from get post")
	// Get the post ID from the URL query parameter
	postID := r.URL.Query().Get("postId")

	// Open the database connection
	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	// Retrieve the post from the database by its ID
	post, err := models.GetPostByID(database.DB, postID)
	if err != nil {
		// If the post is not found, return a 404 Not Found response
		if err == sql.ErrNoRows {
			http.NotFound(w, r)
			return
		}

		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	data, err := json.Marshal(post)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}
