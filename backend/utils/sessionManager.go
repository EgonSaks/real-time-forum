package utils

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/real-time-forum/database/models"
	"github.com/real-time-forum/database/sqlite"
)

func SetSession(w http.ResponseWriter, r *http.Request, id string) (*http.Cookie, error) {
	user := models.User{
		ID: id,
	}

	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	cookie, err := r.Cookie("session")
	fmt.Println("Looking for an active session...")

	if err != nil {

		fmt.Println("Didn't find active session. Creating a new session")
		cookie = &http.Cookie{
			Name:     "session",
			Value:    uuid.New().String(),
			Path:     "/",
			HttpOnly: true,
			Expires:  time.Now().Add(2 * time.Hour),
			Secure:   true,
			SameSite: http.SameSiteNoneMode,
		}
		http.SetCookie(w, cookie)

		session := models.Session{
			ID:        cookie.Value,
			UserID:    user.ID,
			ExpiresAt: cookie.Expires,
		}

		_, err = models.CreateSession(database.DB, session)
		if err != nil {
			log.Fatal(err)
		}

	} else {

		fmt.Println("Getting active session", cookie)

		session, err := models.GetSessionByID(database.DB, cookie.Value)
		if err != nil {
			fmt.Println("No matching session found in the database, delete the cookie")
			DeleteSession(w, r)

			// Create a new session cookie for the current user
			cookie = &http.Cookie{
				Name:     "session",
				Value:    uuid.New().String(),
				Path:     "/",
				HttpOnly: true,
				Expires:  time.Now().Add(2 * time.Hour),
				Secure:   true,
				SameSite: http.SameSiteNoneMode,
			}

			http.SetCookie(w, cookie)

			session := models.Session{
				ID:        cookie.Value,
				UserID:    user.ID,
				ExpiresAt: cookie.Expires,
			}

			_, err = models.CreateSession(database.DB, session)
			if err != nil {
				log.Fatal(err)
			}
			fmt.Println("Created new session for user", user.ID)
		} else if session.UserID != user.ID {
			fmt.Println("Session belongs to a different user, delete the cookie")
			DeleteSession(w, r)

			// Create a new session cookie for the current user
			cookie = &http.Cookie{
				Name:     "session",
				Value:    uuid.New().String(),
				Path:     "/",
				HttpOnly: true,
				Expires:  time.Now().Add(2 * time.Hour),
				Secure:   true,
				SameSite: http.SameSiteNoneMode,
			}
			http.SetCookie(w, cookie)

			session := models.Session{
				ID:        cookie.Value,
				UserID:    user.ID,
				ExpiresAt: cookie.Expires,
			}

			_, err = models.CreateSession(database.DB, session)
			if err != nil {
				fmt.Println("Error with creating session:", err)
				log.Fatal(err)
			}
			fmt.Println("Created new session for user", user.ID)
		}
	}

	return cookie, nil
}

func GetUserFromSession(r *http.Request) (models.User, bool) {
	cookie, err := r.Cookie("session")
	if err != nil {
		return models.User{}, false
	}

	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	var userID string
	err = database.DB.QueryRow(`SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?`, cookie.Value, time.Now()).Scan(&userID)
	if err != nil {
		return models.User{}, false
	}

	var user models.User
	err = database.DB.QueryRow(`SELECT id, username, first_name, last_name, email, age, password, gender, created_at, updated_at FROM users WHERE id = ?`, userID).Scan(&user.ID, &user.Username, &user.FirstName, &user.LastName, &user.Email, &user.Age, &user.Password, &user.Gender, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return models.User{}, false
	}
	// fmt.Println("Logged in", user.ID)
	return user, true
}

func DeleteSession(w http.ResponseWriter, r *http.Request) (*http.Cookie, error) {
	cookie, err := r.Cookie("session")
	if err != nil {
		fmt.Println("No cookie found")
		return nil, nil

	}

	database, err := sqlite.OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer database.DB.Close()

	err = models.DeleteSession(database.DB, cookie.Value)
	if err != nil {
		return nil, err
	}

	cookie = &http.Cookie{
		Name:   "session",
		Value:  "",
		MaxAge: -1,
		Path:   "/",
	}
	http.SetCookie(w, cookie)
	return cookie, nil
}
