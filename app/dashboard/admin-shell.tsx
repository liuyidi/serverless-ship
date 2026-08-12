"use client";

import { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/app/dashboard/_components/admin-sidebar";

const COLLAPSED_STORAGE_KEY = "serverlessship.admin.sidebar.collapsed";

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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

  const topbarTitle =
    pathname === "/dashboard/supabase"
      ? "Supabase"
      : pathname.startsWith("/dashboard/deployments/")
        ? "Deployment detail"
        : pathname.startsWith("/dashboard/deployments")
          ? "Deployments"
          : "Overview";

  const toggleSidebar = () => {
    setCollapsed((current) => !current);
  };

  return (
    <div className="adminShell">
      <AdminSidebar collapsed={collapsed} />
      <div className="adminMain">
        <header className="adminTopbar">
          <div className="adminTopbarLead">
            <button
              type="button"
              className="adminTopbarSidebarToggle"
              onClick={toggleSidebar}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen size={16} aria-hidden="true" /> : <PanelLeftClose size={16} aria-hidden="true" />}
            </button>
            <div className="adminTopbarTrail">
              <span className="adminTopbarEyebrow">Dashboard</span>
              <span className="adminTopbarSeparator">/</span>
              <span className="adminTopbarTitle">{topbarTitle}</span>
            </div>
          </div>
          <div className="adminTopbarActions">
            <span className="adminTopbarPill subtle">Read only</span>
          </div>
        </header>
        <div className="adminContent">{children}</div>
      </div>
    </div>
  );
}
