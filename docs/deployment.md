# Deployment Guide

This page is the final production checklist for ServerlessShip.

## Final deployment table

### Vercel environment variables

| Variable | Where to set | Value source | Notes |
|---|---|---|---|
| `APP_BASE_URL` | Vercel Project Settings > Environment Variables | Your production domain | Use `https://serverless-ship.liuyidi.me` |
| `PROJECT_SLUG` | Vercel Project Settings > Environment Variables | Manual | Usually `serverless-ship` |
| `SUPABASE_URL` | Vercel Project Settings > Environment Variables | Supabase Dashboard | Project URL like `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel Project Settings > Environment Variables | Supabase Dashboard > Settings > API Keys | Server-only secret, never expose in frontend |
| `SUPABASE_ANON_KEY` | Vercel Project Settings > Environment Variables | Supabase Dashboard > Settings > API Keys | Optional for future public client access |
| `GITHUB_WEBHOOK_SECRET` | Vercel Project Settings > Environment Variables | You generate it yourself | Only needed if you enable a GitHub repository webhook to `/api/webhooks/github` |
| `GITHUB_REPOSITORY` | Vercel Project Settings > Environment Variables | Manual | Example: `liuyidi/minibot` |
| `FEISHU_APP_ID` | Vercel Project Settings > Environment Variables | Feishu Open Platform > App details | App ID from your self-built app |
| `FEISHU_APP_SECRET` | Vercel Project Settings > Environment Variables | Feishu Open Platform > App details | App secret from your self-built app |
| `FEISHU_TARGET_OPEN_ID` | Vercel Project Settings > Environment Variables | Feishu Open Platform / API lookup | Required for direct user delivery via Feishu app message |
| `FEISHU_TARGET_ID_TYPE` | Vercel Project Settings > Environment Variables | Manual | Usually `open_id`; keep this aligned with the target ID |
| `FEISHU_WEBHOOK_URL` | Vercel Project Settings > Environment Variables | Feishu incoming webhook URL | Optional legacy fallback |

### Supabase schema

This repository now carries the base schema in:

- `supabase/migrations/20260812000000_init_serverlessship.sql`

The migration creates the tables used by the current server code:

- `projects`
- `releases`
- `deliveries`

Apply it with the Supabase CLI:

```bash
supabase login
supabase link --project-ref sxzqroltcqtzrvnhlufz
supabase db push
```

RLS is enabled in a follow-up migration, but the current access pattern stays
server-side only through the Supabase service role. That keeps the tables
protected until a future user-facing policy is needed.

### Supabase status page

Use the live probe when you want to confirm the remote database after a push:

- `GET /supabase` for the human-readable status page
- `GET /api/supabase/status` for JSON output in CI or curl

If a table shows `missing`, the migration has not been applied to the linked
project yet.

### GitHub Actions caller

| Variable | Where to set | Value source | Notes |
|---|---|---|---|
| `SERVERLESSSHIP_RELEASE_URL` | `minibot` repository Variables | Manual | Recommended default: `https://serverless-ship.liuyidi.me/api/releases` |

If `SERVERLESSSHIP_RELEASE_URL` is missing, the workflow falls back to the production URL directly.

### GitHub webhook mode

Only configure this if you decide to send GitHub repository webhook events directly into ServerlessShip.

| Setting | Where to set | Notes |
|---|---|---|
| Webhook payload URL | GitHub repository Settings > Webhooks | Point to `https://serverless-ship.liuyidi.me/api/webhooks/github` |
| Webhook secret | GitHub repository Settings > Webhooks | Use the same value as `GITHUB_WEBHOOK_SECRET` in Vercel |

GitHub webhooks are configured in the repository’s **Settings > Webhooks** page. GitHub supports setting a secret when you add the webhook, and that secret is used to validate deliveries from GitHub. See the GitHub Docs for creating and validating webhooks. 

## Recommended setup order

1. Create the Feishu app and capture `App ID` / `App Secret`.
2. Decide whether you use GitHub Actions calling `/api/releases` or a GitHub webhook calling `/api/webhooks/github`.
3. Set the Vercel environment variables.
4. If using a GitHub webhook, add the payload URL and secret in the repository settings.
5. Confirm `https://serverless-ship.liuyidi.me` responds with `200`.
6. Point `minibot` release workflows at `SERVERLESSSHIP_RELEASE_URL`.

## Example request

```bash
curl -X POST "https://serverless-ship.liuyidi.me/api/releases" \
  -H "Content-Type: application/json" \
  -d '{
    "project": "minibot desktop",
    "version": "1.0.0-beta.3",
    "tag": "desktop-v1.0.0-beta.3",
    "repository": "liuyidi/minibot",
    "releaseUrl": "https://github.com/liuyidi/minibot/releases/tag/desktop-v1.0.0-beta.3",
    "workflowUrl": "https://github.com/liuyidi/minibot/actions/runs/123",
    "channel": "GitHub Release"
  }'
```
