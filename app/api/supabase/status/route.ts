export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getSupabaseInitStatus } from "@/lib/supabase-status";

export async function GET() {
  const status = await getSupabaseInitStatus();

  return Response.json(status, {
    headers: {
      "cache-control": "no-store",
    },
  });
}
