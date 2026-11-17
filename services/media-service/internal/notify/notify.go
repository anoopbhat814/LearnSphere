// Package notify fans notifications out to delivery channels.
package notify

import (
	"context"
	"log"
	"time"
)

type Message struct {
	UserID string
	Kind   string
	Body   string
}

type Sender interface {
	Send(ctx context.Context, m Message) error
}

type LogSender struct{}

func NewLogSender() *LogSender { return &LogSender{} }

func (LogSender) Send(_ context.Context, m Message) error {
	log.Printf("notify user=%s kind=%s body=%q", m.UserID, m.Kind, m.Body)
	return nil
}

// Dispatcher retries failed sends with exponential backoff.
type Dispatcher struct {
	sender  Sender
	retries int
}

func NewDispatcher(s Sender) *Dispatcher { return &Dispatcher{sender: s, retries: 3} }

func (d *Dispatcher) Send(ctx context.Context, m Message) {
	delay := 100 * time.Millisecond
	for attempt := 0; attempt <= d.retries; attempt++ {
		if err := d.sender.Send(ctx, m); err == nil {
			return
		}
		select {
		case <-time.After(delay):
			delay *= 2
		case <-ctx.Done():
			return
		}
	}
	log.Printf("notify: giving up on %s for user %s", m.Kind, m.UserID)
}
