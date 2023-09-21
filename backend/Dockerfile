# Stage 1: Building the application
FROM golang:1.21 AS builder

WORKDIR /app

COPY ./backend/configs/config /app/configs/config
COPY ./database/sqlite/schema.sql /database/sqlite/schema.sql

COPY ./tls/server.crt /tls/server.crt
COPY ./tls/server.key /tls/server.key

COPY go.mod go.sum ./
RUN go mod download
COPY . ./

RUN apt-get update && apt-get install -y sqlite3 libsqlite3-dev && rm -rf /var/lib/apt/lists/*

RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o /app/backend/server ./backend/backend.go

EXPOSE 8081

ENTRYPOINT ["/app/backend/server"]