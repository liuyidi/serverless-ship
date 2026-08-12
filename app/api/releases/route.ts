export const runtime = "nodejs";

import { sendReleaseNotification } from "@/lib/feishu";
import type { ReleaseCardInput } from "@/lib/card";
import { recordDelivery, recordRelease, updateReleaseStatus } from "@/lib/supabase";

export async function POST(request: Request) {
  let payload: ReleaseCardInput;
  let releaseRecord: { id: string } | null = null;

  try {
    payload = (await request.json()) as ReleaseCardInput;
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  if (!payload.project || !payload.version || !payload.repository || !payload.channel) {
    return Response.json({ ok: false, error: "missing required fields" }, { status: 400 });
  }

  try {
    releaseRecord = await recordRelease(payload, "pending");
    const delivery = await sendReleaseNotification(payload);
    if (releaseRecord?.id) {
      await recordDelivery(releaseRecord.id, "sent", null);
      await updateReleaseStatus(releaseRecord.id, "sent");
    }
    return Response.json({ ok: true, delivered: true, delivery });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    try {
      if (!releaseRecord) {
        releaseRecord = await recordRelease(payload, "failed");
      }
      if (releaseRecord?.id) {
        await recordDelivery(releaseRecord.id, "failed", message);
        await updateReleaseStatus(releaseRecord.id, "failed");
      }
    } catch {
      // Persistence must never block notification delivery.
    }
    return Response.json({ ok: false, error: message }, { status: 502 });
  }
}
