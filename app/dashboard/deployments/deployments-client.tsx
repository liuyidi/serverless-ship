"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, startTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, Clock3, Filter, SquareArrowOutUpRight, Waves } from "lucide-react";
import type { DeploymentListResult, DeploymentRow } from "@/lib/deployments";

const PAGE_SIZE = 20;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function badgeClass(value: string | null) {
  return (value ?? "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function StatusBadge({ value }: { value: string | null }) {
  return <span className={`adminBadge ${badgeClass(value)}`}>{value ?? "unknown"}</span>;
}

function LinkButton({ href, label, external = true }: { href: string; label: string; external?: boolean }) {
  return (
    <Link className="adminLinkButton" href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
      <SquareArrowOutUpRight size={14} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

function DeploymentRowView({ row }: { row: DeploymentRow }) {
  const detailHref = `/dashboard/deployments/${row.id}`;

  return (
    <tr className="adminTableRow">
      <td>
        <div className="adminPrimaryCell">
          <div className="adminProjectName">{row.project_name}</div>
          <div className="adminProjectMeta">{row.project_slug}</div>
        </div>
      </td>
      <td>
        <div className="adminStackedCell">
          <span className="adminVersion">{row.version}</span>
          <span className="adminMuted">{row.tag ?? "-"}</span>
        </div>
      </td>
      <td><StatusBadge value={row.channel} /></td>
      <td><StatusBadge value={row.release_status} /></td>
      <td>
        <div className="adminStackedCell">
          <span className="adminVersion">{formatDate(row.created_at)}</span>
          <span className="adminMuted">Updated {formatDate(row.updated_at)}</span>
        </div>
      </td>
      <td>
        <div className="adminStackedCell">
          <span className="adminVersion">{row.delivery_status ?? "unknown"}</span>
          <span className="adminMuted">{row.delivery_error_message ?? "No delivery error"}</span>
        </div>
      </td>
      <td>
        <div className="adminActions">
          {row.release_url ? <LinkButton href={row.release_url} label="Release" /> : null}
          {row.workflow_url ? <LinkButton href={row.workflow_url} label="Workflow" /> : null}
          <LinkButton href={detailHref} label="Detail" external={false} />
        </div>
      </td>
    </tr>
  );
}

function getSummary(rows: DeploymentRow[]) {
  const sent = rows.filter((row) => row.delivery_status === "sent").length;
  const failed = rows.filter((row) => row.delivery_status === "failed").length;
  const pending = rows.filter((row) => row.release_status === "pending").length;
  const latest = rows[0]?.created_at ?? null;
  return { sent, failed, pending, latest };
}

function parseQueryValue(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);
  return value && value.trim() ? value.trim() : "";
}

function parsePage(value: string) {
  const parsed = Number.parseInt(value || "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildHref(pathname: string, params: Record<string, string | number | null | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && String(value).trim()) {
      search.set(key, String(value).trim());
    }
  }
  const qs = search.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function DeploymentsSkeleton() {
  return (
    <>
      <div className="adminLoadingForm">
        <div className="adminLoadingInput" />
        <div className="adminLoadingInput" />
        <div className="adminLoadingInput" />
        <div className="adminLoadingInput" />
        <div className="adminLoadingInput" />
        <div className="adminLoadingInput" />
        <div className="adminLoadingActions">
          <div className="adminLoadingButton" />
          <div className="adminLoadingButton adminLoadingButtonSecondary" />
        </div>
      </div>
      <div className="adminLoadingTable">
        <div className="adminLoadingTableHeader" />
        <div className="adminLoadingTableRow" />
        <div className="adminLoadingTableRow" />
        <div className="adminLoadingTableRow" />
      </div>
    </>
  );
}

export function DeploymentsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [result, setResult] = useState<DeploymentListResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(() => {
    return {
      project: parseQueryValue(searchParams, "project"),
      channel: parseQueryValue(searchParams, "channel"),
      status: parseQueryValue(searchParams, "status"),
      q: parseQueryValue(searchParams, "q"),
      from: parseQueryValue(searchParams, "from"),
      to: parseQueryValue(searchParams, "to"),
      page: parsePage(parseQueryValue(searchParams, "page")),
    };
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function loadDeployments() {
      try {
        const response = await fetch(`/api/deployments?${search}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load deployments: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as DeploymentListResult;
        if (mounted) {
          setResult(data);
          setError(null);
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        if (mounted) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      }
    }

    setResult(null);
    loadDeployments();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [search]);

  const onFilterChange = (nextParams: Record<string, string | number | null | undefined>) => {
    startTransition(() => {
      router.push(buildHref(pathname, nextParams));
    });
  };

  if (!result) {
    return (
      <>
        <DeploymentsSkeleton />
        {error ? (
          <div className="adminInlineError adminLoadingError">{error}</div>
        ) : null}
      </>
    );
  }

  const totalPages = Math.max(Math.ceil(result.total / PAGE_SIZE), 1);
  const hasPrev = filters.page > 1;
  const hasNext = filters.page < totalPages;
  const summary = getSummary(result.rows);
  const deploymentError = result.error?.status === 404 ? "The deployments view is missing from Supabase." : result.error?.message ?? null;

  return (
    <>
      <form
        className="adminFilterGrid"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          onFilterChange({
            project: String(formData.get("project") ?? "").trim(),
            channel: String(formData.get("channel") ?? "").trim(),
            status: String(formData.get("status") ?? "").trim(),
            q: String(formData.get("q") ?? "").trim(),
            from: String(formData.get("from") ?? "").trim(),
            to: String(formData.get("to") ?? "").trim(),
            page: 1,
          });
        }}
      >
        <label>
          <span>Project</span>
          <input name="project" defaultValue={filters.project} placeholder="minibot desktop" />
        </label>
        <label>
          <span>Channel</span>
          <input name="channel" defaultValue={filters.channel} placeholder="GitHub Release" />
        </label>
        <label>
          <span>Status</span>
          <input name="status" defaultValue={filters.status} placeholder="sent / failed / pending" />
        </label>
        <label>
          <span>Keyword</span>
          <input name="q" defaultValue={filters.q} placeholder="tag, repo, version" />
        </label>
        <label>
          <span>From</span>
          <input name="from" type="date" defaultValue={filters.from} />
        </label>
        <label>
          <span>To</span>
          <input name="to" type="date" defaultValue={filters.to} />
        </label>
        <div className="adminFilterActions">
          <button type="submit">
            <Filter size={14} aria-hidden="true" />
            Filter
          </button>
          <button
            type="button"
            className="adminSecondaryButton"
            onClick={() => onFilterChange({})}
          >
            Reset
          </button>
        </div>
      </form>

      <div className="adminTableMeta">
        <div>
          <div className="adminSectionKicker">Latest first</div>
          <h2>{result.total} deployments</h2>
          <p>{summary.latest ? `Latest row: ${formatDate(summary.latest)}` : "No rows match the current filters."}</p>
        </div>
        <div className="adminPageMeta">
          <div className="adminPageCount">
            <Clock3 size={14} aria-hidden="true" />
            Page {filters.page} / {totalPages}
          </div>
          {deploymentError ? <span className="adminInlineError">{deploymentError}</span> : null}
          {error ? <span className="adminInlineError">{error}</span> : null}
        </div>
      </div>

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Project</th>
              <th>Version / Tag</th>
              <th>Channel</th>
              <th>Status</th>
              <th>Timestamps</th>
              <th>Delivery</th>
              <th>Links</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="adminEmpty">
                    <Waves size={18} aria-hidden="true" />
                    <p>{result.error ? "Deployments are temporarily unavailable." : "No deployments match the current filters."}</p>
                  </div>
                </td>
              </tr>
            ) : (
              result.rows.map((row) => <DeploymentRowView key={row.id} row={row} />)
            )}
          </tbody>
        </table>
      </div>

      <div className="adminPager">
        <button
          type="button"
          className={`adminPagerLink ${!hasPrev ? "disabled" : ""}`}
          disabled={!hasPrev}
          onClick={() =>
            hasPrev &&
            onFilterChange({
              project: filters.project,
              channel: filters.channel,
              status: filters.status,
              q: filters.q,
              from: filters.from,
              to: filters.to,
              page: filters.page - 1,
            })
          }
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Previous
        </button>
        <button
          type="button"
          className={`adminPagerLink ${!hasNext ? "disabled" : ""}`}
          disabled={!hasNext}
          onClick={() =>
            hasNext &&
            onFilterChange({
              project: filters.project,
              channel: filters.channel,
              status: filters.status,
              q: filters.q,
              from: filters.from,
              to: filters.to,
              page: filters.page + 1,
            })
          }
        >
          Next
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </>
  );
}
