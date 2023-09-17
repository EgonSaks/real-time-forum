package utils

import (
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/real-time-forum/backend/logger"
	"github.com/real-time-forum/database/models"
	"github.com/real-time-forum/database/sqlite"
)

func SetSession(w http.ResponseWriter, r *http.Request, id string) (*http.Cookie, error) {
	user := models.User{
		ID: id,
	}

	cookie, err := r.Cookie("session")
	if err != nil {

		cookie = &http.Cookie{
			Name:     "session",
			Value:    uuid.New().String(),
			Path:     "/",
			HttpOnly: false,
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

		_, err = models.CreateSession(session)
		if err != nil {
			logger.FatalLogger.Println("Error creating session:", err)
			return nil, err
		}
	} else {
		session, err := models.GetSessionByID(cookie.Value)
		if err != nil {
			if _, err := DeleteSession(w, r); err != nil {
				logger.ErrorLogger.Println("Error deleting session:", err)
				return nil, err
			}

			cookie = &http.Cookie{
				Name:     "session",
				Value:    uuid.New().String(),
				Path:     "/",
				HttpOnly: false,
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

			_, err = models.CreateSession(session)
			if err != nil {
				log.Fatal(err)
			}
		} else if session.UserID != user.ID {
			if _, err := DeleteSession(w, r); err != nil {
				logger.ErrorLogger.Println("Error deleting session:", err)
				return nil, err
			}

			cookie = &http.Cookie{
				Name:     "session",
				Value:    uuid.New().String(),
				Path:     "/",
				HttpOnly: false,
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

			_, err = models.CreateSession(session)
			if err != nil {
				logger.FatalLogger.Println("Error creating session:", err)
				log.Fatal(err)
			}
		}
	}

	return cookie, nil
}

func GetUserFromSession(r *http.Request) (models.User, bool) {
	cookie, err := r.Cookie("session")
	if err != nil {
		return models.User{}, false
	}

	database := sqlite.GetDatabaseInstance()
	if database == nil || database.DB == nil {
		logger.ErrorLogger.Printf("Database connection error")
		log.Fatal("Database connection error")
		return models.User{}, false
	}

	var userID string
	err = database.DB.QueryRow(`SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?`, cookie.Value, time.Now()).Scan(&userID)
	if err != nil {
		return models.User{}, false
	}

	var user models.User
	err = database.DB.QueryRow(`SELECT id, username, first_name, last_name, email, age, password, gender, created_at, updated_at FROM users WHERE id = ?`, userID).Scan(&user.ID, &user.Username, &user.FirstName, &user.LastName, &user.Email, &user.Age, &user.Password, &user.Gender, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		logger.WarnLogger.Println("User not found in database for the session.")
		return models.User{}, false
	}
	return user, true
}

func DeleteSession(w http.ResponseWriter, r *http.Request) (*http.Cookie, error) {
	cookie, err := r.Cookie("session")
	if err != nil {
		logger.WarnLogger.Println("No session cookie found.")
		return nil, nil
	}

	err = models.DeleteSession(cookie.Value)
	if err != nil {
		logger.ErrorLogger.Println("Failed to delete session:", err)
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
