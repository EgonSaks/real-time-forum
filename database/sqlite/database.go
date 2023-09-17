package sqlite

import (
	"database/sql"
	"log"
	"os"
	"sync"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

var (
	once     sync.Once
	instance *Database
)

type Database struct {
	DB *sql.DB
}

func connectToDatabase() (*sql.DB, error) {
	dbPath := os.Getenv("DB_PATH")
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Println("Error connecting to database:", err)
		return nil, err
	}
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(time.Minute * 5)
	return db, nil
}

func initializeSchema(db *sql.DB) error {
	schemaFilePath := os.Getenv("SCHEMA_FILE_PATH")
	schema, err := os.ReadFile(schemaFilePath)
	if err != nil {
		log.Println("Error reading schema file:", err)
		return err
	}

	_, err = db.Exec(string(schema))
	if err != nil {
		log.Println("Error executing schema:", err)
		return err
	}
	return nil
}

func GetDatabaseInstance() *Database {
	once.Do(func() {
		db, err := connectToDatabase()
		if err != nil {
			return
		}

		err = initializeSchema(db)
		if err != nil {
			return
		}

		instance = &Database{DB: db}
	})
	return instance
}
