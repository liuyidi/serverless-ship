# ServerlessShip

**Serverless Feishu deploy notifier for minibot**

ServerlessShip is a lightweight serverless service for minibot deployment notifications. It runs on Vercel Hobby, uses Supabase Free for state, and turns GitHub release or deploy events into Feishu app messages.

## What you see on the homepage

The landing page is bilingual and centers the delivery loop:


- User
- GitHub
- GitHub Actions
- ServerlessShip
- Supabase
- Feishu app message
- Message card returned to the user

## Current infrastructure

- Production site: [https://serverless-ship.liuyidi.me](https://serverless-ship.liuyidi.me)
- Vercel project: `serverless-ship`
- Supabase project URL: [https://sxzqroltcqtzrvnhlufz.supabase.co](https://sxzqroltcqtzrvnhlufz.supabase.co)
- Deployment target: Vercel Hobby
- Persistence layer: Supabase Free

## API routes

- `GET /api/health` for uptime checks
- `POST /api/releases` for release sync
- `POST /api/webhooks/github` for GitHub webhook delivery

## Runtime responsibilities

- `lib/github-webhook.ts`: normalize GitHub webhook payloads
- `lib/card.ts`: build Feishu app message cards
- `lib/feishu.ts`: send Feishu app messages
- `lib/supabase.ts`: read and write release state
- `lib/env.ts`: centralize environment access

## GitHub Actions

The repository includes a production deploy workflow at `/.github/workflows/deploy-to-vercel.yml`.
It expects these secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

For release notifications from another repo, call `POST /api/releases` with the release payload and the per-project bearer token.
If the `Authorization: Bearer <token>` header is missing, the API returns `401 project token is required`.

## Docs

- [`docs/README.md`](./docs/README.md)
- [`docs/notes/serverlessship.md`](./docs/notes/serverlessship.md)
- [`docs/deployment.md`](./docs/deployment.md)
