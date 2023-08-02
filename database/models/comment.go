package models

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

type Comment struct {
	ID        string    `json:"id"`
	PostID    string    `json:"post_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// The function `CreateComment` inserts a new comment into a database table and returns the ID of the created comment.
func CreateComment(db *sql.DB, comment Comment) (string, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "INSERT INTO comments (id, post_id, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
	statement, err := db.PrepareContext(context, query)
	if err != nil {
		fmt.Printf("failed to prepare create comment statement: %v", err)
		return comment.ID, fmt.Errorf("failed to prepare create comment statement: %v", err)
	}

	_, err = statement.ExecContext(context, comment.ID, comment.PostID, comment.Content, time.Now().UTC(), time.Now().UTC())
	if err != nil {
		fmt.Printf("failed to create comment: %v", err)
		return comment.ID, fmt.Errorf("failed to create comment: %v", err)
	}

	return comment.ID, nil
}

// The function GetAllComments retrieves all comments from a database and returns them as a slice of Comment structs.
func GetAllComments(db *sql.DB) ([]Comment, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "SELECT id, post_id, content, created_at, updated_at FROM comments"
	rows, err := db.QueryContext(context, query)
	if err != nil {
		fmt.Printf("failed to execute query: %v", err)
		return nil, fmt.Errorf("failed to execute query: %v", err)
	}
	defer rows.Close()

	comments := make([]Comment, 0)
	for rows.Next() {
		var comment Comment
		err := rows.Scan(&comment.ID, &comment.PostID, &comment.Content, &comment.CreatedAt, &comment.UpdatedAt)
		if err != nil {
			fmt.Printf("failed to scan row: %v", err)
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}
		comments = append(comments, comment)
	}

	if err := rows.Err(); err != nil {
		fmt.Printf("failed to retrieve rows: %v", err)
		return nil, fmt.Errorf("failed to retrieve rows: %v", err)
	}

	return comments, nil
}

// The function `UpdateComment` updates a comment in a database with the provided content and updated_at timestamp.
func UpdateComment(db *sql.DB, comment Comment) error {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "UPDATE comments SET content = ?, updated_at = ? WHERE id = ?"
	statement, err := db.PrepareContext(context, query)
	if err != nil {
		fmt.Printf("failed to prepare update comment statement: %v", err)
		return fmt.Errorf("failed to prepare update comment statement: %v", err)
	}

	_, err = statement.ExecContext(context, comment.Content, time.Now().UTC(), comment.ID)
	if err != nil {
		fmt.Printf("failed to update comment: %v", err)
		return fmt.Errorf("failed to update comment: %v", err)
	}

	return nil
}

// The DeleteComment function deletes a comment from a database using the provided comment ID.
func DeleteComment(db *sql.DB, commentID string) error {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "DELETE FROM comments WHERE id = ?"
	statement, err := db.PrepareContext(context, query)
	if err != nil {
		fmt.Printf("failed to prepare delete comment statement: %v", err)
		return fmt.Errorf("failed to prepare delete comment statement: %v", err)
	}

	_, err = statement.ExecContext(context, commentID)
	if err != nil {
		fmt.Printf("failed to delete comment: %v", err)
		return fmt.Errorf("failed to delete comment: %v", err)
	}

	return nil
}

// GetCommentByID retrieves a single comment by its ID from the database
func GetCommentByID(db *sql.DB, commentID string) (*Comment, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "SELECT id, post_id, content, created_at, updated_at FROM comments WHERE id = ?"
	row := db.QueryRowContext(context, query, commentID)

	var comment Comment
	err := row.Scan(&comment.ID, &comment.PostID, &comment.Content, &comment.CreatedAt, &comment.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("comment not found")
		}
		fmt.Printf("failed to scan row: %v", err)
		return nil, fmt.Errorf("failed to scan row: %v", err)
	}

	return &comment, nil
}

// GetCommentsByPostID retrieves all comments for a post from the database
// GetCommentsByPostID retrieves all comments for a post from the database
func GetCommentsByPostID(db *sql.DB, postID string) ([]Comment, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "SELECT id, post_id, content, created_at, updated_at FROM comments WHERE post_id = ?"
	rows, err := db.QueryContext(context, query, postID)
	if err != nil {
		fmt.Printf("failed to execute query: %v", err)
		return nil, fmt.Errorf("failed to execute query: %v", err)
	}
	defer rows.Close()

	comments := make([]Comment, 0)
	for rows.Next() {
		var comment Comment
		err := rows.Scan(&comment.ID, &comment.PostID, &comment.Content, &comment.CreatedAt, &comment.UpdatedAt)
		if err != nil {
			fmt.Printf("failed to scan row: %v", err)
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}
		comments = append(comments, comment)
	}

	if err := rows.Err(); err != nil {
		fmt.Printf("failed to retrieve rows: %v", err)
		return nil, fmt.Errorf("failed to retrieve rows: %v", err)
	}

	return comments, nil
}
