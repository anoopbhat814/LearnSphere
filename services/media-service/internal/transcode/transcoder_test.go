package transcode

import (
	"strings"
	"testing"
)

func TestArgsContainScaleAndPlaylist(t *testing.T) {
	tr := NewTranscoder("ffmpeg", "/tmp/out")
	args := tr.Args("in.mp4", "lesson1", Rendition{"720p", 720, "2800k"})
	joined := strings.Join(args, " ")
	for _, want := range []string{"scale=-2:720", "-b:v 2800k", "/tmp/out/lesson1/720p.m3u8"} {
		if !strings.Contains(joined, want) {
			t.Errorf("expected args to contain %q, got %s", want, joined)
		}
	}
}
