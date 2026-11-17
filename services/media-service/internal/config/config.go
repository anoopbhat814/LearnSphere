// Package config loads service settings from the environment.
package config

import (
	"os"
	"strconv"
)

type Config struct {
	Addr       string
	Workers    int
	FFmpegPath string
	OutputDir  string
	RedisURL   string
}

func Load() Config {
	return Config{
		Addr:       getenv("MEDIA_ADDR", ":8080"),
		Workers:    getenvInt("MEDIA_WORKERS", 4),
		FFmpegPath: getenv("FFMPEG_PATH", "ffmpeg"),
		OutputDir:  getenv("MEDIA_OUTPUT_DIR", "/var/lib/learnsphere/media"),
		RedisURL:   getenv("REDIS_URL", "redis://localhost:6379"),
	}
}

func getenv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

func getenvInt(key string, fallback int) int {
	if v, err := strconv.Atoi(os.Getenv(key)); err == nil && v > 0 {
		return v
	}
	return fallback
}
