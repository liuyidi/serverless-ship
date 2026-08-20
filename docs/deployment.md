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
| `GITHUB_APP_ID` | Vercel Project Settings > Environment Variables | GitHub App settings | Required for the dashboard to connect a repository automatically |
| `GITHUB_APP_PRIVATE_KEY` | Vercel Project Settings > Environment Variables | GitHub App private key | Use the downloaded PEM exactly; literal newlines, escaped `\n`, or Base64-encoded PEM are supported |
| `GITHUB_APP_INSTALLATION_ID` | Vercel Project Settings > Environment Variables | GitHub App installation URL | Installation must have Actions secrets and repository contents write permissions |
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

After adding project-level message templates, also apply
`20260817000000_add_project_templates.sql`. It adds the stored theme settings
and hashed per-project notification tokens required by `/api/templates` and
authenticated calls to `/api/releases`.

RLS is enabled in a follow-up migration, but the current access pattern stays
server-side only through the Supabase service role. That keeps the tables
protected until a future user-facing policy is needed.

### Supabase status page

Use the live probe when you want to confirm the remote database after a push:

- `GET /dashboard/supabase` for the human-readable status page

If a table shows `missing`, the migration has not been applied to the linked
project yet.

### GitHub Actions caller

| Variable | Where to set | Value source | Notes |
|---|---|---|---|
| `SERVERLESSSHIP_RELEASE_URL` | `minibot` repository Variables | Manual | Recommended default: `https://serverless-ship.liuyidi.me/api/releases` |
| `SERVERLESSSHIP_TOKEN_<PROJECT_SLUG>` | `minibot` repository Secrets | Auto-created by ServerlessShip when you connect a project | Preferred secret name for authenticated `POST /api/releases` calls |
| `SERVERLESSSHIP_TOKEN` | `minibot` repository Secrets | Manual legacy fallback | Still supported by the generated workflow if the project-specific secret is not present |

If `SERVERLESSSHIP_RELEASE_URL` is missing, the workflow falls back to the production URL directly.
If the request reaches `/api/releases` without `Authorization: Bearer <token>`, the API returns `401 project token is required`.

When calling `/api/releases`, the `project` field is the display name that will be written to `projects.name`. The `repository` field is the stable identity for upserting the project row, and the app derives `projects.slug` from that repository value. Neither field is populated by GitHub automatically; your workflow or caller must set them explicitly.

Minimal authenticated example:

```bash
curl --fail-with-body -X POST "https://serverless-ship.liuyidi.me/api/releases" \
  -H "Authorization: Bearer $SERVERLESSSHIP_TOKEN" \
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

For projects created through **Create and connect GitHub**, ServerlessShip
creates a repository Actions secret named
`SERVERLESSSHIP_TOKEN_<PROJECT_SLUG>` and writes
`.github/workflows/serverless-ship-<project-slug>.yml` automatically. The
generated workflow also falls back to `SERVERLESSSHIP_TOKEN` for older repos.
The server stores only a hash of this token and uses the repository name to
find the associated message theme. Reconnecting an existing project updates
both the secret and workflow.

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
