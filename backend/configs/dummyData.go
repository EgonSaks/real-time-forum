package configs

import (
	"log"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/real-time-forum/backend/utils"
	"github.com/real-time-forum/database/models"
)

func InsertDummyData() {
	users := []struct {
		Username  string
		FirstName string
		LastName  string
		Email     string
		Age       int
		Gender    string
		Password  string
	}{
		{"Elon", "Elon", "Musk", "elon.musk@example.com", 50, "Male", "Password123"},
		{"Bill", "Bill", "Gates", "bill.gates@example.com", 65, "Male", "Password123"},
		{"Jeff", "Jeff", "Bezos", "jeff.bezos@example.com", 58, "Male", "Password123"},
		{"Steve", "Steve", "Jobs", "steve.jobs@example.com", 56, "Male", "Password123"},
		{"Mark", "Mark", "Zuckerberg", "mark.zuckerberg@example.com", 37, "Male", "Password123"},
		{"Sergey", "Sergey", "Brin", "sergey.brin@example.com", 48, "Male", "Password123"},
		{"Tim", "Tim", "Cook", "tim.cook@example.com", 61, "Male", "Password123"},
		{"Satya", "Satya", "Nadella", "satya.nadella@example.com", 53, "Male", "Password123"},
		{"Sundar", "Sundar", "Pichai", "sundar.pichai@example.com", 49, "Male", "Password123"},
		{"Brian", "Brian", "Chesky", "brian.chesky@example.com", 40, "Male", "Password123"},
		{"Travis", "Travis", "Kalanick", "travis.kalanick@example.com", 45, "Male", "Password123"},
	}

	posts := []struct {
		UserID     string
		Author     string
		Title      string
		Content    string
		Categories []string
	}{
		{users[0].Username, "Elon", "How to reach Mars", "To reach Mars, we need to overhaul space travel economics. Current rockets are expendable and costly. Imagine using a Boeing 747 for just one flight and then discarding it. The solution? Reusable rockets, like SpaceX's Falcon series, which land back on Earth. This slashes the cost of payloads and human travel, making Mars an achievable target. Key tech advancements like the Raptor engine and Starship, along with in-orbit refueling, are vital to this mission.\n\nHowever, rockets are just the start. A Mars colony demands innovations in life support, energy, and habitat construction. It's not just about reaching Mars; it's about sustaining life there. This is a mission that requires top talent, significant resources, and unyielding determination. It's not just SpaceX's challenge; it's a challenge for humanity.", []string{"Tech", "Innovation"}},
		{users[1].Username, "Bill", "The future of Software", "Software's impact is evolving beyond mere digitization, penetrating traditional sectors like retail, healthcare, and transportation. It's not just about managing data; it's about intelligent software capable of learning and adapting. Take healthcare: it's not just electronic records but predictive analytics and personalized treatments via machine learning.\n\nWhat's on the horizon? Quantum computing. It promises to tackle complex problems in material science and drug discovery, areas where current computing falls short.\n\nIn summary, the role of software is set to grow exponentially, presenting both unparalleled opportunities and challenges. The future is not just digital; it's intelligent and potentially limitless.", []string{"Tech"}},
		{users[2].Username, "Jeff", "Building a business", "Start by understanding your customer and work backward. Instead of focusing on what you can build, concentrate on what you should build to solve real problems or meet hidden needs.\n\nWhile capital is vital, a culture of innovation and long-term vision is the true lifeblood of a startup. At Amazon, this meant taking calculated risks, even at the risk of failure. Remember, failure and innovation are closely linked.\n\nFinally, implement strong analytics from the get-go. Measure every aspect of your business, from customer behavior to sales funnels. Metrics aren't just numbers; they're the heartbeat of your venture.", []string{"Startup", "Finance"}},
		{users[3].Username, "Steve", "The Importance of Design: Less is...", "The misconception is that added features equal value, but the key is purposeful simplicity. It's not just about functionality, but also the emotional experience it offers.\n\nTake the iPhone as an example: a single button, a touchscreen, yet revolutionary. Its design didn't stem from mimicking competitors but from reimagining possibilities.\n\nDesign is not merely aesthetic; it's functional. Begin by identifying what truly matters and design around that. Complexity is easy; achieving simplicity is where genius lies.", []string{"Startup", "Finance", "Innovation"}},
	}

	for _, usr := range users {

		hashedPassword, err := utils.HashPassword(usr.Password)
		if err != nil {
			log.Println("Hashing failed:", err)
			return
		}

		newUser := models.User{
			ID:        uuid.New().String(),
			Username:  usr.Username,
			FirstName: usr.FirstName,
			LastName:  usr.LastName,
			Email:     usr.Email,
			Age:       strconv.Itoa(usr.Age),
			Gender:    usr.Gender,
			Password:  string(hashedPassword),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		userID, err := models.CreateUser(newUser)
		if err != nil {
			log.Println("Failed to create user:", err)
			return
		}

		for _, pst := range posts {
			if pst.UserID == usr.Username {

				newPost := models.Post{
					ID:         uuid.New().String(),
					UserID:     userID,
					Author:     pst.Author,
					Title:      pst.Title,
					Content:    pst.Content,
					Categories: pst.Categories,
					CreatedAt:  time.Now(),
					UpdatedAt:  time.Now(),
				}

				_, err := models.CreatePost(newPost, newUser)
				if err != nil {
					log.Println("Failed to create post:", err)
					return
				}
			}
		}
	}
}
