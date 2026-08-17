export const runtime = "nodejs";

import { sendReleaseNotification } from "@/lib/feishu";
import type { ReleaseCardInput } from "@/lib/card";
import { recordDelivery, recordRelease, updateReleaseStatus } from "@/lib/supabase";
import { getProjectTemplateByToken } from "@/lib/templates";

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

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return Response.json({ ok: false, error: "project token is required" }, { status: 401 });
  }
  const projectTemplate = await getProjectTemplateByToken(token);
  if (!projectTemplate || projectTemplate.repository !== payload.repository) {
    return Response.json({ ok: false, error: "invalid project token" }, { status: 401 });
  }

  try {
    releaseRecord = await recordRelease({ ...payload, project: projectTemplate.name }, "pending", projectTemplate.slug);
    const delivery = await sendReleaseNotification(payload, projectTemplate?.template_config);
    if (releaseRecord?.id) {
      await recordDelivery(releaseRecord.id, "sent", null);
      await updateReleaseStatus(releaseRecord.id, "sent");
    }
    return Response.json({ ok: true, delivered: true, delivery });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    try {
      if (!releaseRecord) {
        releaseRecord = await recordRelease({ ...payload, project: projectTemplate.name }, "failed", projectTemplate.slug);
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
