package config

import "testing"

func TestLoadDefaults(t *testing.T) {
	t.Setenv("MEDIA_ADDR", "")
	t.Setenv("MEDIA_WORKERS", "")
	cfg := Load()
	if cfg.Addr != ":8080" {
		t.Fatalf("expected default addr :8080, got %q", cfg.Addr)
	}
	if cfg.Workers != 4 {
		t.Fatalf("expected 4 workers, got %d", cfg.Workers)
	}
}

func TestLoadOverrides(t *testing.T) {
	t.Setenv("MEDIA_ADDR", ":9090")
	t.Setenv("MEDIA_WORKERS", "12")
	t.Setenv("FFMPEG_PATH", "/opt/ffmpeg/bin/ffmpeg")
	cfg := Load()
	if cfg.Addr != ":9090" || cfg.Workers != 12 || cfg.FFmpegPath != "/opt/ffmpeg/bin/ffmpeg" {
		t.Fatalf("unexpected config: %+v", cfg)
	}
}

func TestGetenvIntRejectsNonPositive(t *testing.T) {
	t.Setenv("MEDIA_WORKERS", "-3")
	if got := getenvInt("MEDIA_WORKERS", 4); got != 4 {
		t.Fatalf("expected fallback 4, got %d", got)
	}
}
