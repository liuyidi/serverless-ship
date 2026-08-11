export const runtime = "nodejs";

import { sendReleaseNotification } from "@/lib/feishu";
import { toReleaseNotification, verifyGithubSignature } from "@/lib/github-webhook";
import { recordDelivery, recordRelease } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.text();
  const event = request.headers.get("x-github-event");
  const signature = request.headers.get("x-hub-signature-256");
  let releaseRecord: { id: string } | null = null;

  if (!verifyGithubSignature(body, signature)) {
    return Response.json({ ok: false, error: "invalid signature" }, { status: 401 });
  }

  let payload: Parameters<typeof toReleaseNotification>[0];
  try {
    payload = JSON.parse(body) as Parameters<typeof toReleaseNotification>[0];
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  if (event !== "release" && event !== "workflow_run") {
    return Response.json({ ok: true, ignored: true, event });
  }

  const notification = toReleaseNotification(payload);
  if (!notification) {
    return Response.json({ ok: true, ignored: true, reason: "not a release payload" });
  }

  try {
    releaseRecord = await recordRelease(notification, "pending");
    const delivery = await sendReleaseNotification(notification);
    if (releaseRecord?.id) {
      await recordDelivery(releaseRecord.id, "sent", null);
    }
    return Response.json({ ok: true, delivered: true, delivery });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    try {
      if (!releaseRecord) {
        releaseRecord = await recordRelease(notification, "failed");
      }
      if (releaseRecord?.id) {
        await recordDelivery(releaseRecord.id, "failed", message);
      }
    } catch {
      // Persistence must never block notification delivery.
    }
    return Response.json({ ok: false, error: message }, { status: 502 });
  }
}
