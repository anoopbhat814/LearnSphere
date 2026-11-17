.PHONY: install dev build test lint db-up db-migrate db-seed docker-up

install:
	npm install
	cd services/recommender && pip install -r requirements.txt
	cd services/media-service && go mod download

dev:
	npm run dev

build:
	npm run build

test:
	npm test
	cd services/recommender && pytest -q
	cd services/media-service && go test ./...

lint:
	npm run lint

db-up:
	docker compose -f deploy/docker-compose.yml up -d postgres redis

db-migrate:
	npx prisma migrate deploy

db-seed:
	npx prisma db seed

docker-up:
	docker compose -f deploy/docker-compose.yml up --build
