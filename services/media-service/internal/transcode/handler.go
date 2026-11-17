package transcode

import (
	"encoding/json"
	"net/http"

	"github.com/learnsphere/media-service/internal/queue"
)

type Handler struct{ jobs queue.Queue }

func NewHandler(jobs queue.Queue) *Handler { return &Handler{jobs: jobs} }

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var job queue.Job
	if err := json.NewDecoder(r.Body).Decode(&job); err != nil || job.ID == "" || job.Source == "" {
		http.Error(w, "invalid job payload", http.StatusBadRequest)
		return
	}
	if err := h.jobs.Enqueue(job); err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}
	w.WriteHeader(http.StatusAccepted)
	_ = json.NewEncoder(w).Encode(map[string]string{"id": job.ID, "status": "queued"})
}
