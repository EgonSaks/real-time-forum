package models

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"
)

type Post struct {
	ID         string    `json:"id"`
	UserID     string    `json:"user_id"`
	Author     string    `json:"author"`
	Title      string    `json:"title"`
	Content    string    `json:"content"`
	Categories []string  `json:"categories"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func CreatePost(db *sql.DB, post Post, user User) (string, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "INSERT INTO posts (id, user_id, title, content, categories, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
	statement, err := db.PrepareContext(context, query)
	if err != nil {
		fmt.Printf("failed to prepare create post statement: %v", err)
		return post.ID, fmt.Errorf("failed to prepare create post statement: %v", err)
	}

	categoriesStr := strings.Join(post.Categories, ",")
	_, err = statement.ExecContext(context, &post.ID, &user.ID, &post.Title, &post.Content, categoriesStr, time.Now().UTC(), time.Now().UTC())

	if err != nil {
		fmt.Printf("failed to create post: %v", err)
		return post.ID, fmt.Errorf("failed to create post: %v", err)
	}

	return post.ID, nil
}

func GetAllPosts(db *sql.DB) ([]Post, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
        SELECT
            posts.id,
            posts.user_id,
            users.username,
            posts.title,
            posts.content,
            posts.categories,
            posts.created_at,
            posts.updated_at
        FROM
            posts
        INNER JOIN
            users
        ON
            posts.user_id = users.id
    `

	rows, err := db.QueryContext(context, query)
	if err != nil {
		fmt.Printf("failed to execute query: %v", err)
		return nil, fmt.Errorf("failed to execute query: %v", err)
	}
	defer rows.Close()

	posts := make([]Post, 0)
	for rows.Next() {
		var post Post
		var categoriesStr string // A new variable to hold the comma-separated categories string

		err := rows.Scan(&post.ID, &post.UserID, &post.Author, &post.Title, &post.Content, &categoriesStr, &post.CreatedAt, &post.UpdatedAt)
		if err != nil {
			fmt.Printf("failed to scan row: %v", err)
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		post.Categories = strings.Split(categoriesStr, ",") // Convert the string back into a slice

		posts = append(posts, post)
	}

	if err := rows.Err(); err != nil {
		fmt.Printf("failed to retrieve rows: %v", err)
		return nil, fmt.Errorf("failed to retrieve rows: %v", err)
	}

	return posts, nil
}

func GetPostByID(db *sql.DB, postID string) (*Post, error) {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		SELECT
			posts.id,
			posts.user_id,
			users.username,
			posts.title,
			posts.content,
			posts.categories,
			posts.created_at,
			posts.updated_at
		FROM
			posts
		INNER JOIN
			users
		ON
			posts.user_id = users.id
		WHERE
			posts.id = ?`

	row := db.QueryRowContext(context, query, postID)

	var post Post
	var categoriesStr string // A new variable to hold the categories as a comma-separated string

	err := row.Scan(&post.ID, &post.UserID, &post.Author, &post.Title, &post.Content, &categoriesStr, &post.CreatedAt, &post.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("post not found")
		}
		fmt.Printf("failed to scan row: %v", err)
		return nil, fmt.Errorf("failed to scan row: %v", err)
	}

	post.Categories = strings.Split(categoriesStr, ",") // Convert the comma-separated string to a slice
	return &post, nil
}

func UpdatePost(db *sql.DB, post Post) error {
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "UPDATE posts SET title = ?, content = ?, categories = ?, updated_at = ? WHERE id = ?"
	statement, err := db.PrepareContext(context, query)
	if err != nil {
		fmt.Printf("failed to prepare update post statement: %v", err)
		return fmt.Errorf("failed to prepare update post statement: %v", err)
	}

	// Serialize the Categories slice to a string
	categoriesStr := strings.Join(post.Categories, ",")

	// Update the ExecContext call to include the serialized Categories
	_, err = statement.ExecContext(context, &post.Title, &post.Content, &categoriesStr, time.Now().UTC(), &post.ID)
	if err != nil {
		fmt.Printf("failed to update post: %v", err)
		return fmt.Errorf("failed to update post: %v", err)
	}

	return nil
}

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
