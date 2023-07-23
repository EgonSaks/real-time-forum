#!/bin/zsh

# Function to generate random lorem ipsum text with a given length
generate_lorem_ipsum() {
  lorem_ipsum="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
  echo ${lorem_ipsum:0:$1}
}

# Function to generate random headlines with 1 to 5 words
generate_headline() {
  num_words=$((RANDOM % 5 + 1)) # Random number of words from 1 to 5
  words=("Exciting" "Amazing" "Breaking" "Incredible" "Fascinating" "Wonderful" "Fantastic" "Extraordinary" "Sensational" "Unbelievable" "Breathtaking" "Astonishing")
  headline=""
  for ((i=1; i<=$num_words; i++))
  do
    random_word_index=$((RANDOM % ${#words[@]}))
    headline+=" ${words[$random_word_index]}"
  done
  echo $headline
}

for ((i=1; i<=5; i++))
do
  title=$(generate_headline)
  content_length=$((10 + RANDOM % 251)) # Random length between 10 and 250 characters
  content=$(generate_lorem_ipsum $content_length)
  curl -X POST -H "Content-Type: application/json" -d "{\"title\":\"$title\",\"content\":\"$content\"}" http://localhost:8081/api/posts
done
