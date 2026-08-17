import crypto from "node:crypto";
import { getEnv } from "@/lib/env";

export type TemplateConfig = {
  preset: "ember" | "ocean" | "mono";
  title: string;
  signature: string;
  showVersion: boolean;
  showChannel: boolean;
  showLinks: boolean;
};

export type ProjectTemplate = {
  slug: string;
  name: string;
  repository: string;
  template_config: TemplateConfig;
  notify_token_last4: string | null;
};

function config() {
  const env = getEnv();
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) return null;
  return {
    baseUrl: env.supabaseUrl.replace(/\/$/, ""),
    headers: { apikey: env.supabaseServiceRoleKey, Authorization: `Bearer ${env.supabaseServiceRoleKey}`, "content-type": "application/json", Prefer: "resolution=merge-duplicates,return=representation" },
  };
}

export function hashNotifyToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createNotifyToken() {
  return `ss_${crypto.randomBytes(24).toString("base64url")}`;
}

export async function listProjectTemplates() {
  const client = config();
  if (!client) return [];
  const response = await fetch(`${client.baseUrl}/rest/v1/projects?select=slug,name,repository,template_config,notify_token_last4&order=created_at.asc`, { headers: client.headers, cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to list project templates: ${response.status}`);
  return (await response.json()) as ProjectTemplate[];
}

export async function getProjectTemplate(repository: string) {
  const client = config();
  if (!client) return null;
  const params = new URLSearchParams({ select: "slug,name,repository,template_config,notify_token_hash,notify_token_last4", repository: `eq.${repository}`, limit: "1" });
  const response = await fetch(`${client.baseUrl}/rest/v1/projects?${params}`, { headers: client.headers, cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load project template: ${response.status}`);
  return ((await response.json()) as (ProjectTemplate & { notify_token_hash: string | null })[])[0] ?? null;
}

export async function getProjectTemplateBySlug(slug: string) {
  return getProjectTemplateByField("slug", slug);
}

export async function getProjectTemplateByToken(token: string) {
  return getProjectTemplateByField("notify_token_hash", hashNotifyToken(token));
}

async function getProjectTemplateByField(field: "slug" | "notify_token_hash", value: string) {
  const client = config();
  if (!client) return null;
  const params = new URLSearchParams({ select: "slug,name,repository,template_config,notify_token_hash,notify_token_last4", [field]: `eq.${value}`, limit: "1" });
  const response = await fetch(`${client.baseUrl}/rest/v1/projects?${params}`, { headers: client.headers, cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load project template: ${response.status}`);
  return ((await response.json()) as (ProjectTemplate & { notify_token_hash: string | null })[])[0] ?? null;
}

export async function saveProjectTemplate(input: { name: string; repository: string; config: TemplateConfig; slug?: string; rotateToken?: boolean }) {
  const client = config();
  if (!client) throw new Error("Supabase is not configured");
  const slug = input.slug?.trim() || input.repository.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const token = input.rotateToken === false ? null : createNotifyToken();
  const row: Record<string, unknown> = { slug, name: input.name.trim(), repository: input.repository.trim(), template_config: input.config };
  if (token) { row.notify_token_hash = hashNotifyToken(token); row.notify_token_last4 = token.slice(-4); }
  const response = await fetch(`${client.baseUrl}/rest/v1/projects?on_conflict=slug`, { method: "POST", headers: client.headers, body: JSON.stringify([row]) });
  if (!response.ok) throw new Error(`Failed to save project template: ${response.status}`);
  const saved = ((await response.json()) as ProjectTemplate[])[0];
  return { project: saved, token };
}
