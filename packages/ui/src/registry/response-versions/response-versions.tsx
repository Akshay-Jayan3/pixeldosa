"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type ResponseVersion = {
  id: string;
  /** What produced it, in the user's words: "Shorter", "With sources", "First answer". */
  label?: string;
  /** Already formatted by you: "2 minutes ago". Rendered as given, never recomputed. */
  time?: string;
  content: React.ReactNode;
};

export interface ResponseVersionsProps extends Omit<React.ComponentPropsWithoutRef<"div">, "onChange"> {
  /** Oldest first. A regenerate appends; nothing is ever replaced. */
  versions: ResponseVersion[];
  activeId: string;
  onActiveChange: (id: string) => void;
  /** Produces another version. The previous ones stay. */
  onRegenerate?: () => void;
  /** Keeps this version as the answer and ends the comparison. */
  onKeep?: (id: string) => void;
  /** True while a new version is being produced. */
  busy?: boolean;
  label?: string;
}

/**
 * Every answer the agent gave, kept.
 *
 * Regenerating is the most common thing people do with an AI answer, and in most products
 * it destroys the previous one — so a better answer is a gamble, and people keep copies in
 * a notes app. Here each attempt is a version: step back and forth, put two side by side,
 * and keep the one you want.
 *
 * Still by default. The only motion is while a new version is being produced.
 */
function ResponseVersions({
  versions,
  activeId,
  onActiveChange,
  onRegenerate,
  onKeep,
  busy = false,
  label = "Answer versions",
  className,
  ...props
}: ResponseVersionsProps) {
  const [compare, setCompare] = React.useState(false);
  const index = Math.max(0, versions.findIndex((version) => version.id === activeId));
  const current = versions[index];
  const previous = versions[index - 1];

  // Comparing needs something to compare against: at the first version, or once the list
  // shrinks to one, the toggle has nothing to show.
  React.useEffect(() => {
    if (!previous) setCompare(false);
  }, [previous]);

  if (!current) return null;

  const step = (direction: -1 | 1) => {
    const next = versions[index + direction];
    if (next) onActiveChange(next.id);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <div role="group" aria-label={label} className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous version"
            disabled={index === 0}
            onClick={() => step(-1)}
            className="relative inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] after:absolute after:inset-x-0 after:-inset-y-2 after:content-[''] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-30"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
              <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="text-xs text-muted-foreground tabular-nums">
            Version {index + 1} of {versions.length}
          </p>
          <button
            type="button"
            aria-label="Next version"
            disabled={index === versions.length - 1}
            onClick={() => step(1)}
            className="relative inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] after:absolute after:inset-x-0 after:-inset-y-2 after:content-[''] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-30"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
              <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {current.label || current.time ? (
          <p className="text-xs text-muted-foreground">
            {[current.label, current.time].filter(Boolean).join(" · ")}
          </p>
        ) : null}

        <span className="flex-1" />

        {previous ? (
          <button
            type="button"
            aria-pressed={compare}
            onClick={() => setCompare((value) => !value)}
            className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground underline-offset-2 outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            {compare ? "Stop comparing" : "Compare with previous"}
          </button>
        ) : null}

        {onRegenerate ? (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={busy}
            className="rounded-md border border-input px-2.5 py-1 text-xs font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50"
          >
            {/* Says what it does to the other versions, because most products silently
                throw them away. */}
            {busy ? "Writing another…" : "Regenerate"}
          </button>
        ) : null}

        {onKeep ? (
          <button
            type="button"
            onClick={() => onKeep(current.id)}
            className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            Keep this one
          </button>
        ) : null}
      </div>

      {compare && previous ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <section aria-label={`Version ${index}`} className="flex flex-col gap-2 rounded-lg border bg-card p-3">
            <p className="text-xs text-muted-foreground">
              Version {index}
              {previous.label ? ` · ${previous.label}` : ""}
            </p>
            <div className="text-sm text-foreground text-pretty">{previous.content}</div>
          </section>
          <section
            aria-label={`Version ${index + 1}, showing now`}
            className="flex flex-col gap-2 rounded-lg border-[1.5px] border-foreground bg-card p-3"
          >
            <p className="text-xs text-muted-foreground">
              Version {index + 1} · showing now
            </p>
            <div className="text-sm text-foreground text-pretty">{current.content}</div>
          </section>
        </div>
      ) : (
        // Keyed on the version, so switching fades the new text in once rather than
        // re-animating on every render.
        <div key={current.id} className="animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] text-sm text-foreground text-pretty motion-reduce:animate-none">
          {current.content}
        </div>
      )}

      <span role="status" aria-live="polite" className="sr-only">
        {busy ? "Writing another version." : `Showing version ${index + 1} of ${versions.length}.`}
      </span>
    </div>
  );
}

export { ResponseVersions };
