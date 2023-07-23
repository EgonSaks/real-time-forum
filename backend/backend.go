package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/real-time-forum/backend/routes"
	"github.com/real-time-forum/database/sqlite"
)

type Application struct {
	DB *sqlite.Database
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set the necessary CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests (OPTIONS)
		if r.Method == http.MethodOptions {
			return
		}

		// Call the next handler in the chain
		next.ServeHTTP(w, r)
	})
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	mux := routes.Routes()
	handler := corsMiddleware(mux)

	addr := ":" + port
	fmt.Println("Backend server running on http://localhost" + port)
	log.Fatal(http.ListenAndServe(addr, handler))
}