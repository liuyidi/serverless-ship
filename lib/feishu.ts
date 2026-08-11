import { getEnv } from "@/lib/env";
import { buildFeishuInteractiveCard, buildReleaseCard, type ReleaseCardInput } from "@/lib/card";

type FeishuWebhookPayload = {
  msg_type: "text";
  content: { text: string };
};

type FeishuInteractivePayload = {
  msg_type: "interactive";
  content: string;
};

type TenantAccessTokenResponse = {
  code: number;
  msg: string;
  tenant_access_token?: string;
  expire?: number;
};

type FeishuTokenCache = {
  token: string;
  expiresAt: number;
};

let cachedTenantToken: FeishuTokenCache | null = null;

async function postWebhook(url: string, text: string) {
  const payload: FeishuWebhookPayload = {
    msg_type: "text",
    content: { text },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Feishu webhook request failed: ${response.status} ${response.statusText}`);
  }
}

async function getTenantAccessToken() {
  const env = getEnv();
  if (!env.feishuAppId || !env.feishuAppSecret) {
    throw new Error("FEISHU_APP_ID and FEISHU_APP_SECRET are required for app message delivery");
  }

  const now = Date.now();
  if (cachedTenantToken && cachedTenantToken.expiresAt - now > 5 * 60 * 1000) {
    return cachedTenantToken.token;
  }

  const response = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      app_id: env.feishuAppId,
      app_secret: env.feishuAppSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`Feishu token request failed: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as TenantAccessTokenResponse;
  if (!payload.tenant_access_token) {
    throw new Error(`Feishu token request failed: ${payload.msg || "missing tenant_access_token"}`);
  }

  cachedTenantToken = {
    token: payload.tenant_access_token,
    expiresAt: now + ((payload.expire ?? 7200) * 1000),
  };

  return cachedTenantToken.token;
}

async function postFeishuAppMessage(input: ReleaseCardInput) {
  const env = getEnv();
  const receiveId = env.feishuTargetChatId ?? env.feishuTargetOpenId;

  if (!receiveId) {
    throw new Error(
      "FEISHU_TARGET_CHAT_ID or FEISHU_TARGET_OPEN_ID is required for app message delivery",
    );
  }

  const receiveIdType =
    env.feishuTargetIdType ?? (env.feishuTargetChatId ? "chat_id" : "open_id");
  const token = await getTenantAccessToken();
  const content = buildFeishuInteractiveCard(input);
  const payload: FeishuInteractivePayload = {
    msg_type: "interactive",
    content: JSON.stringify(content),
  };

  const response = await fetch(
    `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=${receiveIdType}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        receive_id: receiveId,
        ...payload,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Feishu app message request failed: ${response.status} ${response.statusText}`);
  }
}

export async function sendReleaseNotification(input: ReleaseCardInput) {
  const env = getEnv();
  const card = buildReleaseCard(input);

  if (env.feishuWebhookUrl) {
    await postWebhook(env.feishuWebhookUrl, card);
    return { transport: "webhook" as const };
  }

  if (env.feishuAppId && env.feishuAppSecret) {
    await postFeishuAppMessage(input);
    return { transport: "app" as const };
  }

  throw new Error(
    "Feishu delivery is not configured yet. Set FEISHU_WEBHOOK_URL or FEISHU_APP_ID/FEISHU_APP_SECRET.",
  );
}
