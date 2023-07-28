package models

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

type Post struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// The function `CreatePost` inserts a new post into a database table and returns the ID of the created
// post.
func CreatePost(db *sql.DB, post Post) (string, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "INSERT INTO posts (id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
	statement, err := db.PrepareContext(context, query)
	if err != nil {
		fmt.Printf("failed to prepare create post statement: %v", err)
		return post.ID, fmt.Errorf("failed to prepare create post statement: %v", err)
	}

	_, err = statement.ExecContext(context, &post.ID, &post.Title, &post.Content, time.Now().UTC(), time.Now().UTC())
	if err != nil {
		fmt.Printf("failed to create post: %v", err)
		return post.ID, fmt.Errorf("failed to create post: %v", err)
	}

	return post.ID, nil
}

// The function GetAllPosts retrieves all posts from a database and returns them as a slice of Post
// structs.
func GetAllPosts(db *sql.DB) ([]Post, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "SELECT id, title, content, created_at, updated_at FROM posts"
	rows, err := db.QueryContext(context, query)
	if err != nil {
		fmt.Printf("failed to execute query: %v", err)
		return nil, fmt.Errorf("failed to execute query: %v", err)
	}
	defer rows.Close()

	posts := make([]Post, 0)
	for rows.Next() {
		var post Post
		err := rows.Scan(&post.ID, &post.Title, &post.Content, &post.CreatedAt, &post.UpdatedAt)
		if err != nil {
			fmt.Printf("failed to scan row: %v", err)
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}
		posts = append(posts, post)
	}

	if err := rows.Err(); err != nil {
		fmt.Printf("failed to retrieve rows: %v", err)
		return nil, fmt.Errorf("failed to retrieve rows: %v", err)
	}

	return posts, nil
}

// The function `UpdatePost` updates a post in a database with the provided title, content, and
// updated_at timestamp.
func UpdatePost(db *sql.DB, post Post) error {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "UPDATE posts SET title = ?, content = ?, updated_at = ? WHERE id = ?"
	statement, err := db.PrepareContext(context, query)
	if err != nil {
		fmt.Printf("failed to prepare update post statement: %v", err)
		return fmt.Errorf("failed to prepare update post statement: %v", err)
	}

	_, err = statement.ExecContext(context, &post.Title, &post.Content, time.Now().UTC(), &post.ID)
	if err != nil {
		fmt.Printf("failed to update post: %v", err)
		return fmt.Errorf("failed to update post: %v", err)
	}

	return nil
}

// The DeletePost function deletes a post from a database using the provided post ID.
func DeletePost(db *sql.DB, postID string) error {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "DELETE FROM posts WHERE id = ?"
	statement, err := db.PrepareContext(context, query)
	if err != nil {
		fmt.Printf("failed to prepare delete post statement: %v", err)
		return fmt.Errorf("failed to prepare delete post statement: %v", err)
	}

	_, err = statement.ExecContext(context, &postID)
	if err != nil {
		fmt.Printf("failed to delete post: %v", err)
		return fmt.Errorf("failed to delete post: %v", err)
	}

	return nil
}

// GetPostByID retrieves a single post by its ID from the database
func GetPostByID(db *sql.DB, postID string) (*Post, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "SELECT id, title, content, created_at, updated_at FROM posts WHERE id = ?"
	row := db.QueryRowContext(context, query, postID)

	var post Post
	err := row.Scan(&post.ID, &post.Title, &post.Content, &post.CreatedAt, &post.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("post not found")
		}
		fmt.Printf("failed to scan row: %v", err)
		return nil, fmt.Errorf("failed to scan row: %v", err)
	}

	return &post, nil
}
