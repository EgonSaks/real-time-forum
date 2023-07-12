package routes

import (
	"net/http"

	"github.com/real-time-forum/backend/handlers"
)

func Routes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/", handlers.Index)
	mux.HandleFunc("/api/posts", handlers.Posts)

	fileserver := http.FileServer(http.Dir("./frontend/assets"))
	mux.Handle("/frontend/assets/", http.StripPrefix("/frontend/assets", fileserver))

	return mux
}
