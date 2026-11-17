package config

// Rendition describes one adaptive-bitrate output ladder step.
type Rendition struct {
	Name         string
	Height       int
	VideoBitrate string
	AudioBitrate string
}

// DefaultLadder is the HLS rendition ladder used for lesson videos.
func DefaultLadder() []Rendition {
	return []Rendition{
		{Name: "1080p", Height: 1080, VideoBitrate: "5000k", AudioBitrate: "192k"},
		{Name: "720p", Height: 720, VideoBitrate: "2800k", AudioBitrate: "128k"},
		{Name: "480p", Height: 480, VideoBitrate: "1400k", AudioBitrate: "128k"},
		{Name: "360p", Height: 360, VideoBitrate: "800k", AudioBitrate: "96k"},
	}
}
