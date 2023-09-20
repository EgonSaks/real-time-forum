# Build stage
FROM golang:1.21 AS builder

# Set working directory
WORKDIR /app

# Copy necessary files
COPY go.mod go.sum ./
COPY . ./

# Install any needed dependencies
RUN go mod download

# Build the application
RUN go build -o /backend ./backend/backend.go

# Expose port 8081
EXPOSE 8081

# Run the compiled binary
ENTRYPOINT [ "/backend"]
