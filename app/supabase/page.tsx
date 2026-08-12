export const dynamic = "force-dynamic";

import { CircleAlert, CircleCheckBig, Database, ExternalLink, ShieldCheck, TerminalSquare } from "lucide-react";
import Link from "next/link";
import { getSupabaseInitStatus } from "@/lib/supabase-status";

function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? <CircleCheckBig className="statusIcon ok" aria-hidden="true" /> : <CircleAlert className="statusIcon warn" aria-hidden="true" />;
}

function TableStatePill({ state }: { state: "ready" | "missing" | "unauthorized" | "error" | "unconfigured" }) {
  const labelMap: Record<typeof state, string> = {
    ready: "ready",
    missing: "missing",
    unauthorized: "unauthorized",
    error: "error",
    unconfigured: "unconfigured",
  };

  return <span className={`statusPill ${state}`}>{labelMap[state]}</span>;
}

export default async function SupabaseStatusPage() {
  const status = await getSupabaseInitStatus();
  const readyCount = status.tableProbes.filter((probe) => probe.ok).length;

  return (
    <main className="statusPage">
      <section className="statusHero sectionCard">
        <div className="statusHeroCopy">
          <div className="sectionKicker">Supabase init status</div>
          <h1>Supabase 初始化状态</h1>
          <p>
            This page checks whether ServerlessShip can reach Supabase and whether the core tables
            exist. It is the fastest way to confirm the database setup after you push migrations.
          </p>
        </div>

        <div className="statusHeroAside">
          <div className="statusMetric">
            <div className="statusMetricValue">{readyCount}/3</div>
            <div className="statusMetricLabel">tables ready</div>
          </div>
          <div className={`statusBadge ${status.configured ? "ready" : "warn"}`}>
            <ShieldCheck className="statusBadgeIcon" aria-hidden="true" />
            {status.configured ? "connected" : "not connected"}
          </div>
          <div className="statusMeta">
            <div>project slug: {status.projectSlug}</div>
            <div>repository: {status.repository}</div>
            <div>checked at: {status.checkedAt}</div>
          </div>
        </div>
      </section>

      <section className="statusGrid">
        <article className="statusCard">
          <div className="statusCardHead">
            <Database className="statusCardIcon" aria-hidden="true" />
            <div>
              <h2>Connection</h2>
              <p>Verifies the deployment can reach the configured Supabase project.</p>
            </div>
          </div>

          <ul className="statusList">
            <li>
              <span>SUPABASE_URL</span>
              <strong>{status.url ?? "missing"}</strong>
            </li>
            <li>
              <span>Service role key</span>
              <strong>{status.serviceRoleConfigured ? "configured" : "missing"}</strong>
            </li>
          </ul>
        </article>

        <article className="statusCard">
          <div className="statusCardHead">
            <TerminalSquare className="statusCardIcon" aria-hidden="true" />
            <div>
              <h2>CLI workflow</h2>
              <p>Use the CLI to generate and apply migrations against the remote project.</p>
            </div>
          </div>

          <ol className="statusCommandList">
            {status.commands.map((command) => (
              <li key={command}>
                <code>{command}</code>
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section className="statusCard">
        <div className="statusCardHead">
          <ShieldCheck className="statusCardIcon" aria-hidden="true" />
          <div>
            <h2>Table probes</h2>
            <p>Checks whether the three tables used by the current code are reachable through REST.</p>
          </div>
        </div>

        <div className="statusTable">
          {status.tableProbes.map((probe) => (
            <div className="statusRow" key={probe.table}>
              <div className="statusRowMain">
                <StatusIcon ok={probe.ok} />
                <div>
                  <div className="statusRowTitle">{probe.table}</div>
                  <div className="statusRowDetail">{probe.detail}</div>
                </div>
              </div>
              <div className="statusRowMeta">
                <TableStatePill state={probe.state} />
                <span>{probe.httpStatus ?? "n/a"}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="statusCard">
        <div className="statusCardHead">
          <ExternalLink className="statusCardIcon" aria-hidden="true" />
          <div>
            <h2>Next steps</h2>
            <p>
              If any table shows <strong>missing</strong>, run the migration push again after checking
              the Supabase link and project ref.
            </p>
          </div>
        </div>

        <p className="statusNote">
          The current architecture keeps server writes on the service-role path. RLS is enabled on the
          tables to protect them from public access until a user-facing policy is added later.
        </p>

        <div className="statusLinks">
          <Link href="/api/supabase/status">JSON status</Link>
          <Link href="/">Back to home</Link>
        </div>
      </section>
    </main>
  );
}
