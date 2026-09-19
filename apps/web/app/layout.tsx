import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import { SiteHeader } from "@/components/site-header";

import "@fontsource/kalam/400.css";
import "@fontsource/kalam/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PixelDosa — agent interfaces people can trust",
    template: "%s — PixelDosa",
  },
  description:
    "Components, blocks and agent skills for AI products that do real work: editable plans, steerable runs, approvals that state consequences, and an agent people can read. Pure React, no SDK lock-in.",
};

/**
 * Applied before first paint so the correct theme is already on <html> when the
 * document renders. Doing this in an effect instead produces a light-mode flash
 * on every dark-mode load. Dark (near-black ground, near-white ink) is the default
 * identity — an explicit stored light preference is the only thing that overrides it;
 * system preference is not consulted.
 */
const themeScript = `
try {
  var stored = localStorage.getItem('pd-theme');
  var dark = stored !== 'light';
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
        <Analytics />
      </body>
    </html>
  );
}
