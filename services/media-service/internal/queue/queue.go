// Package queue provides a minimal job queue abstraction.
package queue

import (
	"context"
	"errors"
)

type Job struct {
	ID       string `json:"id"`
	LessonID string `json:"lessonId"`
	Source   string `json:"source"`
	UserID   string `json:"userId"`
}

var ErrFull = errors.New("queue is full")

type Queue interface {
	Enqueue(Job) error
	Dequeue(ctx context.Context) (Job, error)
}

type MemoryQueue struct{ ch chan Job }

func NewMemoryQueue(size int) *MemoryQueue { return &MemoryQueue{ch: make(chan Job, size)} }

func (q *MemoryQueue) Enqueue(j Job) error {
	select {
	case q.ch <- j:
		return nil
	default:
		return ErrFull
	}
}

func (q *MemoryQueue) Dequeue(ctx context.Context) (Job, error) {
	select {
	case j := <-q.ch:
		return j, nil
	case <-ctx.Done():
		return Job{}, ctx.Err()
	}
}
