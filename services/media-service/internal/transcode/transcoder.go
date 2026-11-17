// Package transcode converts uploaded lesson videos into HLS renditions.
package transcode

import (
	"context"
	"fmt"
	"os/exec"
	"path/filepath"
)

type Rendition struct {
	Name    string
	Height  int
	Bitrate string
}

var DefaultRenditions = []Rendition{
	{"360p", 360, "800k"},
	{"720p", 720, "2800k"},
	{"1080p", 1080, "5000k"},
}

type Transcoder struct {
	ffmpeg    string
	outputDir string
}

func NewTranscoder(ffmpeg, outputDir string) *Transcoder {
	return &Transcoder{ffmpeg: ffmpeg, outputDir: outputDir}
}

// Args builds the ffmpeg arguments for a single HLS rendition.
func (t *Transcoder) Args(source, lessonID string, r Rendition) []string {
	out := filepath.Join(t.outputDir, lessonID, r.Name)
	return []string{
		"-y", "-i", source,
		"-vf", fmt.Sprintf("scale=-2:%d", r.Height),
		"-c:v", "libx264", "-b:v", r.Bitrate, "-c:a", "aac",
		"-hls_time", "6", "-hls_playlist_type", "vod",
		"-hls_segment_filename", out + "_%03d.ts",
		out + ".m3u8",
	}
}

func (t *Transcoder) Run(ctx context.Context, source, lessonID string) error {
	for _, r := range DefaultRenditions {
		cmd := exec.CommandContext(ctx, t.ffmpeg, t.Args(source, lessonID, r)...)
		if out, err := cmd.CombinedOutput(); err != nil {
			return fmt.Errorf("transcode %s failed: %w: %s", r.Name, err, out)
		}
	}
	return nil
}
