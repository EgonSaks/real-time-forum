package main

import (
	"fmt"
	"html/template"
	"net/http"
	"os"
	"path/filepath"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	templatesPath := filepath.Join(".", "templates")
	indexPath := filepath.Join(templatesPath, "index.html")
	assetsPath := filepath.Join(".", "assets")

	http.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir(assetsPath))))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		tmpl, err := template.ParseFiles(indexPath)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		err = tmpl.Execute(w, nil)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	})

	addr := ":" + port
	fmt.Println("Frontend server running at http://localhost:" + port)
	http.ListenAndServe(addr, nil)
}
