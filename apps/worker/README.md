# @learnsphere/worker

Background job runner for LearnSphere. It blocks on Redis lists and dispatches
each payload to a handler:

| Queue            | Handler                       | Purpose                             |
| ---------------- | ----------------------------- | ----------------------------------- |
| `certificates`   | `src/certificate.js`          | Render completion certificates      |
| `notifications`  | `src/notifications.js`        | Send transactional email            |

Failed jobs are pushed to `<queue>:dead` for manual inspection.

## Running

```bash
REDIS_URL=redis://localhost:6379 SMTP_HOST=localhost SMTP_PORT=1025 npm start
```

## Testing

```bash
npm test
```
