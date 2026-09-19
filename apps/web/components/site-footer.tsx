import Link from "next/link";

import { AgentFigure } from "@pixeldosa/ui";

import { CodeBlock } from "@/components/code-block";
import { CHANGELOG } from "@/lib/changelog";
import { PORTFOLIO_URL, WORK_EMAIL_URL } from "@/lib/links";
import { installCommand } from "@/lib/registry";

const REPO_URL = "https://github.com/Akshay-Jayan3/pixeldosa";

/** "18 September 2026" — the changelog's own newest date, so it can't drift. */
function formatUpdated(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</h2>
      <ul className="flex flex-col gap-2 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("/r/");
  const className =
    "rounded-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40";

  return (
    <li>
      {external ? (
        <a href={href} className={className}>
          {children}
        </a>
      ) : (
        <Link href={href} className={className}>
          {children}
        </Link>
      )}
    </li>
  );
}

/**
 * The end of the page, treated as the last useful moment rather than a sitemap.
 *
 * Three decisions separate this from the standard four-column link footer:
 *
 * - **It leads with the next action.** Someone who has just read a component page wants
 *   the install line, not sixteen links. So the install command is the first thing here,
 *   copyable, and the links come after it.
 * - **The counts are read from the registry and the changelog**, not typed in. A footer
 *   that claims "50+ components" is a maintenance promise nobody keeps; this one cannot
 *   say a number the build doesn't agree with.
 * - **Only real links.** No Pricing, no Careers, no social account that doesn't exist.
 *   Three honest columns read as a project with nothing to hide; four padded ones read as
 *   a template.
 *
 * The agent signs off at rest: the page has ended, so by the system's own grammar —
 * motion means the machine is busy, stillness means it's your turn — the figure holds
 * still.
 */
export function SiteFooter() {
  const latest = CHANGELOG[0];

  return (
    <footer className="mt-16 border-t">

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
          {/* min-w-0: a grid item will not shrink below its content, and the install
              command is one long unbreakable string — without this the column grows to
              fit it and the whole page scrolls sideways on a phone. */}
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex items-center gap-2 font-semibold tracking-tight">
              <AgentFigure variant="mark" size="md" pose="idle" hideLabel aria-hidden="true" still />
              PixelDosa
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
              Interface components for AI products — the moments people decide whether to
              trust an agent. Plain React, no SDK or protocol required. Copy the source and
              keep the craft.
            </p>
            <div>
              <CodeBlock code={installCommand("pixeldosa-theme")} language="bash" />
            </div>
          </div>

          <nav
            aria-label="Footer"
            className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:justify-items-end"
          >
            <Column title="Browse">
              <FooterLink href="/docs/components">All components</FooterLink>
              <FooterLink href="/changelog">Changelog</FooterLink>
              <FooterLink href="/docs/ai">Build with AI</FooterLink>
            </Column>

            <Column title="For agents">
              <FooterLink href="/llms.txt">llms.txt</FooterLink>
              <FooterLink href="/r/catalog.json">Component catalogue</FooterLink>
              <FooterLink href="/r/registry.json">Registry index</FooterLink>
            </Column>

            <Column title="Project">
              <FooterLink href="/work-with-me">Work with me</FooterLink>
              <FooterLink href={REPO_URL}>GitHub</FooterLink>
              <FooterLink href={PORTFOLIO_URL}>Akshay Jayan</FooterLink>
              <FooterLink href={WORK_EMAIL_URL}>Email</FooterLink>
            </Column>
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-baseline sm:justify-between">
          <p className="text-pretty">
            PixelDosa (beta). Designed and built by{" "}
            <a
              href={PORTFOLIO_URL}
              className="rounded-sm text-foreground underline underline-offset-4 outline-none hover:no-underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              Akshay Jayan
            </a>
            , design engineer. MIT licensed.
          </p>
          {/* A date, not a count. "48 components" needs a paragraph to defend — items or
              exported components, with or without the foundation primitives — and a number
              that needs defending does not belong in a footer. When it last moved is
              unambiguous, and it links to the evidence. */}
          {latest ? (
            <p>
              <Link
                href="/changelog"
                className="rounded-sm underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
              >
                Last updated {formatUpdated(latest.date)}
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
