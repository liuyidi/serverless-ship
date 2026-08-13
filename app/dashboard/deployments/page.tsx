import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { DeploymentsClient } from "./deployments-client";
import { dashboardCopy, resolveDashboardLocale } from "@/lib/dashboard-copy";

export default async function AdminDeploymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const locale = resolveDashboardLocale(resolvedSearchParams.lang);
  const copy = dashboardCopy[locale];

  return (
    <main className="adminPage">
      <section className="adminHeroCard">
        <div className="adminHeroCopy">
          <div className="adminSectionKicker">{copy.deployments.hero.kicker}</div>
          <h1>{copy.deployments.hero.title}</h1>
          <p>{copy.deployments.hero.description}</p>
          <div className="adminHeroPills">
            <span className="adminBadge neutral">{copy.deployments.hero.pills.readOnly}</span>
            <span className="adminBadge neutral">{copy.deployments.hero.pills.newestFirst}</span>
            <span className="adminBadge neutral">{copy.deployments.hero.pills.supabaseRest}</span>
          </div>
        </div>

        <div className="adminHeroStats">
          <div className="adminStatCard">
            <div className="adminStatLabel">{copy.deployments.hero.stats.totalRows}</div>
            <div className="adminLoadingLine adminLoadingLineWide" />
            <div className="adminStatHelp">{copy.deployments.hero.stats.currentFilterResult}</div>
          </div>
          <div className="adminStatCard">
            <div className="adminStatLabel">{copy.deployments.hero.stats.sentDeliveries}</div>
            <div className="adminLoadingLine adminLoadingLineWide" />
            <div className="adminStatHelp">{copy.deployments.hero.stats.latestPageRecords}</div>
          </div>
          <div className="adminStatCard">
            <div className="adminStatLabel">{copy.deployments.hero.stats.pendingReleases}</div>
            <div className="adminLoadingLine adminLoadingLineWide" />
            <div className="adminStatHelp">{copy.deployments.hero.stats.releaseStatusPending}</div>
          </div>
        </div>
      </section>

      <section className="adminPanel">
        <div className="adminPanelHeader">
          <div>
            <div className="adminSectionKicker">{copy.deployments.panel.kicker}</div>
            <h2>{copy.deployments.panel.title}</h2>
            <p>{copy.deployments.panel.description}</p>
          </div>
          <Link className="adminGhostLink" href="/dashboard/supabase">
            <BadgeCheck size={16} aria-hidden="true" />
            {copy.deployments.panel.supabaseStatus}
          </Link>
        </div>

        <DeploymentsClient locale={locale} />
      </section>
    </main>
  );
}
