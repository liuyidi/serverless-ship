"use client";

import Link from "next/link";
import {
  BarChart3,
  Database,
  ExternalLink,
  LayoutDashboard,
} from "lucide-react";
import { dashboardCopy, type DashboardLocale, buildDashboardHref } from "@/lib/dashboard-copy";

type AdminNavItem = {
  group: string;
  href: string;
  label: string;
  icon: typeof BarChart3;
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({
  collapsed,
  locale,
  pathname,
}: {
  collapsed: boolean;
  locale: DashboardLocale;
  pathname: string;
}) {
  const copy = dashboardCopy[locale];
  const localeSearch = new URLSearchParams({ lang: locale }).toString();
  const navItems: AdminNavItem[] = [
    {
      group: copy.shell.sidebar.groups.core,
      href: "/dashboard/deployments",
      label: copy.shell.sidebar.nav.deployments,
      icon: BarChart3,
    },
    {
      group: copy.shell.sidebar.groups.core,
      href: "/dashboard/supabase",
      label: copy.shell.sidebar.nav.supabase,
      icon: Database,
    },
    {
      group: copy.shell.sidebar.groups.public,
      href: "/",
      label: copy.shell.sidebar.nav.publicSite,
      icon: ExternalLink,
    },
  ];

  return (
    <aside className={`adminSidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="adminBrand">
        <div className="adminBrandIdentity">
          <div className="adminBrandMark">
            <LayoutDashboard size={16} aria-hidden="true" />
          </div>
          <div className="adminBrandText">
            <div className="adminBrandName">ServerlessShip</div>
            <div className="adminBrandMeta">
              <span className="adminBrandPill">{copy.shell.sidebar.brandMeta}</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="adminNav" aria-label="Admin navigation">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          const previousGroup = navItems[index - 1]?.group;
          const showGroup = previousGroup !== item.group;
          const href = item.href === "/" ? "/" : buildDashboardHref(item.href, localeSearch, locale);

          return (
            <div key={item.href} className="adminNavGroup">
              {showGroup ? <div className="adminNavSection">{item.group}</div> : null}
              <Link
                href={href}
                className={`adminNavLink ${active ? "active" : ""} ${collapsed ? "collapsed" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <span className="adminNavIcon">
                  <Icon size={16} aria-hidden="true" />
                </span>
                <span className="adminNavCopy">
                  <span className="adminNavLabel">{item.label}</span>
                </span>
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="adminSidebarFooter">
        <div className="adminLocaleLabel">{copy.shell.sidebar.languageLabel}</div>
        <div className="adminLocaleSwitch" role="group" aria-label={copy.shell.sidebar.languageLabel}>
          <Link
            href={buildDashboardHref(pathname, localeSearch, "zh")}
            className={`adminLocaleButton ${locale === "zh" ? "active" : ""}`}
            aria-current={locale === "zh" ? "page" : undefined}
          >
            {copy.shell.sidebar.languageOptions.zh}
          </Link>
          <Link
            href={buildDashboardHref(pathname, localeSearch, "en")}
            className={`adminLocaleButton ${locale === "en" ? "active" : ""}`}
            aria-current={locale === "en" ? "page" : undefined}
          >
            {copy.shell.sidebar.languageOptions.en}
          </Link>
        </div>
      </div>

    </aside>
  );
}
