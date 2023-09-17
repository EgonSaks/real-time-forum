package models

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/real-time-forum/backend/logger"
	"github.com/real-time-forum/database/sqlite"
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

func CreatePost(post Post, user User) (string, error) {
	database := sqlite.GetDatabaseInstance()
	if database == nil || database.DB == nil {
		logger.ErrorLogger.Printf("Database connection error")
		log.Fatal("Database connection error")
		return post.ID, fmt.Errorf("database connection error")
	}
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "INSERT INTO posts (id, user_id, title, content, categories, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
	statement, err := database.DB.PrepareContext(context, query)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to prepare create post statement for user ID: %s, Title: %s. Error: %v", user.ID, post.Title, err)
		return post.ID, fmt.Errorf("failed to prepare create post statement: %v", err)
	}

	categoriesStr := strings.Join(post.Categories, ",")
	_, err = statement.ExecContext(context, &post.ID, &user.ID, &post.Title, &post.Content, categoriesStr, time.Now().UTC(), time.Now().UTC())

	if err != nil {
		logger.ErrorLogger.Printf("Failed to create post for user ID: %s, Title: %s. Error: %v", user.ID, post.Title, err)
		return post.ID, fmt.Errorf("failed to create post: %v", err)
	}

	return post.ID, nil
}

func GetAllPosts() ([]Post, error) {
	database := sqlite.GetDatabaseInstance()
	if database == nil || database.DB == nil {
		logger.ErrorLogger.Printf("Database connection error")
		log.Fatal("Database connection error")
		return nil, fmt.Errorf("database connection error")
	}
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

	rows, err := database.DB.QueryContext(context, query)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to execute query to get all posts. Error: %v", err)
		return nil, fmt.Errorf("failed to execute query: %v", err)
	}
	defer rows.Close()

	posts := make([]Post, 0)
	for rows.Next() {
		var post Post
		var categoriesStr string

		err := rows.Scan(&post.ID, &post.UserID, &post.Author, &post.Title, &post.Content, &categoriesStr, &post.CreatedAt, &post.UpdatedAt)
		if err != nil {
			logger.ErrorLogger.Printf("Failed to scan row during post retrieval. Error: %v", err)
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		post.Categories = strings.Split(categoriesStr, ",")

		posts = append(posts, post)
	}

	if err := rows.Err(); err != nil {
		logger.ErrorLogger.Printf("Failed to retrieve rows during post retrieval. Error: %v", err)
		return nil, fmt.Errorf("failed to retrieve rows: %v", err)
	}

	return posts, nil
}

func GetPostByID(postID string) (*Post, error) {
	database := sqlite.GetDatabaseInstance()
	if database == nil || database.DB == nil {
		logger.ErrorLogger.Printf("Database connection error")
		log.Fatal("Database connection error")
		return nil, fmt.Errorf("database connection error")
	}

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

	row := database.DB.QueryRowContext(context, query, postID)

	var post Post
	var categoriesStr string

	err := row.Scan(&post.ID, &post.UserID, &post.Author, &post.Title, &post.Content, &categoriesStr, &post.CreatedAt, &post.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			logger.WarnLogger.Printf("Post with ID: %s not found.", postID)
			return nil, fmt.Errorf("post not found")
		}
		logger.ErrorLogger.Printf("Failed to scan row during post retrieval with ID: %s. Error: %v", postID, err)
		return nil, fmt.Errorf("failed to scan row: %v", err)
	}

	post.Categories = strings.Split(categoriesStr, ",")

	return &post, nil
}

func UpdatePost(post Post) error {
	database := sqlite.GetDatabaseInstance()
	if database == nil || database.DB == nil {
		logger.ErrorLogger.Printf("Database connection error")
		log.Fatal("Database connection error")
		return fmt.Errorf("database connection error")
	}
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "UPDATE posts SET title = ?, content = ?, categories = ?, updated_at = ? WHERE id = ?"
	statement, err := database.DB.PrepareContext(context, query)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to prepare update post statement for post ID: %s. Error: %v", post.ID, err)
		return fmt.Errorf("failed to prepare update post statement: %v", err)
	}

	categoriesStr := strings.Join(post.Categories, ",")

	_, err = statement.ExecContext(context, &post.Title, &post.Content, &categoriesStr, time.Now().UTC(), &post.ID)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to update post with ID: %s. Error: %v", post.ID, err)
		return fmt.Errorf("failed to update post: %v", err)
	}

	return nil
}

func DeletePost(postID string) error {
	database := sqlite.GetDatabaseInstance()
	if database == nil || database.DB == nil {
		logger.ErrorLogger.Printf("Database connection error")
		log.Fatal("Database connection error")
		return fmt.Errorf("database connection error")
	}
	context, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := "DELETE FROM posts WHERE id = ?"
	statement, err := database.DB.PrepareContext(context, query)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to prepare delete post statement for post ID: %s. Error: %v", postID, err)
		return fmt.Errorf("failed to prepare delete post statement: %v", err)
	}

	_, err = statement.ExecContext(context, &postID)
	if err != nil {
		logger.ErrorLogger.Printf("Failed to delete post with ID: %s. Error: %v", postID, err)
		return fmt.Errorf("failed to delete post: %v", err)
	}

	return nil
}
