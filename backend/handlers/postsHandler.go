package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"rt-forum/database/models"
	"rt-forum/database/sqlite"

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
	fmt.Println("create Post from postsHandler")
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
	fmt.Println(string(data))
	w.Write(data)
}

func getPosts(w http.ResponseWriter, r *http.Request) {
	fmt.Println("get all posts from postsHandler")

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

	fmt.Println("getPosts handler", posts)

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
	fmt.Println("update post from postsHandler")
}

func deletePost(w http.ResponseWriter, r *http.Request) {
	fmt.Println("delete post from postsHandler")
}
