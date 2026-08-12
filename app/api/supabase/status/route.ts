export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getAdminSupabaseStatus } from "@/app/dashboard/_server/api/supabase-status";

export async function GET() {
  const status = await getAdminSupabaseStatus();

  return Response.json(status, {
    headers: {
      "cache-control": "no-store",
    },
  });
}
