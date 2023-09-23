# Stage 1: Building the application
FROM golang:1.21-alpine AS builder
WORKDIR /app

COPY ./frontend/ /app/frontend/

COPY go.mod go.sum ./
RUN go mod download

COPY frontend/ ./

RUN apk --no-cache add gcc g++
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o /app/server ./frontend/frontend.go

# Stage 2: Production stage using Alpine
FROM alpine:latest

RUN apk --no-cache add ca-certificates sqlite

COPY ./tls/server.crt /tls/server.crt
COPY ./tls/server.key /tls/server.key
COPY frontend/ ./

COPY --from=builder /app/server /app/server

EXPOSE 8080

ENTRYPOINT ["/app/server"]