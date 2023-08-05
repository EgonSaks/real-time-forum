package routes

import (
	"net/http"

	"github.com/real-time-forum/backend/auth"
	"github.com/real-time-forum/backend/handlers"
)

func Routes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/login", auth.Login)
	mux.HandleFunc("/logout", auth.Logout)
	mux.HandleFunc("/register", auth.Register)

	mux.HandleFunc("/api/users", handlers.Users)
	mux.HandleFunc("/api/user/", handlers.User)

	mux.HandleFunc("/api/posts", handlers.Posts)
	mux.HandleFunc("/api/post/", handlers.Post)
	mux.HandleFunc("/api/comment", handlers.Comment)

	return mux
}
