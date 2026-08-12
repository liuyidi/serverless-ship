"use client";

import Link from "next/link";
import {
  BarChart3,
  Database,
  ExternalLink,
  LayoutDashboard,
} from "lucide-react";
import { usePathname } from "next/navigation";

type AdminNavItem = {
  group: string;
  href: string;
  label: string;
  icon: typeof BarChart3;
};

const navItems: AdminNavItem[] = [
  {
    group: "Core",
    href: "/dashboard/deployments",
    label: "Deployments",
    icon: BarChart3,
  },
  {
    group: "Core",
    href: "/dashboard/supabase",
    label: "Supabase",
    icon: Database,
  },
  {
    group: "Public",
    href: "/",
    label: "Public site",
    icon: ExternalLink,
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

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
              <span className="adminBrandPill">Console</span>
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

          return (
            <div key={item.href} className="adminNavGroup">
              {showGroup ? <div className="adminNavSection">{item.group}</div> : null}
              <Link
                href={item.href}
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

    </aside>
  );
}
