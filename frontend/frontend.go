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
	tmpl := template.Must(template.ParseFiles(filepath.Join("templates/index.html")))

	err := tmpl.Execute(w, nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
