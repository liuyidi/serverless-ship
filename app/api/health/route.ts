export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    ok: true,
    service: "serverless-ship",
    now: new Date().toISOString(),
  });
}
