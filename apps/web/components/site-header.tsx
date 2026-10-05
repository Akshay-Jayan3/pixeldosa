import Link from "next/link";

import { AgentFigure, Button } from "@pixeldosa/ui";

import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      {/* Three columns so the nav sits in the true centre, whatever the widths of the logo and
          the right-hand controls. */}
      <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 justify-self-start font-semibold tracking-tight">
          <AgentFigure variant="mark" size="md" pose="idle" hideLabel aria-hidden="true" />
          PixelDosa UI
          <span className="hidden rounded-full border px-1.5 py-px sm:inline text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">
            Beta
          </span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/docs" className="transition-colors hover:text-foreground">
            Docs
          </Link>
          <Link href="/docs/components" className="transition-colors hover:text-foreground">
            Components
          </Link>
          <Link href="/docs/components#group-blocks" className="hidden transition-colors hover:text-foreground sm:inline">
            Blocks
          </Link>
          <Link href="/docs/ai" className="hidden transition-colors hover:text-foreground lg:inline">
            AI patterns
          </Link>
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link href="/work-with-me">Work with me</Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
