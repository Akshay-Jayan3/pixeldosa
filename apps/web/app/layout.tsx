import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PixelDosa — the trust layer for AI products",
    template: "%s — PixelDosa",
  },
  description:
    "React components for the moments people decide whether to trust an agent: before it runs, while it works, and when they review what it did. No SDK lock-in, installable by you or your coding agent.",
};

/**
 * Applied before first paint so the correct theme is already on <html> when the
 * document renders. Doing this in an effect instead produces a light-mode flash
 * on every dark-mode load. Dark is the default identity — an explicit stored
 * preference is the only thing that overrides it, system preference is not
 * consulted.
 */
const themeScript = `
try {
  var stored = localStorage.getItem('pd-theme');
  var dark = stored ? stored === 'dark' : true;
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
            PixelDosa (beta). The trust layer for AI products, crafted by a design engineer.
          </div>
        </footer>
      </body>
    </html>
  );
}
