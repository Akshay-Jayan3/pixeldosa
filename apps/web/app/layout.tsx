import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import { SiteHeader } from "@/components/site-header";
import { PORTFOLIO_URL } from "@/lib/links";

import "@fontsource/kalam/400.css";
import "@fontsource/kalam/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Pixel Dosa — give your agents life",
    template: "%s — Pixel Dosa",
  },
  description:
    "Components, blocks and agent skills for AI products that do real work: editable plans, steerable runs, approvals that state consequences, and an agent people can read. Pure React, no SDK lock-in.",
};

/**
 * Applied before first paint so the correct theme is already on <html> when the
 * document renders. Doing this in an effect instead produces a light-mode flash
 * on every dark-mode load. Light (ink on paper) is the default identity — an
 * explicit stored preference is the only thing that overrides it, system preference
 * is not consulted.
 */
const themeScript = `
try {
  var stored = localStorage.getItem('pd-theme');
  var dark = stored === 'dark';
  document.documentElement.classList.toggle('dark', dark);
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="custom-scrollbar">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-svh font-sans antialiased ">
        <SiteHeader />
        {children}
        <footer className="border-t py-8">
          <div className="mx-auto max-w-6xl px-4 text-sm text-muted-foreground sm:px-6">
            Pixel Dosa (beta). Designed and built by{" "}
            <a href={PORTFOLIO_URL} className="text-foreground underline underline-offset-4 hover:no-underline">
              Akshay Jayan
            </a>
            , design engineer.
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
