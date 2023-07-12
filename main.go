package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/real-time-forum/backend/routes"
	"github.com/real-time-forum/database/sqlite"
)

type Application struct {
	DB *sqlite.Database
}

const port = ":8080"

func main() {
	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	mux := routes.Routes()

	fmt.Println("Starting server on http://localhost" + port)
	log.Fatal(http.ListenAndServe(port, mux))
}
