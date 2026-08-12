"use client";

import {
  Braces,
  Database,
  GitBranch,
  LayoutGrid,
  Ship,
  Sparkles,
  UserRound,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import { apiCards, copy, moduleCards, type Locale } from "@/lib/i18n";
import { DEFAULT_THEME, isThemeMode, THEME_STORAGE_KEY, themeOptions, type ThemeMode } from "@/lib/theme";

function ThemeIcon({ mode, className }: { mode: ThemeMode; className?: string }) {
  if (mode === "shadcn") {
    return <LayoutGrid className={className} aria-hidden="true" />;
  }

  return <Sparkles className={className} aria-hidden="true" />;
}

type FlowIcon = LucideIcon | ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;

function FeishuAppMark({ className, size = 28, strokeWidth = 1.9 }: { className?: string; size?: number; strokeWidth?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5.5 6.5h13a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H11.2L8 18.6V15.5H5.5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8.3 10h7.4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M8.3 12.8h5.4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M8.3 15.6h3.4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

function FlowBoard({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <div className="flowPanel flowColumnsFour">
      <div className="flowColumn flowColumnCenter">
        <StageCard accent="dark" icon={UserRound} title={t.flowLabels.user} subtitle="push code" />
      </div>

      <FlowConnector />

      <div className="flowColumn flowColumnStack">
        <StageCard accent="dark" icon={GitBranch} title={t.flowLabels.github} subtitle="repo / release / webhook" />
        <StageCard accent="teal" icon={Workflow} title={t.flowLabels.actions} subtitle="build + deploy + notify" />
      </div>

      <FlowConnector />

      <div className="flowColumn flowColumnStack">
        <StageCard accent="ink" icon={Ship} title={t.flowLabels.ship} subtitle="route + format + log" />
        <StageCard accent="green" icon={Database} title={t.flowLabels.supabase} subtitle="serverless storage" />
      </div>

      <FlowConnector />

      <div className="flowColumn flowColumnCenter">
        <StageCard accent="orange" icon={FeishuAppMark} title={t.flowLabels.feishu} subtitle="message card" />
      </div>
    </div>
  );
}

function FlowConnector() {
  return (
    <div className="flowConnector" aria-hidden="true">
      <span>&gt;</span>
    </div>
  );
}

function StageCard({
  accent,
  icon,
  title,
  subtitle,
}: {
  accent: "dark" | "teal" | "ink" | "orange" | "green";
  icon: FlowIcon;
  title: string;
  subtitle: string;
}) {
  const Icon = icon;

  return (
    <div className="stageCard">
      <div className={`stageIcon ${accent}`}>
        <Icon className="stageIconGlyph" size={28} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <div className="stageTitle">{title}</div>
      <div className="stageSubtitle">{subtitle}</div>
    </div>
  );
}

export default function HomePage() {
  const [locale, setLocale] = useState<Locale>("zh");
  const [theme, setTheme] = useState<ThemeMode>(DEFAULT_THEME);
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (isThemeMode(stored)) {
        setTheme(stored);
      }
    } catch {
      // Ignore storage access failures and fall back to the default theme.
    }

    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) {
      return;
    }

    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = "light";

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage access failures and keep the in-memory theme active.
    }
  }, [theme, themeReady]);

  const t = copy[locale];
  const api = apiCards[locale];
  const modules = moduleCards[locale];

  return (
    <main className="homePage">
      <section className="hero">
        <div className="heroTopRow">
          <div className="eyebrow">{t.badge}</div>
          <div className="heroControls">
            <div className="themeSwitch" aria-label="Theme switch">
              {(["shadcn", "claude"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={theme === mode ? "active" : ""}
                  onClick={() => setTheme(mode)}
                  aria-pressed={theme === mode}
                  title={themeOptions[mode].description}
                >
                  <ThemeIcon mode={mode} className="themeSwitchIcon" />
                </button>
              ))}
            </div>
            <div className="langSwitch" aria-label="Language switch">
              <button type="button" className={locale === "zh" ? "active" : ""} onClick={() => setLocale("zh")} aria-pressed={locale === "zh"}>
                中
              </button>
              <button type="button" className={locale === "en" ? "active" : ""} onClick={() => setLocale("en")} aria-pressed={locale === "en"}>
                EN
              </button>
            </div>
          </div>
        </div>

        <div className="heroContent">
          <div>
            <h1>{t.title}</h1>
            <p className="heroLead">{t.subtitle}</p>
            <p className="heroBody">{t.description}</p>

            <div className="ctaRow">
              <a className="button primary" href="#api">
                {t.primaryCta}
              </a>
              <a className="button secondary" href="https://github.com/liuyidi/serverless-ship" target="_blank" rel="noreferrer">
                {t.secondaryCta}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="sectionCard">
        <div className="sectionLabel">
          <div className="sectionKicker">{t.flowTitle}</div>
        </div>

        <div className="flowScroll">
          <FlowBoard locale={locale} />
        </div>
      </section>

      <section className="twoUp">
        <article className="sectionCard" id="api">
          <div className="sectionHead compact">
            <div className="sectionKicker">{t.apiTitle}</div>
            <p>{t.apiDescription}</p>
          </div>

          <div className="apiGrid">
            {api.map((item) => (
              <div className="apiCard" key={item.path}>
                <div className="apiPath">
                  <Braces size={20} strokeWidth={1.8} aria-hidden="true" />
                  <span>{item.path}</span>
                </div>
                <div className="apiName">{item.title}</div>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="sectionCard">
          <div className="sectionHead compact">
            <div className="sectionKicker">{t.moduleTitle}</div>
            <p>{t.moduleDescription}</p>
          </div>

          <div className="moduleGrid">
            {modules.map((item) => (
              <div className="moduleCard" key={item.name}>
                <div className="moduleName">{item.name}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="stackBanner">
        <div>
          <div className="sectionKicker">{t.stackTitle}</div>
          <h2>{locale === "zh" ? "专门给部署消息做的轻量服务" : "A lightweight service built specifically for deployment notifications"}</h2>
        </div>
        <div className="stackRow">
          {t.stackItems.map((item) => (
            <span className="tag strong" key={item}>
              {item}
            </span>
          ))}
        </div>
      </section>

      <p className="foot">{locale === "zh" ? "ServerlessShip 目前用于 minibot 的发布通知链路。" : "ServerlessShip currently powers the minibot release notification path."}</p>
    </main>
  );
}
