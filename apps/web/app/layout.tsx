import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PixelDosa — components for design engineers",
    template: "%s — PixelDosa",
  },
  description:
    "Production-ready components, crafted by a Design Engineer — for developers who want beautiful, accessible interfaces, and for AI agents that need to build them correctly.",
};

/**
 * Applied before first paint so the correct theme is already on <html> when the
 * document renders. Doing this in an effect instead produces a light-mode flash
 * on every dark-mode load.
 */
const themeScript = `
try {
  var stored = localStorage.getItem('pd-theme');
  var dark = stored ? stored === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', dark);
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-svh font-sans antialiased">
        <SiteHeader />
        {children}
        <footer className="border-t py-8">
          <div className="mx-auto max-w-6xl px-4 text-sm text-muted-foreground sm:px-6">
            PixelDosa — a design engineering system. Core, AI and Motion under one roof.
          </div>
        </footer>
      </body>
    </html>
  );
}
