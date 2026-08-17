import { listProjectTemplates, saveProjectTemplate, type TemplateConfig } from "@/lib/templates";

export const runtime = "nodejs";

export async function GET() {
  try {
    return Response.json({ ok: true, projects: await listProjectTemplates() });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "failed to load templates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: { name?: string; repository?: string; slug?: string; config?: TemplateConfig; rotateToken?: boolean };
  try { body = await request.json(); } catch { return Response.json({ ok: false, error: "invalid json" }, { status: 400 }); }
  if (!body.name?.trim() || !body.repository?.trim() || !body.config) return Response.json({ ok: false, error: "name, repository and config are required" }, { status: 400 });
  try {
    const result = await saveProjectTemplate({ name: body.name, repository: body.repository, slug: body.slug, config: body.config, rotateToken: body.rotateToken });
    return Response.json({ ok: true, project: result.project, token: result.token });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "failed to save template" }, { status: 500 });
  }
}
