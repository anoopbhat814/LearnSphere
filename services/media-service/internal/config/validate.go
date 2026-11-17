package config

import (
	"errors"
	"fmt"
	"os/exec"
	"strings"
)

// Validate checks that the loaded configuration is usable before the service
// starts accepting jobs. It reports every problem it finds, not just the first.
func (c Config) Validate() error {
	var problems []string

	if !strings.Contains(c.Addr, ":") {
		problems = append(problems, fmt.Sprintf("MEDIA_ADDR %q must include a port", c.Addr))
	}
	if c.Workers > 64 {
		problems = append(problems, fmt.Sprintf("MEDIA_WORKERS=%d exceeds the supported maximum of 64", c.Workers))
	}
	if _, err := exec.LookPath(c.FFmpegPath); err != nil {
		problems = append(problems, fmt.Sprintf("ffmpeg binary %q not found on PATH", c.FFmpegPath))
	}
	if !strings.HasPrefix(c.RedisURL, "redis://") && !strings.HasPrefix(c.RedisURL, "rediss://") {
		problems = append(problems, "REDIS_URL must use the redis:// or rediss:// scheme")
	}

	if len(problems) > 0 {
		return errors.New("invalid configuration: " + strings.Join(problems, "; "))
	}
	return nil
}
