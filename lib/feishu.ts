import { getEnv } from "@/lib/env";
import { buildReleaseCard, type ReleaseCardInput } from "@/lib/card";

type FeishuWebhookPayload = {
  msg_type: "text";
  content: { text: string };
};

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

export async function sendReleaseNotification(input: ReleaseCardInput) {
  const env = getEnv();
  const card = buildReleaseCard(input);

  if (env.feishuWebhookUrl) {
    await postWebhook(env.feishuWebhookUrl, card);
    return { transport: "webhook" as const };
  }

  throw new Error(
    "Feishu delivery is not configured yet. Set FEISHU_WEBHOOK_URL or add app-based Feishu delivery.",
  );
}
