import type { Metadata } from "next";
import { DEFAULT_THEME, getThemeInitScript } from "@/lib/theme";
import "../base.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "ServerlessShip",
  description: "Serverless Feishu deploy notifier for minibot with a bilingual architecture-first homepage.",
};

export default function LandingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme={DEFAULT_THEME} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
        {children}
      </body>
    </html>
  );
}
