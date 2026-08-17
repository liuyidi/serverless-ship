import { connectGithubProject } from "@/lib/github-app";
import { getProjectTemplateBySlug, saveProjectTemplate } from "@/lib/templates";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { slug?: string; channel?: string };
  try { body = await request.json(); } catch { return Response.json({ ok: false, error: "invalid json" }, { status: 400 }); }
  if (!body.slug?.trim()) return Response.json({ ok: false, error: "project slug is required" }, { status: 400 });
  try {
    const project = await getProjectTemplateBySlug(body.slug);
    if (!project) return Response.json({ ok: false, error: "project template not found" }, { status: 404 });
    const created = await saveProjectTemplate({ name: project.name, repository: project.repository, slug: project.slug, config: project.template_config, rotateToken: true });
    if (!created.token) throw new Error("failed to create project token");
    const connection = await connectGithubProject({ repository: project.repository, slug: project.slug, projectName: project.name, channel: body.channel ?? "GitHub Release", notifyToken: created.token });
    return Response.json({ ok: true, ...connection, tokenLast4: created.token.slice(-4) });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "GitHub connection failed" }, { status: 500 });
  }
}
