# Deployment

1. Build images with `docker compose -f deploy/docker-compose.yml build`.
2. Run `npx prisma migrate deploy` against the production database before starting the API.
3. Terminate TLS at the load balancer and route traffic using `deploy/nginx.conf`.
4. Scale `worker` and `media-service` horizontally; both consume from Redis-backed queues.
5. Configure secrets through your orchestrator; never commit a real `.env`.
