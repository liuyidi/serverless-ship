import Link from "next/link";
import { ArrowLeft, BadgeCheck, SquareArrowOutUpRight } from "lucide-react";
import { getDeploymentById } from "@/lib/deployments";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="adminInfoCard">
      <span>{label}</span>
      <strong>{value ?? "-"}</strong>
    </div>
  );
}

function statusClass(value: string | null) {
  return (value ?? "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default async function AdminDeploymentDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const row = await getDeploymentById(id);

  if (!row) {
    return (
      <main className="adminPage">
        <section className="adminPanel adminDetailPanel">
          <div className="adminDetailHeader">
            <Link className="adminBackLink" href="/dashboard/deployments">
              <ArrowLeft size={14} aria-hidden="true" />
              Back to deployments
            </Link>
            <div className="adminSectionKicker">Dashboard / Deployment</div>
          </div>
          <h1>Deployment not found</h1>
          <p>The record may have been removed or the dashboard is still syncing.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="adminPage">
      <section className="adminPanel adminDetailPanel">
        <div className="adminDetailHeader">
          <Link className="adminBackLink" href="/dashboard/deployments">
            <ArrowLeft size={14} aria-hidden="true" />
            Back to deployments
          </Link>
          <div className="adminSectionKicker">Dashboard / Deployment detail</div>
        </div>

        <div className="adminDetailTop">
          <div>
            <h1>{row.project_name}</h1>
            <p>{row.repository}</p>
            <div className="adminHeroPills">
              <span className={`adminBadge ${statusClass(row.release_status)}`}>{row.release_status}</span>
              <span className={`adminBadge ${statusClass(row.delivery_status)}`}>{row.delivery_status ?? "unknown"}</span>
              <span className="adminBadge neutral">Channel: {row.channel ?? "unknown"}</span>
            </div>
          </div>
          <div className="adminDetailMeta">
            <span className="adminDetailMetaLabel">Deployment ID</span>
            <strong>{row.id}</strong>
          </div>
        </div>

        <div className="adminDetailGrid">
          <InfoRow label="Version" value={row.version} />
          <InfoRow label="Tag" value={row.tag} />
          <InfoRow label="Created" value={formatDate(row.created_at)} />
          <InfoRow label="Updated" value={formatDate(row.updated_at)} />
          <InfoRow label="Release URL" value={row.release_url} />
          <InfoRow label="Workflow URL" value={row.workflow_url} />
          <InfoRow label="Delivery error" value={row.delivery_error_message} />
          <InfoRow label="Delivery sent at" value={row.delivery_sent_at} />
        </div>

        <div className="adminDetailActions">
          {row.release_url ? (
            <Link className="adminLinkButton" href={row.release_url} target="_blank" rel="noreferrer">
              <SquareArrowOutUpRight size={14} aria-hidden="true" />
              GitHub Release
            </Link>
          ) : null}
          {row.workflow_url ? (
            <Link className="adminLinkButton" href={row.workflow_url} target="_blank" rel="noreferrer">
              <SquareArrowOutUpRight size={14} aria-hidden="true" />
              Workflow
            </Link>
          ) : null}
          <Link className="adminGhostLink" href="/dashboard/supabase">
            <BadgeCheck size={14} aria-hidden="true" />
            Supabase status
          </Link>
        </div>
      </section>
    </main>
  );
}
