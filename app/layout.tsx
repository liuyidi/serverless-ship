import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ServerlessShip",
  description: "Serverless Feishu deploy notifier for minibot.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
