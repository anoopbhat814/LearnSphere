package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/learnsphere/media-service/internal/config"
	"github.com/learnsphere/media-service/internal/notify"
	"github.com/learnsphere/media-service/internal/queue"
	"github.com/learnsphere/media-service/internal/transcode"
)

func main() {
	cfg := config.Load()
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	transcoder := transcode.NewTranscoder(cfg.FFmpegPath, cfg.OutputDir)
	notifier := notify.NewDispatcher(notify.NewLogSender())
	jobs := queue.NewMemoryQueue(64)

	pool := transcode.NewPool(cfg.Workers, jobs, transcoder, notifier)
	go pool.Run(ctx)

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("ok")) })
	mux.Handle("/v1/jobs", transcode.NewHandler(jobs))

	srv := &http.Server{Addr: cfg.Addr, Handler: mux, ReadHeaderTimeout: 5 * time.Second}
	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		_ = srv.Shutdown(shutdownCtx)
	}()

	log.Printf("media-service listening on %s with %d workers", cfg.Addr, cfg.Workers)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
