const requiredKeys = ["PROJECT_SLUG"] as const;

export type Env = {
  appBaseUrl: string;
  projectSlug: string;
  githubWebhookSecret: string | null;
  githubRepository: string;
  feishuWebhookUrl: string | null;
  feishuAppId: string | null;
  feishuAppSecret: string | null;
  feishuTargetChatId: string | null;
  feishuTargetOpenId: string | null;
  feishuTargetIdType: string | null;
  supabaseUrl: string | null;
  supabaseServiceRoleKey: string | null;
};

function read(name: string): string | null {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : null;
}

export function getEnv(): Env {
  for (const key of requiredKeys) {
    if (!read(key)) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return {
    appBaseUrl: read("APP_BASE_URL") ?? "http://localhost:3000",
    projectSlug: read("PROJECT_SLUG") ?? "serverless-ship",
    githubWebhookSecret: read("GITHUB_WEBHOOK_SECRET"),
    githubRepository: read("GITHUB_REPOSITORY") ?? "liuyidi/minibot",
    feishuWebhookUrl: read("FEISHU_WEBHOOK_URL"),
    feishuAppId: read("FEISHU_APP_ID"),
    feishuAppSecret: read("FEISHU_APP_SECRET"),
    feishuTargetChatId: read("FEISHU_TARGET_CHAT_ID"),
    feishuTargetOpenId: read("FEISHU_TARGET_OPEN_ID"),
    feishuTargetIdType: read("FEISHU_TARGET_ID_TYPE"),
    supabaseUrl: read("SUPABASE_URL"),
    supabaseServiceRoleKey: read("SUPABASE_SERVICE_ROLE_KEY"),
  };
}
