package utils

import (
	"bufio"
	"os"
	"strings"

	"github.com/real-time-forum/backend/logger"
)

func GetEnvironment() string {
	env := os.Getenv("GO_ENV")
	if env == "" {
		env = "dev"
	}
	logger.InfoLogger.Printf("Current environment: %s", env)
	return env
}

func LoadConfigFile(filePath string) (*os.File, error) {
	file, err := os.Open(filePath)
	if err != nil {
		logger.ErrorLogger.Printf("Error loading config file: %v", err)
		return nil, err
	}
	logger.InfoLogger.Printf("Config file %s loaded successfully", filePath)
	return file, nil
}

func SetEnvironmentVariables(file *os.File) error {
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, "=") {
			parts := strings.SplitN(line, "=", 2)
			key := parts[0]
			value := parts[1]
			os.Setenv(key, value)
			logger.InfoLogger.Printf("Environment variable %s set to %s", key, value)
		}
	}
	if err := scanner.Err(); err != nil {
		logger.ErrorLogger.Printf("Error setting environment variables: %v", err)
		return err
	}
	logger.InfoLogger.Printf("Environment variables set successfully")
	return nil
}
