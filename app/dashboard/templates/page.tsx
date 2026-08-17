"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ExternalLink, Eye, GitBranch, Link2, Palette, Plus, Save, SlidersHorizontal } from "lucide-react";

type ProjectKey = string;
type Preset = "ember" | "ocean" | "mono";

type TemplateConfig = {
  preset: Preset;
  title: string;
  signature: string;
  showVersion: boolean;
  showChannel: boolean;
  showLinks: boolean;
};

type ProjectData = { name: string; repo: string; version: string; tag: string; channel: string; release: string; workflow: string };

const projects: Record<ProjectKey, ProjectData> = {
  "mini-auth": {
    name: "mini-auth",
    repo: "liuyidi/mini-auth",
    version: "3d93bef",
    tag: "3d93bef6ed7b94c177bdf86cd2354d5534053b24",
    channel: "Tencent CVM",
    release: "https://auth.liuyidi.me/",
    workflow: "https://github.com/liuyidi/mini-auth/actions/runs/32014529227",
  },
  minibot: {
    name: "minibot",
    repo: "liuyidi/minibot",
    version: "1.0.11",
    tag: "desktop-v2-v1.0.11",
    channel: "GitHub Release (Desktop V2)",
    release: "https://github.com/liuyidi/minibot/releases/tag/desktop-v2-v1.0.11",
    workflow: "https://github.com/liuyidi/minibot/actions/runs/32012236600",
  },
  minikb: { name: "minikb", repo: "liuyidi/minikb", version: "latest", tag: "main", channel: "GitHub Workflow", release: "https://github.com/liuyidi/minikb", workflow: "https://github.com/liuyidi/minikb/actions" },
  "serverless-ship": { name: "serverless-ship", repo: "liuyidi/serverless-ship", version: "0.1.0", tag: "main", channel: "Vercel", release: "https://github.com/liuyidi/serverless-ship", workflow: "https://github.com/liuyidi/serverless-ship/actions" },
  "minibot-desktop": { name: "minibot-desktop", repo: "liuyidi/minibot", version: "1.0.11", tag: "desktop-v2-v1.0.11", channel: "GitHub Release (Desktop V2)", release: "https://github.com/liuyidi/minibot/releases", workflow: "https://github.com/liuyidi/minibot/actions" },
};

const presets: Record<Preset, { name: string; hint: string; accent: string; background: string; ink: string }> = {
  ember: { name: "Ember", hint: "暖橙 · 适合产品发布", accent: "#c2410c", background: "#fff7ed", ink: "#431407" },
  ocean: { name: "Ocean", hint: "蓝青 · 适合基础设施", accent: "#0f766e", background: "#f0fdfa", ink: "#134e4a" },
  mono: { name: "Mono", hint: "黑白 · 适合工具链", accent: "#18181b", background: "#fafafa", ink: "#18181b" },
};

const defaults: Record<ProjectKey, TemplateConfig> = {
  "mini-auth": { preset: "ember", title: "mini-auth 发布完成", signature: "ServerlessShip", showVersion: true, showChannel: true, showLinks: true },
  minibot: { preset: "mono", title: "minibot 发布完成", signature: "ServerlessShip", showVersion: true, showChannel: true, showLinks: true },
  minikb: { preset: "ocean", title: "minikb 发布完成", signature: "ServerlessShip", showVersion: true, showChannel: true, showLinks: true },
  "serverless-ship": { preset: "mono", title: "serverless-ship 发布完成", signature: "ServerlessShip", showVersion: true, showChannel: true, showLinks: true },
  "minibot-desktop": { preset: "ocean", title: "minibot-desktop 发布完成", signature: "ServerlessShip", showVersion: true, showChannel: true, showLinks: true },
};

const STORAGE_KEY = "serverless-ship-template-configs";
const PROJECTS_KEY = "serverless-ship-template-projects";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="templateToggle">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="templateToggleTrack" aria-hidden="true"><span /></span>
      <span>{label}</span>
    </label>
  );
}

export default function TemplatesPage() {
  const searchParams = useSearchParams();
  const [project, setProject] = useState<ProjectKey>("mini-auth");
  const [projectCatalog, setProjectCatalog] = useState<Record<ProjectKey, ProjectData>>(projects);
  const [configs, setConfigs] = useState(defaults);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tokenLast4, setTokenLast4] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);
  const config = configs[project] ?? defaults["mini-auth"];
  const projectData = projectCatalog[project] ?? projects["mini-auth"];
  const preset = presets[config.preset];

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
      const storedProjects = JSON.parse(window.localStorage.getItem(PROJECTS_KEY) ?? "null");
      if (stored && typeof stored === "object") setConfigs({ ...defaults, ...stored });
      if (storedProjects && typeof storedProjects === "object") setProjectCatalog({ ...projects, ...storedProjects });
    } catch { /* local preview can fall back to defaults */ }

    fetch("/api/templates")
      .then(async (response) => {
        if (!response.ok) throw new Error("template storage unavailable");
        return response.json() as Promise<{ projects: Array<{ slug: string; name: string; repository: string; template_config: TemplateConfig; notify_token_last4: string | null }> }>;
      })
      .then((data) => {
        if (!data.projects?.length) return;
        const remoteProjects: Record<string, ProjectData> = {};
        const remoteConfigs: Record<string, TemplateConfig> = {};
        for (const item of data.projects) {
          remoteProjects[item.slug] = { name: item.name, repo: item.repository, version: "待发布", tag: "-", channel: "GitHub Workflow", release: `https://github.com/${item.repository}/releases`, workflow: `https://github.com/${item.repository}/actions` };
          remoteConfigs[item.slug] = item.template_config;
        }
        setProjectCatalog((current) => ({ ...current, ...remoteProjects }));
        setConfigs((current) => ({ ...current, ...remoteConfigs }));
      })
      .catch(() => { /* Supabase remains optional for local visual development. */ });
  }, []);

  useEffect(() => {
    const requested = searchParams.get("project");
    if (requested) setProject(requested);
  }, [searchParams]);

  const update = (patch: Partial<TemplateConfig>) => {
    setConfigs((current) => ({ ...current, [project]: { ...current[project], ...patch } }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/templates", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: projectData.name, repository: projectData.repo, slug: project, config, rotateToken: false }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "保存失败");
      setTokenLast4(data.project?.notify_token_last4 ?? null);
      setSaved(true);
    } catch {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
      setSaved(true);
    } finally {
      setSaving(false);
      window.setTimeout(() => setSaved(false), 2200);
    }
  };

  const connectGithub = async () => {
    setConnecting(true);
    setConnectionMessage(null);
    try {
      await save();
      const response = await fetch("/api/templates/connect", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug: project, channel: projectData.channel }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "GitHub 连接失败");
      setTokenLast4(data.tokenLast4);
      setConnectionMessage(`已写入 ${data.secretName} 和 ${data.workflowPath}`);
    } catch (error) {
      setConnectionMessage(error instanceof Error ? error.message : "GitHub 连接失败");
    } finally {
      setConnecting(false);
    }
  };

  const projectKeys = useMemo(() => Object.keys(projectCatalog), [projectCatalog]);

  const linkLabel = useMemo(() => project === "mini-auth" ? "打开服务" : "查看 Release", [project]);

  return (
    <main className="adminPage templatesPage">
      <section className="adminHeroCard templatesHero">
        <div className="adminHeroCopy">
          <div className="adminSectionKicker">消息模板 / 项目主题</div>
          <h1>让每个项目有自己的发布风格</h1>
          <p>为不同仓库配置独立的消息主题和内容字段，保存后即可用于后续自动通知。</p>
        </div>
        <div className="templateHeroActions"><div className="templateHeroMark"><Palette size={22} aria-hidden="true" /><span>{projectKeys.length} 个项目</span></div><Link className="templateAddButton" href="/dashboard/templates/new"><Plus size={16} aria-hidden="true" />新增应用</Link></div>
      </section>

      <div className="templatesWorkspace">
        <section className="adminPanel templateSettings">
          <div className="adminPanelHeader"><div><div className="adminSectionKicker">配置</div><h2>选择项目</h2></div><SlidersHorizontal size={18} className="templateHeaderIcon" aria-hidden="true" /></div>
          <div className="templateProjectList">
            {projectKeys.map((key) => (
              <button key={key} type="button" className={`templateProject ${project === key ? "active" : ""}`} onClick={() => setProject(key)}>
                <span className="templateProjectDot" style={{ background: presets[configs[key]?.preset ?? "mono"].accent }} />
                <span><strong>{projectCatalog[key].name}</strong><small>{projectCatalog[key].repo}</small></span>
                {project === key ? <Check size={16} aria-hidden="true" /> : null}
              </button>
            ))}
          </div>

          <div className="templateSection">
            <div className="templateLabel">主题预设</div>
            <div className="templatePresetGrid">
              {(Object.keys(presets) as Preset[]).map((key) => (
                <button key={key} type="button" className={`templatePreset ${config.preset === key ? "active" : ""}`} onClick={() => update({ preset: key })}>
                  <span className="templatePresetSwatch" style={{ background: presets[key].accent }} />
                  <span><strong>{presets[key].name}</strong><small>{presets[key].hint}</small></span>
                  {config.preset === key ? <Check size={14} aria-hidden="true" /> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="templateSection templateForm">
            <label><span>消息标题</span><input value={config.title} onChange={(event) => update({ title: event.target.value })} /></label>
            <label><span>底部签名</span><input value={config.signature} onChange={(event) => update({ signature: event.target.value })} /></label>
          </div>

          <div className="templateSection templateToggles">
            <div className="templateLabel">消息内容</div>
            <Toggle label="显示版本与 Tag" checked={config.showVersion} onChange={(showVersion) => update({ showVersion })} />
            <Toggle label="显示发布通道" checked={config.showChannel} onChange={(showChannel) => update({ showChannel })} />
            <Toggle label="显示 Release 与 Workflow 链接" checked={config.showLinks} onChange={(showLinks) => update({ showLinks })} />
          </div>

          {tokenLast4 ? <div className="templateTokenHint">已连接项目密钥 ····{tokenLast4}</div> : null}
          {connectionMessage ? <div className="templateConnectionNote">{connectionMessage}</div> : null}
          <button type="button" className="templateConnectButton" onClick={connectGithub} disabled={connecting}><GitBranch size={16} aria-hidden="true" />{connecting ? "正在连接 GitHub…" : "连接 GitHub"}</button>
          <button type="button" className="templateSaveButton" onClick={save} disabled={saving}><Save size={16} aria-hidden="true" />{saving ? "保存中…" : saved ? "已保存" : "保存此项目模板"}</button>
        </section>

        <section className="adminPanel templatePreviewPanel">
          <div className="adminPanelHeader"><div><div className="adminSectionKicker">实时预览</div><h2>消息卡片</h2></div><span className="templatePreviewBadge"><Eye size={14} aria-hidden="true" />预览</span></div>
          <div className="templatePreviewStage" style={{ background: `linear-gradient(145deg, ${preset.background}, #ffffff)`, "--template-accent": preset.accent, "--template-ink": preset.ink } as React.CSSProperties}>
            <article className="releaseMessageCard">
              <div className="releaseMessageTop"><span className="releaseMessageStatus"><span />成功</span><span className="releaseMessageProject">{projectData.repo}</span></div>
              <h3>{config.title || `${projectData.name} 发布完成`}</h3>
              <div className="releaseMessageRule" />
              {config.showVersion ? <div className="releaseMessageRow"><span>版本</span><strong>{projectData.version}</strong></div> : null}
              {config.showVersion ? <div className="releaseMessageRow releaseMessageTag"><span>Tag</span><code>{projectData.tag}</code></div> : null}
              {config.showChannel ? <div className="releaseMessageRow"><span>通道</span><strong>{projectData.channel}</strong></div> : null}
              {config.showLinks ? <div className="releaseMessageLinks"><a href={projectData.release} target="_blank" rel="noreferrer"><Link2 size={14} aria-hidden="true" />Release</a><a href={projectData.workflow} target="_blank" rel="noreferrer"><ExternalLink size={14} aria-hidden="true" />Workflow</a></div> : null}
              <div className="releaseMessageFooter">{config.signature || "ServerlessShip"}<span>{new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" }).format(new Date())}</span></div>
            </article>
          </div>
          <div className="templatePreviewNote">发送到飞书后，项目成员将看到这张卡片。</div>
        </section>
      </div>
    </main>
  );
}
