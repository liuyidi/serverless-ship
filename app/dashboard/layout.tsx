import type { Metadata } from "next";
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
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
