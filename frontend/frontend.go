package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/", index)

	assetsPath := filepath.Join(".", "assets")
	http.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir(assetsPath))))

	http.Handle("/robots.txt", http.FileServer(http.Dir("./")))

	addr := ":" + port
	fmt.Println("Frontend server running at https://localhost:" + port)
	log.Fatal(http.ListenAndServeTLS(addr, "../tls/server.crt", "../tls/server.key", nil))
}

func index(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles(filepath.Join("templates", "index.html"))
	if err != nil {
		http.Error(w, "Template file not found", http.StatusInternalServerError)
		log.Printf("Error parsing template: %v", err)
		return
	}

	err = tmpl.Execute(w, nil)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		log.Printf("Error rendering template: %v", err)
		return
	}
}
