import { getSupabaseInitStatus } from "@/lib/supabase-status";

export async function getAdminSupabaseStatus() {
  return getSupabaseInitStatus();
}
