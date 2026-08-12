export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getAdminDeployments } from "@/app/dashboard/_server/api/deployments";

export async function GET(request: Request) {
  const result = await getAdminDeployments(request);

  return Response.json(result, {
    headers: {
      "cache-control": "no-store",
    },
  });
}
