package transcode

import (
	"context"
	"log"
	"sync"

	"github.com/learnsphere/media-service/internal/notify"
	"github.com/learnsphere/media-service/internal/queue"
)

// Pool runs a fixed number of workers that drain the job queue.
type Pool struct {
	workers  int
	jobs     queue.Queue
	tc       *Transcoder
	notifier *notify.Dispatcher
}

func NewPool(workers int, jobs queue.Queue, tc *Transcoder, n *notify.Dispatcher) *Pool {
	return &Pool{workers: workers, jobs: jobs, tc: tc, notifier: n}
}

func (p *Pool) Run(ctx context.Context) {
	var wg sync.WaitGroup
	for i := 0; i < p.workers; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			for {
				job, err := p.jobs.Dequeue(ctx)
				if err != nil {
					return
				}
				status := "ready"
				if err := p.tc.Run(ctx, job.Source, job.LessonID); err != nil {
					log.Printf("worker %d: job %s failed: %v", id, job.ID, err)
					status = "failed"
				}
				p.notifier.Send(ctx, notify.Message{UserID: job.UserID, Kind: "video." + status, Body: "Lesson video " + status})
			}
		}(i)
	}
	wg.Wait()
}
