package main

import (
	"encoding/json"
	"net/http"
	"runtime"
	"time"
)

var startedAt = time.Now()

type healthReport struct {
	Status    string `json:"status"`
	Uptime    string `json:"uptime"`
	GoVersion string `json:"goVersion"`
	Workers   int    `json:"workers"`
}

// readyHandler reports liveness details used by the Kubernetes readiness probe.
func readyHandler(workers int) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(healthReport{
			Status:    "ready",
			Uptime:    time.Since(startedAt).Round(time.Second).String(),
			GoVersion: runtime.Version(),
			Workers:   workers,
		})
	}
}
