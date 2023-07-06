package routes

import (
	"net/http"
	"rt-forum/backend/handlers"
)

func Routes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/", handlers.Index)
	mux.HandleFunc("/posts", handlers.Posts)

	fileServer := http.FileServer(http.Dir("./frontend/assets"))
	mux.Handle("/frontend/assets/", http.StripPrefix("/frontend/assets", fileServer))
	return mux
}
