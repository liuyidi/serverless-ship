import { getEnv } from "@/lib/env";
import type { ReleaseCardInput } from "@/lib/card";

type SupabaseRow = Record<string, unknown> & { id: string };

function supabaseHeaders() {
  const env = getEnv();
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return null;
  }

  return {
    baseUrl: env.supabaseUrl.replace(/\/$/, ""),
    headers: {
      apikey: env.supabaseServiceRoleKey,
      Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
      "content-type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    projectSlug: env.projectSlug,
    githubRepository: env.githubRepository,
  };
}

async function upsertProject(projectName: string, repository: string) {
  const config = supabaseHeaders();
  if (!config) return null;

  const response = await fetch(`${config.baseUrl}/rest/v1/projects?on_conflict=repository`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify([
      {
        slug: projectName,
        name: projectName,
        repository,
      },
    ]),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to upsert project: ${response.status} ${response.statusText}`);
  }

  const rows = (await response.json()) as SupabaseRow[];
  return rows[0] ?? null;
}

export async function recordRelease(input: ReleaseCardInput, status: string) {
  const config = supabaseHeaders();
  if (!config) return null;

  const projectName = input.project.trim() || config.projectSlug;
  const repository = input.repository.trim() || config.githubRepository;
  const project = await upsertProject(projectName, repository);
  if (!project) return null;

  const response = await fetch(`${config.baseUrl}/rest/v1/releases`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify([
      {
        project_id: project.id,
        version: input.version,
        tag: input.tag,
        channel: input.channel,
        release_url: input.releaseUrl,
        workflow_url: input.workflowUrl,
        status,
      },
    ]),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to record release: ${response.status} ${response.statusText}`);
  }

  const rows = (await response.json()) as SupabaseRow[];
  return rows[0] ?? null;
}

export async function updateReleaseStatus(releaseId: string, status: string) {
  const config = supabaseHeaders();
  if (!config) return null;

  const response = await fetch(`${config.baseUrl}/rest/v1/releases?id=eq.${releaseId}`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({ status }),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to update release status: ${response.status} ${response.statusText}`);
  }

  const rows = (await response.json()) as SupabaseRow[];
  return rows[0] ?? null;
}

export async function recordDelivery(releaseId: string, status: string, errorMessage?: string | null) {
  const config = supabaseHeaders();
  if (!config) return null;

  const response = await fetch(`${config.baseUrl}/rest/v1/deliveries`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify([
      {
        release_id: releaseId,
        status,
        error_message: errorMessage ?? null,
        sent_at: status === "sent" ? new Date().toISOString() : null,
      },
    ]),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to record delivery: ${response.status} ${response.statusText}`);
  }

  const rows = (await response.json()) as SupabaseRow[];
  return rows[0] ?? null;
}
