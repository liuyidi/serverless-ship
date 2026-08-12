import type { Metadata } from "next";
import "./globals.css";
import { DEFAULT_THEME, getThemeInitScript } from "@/lib/theme";

export const metadata: Metadata = {
  title: "ServerlessShip",
  description: "Serverless Feishu deploy notifier for minibot with a bilingual architecture-first homepage.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme={DEFAULT_THEME} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
        {children}
      </body>
    </html>
  );
}
