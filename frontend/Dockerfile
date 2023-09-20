# Stage 1: Build the Go application
FROM golang:1.21 AS builder

# Set working directory
WORKDIR /app

# Copy package files and download dependencies
COPY go.mod go.sum ./
RUN go mod download
COPY . .

# Build the Go app
RUN CGO_ENABLED=1 GOOS=linux go build -o frontend ./frontend/frontend.go

# Stage 2: Create the final image
FROM alpine

# Add SSL certificates
RUN apk --no-cache add ca-certificates

# Copy SSL certificates for https
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY ./tls/server.crt /tls/server.crt
COPY ./tls/server.key /tls/server.key

# Copy the compiled application from builder
COPY --from=builder /app/frontend /frontend

# Explicitly set permissions
RUN chmod +x /frontend/frontend

# Expose port 8080 for the frontend
EXPOSE 8080

# Run the application
CMD ["/frontend/frontend"]
