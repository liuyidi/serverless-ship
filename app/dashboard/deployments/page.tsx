import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { DeploymentsClient } from "./deployments-client";

export default function AdminDeploymentsPage() {
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
            <div className="adminLoadingLine adminLoadingLineWide" />
            <div className="adminStatHelp">Current filter result</div>
          </div>
          <div className="adminStatCard">
            <div className="adminStatLabel">Sent deliveries</div>
            <div className="adminLoadingLine adminLoadingLineWide" />
            <div className="adminStatHelp">Latest page records</div>
          </div>
          <div className="adminStatCard">
            <div className="adminStatLabel">Pending releases</div>
            <div className="adminLoadingLine adminLoadingLineWide" />
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

        <DeploymentsClient />
      </section>
    </main>
  );
}
