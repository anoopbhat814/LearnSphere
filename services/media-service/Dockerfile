FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/media-service ./cmd/server

FROM alpine:3.19
RUN apk add --no-cache ffmpeg
COPY --from=build /out/media-service /usr/local/bin/media-service
EXPOSE 8080
ENTRYPOINT ["media-service"]
