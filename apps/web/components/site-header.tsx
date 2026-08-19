import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="flex h-14 items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden="true"
            className="inline-block size-4 rounded-full bg-primary shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
          />
          PixelDosa
        </Link>

        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/docs" className="hover:text-foreground">
            Docs
          </Link>
          <Link href="/docs/components" className="hover:text-foreground">
            Components
          </Link>
        </nav>

        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
