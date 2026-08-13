import type { Metadata } from "next";
import { Suspense } from "react";
import "../base.css";
import "./globals.css";
import { AdminShell } from "@/app/dashboard/admin-shell";

export const metadata: Metadata = {
  title: "Dashboard Console | ServerlessShip",
  description: "ServerlessShip dashboard console for deployments and operational status.",
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div className="adminShell" />}>
          <AdminShell>{children}</AdminShell>
        </Suspense>
      </body>
    </html>
  );
}
