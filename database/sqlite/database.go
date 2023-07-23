package sqlite

import (
	"database/sql"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	DB *sql.DB
}

func OpenDatabase() (*Database, error) {
	dbPath := "../database/sqlite/database.db"
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}

	// Print out the schema file path
	schemaFilePath := "../database/sqlite/schema.sql"
	schema, err := os.ReadFile(schemaFilePath)
	if err != nil {
		return nil, err
	}

	_, err = db.Exec(string(schema))
	if err != nil {
		return nil, err
	}

	return &Database{DB: db}, nil
}
