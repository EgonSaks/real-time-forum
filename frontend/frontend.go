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

	addr := ":" + port
	fmt.Println("Frontend server running at http://localhost:" + port)
	log.Fatal(http.ListenAndServe(addr, nil))
}

func index(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles(filepath.Join("templates/index.html"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = tmpl.Execute(w, nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
