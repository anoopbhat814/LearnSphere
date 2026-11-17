# Architecture

LearnSphere is split into a web tier, an API tier and two supporting services.

## Request flow
1. The Next.js app renders catalogue pages on the server and calls the NestJS API.
2. The API reads and writes PostgreSQL through Prisma and uses Redis for caching and job queues.
3. When a learner finishes the last lesson, the API enqueues a `certificates` job.
4. `apps/worker` consumes the job, renders the certificate and emails the learner.
5. Recommendations are requested from the Python service; if it is unavailable the API falls back to popular courses.
6. Instructors upload videos; the Go media-service transcodes them to HLS renditions with ffmpeg.

## Design decisions
- Shared zod schemas in `packages/shared-types` keep client and server validation identical.
- Quiz answers are graded server-side only; correct options never leave the API.
- Progress writes are debounced on the client and idempotent on the server (upsert).
