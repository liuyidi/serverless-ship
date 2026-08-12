import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, BadgeCheck, Clock3, Filter, SquareArrowOutUpRight, Waves } from "lucide-react";
import { listDeployments, type DeploymentRow } from "@/lib/deployments";

const PAGE_SIZE = 20;

type DeploymentsPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? null;
}

function parsePage(value: string | null) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildHref(params: Record<string, string | null | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && value.trim()) {
      search.set(key, value.trim());
    }
  }
  const qs = search.toString();
  return qs ? `/dashboard/deployments?${qs}` : "/dashboard/deployments";
}

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
  const label = (value ?? "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return label;
}

function StatusBadge({ value }: { value: string | null }) {
  const label = value ?? "unknown";
  return <span className={`adminBadge ${badgeClass(value)}`}>{label}</span>;
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
  const releaseHref = row.release_url ?? null;
  const workflowHref = row.workflow_url ?? null;
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
          {releaseHref ? <LinkButton href={releaseHref} label="Release" /> : null}
          {workflowHref ? <LinkButton href={workflowHref} label="Workflow" /> : null}
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

export default async function AdminDeploymentsPage({ searchParams }: DeploymentsPageProps) {
  const params = searchParams ?? {};
  const project = firstParam(params.project);
  const channel = firstParam(params.channel);
  const status = firstParam(params.status);
  const q = firstParam(params.q);
  const from = firstParam(params.from);
  const to = firstParam(params.to);
  const page = parsePage(firstParam(params.page));

  const result = await listDeployments({ project, channel, status, q, from, to, page, pageSize: PAGE_SIZE });
  const totalPages = Math.max(Math.ceil(result.total / PAGE_SIZE), 1);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const summary = getSummary(result.rows);
  const deploymentError = result.error?.status === 404 ? "The deployments view is missing from Supabase." : result.error?.message ?? null;

  return (
    <main className="adminPage">
      <section className="adminHeroCard">
        <div className="adminHeroCopy">
          <div className="adminSectionKicker">Dashboard / Deployments</div>
          <h1>Deployments console</h1>
          <p>Read-only operational view for release history, delivery status, and outbound links.</p>
          <div className="adminHeroPills">
            <span className="adminBadge neutral">Read only</span>
            <span className="adminBadge neutral">Newest first</span>
            <span className="adminBadge neutral">Supabase REST</span>
          </div>
        </div>

        <div className="adminHeroStats">
          <div className="adminStatCard">
            <div className="adminStatLabel">Total rows</div>
            <div className="adminStatValue">{result.total}</div>
            <div className="adminStatHelp">Current filter result</div>
          </div>
          <div className="adminStatCard">
            <div className="adminStatLabel">Sent deliveries</div>
            <div className="adminStatValue">{summary.sent}</div>
            <div className="adminStatHelp">Latest page records</div>
          </div>
          <div className="adminStatCard">
            <div className="adminStatLabel">Pending releases</div>
            <div className="adminStatValue">{summary.pending}</div>
            <div className="adminStatHelp">Release status pending</div>
          </div>
        </div>
      </section>

      <section className="adminPanel">
        <div className="adminPanelHeader">
          <div>
            <div className="adminSectionKicker">Filters</div>
            <h2>Refine the feed</h2>
            <p>Search by project, channel, status, date range, or keyword.</p>
          </div>
          <Link className="adminGhostLink" href="/dashboard/supabase">
            <BadgeCheck size={16} aria-hidden="true" />
            Supabase status
          </Link>
        </div>

        <form className="adminFilterGrid" action="/dashboard/deployments" method="get">
          <label>
            <span>Project</span>
            <input name="project" defaultValue={project ?? ""} placeholder="minibot desktop" />
          </label>
          <label>
            <span>Channel</span>
            <input name="channel" defaultValue={channel ?? ""} placeholder="GitHub Release" />
          </label>
          <label>
            <span>Status</span>
            <input name="status" defaultValue={status ?? ""} placeholder="sent / failed / pending" />
          </label>
          <label>
            <span>Keyword</span>
            <input name="q" defaultValue={q ?? ""} placeholder="tag, repo, version" />
          </label>
          <label>
            <span>From</span>
            <input name="from" type="date" defaultValue={from ?? ""} />
          </label>
          <label>
            <span>To</span>
            <input name="to" type="date" defaultValue={to ?? ""} />
          </label>
          <input type="hidden" name="page" value="1" />
          <div className="adminFilterActions">
            <button type="submit">
              <Filter size={14} aria-hidden="true" />
              Filter
            </button>
            <Link className="adminSecondaryButton" href="/dashboard/deployments">
              Reset
            </Link>
          </div>
        </form>
      </section>

      <section className="adminPanel">
        <div className="adminTableMeta">
          <div>
            <div className="adminSectionKicker">Latest first</div>
            <h2>{result.total} deployments</h2>
            <p>{summary.latest ? `Latest row: ${formatDate(summary.latest)}` : "No rows match the current filters."}</p>
          </div>
          <div className="adminPageMeta">
            <div className="adminPageCount">
              <Clock3 size={14} aria-hidden="true" />
              Page {page} / {totalPages}
            </div>
            {deploymentError ? <span className="adminInlineError">{deploymentError}</span> : null}
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
          <Link aria-disabled={!hasPrev} className={`adminPagerLink ${!hasPrev ? "disabled" : ""}`} href={hasPrev ? buildHref({ project, channel, status, q, from, to, page: String(page - 1) }) : "#"}>
            <ArrowLeft size={14} aria-hidden="true" />
            Previous
          </Link>
          <Link aria-disabled={!hasNext} className={`adminPagerLink ${!hasNext ? "disabled" : ""}`} href={hasNext ? buildHref({ project, channel, status, q, from, to, page: String(page + 1) }) : "#"}>
            Next
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
