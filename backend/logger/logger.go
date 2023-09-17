package logger

import (
	"log"
	"os"
	"time"
)

var (
	InfoLogger  *log.Logger
	ErrorLogger *log.Logger
	WarnLogger  *log.Logger
	FatalLogger *log.Logger
	logFile     *os.File
)

func InitLogger() {
	file, err := os.OpenFile("log.txt", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		log.Fatal("Error opening log file:", err)
	}

	InfoLogger = log.New(file, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
	ErrorLogger = log.New(file, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)
	WarnLogger = log.New(file, "WARNING: ", log.Ldate|log.Ltime|log.Lshortfile)
	FatalLogger = log.New(file, "FATAL: ", log.Ldate|log.Ltime|log.Lshortfile)
	logFile = file

	go func() {
		for {
			now := time.Now()
			nextMidnight := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, now.Location())
			sleepDuration := nextMidnight.Sub(now)

			time.Sleep(sleepDuration)

			err := logFile.Close()
			if err != nil {
				log.Println("Error closing log file:", err)
			}

			err = os.Rename("log.txt", now.Format("log-2006-01-02.txt"))
			if err != nil {
				log.Println("Error renaming log file:", err)
			}

			file, err := os.OpenFile("log.txt", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
			if err != nil {
				log.Println("Error opening log file:", err)
			}

			InfoLogger.SetOutput(file)
			ErrorLogger.SetOutput(file)
			WarnLogger.SetOutput(file)
			FatalLogger.SetOutput(file)
			logFile = file
		}
	}()
}
