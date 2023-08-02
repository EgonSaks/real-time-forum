package routes

import (
	"net/http"

	"github.com/real-time-forum/backend/handlers"
)

func Routes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/login", handlers.Login)
	mux.HandleFunc("/register", handlers.Register)

	mux.HandleFunc("/api/posts", handlers.Posts)
	mux.HandleFunc("/api/post/", handlers.Post)
	mux.HandleFunc("/api/comments", handlers.Comments)

	return mux
}
