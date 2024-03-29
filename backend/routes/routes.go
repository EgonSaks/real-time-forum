package routes

import (
	"fmt"
	"net/http"

	"github.com/real-time-forum/backend/auth"
	"github.com/real-time-forum/backend/handlers"
	"github.com/real-time-forum/backend/logger"
	"github.com/real-time-forum/backend/websockets"
)

func Routes() http.Handler {
	mux := http.NewServeMux()

	manager := websockets.NewManager()

	mux.HandleFunc("/login", auth.Login(manager))
	mux.HandleFunc("/logout", auth.Logout(manager))
	mux.HandleFunc("/register", auth.Register)

	mux.HandleFunc("/api/users", handlers.Users)
	mux.HandleFunc("/api/user/", handlers.User)

	mux.HandleFunc("/api/chats", handlers.Chats)

	mux.HandleFunc("/api/posts", handlers.Posts)
	mux.HandleFunc("/api/post/", handlers.Post)
	mux.HandleFunc("/api/comment", handlers.Comment)

	mux.HandleFunc("/api/session/", handlers.Session)

	mux.HandleFunc("/ws", manager.ServeWS)

	mux.HandleFunc("/debug", func(w http.ResponseWriter, r *http.Request) {
		numClients := len(manager.Clients)
		responseText := fmt.Sprintf("Number of connected clients: %d", numClients)
		fmt.Fprint(w, responseText)
		logger.InfoLogger.Println(responseText)
	})

	return mux
}
