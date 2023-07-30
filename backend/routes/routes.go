package routes

import (
	"net/http"

	"github.com/real-time-forum/backend/handlers"
)

func Routes() http.Handler {
	mux := http.NewServeMux()

	// mux.HandleFunc("/api/post", handlers.Post)
	mux.HandleFunc("/api/posts", handlers.Posts)
	// mux.HandleFunc("/api/comment", handlers.Comment)
	mux.HandleFunc("/api/comments", handlers.Comments)

	return mux
}
