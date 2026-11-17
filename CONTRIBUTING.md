# Contributing to LearnSphere

Thanks for helping improve LearnSphere. This guide covers the basics.

## Getting set up

```bash
cp .env.example .env
npm install
npx prisma generate
npm run dev
```

The Go media service and Python recommender are developed independently:

```bash
cd services/media-service && go test ./...
cd services/recommender && pip install -r requirements.txt && pytest
```

## Workflow

1. Fork the repository and create a branch from `main` (`feat/...`, `fix/...`).
2. Keep pull requests focused; one logical change per PR.
3. Add or update tests alongside code changes.
4. Run `npm run lint && npm test` before pushing.
5. Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

## Database changes

Edit `prisma/schema.prisma` and run `npx prisma migrate dev --name <description>`.
Commit the generated migration folder.

## Code style

Formatting is governed by `.editorconfig` and ESLint. Go code must pass `gofmt`
and `go vet`; Python follows PEP 8 with 4-space indentation.

## Reporting issues

Use the issue templates. For security problems see [SECURITY.md](SECURITY.md).
