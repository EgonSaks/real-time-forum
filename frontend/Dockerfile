# Use an official Golang runtime as base image
FROM golang:1.21

# Set working directory
WORKDIR /go/src/app

# Copy the local package files to the container workspace
COPY . .

# Install any needed dependencies
RUN go mod download

# Build the application
RUN go build -o frontend .

# Expose port 8080
EXPOSE 8080

# Run the compiled binary
CMD ["./frontend"]


# # Stage 1: Building the application
# FROM golang:1.21 AS builder

# # Set working directory
# WORKDIR /app

# # Copy necessary files
# COPY go.mod go.sum ./
# RUN go mod download

# # Copy remaining project files
# COPY . .

# # Build the Go app with flags for a static binary
# RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o frontend ./frontend/frontend.go

# # Stage 2: Copy the binary to an empty image
# FROM alpine

# # Copy SSL certificates for https
# COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
# COPY ./tls/server.crt /tls/server.crt
# COPY ./tls/server.key /tls/server.key


# # Copy the compiled application from builder
# COPY --from=builder /app/frontend /frontend

# # Explicitly set permissions
# RUN chmod +x /frontend/frontend

# # Expose port 8080 for the frontend
# EXPOSE 8080

# # Run the application
# CMD ["/frontend"]
