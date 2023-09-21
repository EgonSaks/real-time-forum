# Stage 1: Building the application
FROM golang:1.21 AS builder

WORKDIR /app

COPY ./tls/server.crt /tls/server.crt
COPY ./tls/server.key /tls/server.key

COPY ./backend/ /app/backend/
COPY ./database/ /database/

COPY go.mod go.sum ./
RUN go mod download
COPY . ./

COPY backend/ ./

RUN apt-get update && apt-get install -y sqlite3 libsqlite3-dev && rm -rf /var/lib/apt/lists/*

RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o /app/backend/server ./backend/backend.go

EXPOSE 8081

ENTRYPOINT ["/app/backend/server"]