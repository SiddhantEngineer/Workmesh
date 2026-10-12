import type { Metadata } from "next";
import { Providers } from "./providers";
import { AppShell } from "../components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workmesh - Agent-First Ticket Management",
  description: "Collaborative ticket management connecting AI agents via MCP with human developers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('workmesh-theme');
                if (saved === 'dark' || saved === 'light') {
                  document.documentElement.setAttribute('data-theme', saved);
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
