package routes

import (
	"net/http"

	"github.com/real-time-forum/backend/handlers"
)

func Routes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/posts", handlers.Posts)

	return mux
}
