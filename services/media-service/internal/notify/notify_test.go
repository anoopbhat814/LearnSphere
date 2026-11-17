package notify

import (
	"context"
	"errors"
	"testing"
)

type flaky struct{ failures, calls int }

func (f *flaky) Send(context.Context, Message) error {
	f.calls++
	if f.calls <= f.failures {
		return errors.New("temporary failure")
	}
	return nil
}

func TestDispatcherRetriesUntilSuccess(t *testing.T) {
	s := &flaky{failures: 2}
	NewDispatcher(s).Send(context.Background(), Message{UserID: "u1", Kind: "test"})
	if s.calls != 3 {
		t.Fatalf("expected 3 calls, got %d", s.calls)
	}
}
