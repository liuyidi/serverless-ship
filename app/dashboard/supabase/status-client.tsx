"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { CircleAlert, CircleCheckBig, Database, ExternalLink, ShieldCheck, TerminalSquare } from "lucide-react";
import type { SupabaseInitStatus } from "@/lib/supabase-status";

function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? <CircleCheckBig className="statusIcon ok" aria-hidden="true" /> : <CircleAlert className="statusIcon warn" aria-hidden="true" />;
}

function TableStatePill({ state }: { state: SupabaseInitStatus["tableProbes"][number]["state"] }) {
  return <span className={`statusPill ${state}`}>{state}</span>;
}

function HeroAsideSkeleton() {
  return (
    <div className="statusHeroAside">
      <div className="statusMetric">
        <div className="statusMetricValue">
          <span className="statusSkeletonLine statusSkeletonLineShort" />
        </div>
        <div className="statusMetricLabel">tables ready</div>
      </div>
      <div className="statusBadge warn">
        <ShieldCheck className="statusBadgeIcon" aria-hidden="true" />
        checking
      </div>
      <div className="statusMeta">
        <div className="statusSkeletonLine statusSkeletonLineShort" />
        <div className="statusSkeletonLine" />
        <div className="statusSkeletonLine" />
      </div>
    </div>
  );
}

function StatusSkeleton() {
  return (
    <>
      <section className="statusLoadingGrid">
        <article className="statusCard">
          <div className="statusCardHead">
            <div className="statusCardIcon statusSkeletonIcon" />
            <div className="statusSkeletonBlock">
              <div className="statusSkeletonLine statusSkeletonLineShort" />
              <div className="statusSkeletonLine" />
            </div>
          </div>
          <div className="statusSkeletonStack">
            <div className="statusSkeletonLine" />
            <div className="statusSkeletonLine" />
          </div>
        </article>

        <article className="statusCard">
          <div className="statusCardHead">
            <div className="statusCardIcon statusSkeletonIcon" />
            <div className="statusSkeletonBlock">
              <div className="statusSkeletonLine statusSkeletonLineShort" />
              <div className="statusSkeletonLine" />
            </div>
          </div>
          <div className="statusSkeletonStack">
            <div className="statusSkeletonLine" />
            <div className="statusSkeletonLine" />
            <div className="statusSkeletonLine" />
          </div>
        </article>
      </section>

      <section className="statusCard statusLoadingWide">
        <div className="statusSkeletonBlock">
          <div className="statusSkeletonLine statusSkeletonLineShort" />
          <div className="statusSkeletonLine" />
          <div className="statusSkeletonLine" />
        </div>
      </section>
    </>
  );
}

export function SupabaseStatusClient({ hero }: { hero: ReactNode }) {
  const [status, setStatus] = useState<SupabaseInitStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function loadStatus() {
      try {
        const response = await fetch("/api/supabase/status", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load status: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as SupabaseInitStatus;
        if (mounted) {
          setStatus(data);
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

    loadStatus();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const readyCount = status?.tableProbes.filter((probe) => probe.ok).length ?? null;

  return (
    <>
      <section className="statusHero sectionCard">
        <div className="statusHeroCopy">{hero}</div>

        {status ? (
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
        ) : (
          <HeroAsideSkeleton />
        )}
      </section>

      {!status ? (
        error ? (
          <section className="statusCard statusErrorCard">
            <div className="statusCardHead">
              <ExternalLink className="statusCardIcon" aria-hidden="true" />
              <div>
                <h2>Failed to load status</h2>
                <p>{error}</p>
              </div>
            </div>
            <div className="statusLinks">
              <Link className="adminGhostLink" href="/dashboard/deployments">
                Back to dashboard
              </Link>
            </div>
          </section>
        ) : (
          <StatusSkeleton />
        )
      ) : (
        <>
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
                <h2>Resource probes</h2>
                <p>Checks whether the three tables and the deployments dashboard view are reachable through REST.</p>
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
                  If any resource shows <strong>missing</strong>, run the migration push again after checking
                  the Supabase link and project ref.
                </p>
              </div>
            </div>

            <p className="statusNote">
              The current architecture keeps server writes on the service-role path. RLS is enabled on the
              tables to protect them from public access until a user-facing policy is added later.
            </p>

            <div className="statusLinks">
              <Link className="adminGhostLink" href="/dashboard/deployments">
                Back to dashboard
              </Link>
            </div>
          </section>
        </>
      )}
    </>
  );
}
