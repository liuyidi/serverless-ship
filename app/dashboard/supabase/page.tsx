import { SupabaseStatusClient } from "./status-client";

export default function AdminSupabaseStatusPage() {
  return (
    <main className="statusPage">
      <section className="statusHero sectionCard">
        <div className="statusHeroCopy">
          <div className="sectionKicker">Dashboard / Supabase init status</div>
          <h1>Supabase 初始化状态</h1>
          <p>
            This page checks whether ServerlessShip can reach Supabase and whether the core tables
            exist. The shell renders first, then the live status fills in without blocking the route
            switch.
          </p>
        </div>
      </section>

      <SupabaseStatusClient />
    </main>
  );
}
