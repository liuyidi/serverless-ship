"use client";

import { useEffect, useMemo, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { AdminSidebar } from "@/app/dashboard/_components/admin-sidebar";
import { dashboardCopy, resolveDashboardLocale } from "@/lib/dashboard-copy";

const COLLAPSED_STORAGE_KEY = "serverlessship.admin.sidebar.collapsed";

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const locale = resolveDashboardLocale(searchParams.get("lang"));
  const copy = dashboardCopy[locale];

  const topbarTitle = useMemo(() => {
    if (pathname === "/dashboard/supabase") {
      return copy.shell.topbarTitles.supabase;
    }

    if (pathname.startsWith("/dashboard/deployments/")) {
      return copy.shell.topbarTitles.deploymentDetail;
    }

    if (pathname.startsWith("/dashboard/deployments")) {
      return copy.shell.topbarTitles.deployments;
    }

    if (pathname.startsWith("/dashboard/templates")) {
      return copy.shell.topbarTitles.templates;
    }

    return copy.shell.topbarTitles.overview;
  }, [copy.shell.topbarTitles, pathname]);

  useEffect(() => {
    const saved = window.localStorage.getItem(COLLAPSED_STORAGE_KEY);
    const nextCollapsed = saved === "true";
    setCollapsed(nextCollapsed);
    document.documentElement.dataset.adminSidebarCollapsed = String(nextCollapsed);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.adminSidebarCollapsed = String(collapsed);
    window.localStorage.setItem(COLLAPSED_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const toggleSidebar = () => {
    setCollapsed((current) => !current);
  };

  return (
    <div className="adminShell">
      <AdminSidebar collapsed={collapsed} locale={locale} pathname={pathname} />
      <div className="adminMain">
        <header className="adminTopbar">
          <div className="adminTopbarLead">
            <button
              type="button"
              className="adminTopbarSidebarToggle"
              onClick={toggleSidebar}
              aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
              title={collapsed ? "展开侧边栏" : "收起侧边栏"}
            >
              {collapsed ? <PanelLeftOpen size={16} aria-hidden="true" /> : <PanelLeftClose size={16} aria-hidden="true" />}
            </button>
            <div className="adminTopbarTrail">
              <span className="adminTopbarEyebrow">{copy.shell.eyebrow}</span>
              <span className="adminTopbarSeparator">/</span>
              <span className="adminTopbarTitle">{topbarTitle}</span>
            </div>
          </div>
          <div className="adminTopbarActions">
            <span className="adminTopbarPill subtle">{copy.shell.readOnly}</span>
          </div>
        </header>
        <div className="adminContent">{children}</div>
      </div>
    </div>
  );
}
