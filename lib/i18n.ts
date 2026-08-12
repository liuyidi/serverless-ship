export type Locale = "zh" | "en";

export type LocaleCopy = {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  flowTitle: string;
  apiTitle: string;
  apiDescription: string;
  moduleTitle: string;
  moduleDescription: string;
  stackTitle: string;
  stackItems: string[];
  flowLabels: {
    user: string;
    github: string;
    actions: string;
    ship: string;
    feishu: string;
    supabase: string;
  };
};

export const copy: Record<Locale, LocaleCopy> = {
  zh: {
    badge: "Serverless Feishu deploy notifier for minibot",
    title: "ServerlessShip",
    subtitle: "把部署链路变成一个可视化、可通知、可审计的闭环",
    description:
      "从 GitHub 提交、Actions 构建、ServerlessShip 转发，到飞书应用消息回到用户，整个链路都运行在 Vercel 与 Supabase 上。",
    primaryCta: "查看 API",
    secondaryCta: "打开 GitHub",
    flowTitle: "部署闭环",
    apiTitle: "API 接口",
    apiDescription: "三个入口覆盖健康检查、发布同步和 GitHub Webhook。",
    moduleTitle: "模块拆分",
    moduleDescription: "每个模块只负责一件事，便于扩展飞书应用功能",
    stackTitle: "运行栈",
    stackItems: ["Vercel Hobby", "Supabase Free", "GitHub Actions", "飞书应用消息"],
    flowLabels: {
      user: "用户",
      github: "GitHub",
      actions: "Actions",
      ship: "ServerlessShip",
      feishu: "飞书应用",
      supabase: "Supabase",
    },
  },
  en: {
    badge: "Serverless Feishu deploy notifier for minibot",
    title: "ServerlessShip",
    subtitle: "A visual deployment loop that is easy to read, notify, and audit",
    description:
      "From GitHub pushes and Actions builds to ServerlessShip routing and Feishu app messages, the entire loop runs on Vercel and Supabase.",
    primaryCta: "View API",
    secondaryCta: "Open GitHub",
    flowTitle: "Deployment loop",
    apiTitle: "API surface",
    apiDescription: "Three entry points cover health checks, release sync, and the GitHub webhook.",
    moduleTitle: "Module split",
    moduleDescription:
      "Each module handles one responsibility so the app can grow into retries, audit logs, and richer Feishu app messages.",
    stackTitle: "Runtime stack",
    stackItems: ["Vercel Hobby", "Supabase Free", "GitHub Actions", "Feishu app messages"],
    flowLabels: {
      user: "User",
      github: "GitHub",
      actions: "Actions",
      ship: "ServerlessShip",
      feishu: "Feishu app",
      supabase: "Supabase",
    },
  },
};

export const apiCards = {
  zh: [
    { path: "GET /api/health", title: "健康检查", body: "用于 Vercel、GitHub 或外部监控确认服务在线。" },
    { path: "POST /api/releases", title: "发布同步", body: "接收 release payload，并将它整理成标准通知流程。" },
    { path: "POST /api/webhooks/github", title: "GitHub Webhook", body: "直接接收 GitHub release / push 事件，走统一的通知链路。" },
  ],
  en: [
    { path: "GET /api/health", title: "Health check", body: "Lets Vercel, GitHub, or external monitors confirm the service is online." },
    { path: "POST /api/releases", title: "Release sync", body: "Accepts release payloads and normalizes them into the notification flow." },
    { path: "POST /api/webhooks/github", title: "GitHub webhook", body: "Receives GitHub release / push events and sends them through the shared notification path." },
  ],
} as const;

export const moduleCards = {
  zh: [
    { name: "Ingress", title: "事件入口", body: "统一处理 GitHub webhook、release 事件和手动触发的发布同步。" },
    { name: "Formatter", title: "卡片格式化", body: "把发布信息转成飞书应用消息 card，保留版本、链接、状态。" },
    { name: "Storage", title: "状态与审计", body: "把发布、投递结果和失败重试记录在 Supabase 里。" },
    { name: "Delivery", title: "飞书投递", body: "通过飞书应用消息直接发给 open_id 用户，必要时继续扩展 chat_id。" },
  ],
  en: [
    { name: "Ingress", title: "Event intake", body: "Handles GitHub webhooks, release events, and manual release syncs in one place." },
    { name: "Formatter", title: "Card formatting", body: "Turns release payloads into Feishu app message cards with version, links, and status." },
    { name: "Storage", title: "State and audit", body: "Stores releases, delivery results, and retry history in Supabase." },
    { name: "Delivery", title: "Feishu delivery", body: "Sends directly to an open_id user via Feishu app messages, with room to extend later." },
  ],
} as const;
