package sqlite

import (
	"database/sql"
	"os"

	_ "github.com/mattn/go-sqlite3" // Import SQLite driver
)

type Database struct {
	DB *sql.DB
}

func OpenDatabase() (*Database, error) {
	dbPath := "./database/sqlite/database.db"
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}

	schema, err := os.ReadFile("./database/sqlite/schema.sql")
	if err != nil {
		return nil, err
	}

	_, err = db.Exec(string(schema))
	if err != nil {
		return nil, err
	}

	return &Database{DB: db}, nil
}
