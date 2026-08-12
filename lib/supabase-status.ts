import { getEnv } from "@/lib/env";

export type SupabaseTableName = "projects" | "releases" | "deliveries" | "deployments_dashboard";

export type SupabaseTableProbe = {
  table: SupabaseTableName;
  ok: boolean;
  httpStatus: number | null;
  state: "ready" | "missing" | "unauthorized" | "error" | "unconfigured";
  detail: string;
};

export type SupabaseInitStatus = {
  checkedAt: string;
  projectSlug: string;
  repository: string;
  url: string | null;
  configured: boolean;
  serviceRoleConfigured: boolean;
  tableProbes: SupabaseTableProbe[];
  commands: string[];
};

const TABLES: SupabaseTableName[] = ["projects", "releases", "deliveries", "deployments_dashboard"];

function baseUrlFromEnv() {
  const env = getEnv();
  const url = env.supabaseUrl?.replace(/\/$/, "") ?? null;

  return {
    env,
    url,
    configured: Boolean(url && env.supabaseServiceRoleKey),
  };
}

async function probeTable(baseUrl: string, table: SupabaseTableName, headers: HeadersInit): Promise<SupabaseTableProbe> {
  try {
    const response = await fetch(`${baseUrl}/rest/v1/${table}?select=id&limit=1`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (response.ok) {
      return {
        table,
        ok: true,
        httpStatus: response.status,
        state: "ready",
        detail: "table reachable",
      };
    }

    if (response.status === 404) {
      return {
        table,
        ok: false,
        httpStatus: response.status,
        state: "missing",
        detail: "table not found",
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        table,
        ok: false,
        httpStatus: response.status,
        state: "unauthorized",
        detail: "authorization rejected",
      };
    }

    const detail = (await response.text()).trim();
    return {
      table,
      ok: false,
      httpStatus: response.status,
      state: "error",
      detail: detail ? `${response.status} ${response.statusText} - ${detail}` : `${response.status} ${response.statusText}`,
    };
  } catch (error) {
    return {
      table,
      ok: false,
      httpStatus: null,
      state: "error",
      detail: error instanceof Error ? error.message : "unknown error",
    };
  }
}

export async function getSupabaseInitStatus(): Promise<SupabaseInitStatus> {
  const { env, url, configured } = baseUrlFromEnv();

  if (!configured || !url || !env.supabaseServiceRoleKey) {
    return {
      checkedAt: new Date().toISOString(),
      projectSlug: env.projectSlug,
      repository: env.githubRepository,
      url,
      configured: false,
      serviceRoleConfigured: Boolean(env.supabaseServiceRoleKey),
      tableProbes: TABLES.map((table) => ({
        table,
        ok: false,
        httpStatus: null,
        state: "unconfigured",
        detail: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing",
      })),
      commands: [
        "supabase login",
        "supabase link --project-ref sxzqroltcqtzrvnhlufz",
        "supabase db push",
      ],
    };
  }

  const headers = {
    apikey: env.supabaseServiceRoleKey,
    Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
    "content-type": "application/json",
  };

  const tableProbes = await Promise.all(TABLES.map((table) => probeTable(url, table, headers)));

  return {
    checkedAt: new Date().toISOString(),
    projectSlug: env.projectSlug,
    repository: env.githubRepository,
    url,
    configured: true,
    serviceRoleConfigured: true,
    tableProbes,
    commands: [
      "supabase login",
      "supabase link --project-ref sxzqroltcqtzrvnhlufz",
      "supabase db push",
    ],
  };
}
