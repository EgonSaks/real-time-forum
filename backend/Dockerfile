# Stage 1: Building the application
FROM golang:1.21 AS builder

# Set working directory
WORKDIR /app

# Copy necessary files for Go build
COPY go.mod go.sum ./
RUN go mod download
COPY . .

RUN apt-get update && apt-get install -y sqlite3 libsqlite3-dev && rm -rf /var/lib/apt/lists/*

# Build the Go app
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o backend ./backend/backend.go
# RUN chmod +x backend

# Stage 2: Copy the binary and other resources to an empty image
# Using alpine because it's lightweight and contains essential libraries
FROM alpine

# Add SSL certificates
RUN apk --no-cache add ca-certificates

# Install zsh and bash
RUN apk add --no-cache zsh
RUN apk add --no-cache bash

# Copy SQLite database and schema
COPY --from=builder /app/database/sqlite/database.db /database/sqlite/database.db
COPY --from=builder /app/database/sqlite/schema.sql /database/sqlite/schema.sql

# Copy SSL certificates for https
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY ./tls/server.crt /tls/server.crt
COPY ./tls/server.key /tls/server.key

# Copy environment files
COPY ./backend/configs/config /configs/config

# Copy the compiled application from builder
COPY --from=builder /app/backend /backend

# Explicitly set permissions
RUN chmod +x /backend/backend

# Expose port 8081 for the backend
EXPOSE 8081

# Run the application
CMD ["/backend"]
