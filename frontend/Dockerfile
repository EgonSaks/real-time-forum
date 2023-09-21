# Stage 1: Building the application
FROM golang:1.21 AS builder

WORKDIR /app

COPY ./tls/server.crt /tls/server.crt
COPY ./tls/server.key /tls/server.key

COPY go.mod go.sum ./
RUN go mod download
COPY . ./

RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o /app/frontend/server ./frontend/frontend.go

COPY ./frontend/templates /app/frontend/templates
COPY ./frontend/assets/css /app/frontend/assets/css
COPY ./frontend/assets/js /app/frontend/assets/js

EXPOSE 8080

ENTRYPOINT ["/app/frontend/server"]

