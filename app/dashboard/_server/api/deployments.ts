import { listDeployments } from "@/lib/deployments";

function readString(value: string | null) {
  return value && value.trim() ? value.trim() : null;
}

function readPage(value: string | null) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export async function getAdminDeployments(request: Request) {
  const url = new URL(request.url);

  return listDeployments({
    project: readString(url.searchParams.get("project")),
    channel: readString(url.searchParams.get("channel")),
    status: readString(url.searchParams.get("status")),
    q: readString(url.searchParams.get("q")),
    from: readString(url.searchParams.get("from")),
    to: readString(url.searchParams.get("to")),
    page: readPage(url.searchParams.get("page")),
    pageSize: 20,
  });
}
