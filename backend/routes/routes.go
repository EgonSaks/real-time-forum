package routes

import (
	"context"
	"fmt"
	"net/http"

	"github.com/real-time-forum/backend/auth"
	"github.com/real-time-forum/backend/handlers"
	"github.com/real-time-forum/backend/websockets"
)

func Routes() http.Handler {
	mux := http.NewServeMux()

	rootCtx := context.Background()
	ctx, cancel := context.WithCancel(rootCtx)
	defer cancel()

	manager := websockets.NewManager(ctx)

	mux.HandleFunc("/debug", func(w http.ResponseWriter, r *http.Request) {
		numClients := len(manager.Clients)
		responseText := fmt.Sprintf("Number of connected clients: %d", numClients)

		fmt.Fprint(w, responseText)
		fmt.Println(responseText)
	})

	mux.HandleFunc("/ws", manager.ServeWS)

	mux.HandleFunc("/login", auth.Login(manager))
	mux.HandleFunc("/logout", auth.Logout)
	mux.HandleFunc("/register", auth.Register)

	mux.HandleFunc("/api/users", handlers.Users)
	mux.HandleFunc("/api/user/", handlers.User)

	mux.HandleFunc("/api/posts", handlers.Posts)
	mux.HandleFunc("/api/post/", handlers.Post)
	mux.HandleFunc("/api/comment", handlers.Comment)

	return mux
}
