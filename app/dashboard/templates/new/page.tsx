"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Rocket } from "lucide-react";

type Preset = "ember" | "ocean" | "mono";
const presets: Record<Preset, { name: string; hint: string; accent: string }> = {
  ember: { name: "Ember", hint: "暖橙 · 产品发布", accent: "#c2410c" },
  ocean: { name: "Ocean", hint: "蓝青 · 基础设施", accent: "#0f766e" },
  mono: { name: "Mono", hint: "黑白 · 工具链", accent: "#18181b" },
};
const STORAGE_KEY = "serverless-ship-template-configs";
const PROJECTS_KEY = "serverless-ship-template-projects";
function keyFrom(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"); }

export default function NewTemplatePage() {
  const [name, setName] = useState("");
  const [repo, setRepo] = useState("");
  const [channel, setChannel] = useState("GitHub Release");
  const [preset, setPreset] = useState<Preset>("ember");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);

  const next = () => {
    if (!name.trim() || !repo.trim()) { setError("请填写应用名称和 GitHub 仓库。"); return; }
    setError(""); setStep(2);
  };

  const finish = async () => {
    const key = keyFrom(name);
    const config = { preset, title: `${name.trim()} 发布完成`, signature: "ServerlessShip", showVersion: true, showChannel: true, showLinks: true };
    try {
      const response = await fetch("/api/templates", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: name.trim(), repository: repo.trim(), slug: key, config, rotateToken: true }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "保存失败");
      setToken(data.token);
    } catch {
      const project = { name: name.trim(), repo: repo.trim(), version: "待发布", tag: "-", channel, release: `https://github.com/${repo.trim()}/releases`, workflow: `https://github.com/${repo.trim()}/actions` };
      const previousProjects = JSON.parse(window.localStorage.getItem(PROJECTS_KEY) ?? "{}");
      const previousConfigs = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
      window.localStorage.setItem(PROJECTS_KEY, JSON.stringify({ ...previousProjects, [key]: project }));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...previousConfigs, [key]: config }));
      setToken("local-preview-token");
    }
    setStep(3);
  };

  const workflowSnippet = useMemo(() => `- name: Notify ServerlessShip
  if: success()
  env:
    SERVERLESSSHIP_URL: https://serverless-ship.liuyidi.me
    SERVERLESSSHIP_TOKEN: \${{ secrets.SERVERLESSSHIP_TOKEN }}
  run: |
    curl --fail-with-body -X POST "$SERVERLESSSHIP_URL/api/releases" \\
      -H "Authorization: Bearer $SERVERLESSSHIP_TOKEN" \\
      -H "Content-Type: application/json" \\
      -d '{"project":"${name || "my-app"}","version":"\${{ github.ref_name }}","repository":"\${{ github.repository }}","channel":"${channel}"}'`, [channel, name]);

  return (
    <main className="adminPage templateNewPage">
      <div className="templateNewBack"><Link href="/dashboard/templates"><ArrowLeft size={16} aria-hidden="true" />返回消息模板</Link></div>
      <section className="adminHeroCard templatesHero"><div className="adminHeroCopy"><div className="adminSectionKicker">消息模板 / 新增应用</div><h1>配置一个新的发布应用</h1><p>完成两步设置，之后每次发布都能自动套用这套主题。</p></div><div className="templateHeroMark"><Rocket size={20} aria-hidden="true" /><span>配置引导</span></div></section>
      <section className="adminPanel templateWizard">
        <div className="templateWizardSteps"><span className={step === 1 ? "active" : "done"}>1 <b>应用信息</b></span><i /><span className={step === 2 ? "active" : step === 3 ? "done" : ""}>2 <b>选择主题</b></span><i /><span className={step === 3 ? "active" : ""}>3 <b>接入 Workflow</b></span></div>
        {step === 1 ? <div className="templateWizardBody"><div className="templateWizardIntro"><h2>先告诉我们应用在哪里</h2><p>这些信息用于生成 Release 和 Workflow 链接，后续仍可修改。</p></div><div className="templateForm templateWizardForm"><label><span>应用名称</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：minikb" /></label><label><span>GitHub 仓库</span><input value={repo} onChange={(event) => setRepo(event.target.value)} placeholder="liuyidi/minikb" /></label><label><span>发布通道</span><select value={channel} onChange={(event) => setChannel(event.target.value)}><option>GitHub Release</option><option>GitHub Workflow</option><option>Tencent CVM</option><option>Vercel</option></select></label></div>{error ? <p className="templateWizardError">{error}</p> : null}<div className="templateWizardActions"><button type="button" className="templateSaveButton" onClick={next}>下一步 <ArrowRight size={16} aria-hidden="true" /></button></div></div> : step === 2 ? <div className="templateWizardBody"><div className="templateWizardIntro"><h2>选择这个应用的主题</h2><p>主题会应用到飞书发布消息的颜色、标题和信息层级。</p></div><div className="newPresetGrid">{(Object.keys(presets) as Preset[]).map((key) => <button type="button" key={key} className={`templatePreset ${preset === key ? "active" : ""}`} onClick={() => setPreset(key)}><span className="templatePresetSwatch" style={{ background: presets[key].accent }} /><span><strong>{presets[key].name}</strong><small>{presets[key].hint}</small></span>{preset === key ? <Check size={14} aria-hidden="true" /> : null}</button>)}</div><div className="newTemplatePreview"><span style={{ background: presets[preset].accent }} /><div><strong>{name || "你的应用"} 发布完成</strong><small>{repo || "liuyidi/repository"} · {channel}</small></div></div><div className="templateWizardActions"><button type="button" className="adminSecondaryButton" onClick={() => setStep(1)}><ArrowLeft size={16} aria-hidden="true" />上一步</button><button type="button" className="templateSaveButton" onClick={finish}>完成并保存 <Check size={16} aria-hidden="true" /></button></div></div> : <div className="templateWizardBody"><div className="templateWizardIntro"><h2>应用已创建，接入 GitHub Workflow</h2><p>将下面的密钥保存为仓库 Secret：<code>SERVERLESSSHIP_TOKEN</code>。密钥只显示这一次。</p></div><div className="templateTokenBox"><code>{token}</code></div><pre className="templateWorkflowSnippet">{workflowSnippet}</pre><div className="templateWizardActions"><Link className="adminSecondaryButton" href={`/dashboard/templates?project=${encodeURIComponent(keyFrom(name))}`}>返回模板列表</Link></div></div>}
      </section>
    </main>
  );
}
