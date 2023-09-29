package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/real-time-forum/backend/logger"
	"github.com/real-time-forum/backend/routes"
	"github.com/real-time-forum/backend/utils"
	"github.com/real-time-forum/database/sqlite"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "https://localhost:8080")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func init() {
	logger.InitLogger()
	logger.InfoLogger.Println("Logger initialized.")

	env := utils.GetEnvironment()
	logger.InfoLogger.Printf("Running in environment: %s", strings.ToUpper(env))
	log.Println("Running in environment:", strings.ToUpper(env))

	path := utils.GetConfigPath()
	configFile := filepath.Join(path, env+".env")
	file, err := utils.LoadConfigFile(configFile)
	if err != nil {
		logger.FatalLogger.Printf("Error opening config file: %v", err)
		os.Exit(1)
	}
	defer file.Close()
	logger.InfoLogger.Println("Config file loaded successfully.")

	err = utils.SetEnvironmentVariables(file)
	if err != nil {
		logger.FatalLogger.Printf("Error setting environment variables: %v", err)
		os.Exit(1)
	}
	logger.InfoLogger.Println("Environment variables set successfully.")
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	logger.InfoLogger.Printf("Using port: %s", port)

	domain := os.Getenv("DOMAIN")
	if domain == "" {
		domain = "localhost" 
	}

	database := sqlite.GetDatabaseInstance()
	if database == nil || database.DB == nil {
		logger.FatalLogger.Println("Database initialization failed.")
		log.Fatal("Database initialization failed.")
		return
	}
	defer database.DB.Close()

	// configs.InsertDummyData()

	mux := routes.Routes()
	logger.InfoLogger.Println("Routes configured.")

	handler := corsMiddleware(mux)
	logger.InfoLogger.Println("CORS Middleware applied.")

	addr := ":" + port
	backendAddress := "https://" + domain + addr
	logger.InfoLogger.Printf("Backend server running on %s", backendAddress)
	log.Println("Backend server running on " + backendAddress)

	log.Fatal(http.ListenAndServeTLS(addr, "../tls/server.crt", "../tls/server.key", handler))
}
