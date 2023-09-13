package utils

import (
	"regexp"
	"strconv"

	"github.com/real-time-forum/database/models"
)

func ValidateRegisterFormData(user models.User) map[string]string {
	errors := make(map[string]string)

	if user.Username == "" {
		errors["username"] = "username cannot be empty"
	} else {
		if len(user.Username) < 2 || len(user.Username) > 15 {
			errors["username"] = "username must be between 2 and 15 characters in length"
		}
		if !regexp.MustCompile(`^[a-zA-Z0-9_]+$`).MatchString(user.Username) {
			errors["username"] = "username can only contain letters, numbers, and underscores"
		}
	}

	if user.FirstName == "" {
		errors["first_name"] = "first name cannot be empty"
	}

	if user.LastName == "" {
		errors["last_name"] = "last name cannot be empty"
	}

	if user.Email == "" {
		errors["email"] = "email cannot be empty"
	} else if !regexp.MustCompile(`\S+@\S+\.\S+`).MatchString(user.Email) {
		errors["email"] = "invalid email format"
	}

	age, err := strconv.Atoi(user.Age)
	if err != nil || age < 0 {
		errors["age"] = "invalid age"
	}

	if user.Gender != "Male" && user.Gender != "Female" {
		errors["gender"] = "please select your gender"
	}

	if user.Password == "" {
		errors["password"] = "password cannot be empty"
	} else if len(user.Password) < 6 || len(user.Password) > 30 {
		errors["password"] = "password must be between 6 and 30 characters in length"
	}

	return errors
}

func ValidateLoginFormInput(usernameOrEmail, password string) map[string]string {
	errors := make(map[string]string)
	var cred models.Credentials

	if usernameOrEmail == "" {
		errors["usernameOrEmail"] = "username or email is required"
	} else {
		emailRegex := regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
		isEmail := emailRegex.MatchString(usernameOrEmail)
		if isEmail {
			cred.Email = usernameOrEmail
		} else {
			cred.Username = usernameOrEmail
		}
	}

	if password == "" {
		errors["password"] = "password is required"
	} else if len(password) < 6 {
		errors["password"] = "password should be at least 6 characters long"
	}

	cred.Password = password

	return errors
}

func ValidatePostInput(post models.Post) map[string]string {
	errors := make(map[string]string)

	if post.Title == "" {
		errors["title"] = "title cannot be empty"
	} else if len(post.Title) > 50 {
		errors["title"] = "title cannot exceed 50 characters"
	}

	if post.Content == "" {
		errors["content"] = "content cannot be empty"
	} else if len(post.Content) > 1000 {
		errors["content"] = "content cannot exceed 1000 characters"
	}

	if len(post.Categories) == 0 {
		errors["categories"] = "at least one category has to be selected"
	}

	return errors
}

func ValidateUpdatedData(post models.Post) map[string]string {
	errors := make(map[string]string)

	if post.Title == "" {
		errors["title"] = "title cannot be empty"
	} else if len(post.Title) > 50 {
		errors["title"] = "title cannot exceed 50 characters"
	}

	if post.Content == "" {
		errors["content"] = "content cannot be empty"
	} else if len(post.Content) > 1000 {
		errors["content"] = "content cannot exceed 1000 characters"
	}

	if len(post.Categories) == 0 {
		errors["categories"] = "at least one category has to be selected"
	}

	return errors
}

func ValidateCommentInput(comment models.Comment) map[string]string {
	errors := make(map[string]string)

	if comment.Content == "" {
		errors["content"] = "comment cannot be empty"
	} else if len(comment.Content) > 250 {
		errors["content"] = "comment cannot exceed 250 characters"
	}

	return errors
}
