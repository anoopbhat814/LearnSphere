package queue

import (
	"context"
	"testing"
)

func TestMemoryQueueRoundTrip(t *testing.T) {
	q := NewMemoryQueue(1)
	if err := q.Enqueue(Job{ID: "j1"}); err != nil {
		t.Fatal(err)
	}
	if err := q.Enqueue(Job{ID: "j2"}); err != ErrFull {
		t.Fatalf("expected ErrFull, got %v", err)
	}
	job, err := q.Dequeue(context.Background())
	if err != nil || job.ID != "j1" {
		t.Fatalf("unexpected result %v %v", job, err)
	}
}
