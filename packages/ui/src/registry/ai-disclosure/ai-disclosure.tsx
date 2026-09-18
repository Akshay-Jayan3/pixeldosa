"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/** One thing the user should know, stated plainly. */
export type DisclosureFact = {
  id: string;
  /** "What it used", "Who can see it", "How long it's kept". */
  label: string;
  /** "Your last 20 messages in this project." */
  value: string;
};

export interface AIDisclosureProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title"> {
  /** Level of the title heading, so it fits the outline of the page it's placed in. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /**
   * `notice` states what happened or is happening. `consent` asks first and nothing
   * proceeds until the person answers.
   */
  variant?: "notice" | "consent";
  /** "Written by AI", "This call will be recorded and summarised". */
  title: string;
  /** One sentence in the user's words. */
  summary?: string;
  /** The specifics, shown on demand for a notice and up front for consent. */
  facts?: DisclosureFact[];
  /** Your policy page. */
  learnMoreHref?: string;
  learnMoreLabel?: string;
  /** Consent only. Both answers are equally available; neither is preselected. */
  onAllow?: () => void;
  onDecline?: () => void;
  allowLabel?: string;
  declineLabel?: string;
  /** Notice only. Lets the reader dismiss it once they've read it. */
  onDismiss?: () => void;
}

/**
 * What the AI did, what it used, and — when it matters — asking first.
 *
 * Two shapes, one component. A `notice` states the fact ("Written by AI from your last 20
 * messages") and keeps the specifics one click away, so a label doesn't become a wall of
 * policy text. A `consent` asks before anything happens, with both answers equally
 * available: no preselected "Allow", no styling that makes declining look like a mistake,
 * and the specifics visible without expanding anything, because consent given without
 * reading isn't consent.
 *
 * Holds completely still. Nothing here is the machine's turn.
 */
function AIDisclosure({
  headingLevel = 3,
  variant = "notice",
  title,
  summary,
  facts,
  learnMoreHref,
  learnMoreLabel = "How this works",
  onAllow,
  onDecline,
  allowLabel = "Allow",
  declineLabel = "Not now",
  onDismiss,
  className,
  ...props
}: AIDisclosureProps) {
  const Heading = `h${headingLevel}` as "h3";
  const headingId = React.useId();
  const detailsId = React.useId();
  const consent = variant === "consent";
  const [open, setOpen] = React.useState(consent);

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-3",
        consent && "border-[1.5px] border-agent-waiting bg-agent-waiting-soft",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-2.5">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 11v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="12" cy="8" r="0.9" fill="currentColor" />
        </svg>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Heading id={headingId} className="text-sm font-medium text-foreground text-pretty">
            {title}
          </Heading>
          {summary ? <p className="text-sm text-muted-foreground text-pretty">{summary}</p> : null}
        </div>
        {onDismiss && !consent ? (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss this notice"
            className="relative -m-1 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-[''] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3.5">
              <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </div>

      {facts && facts.length > 0 ? (
        <div className="flex flex-col gap-2">
          {/* A notice keeps the specifics one click away; consent shows them up front,
              because a decision made without them isn't a decision. */}
          {!consent ? (
            <button
              type="button"
              aria-expanded={open}
              aria-controls={detailsId}
              onClick={() => setOpen((value) => !value)}
              className="self-start rounded-md text-xs font-medium text-muted-foreground underline-offset-4 outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              {open ? "Hide the details" : "What this used"}
            </button>
          ) : null}
          <dl
            id={detailsId}
            hidden={!open}
            className="grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)]"
          >
            {facts.map((fact) => (
              <React.Fragment key={fact.id}>
                <dt className="text-muted-foreground">{fact.label}</dt>
                <dd className="text-foreground text-pretty">{fact.value}</dd>
              </React.Fragment>
            ))}
          </dl>
        </div>
      ) : null}

      {learnMoreHref ? (
        <a
          href={learnMoreHref}
          className="self-start rounded-md text-xs font-medium text-foreground underline underline-offset-4 outline-none hover:no-underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          {learnMoreLabel}
        </a>
      ) : null}

      {consent && (onAllow || onDecline) ? (
        // Equal weight on purpose: the same size and the same prominence, so declining
        // never looks like the wrong answer.
        <div className="flex flex-wrap gap-2">
          {onAllow ? (
            <button
              type="button"
              onClick={onAllow}
              className="rounded-md border-[1.5px] border-foreground px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              {allowLabel}
            </button>
          ) : null}
          {onDecline ? (
            <button
              type="button"
              onClick={onDecline}
              className="rounded-md border-[1.5px] border-foreground px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              {declineLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export { AIDisclosure };
