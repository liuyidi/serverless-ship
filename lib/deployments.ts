import { getEnv } from "@/lib/env";

export type DeploymentFilters = {
  id?: string | null;
  project?: string | null;
  channel?: string | null;
  status?: string | null;
  q?: string | null;
  from?: string | null;
  to?: string | null;
  page?: number;
  pageSize?: number;
};

export type DeploymentRow = {
  id: string;
  project_id: string;
  project_slug: string;
  project_name: string;
  repository: string;
  version: string;
  tag: string | null;
  channel: string | null;
  release_url: string | null;
  workflow_url: string | null;
  release_status: string;
  created_at: string;
  updated_at: string;
  delivery_status: string | null;
  delivery_error_message: string | null;
  delivery_sent_at: string | null;
  delivery_created_at: string | null;
};

export type DeploymentListResult = {
  rows: DeploymentRow[];
  total: number;
  page: number;
  pageSize: number;
  error: DeploymentListError | null;
};

export type DeploymentListError = {
  status: number;
  statusText: string;
  message: string;
};

function getSupabaseConfig() {
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
    },
  };
}

function escapeLike(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

export function buildDeploymentQuery(filters: DeploymentFilters) {
  const params = new URLSearchParams();
  params.set("select", "*");
  params.set("order", "created_at.desc");
  params.set("limit", String(filters.pageSize ?? 20));
  params.set("offset", String(Math.max((filters.page ?? 1) - 1, 0) * (filters.pageSize ?? 20)));

  if (filters.id) {
    params.set("id", `eq.${filters.id}`);
  }

  if (filters.project) {
    params.set("project_slug", `eq.${filters.project}`);
  }

  if (filters.channel) {
    params.set("channel", `eq.${filters.channel}`);
  }

  if (filters.status) {
    params.set("release_status", `eq.${filters.status}`);
  }

  if (filters.q) {
    const q = escapeLike(filters.q.trim());
    params.set("or", `(project_name.ilike.*${q}*,project_slug.ilike.*${q}*,version.ilike.*${q}*,tag.ilike.*${q}*,repository.ilike.*${q}*)`);
  }

  if (filters.from) {
    params.append("created_at", `gte.${filters.from}T00:00:00.000Z`);
  }

  if (filters.to) {
    params.append("created_at", `lte.${filters.to}T23:59:59.999Z`);
  }

  return params.toString();
}

export async function listDeployments(filters: DeploymentFilters = {}): Promise<DeploymentListResult> {
  const config = getSupabaseConfig();
  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = Math.max(filters.pageSize ?? 20, 1);

  if (!config) {
    return { rows: [], total: 0, page, pageSize, error: null };
  }

  const query = buildDeploymentQuery({ ...filters, page, pageSize });
  const response = await fetch(`${config.baseUrl}/rest/v1/deployments_dashboard?${query}`, {
    headers: {
      ...config.headers,
      Prefer: "count=exact",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = (await response.text()).trim();
    return {
      rows: [],
      total: 0,
      page,
      pageSize,
      error: {
        status: response.status,
        statusText: response.statusText,
        message: detail || `Failed to load deployments: ${response.status} ${response.statusText}`,
      },
    };
  }

  const rows = (await response.json()) as DeploymentRow[];
  const range = response.headers.get("content-range");
  const total = range ? Number.parseInt(range.split("/").at(-1) ?? "0", 10) || rows.length : rows.length;

  return { rows, total, page, pageSize, error: null };
}

export async function getDeploymentById(id: string): Promise<DeploymentRow | null> {
  const result = await listDeployments({ id, page: 1, pageSize: 1 });
  return result.rows[0] ?? null;
}
