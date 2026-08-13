"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, startTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3, Filter, SquareArrowOutUpRight, Waves } from "lucide-react";
import type { DeploymentListResult, DeploymentRow } from "@/lib/deployments";
import { buildDashboardHref, dashboardCopy, type DashboardLocale } from "@/lib/dashboard-copy";

const PAGE_SIZE = 20;

function formatDate(value: string, locale: DashboardLocale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
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

function translateStatus(value: string | null, locale: DashboardLocale) {
  if (!value) {
    return locale === "zh" ? "未知" : "unknown";
  }

  if (locale === "zh") {
    switch (value) {
      case "sent":
        return "已发送";
      case "failed":
        return "失败";
      case "pending":
        return "待处理";
      default:
        return value;
    }
  }

  return value;
}

function translateChannel(value: string | null, locale: DashboardLocale) {
  if (!value) {
    return locale === "zh" ? "未知" : "unknown";
  }

  if (locale === "zh") {
    switch (value) {
      case "GitHub Release":
        return "GitHub 发布";
      case "GitHub Workflow":
        return "GitHub 工作流";
      default:
        return value;
    }
  }

  return value;
}

function StatusBadge({
  value,
  tone,
}: {
  value: string | null;
  tone?: string | null;
}) {
  return <span className={`adminBadge ${badgeClass(tone ?? value)}`}>{value ?? "unknown"}</span>;
}

function LinkButton({ href, label, external = true }: { href: string; label: string; external?: boolean }) {
  return (
    <Link className="adminLinkButton" href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
      <SquareArrowOutUpRight size={14} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

function DeploymentRowView({
  row,
  locale,
  search,
}: {
  row: DeploymentRow;
  locale: DashboardLocale;
  search: string;
}) {
  const copy = dashboardCopy[locale].deployments;
  const detailHref = buildDashboardHref(`/dashboard/deployments/${row.id}`, search, locale);

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
      <td>
        <StatusBadge value={translateChannel(row.channel, locale)} tone={row.channel} />
      </td>
      <td>
        <StatusBadge value={translateStatus(row.release_status, locale)} tone={row.release_status} />
      </td>
      <td>
        <div className="adminStackedCell">
          <span className="adminVersion">{formatDate(row.created_at, locale)}</span>
          <span className="adminMuted">
            {copy.row.updated} {formatDate(row.updated_at, locale)}
          </span>
        </div>
      </td>
      <td>
        <div className="adminStackedCell">
          <span className="adminVersion">{translateStatus(row.delivery_status, locale)}</span>
          <span className="adminMuted">{row.delivery_error_message ?? copy.row.noDeliveryError}</span>
        </div>
      </td>
      <td>
        <div className="adminActions">
          {row.release_url ? <LinkButton href={row.release_url} label={copy.row.release} /> : null}
          {row.workflow_url ? <LinkButton href={row.workflow_url} label={copy.row.workflow} /> : null}
          <LinkButton href={detailHref} label={copy.row.detail} external={false} />
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

export function DeploymentsClient({ locale }: { locale: DashboardLocale }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const copy = dashboardCopy[locale].deployments;
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
          setError(err instanceof Error ? err.message : copy.status.filterError);
        }
      }
    }

    setResult(null);
    loadDeployments();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [copy.status.filterError, search]);

  const onFilterChange = (nextParams: Record<string, string | number | null | undefined>) => {
    startTransition(() => {
      router.push(buildHref(pathname, { ...nextParams, lang: locale }));
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
  const deploymentError =
    result.error?.status === 404 ? copy.status.deploymentViewMissing : result.error?.message ?? null;

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
          <span>{copy.filters.project}</span>
          <input name="project" defaultValue={filters.project} placeholder={copy.filters.projectPlaceholder} />
        </label>
        <label>
          <span>{copy.filters.channel}</span>
          <input name="channel" defaultValue={filters.channel} placeholder={copy.filters.channelPlaceholder} />
        </label>
        <label>
          <span>{copy.filters.status}</span>
          <input name="status" defaultValue={filters.status} placeholder={copy.filters.statusPlaceholder} />
        </label>
        <label>
          <span>{copy.filters.keyword}</span>
          <input name="q" defaultValue={filters.q} placeholder={copy.filters.keywordPlaceholder} />
        </label>
        <label>
          <span>{copy.filters.from}</span>
          <input name="from" type="date" defaultValue={filters.from} />
        </label>
        <label>
          <span>{copy.filters.to}</span>
          <input name="to" type="date" defaultValue={filters.to} />
        </label>
        <div className="adminFilterActions">
          <button type="submit">
            <Filter size={14} aria-hidden="true" />
            {copy.filters.submit}
          </button>
          <button
            type="button"
            className="adminSecondaryButton"
            onClick={() => onFilterChange({ lang: locale })}
          >
            {copy.filters.reset}
          </button>
        </div>
      </form>

      <div className="adminTableMeta">
        <div>
          <div className="adminSectionKicker">{copy.table.latestFirst}</div>
          <h2>
            {result.total} {copy.table.deployments}
          </h2>
          <p>{summary.latest ? `${copy.table.latestRow}${formatDate(summary.latest, locale)}` : copy.table.noRows}</p>
        </div>
        <div className="adminPageMeta">
          <div className="adminPageCount">
            <Clock3 size={14} aria-hidden="true" />
            {copy.pager.page} {filters.page} / {totalPages}
          </div>
          {deploymentError ? <span className="adminInlineError">{deploymentError}</span> : null}
          {error ? <span className="adminInlineError">{error}</span> : null}
        </div>
      </div>

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>{copy.table.headings.project}</th>
              <th>{copy.table.headings.versionTag}</th>
              <th>{copy.table.headings.channel}</th>
              <th>{copy.table.headings.status}</th>
              <th>{copy.table.headings.timestamps}</th>
              <th>{copy.table.headings.delivery}</th>
              <th>{copy.table.headings.links}</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="adminEmpty">
                    <Waves size={18} aria-hidden="true" />
                    <p>{result.error ? copy.status.filterError : copy.table.noRows}</p>
                  </div>
                </td>
              </tr>
            ) : (
              result.rows.map((row) => <DeploymentRowView key={row.id} row={row} locale={locale} search={search} />)
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
          {copy.pager.previous}
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
          {copy.pager.next}
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </>
  );
}
