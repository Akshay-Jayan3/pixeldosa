import Link from "next/link";

import { AgentFigure } from "@pixeldosa/ui";

import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="flex h-14 items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <AgentFigure variant="mark" size="md" pose="idle" hideLabel aria-hidden="true" />
          PixelDosa
          <span className="rounded-full border px-1.5 py-px text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">
            Beta
          </span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/docs" className="hover:text-foreground">
            Docs
          </Link>
          <Link href="/docs/components" className="hover:text-foreground">
            Components
          </Link>
          <Link href="/docs/ai" className="hidden hover:text-foreground sm:inline">
            Build with AI
          </Link>
          <Link href="/changelog" className="hidden hover:text-foreground sm:inline">
            Changelog
          </Link>
          <Link href="/sprint" className="hidden hover:text-foreground md:inline">
            Work with me
          </Link>
        </nav>

        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
