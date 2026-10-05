import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import { SiteHeader } from "@/components/site-header";

import "@fontsource-variable/space-grotesk";
import "@fontsource/kalam/400.css";
import "@fontsource/kalam/700.css";
import "./globals.css";

const siteUrl = "https://pixeldosa.akshayjayan.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "PixelDosa UI — Thoughtful interactive components and blocks",
    template: "%s — PixelDosa UI",
  },

  description:
    "A growing library of interactive React components and ready-to-use blocks for thoughtful product experiences, including human-centered AI.",

  applicationName: "PixelDosa UI",

  keywords: [
    "interactive UI",
    "React UI blocks",
    "React component library",
    "product interfaces",
    "UI patterns",
    "AI interfaces",
    "AI agent UI",
    "AI UX",
    "agent interfaces",
    "shadcn",
    "design systems",
  ],

  authors: [
    {
      name: "Akshay Jayan",
      url: "https://akshayjayan.com",
    },
  ],

  creator: "Akshay Jayan",

  alternates: {
    canonical: siteUrl,
  },

  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "PixelDosa UI",
    title: "PixelDosa UI — Thoughtful interactive components and blocks",
    description:
      "A growing library of interactive React components and ready-to-use blocks for thoughtful product experiences, including human-centered AI.",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PixelDosa UI — Thoughtful interactive components and blocks",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "PixelDosa UI — Thoughtful interactive components and blocks",
    description:
      "A growing library of interactive React components and ready-to-use blocks for thoughtful product experiences, including human-centered AI.",
    creator: "@akshayjayan",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

/**
 * Applied before first paint so the correct theme is already on <html>.
 * Dark is the default identity. An explicit stored light preference
 * overrides it.
 */
const themeScript = `
try {
  var stored = localStorage.getItem('pd-theme');
  var dark = stored !== 'light';
  document.documentElement.classList.toggle('dark', dark);
} catch (e) {}
`;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  name: "PixelDosa UI",
  description:
    "Interactive React components and ready-to-use blocks for thoughtful product experiences, including human-centered AI.",
  url: siteUrl,
  programmingLanguage: "TypeScript",
  author: {
    "@type": "Person",
    name: "Akshay Jayan",
    url: "https://akshayjayan.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="custom-scrollbar">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeScript,
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>

      <body className="min-h-svh font-sans antialiased">
        <SiteHeader />
        {children}
        <Analytics />
      </body>
    </html>
  );
}