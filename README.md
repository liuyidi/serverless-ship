# ServerlessShip

**Serverless Feishu deploy notifier for minibot**

ServerlessShip is a lightweight serverless service for minibot deployment notifications.
It is designed to run on Vercel Hobby with Supabase Free, and it turns GitHub release or deploy events into Feishu notifications.

## Current infrastructure

- Production site: [https://serverless-ship.liuyidi.me](https://serverless-ship.liuyidi.me)
- Vercel project: `serverless-ship`
- Supabase project URL: [https://sxzqroltcqtzrvnhlufz.supabase.co](https://sxzqroltcqtzrvnhlufz.supabase.co)
- Supabase database: managed through the Supabase dashboard for this project
- Supabase keys used by the app: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`

## What it does

- Receives deployment completion events
- Formats a release notification card
- Sends the message to Feishu users or groups
- Records delivery state for retries and audit

## API routes

- `POST /api/releases` for GitHub Actions or release pipelines
- `POST /api/webhooks/github` for GitHub release webhooks
- `GET /api/health` for uptime checks

## GitHub Actions

The repository includes a production deploy workflow at
[`/.github/workflows/deploy-to-vercel.yml`](./.github/workflows/deploy-to-vercel.yml).
It expects these secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

For release notifications from another repo, call `POST /api/releases` with the release payload.

## Suggested stack

- Vercel Hobby for serverless API routes and scheduled jobs
- Supabase Free for persistence and lightweight state
- GitHub Actions for release or deployment triggers
- Feishu OpenAPI for delivery

## Docs

- [`docs/README.md`](./docs/README.md)
- [`docs/notes/serverlessship.md`](./docs/notes/serverlessship.md)
- [`docs/deployment.md`](./docs/deployment.md)
