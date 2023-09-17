package utils

import (
	"github.com/real-time-forum/backend/logger"
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) ([]byte, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		logger.ErrorLogger.Println("Failed to hash password:", err)
		return nil, err
	}
	return hashedPassword, nil
}

func ComparePasswords(hashedPassword, plaintextPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(plaintextPassword))
	if err != nil {
		logger.WarnLogger.Println("Password comparison failed")
		return false
	}

	return true
}
