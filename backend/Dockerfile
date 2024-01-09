# Stage 1: Building the application
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . ./
RUN apk --no-cache add gcc g++ sqlite
# Set the CGO_CFLAGS environment variable
ENV CGO_CFLAGS="-D_LARGEFILE64_SOURCE"
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o /app/server ./backend/backend.go

# Stage 2: Production stage using Alpine
FROM alpine:latest

RUN apk --no-cache add ca-certificates sqlite

COPY ./tls/server.crt /tls/server.crt
COPY ./tls/server.key /tls/server.key
COPY ./backend/configs/config /app/configs/config
COPY ./database/ /database/

COPY --from=builder /app/server /app/server

COPY backend/ ./

EXPOSE 8081
ENTRYPOINT ["/app/server"]