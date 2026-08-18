---
name: deploying-vercel-serverless-ship
description: >-
  Use when the user asks to 发布、部署 serverless-ship、
  serverless-ship.liuyidi.me、Vercel Hobby, Feishu deploy notifier, or
  /api/releases. Not for Aliyun ECS, Tencent CVM, minibot, mlf, kb, or
  auth hosts.
---

# Vercel ServerlessShip Deploy（只 ship）

应用已经拆开，**先选仓**。本 skill 只覆盖 ServerlessShip。

| 域名 | 仓 | 云 | Skill |
|------|----|----|-------|
| `liuyidi.me` / `bot.liuyidi.me` | minibot | 阿里云 ECS | minibot `aliyun-ecs-demo-deploy` |
| `kb.liuyidi.me` | minikb | 火山引擎 | minikb `deploying-volcengine-minikb` |
| `mlf.liuyidi.me` | mini-langfuse | 腾讯云 | mini-langfuse `deploying-tencent-mlf` |
| `auth.liuyidi.me` | mini-auth | 腾讯云 CVM | mini-auth `deploying-tencent-mini-auth` |
| `serverless-ship.liuyidi.me` | serverless-ship | Vercel Hobby | **本文件** |

不要部署到阿里云 / 腾讯云 ECS。状态在 Supabase Free；飞书消息由本服务发。

## 发布（优先）

GitHub Actions → `Deploy to Vercel`（`.github/workflows/deploy-to-vercel.yml`）。

- push `main` 或 `workflow_dispatch`
- Secrets：`VERCEL_TOKEN`、`VERCEL_ORG_ID`、`VERCEL_PROJECT_ID`
- 环境变量清单见 `docs/deployment.md`（不要把 `.env` / PEM 提交进仓）

本机应急：`vercel deploy --prod --yes`（需已登录且项目已 link）。

其它仓发版通知：它们的 workflow 调 `POST https://serverless-ship.liuyidi.me/api/releases`（变量 `SERVERLESSSHIP_RELEASE_URL`）。那是**调用方**配置，不是在本机起 Docker。

## 验收

```bash
curl -fsS https://serverless-ship.liuyidi.me/api/health
```
