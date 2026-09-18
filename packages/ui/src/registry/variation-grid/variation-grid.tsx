"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type VariationStatus = "running" | "done" | "failed";

export type Variation = {
  id: string;
  /** The result itself: an image, a video poster, a card of text. Yours to render. */
  preview?: React.ReactNode;
  /** "Version 3", "Warmer light". */
  label?: string;
  status?: VariationStatus;
  /** Why this one failed, and what happened to the credits. */
  note?: string;
};

export interface VariationGridProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title" | "onSelect"> {
  /** Level of the title heading, so it fits the outline of the page it's placed in. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  title?: string;
  items: Variation[];
  /** The ones the user is keeping. They survive the next regeneration. */
  keptIds: string[];
  onKeptChange: (ids: string[]) => void;
  /** Regenerates only what isn't kept — the thing people do by hand today. */
  onRegenerateRest?: (idsToReplace: string[]) => void;
  /** Cost of that regeneration, formatted by you: "4 credits". Shown before the click. */
  regenerateCost?: string;
  /** Takes one result forward: into the document, the post, the canvas. */
  onUse?: (id: string) => void;
  useLabel?: string;
  /** More like this one. */
  onMore?: (id: string) => void;
  /** Retries a single failed result. */
  onRetry?: (id: string) => void;
  /** Aspect ratio for each cell, so the grid never jumps as results land. */
  aspectRatio?: string;
}

/**
 * The results of one prompt, with the good ones kept.
 *
 * Research on how people actually use generation tools calls this apple picking: they
 * keep the two they like and run the rest again. Almost no tool supports it, so people do
 * it by hand — downloading favourites, re-prompting, losing track of which was which.
 * Here keeping is a first-class state: kept results are marked, "Regenerate the rest"
 * replaces only the others, and the cost of doing that is on the button before the click,
 * because unpriced iteration is the loudest complaint in this category.
 *
 * Failures are per cell, not per batch: one failed result shows its own reason and its own
 * Retry while the rest stay usable.
 */
function VariationGrid({
  headingLevel = 3,
  title = "Results",
  items,
  keptIds,
  onKeptChange,
  onRegenerateRest,
  regenerateCost,
  onUse,
  useLabel = "Use this",
  onMore,
  onRetry,
  aspectRatio = "1 / 1",
  className,
  ...props
}: VariationGridProps) {
  const Heading = `h${headingLevel}` as "h3";
  const headingId = React.useId();
  const kept = items.filter((item) => keptIds.includes(item.id));
  const replaceable = items.filter((item) => !keptIds.includes(item.id) && item.status !== "running");

  const toggleKeep = (id: string) =>
    onKeptChange(keptIds.includes(id) ? keptIds.filter((value) => value !== id) : [...keptIds, id]);

  return (
    <section
      aria-labelledby={headingId}
      className={cn("flex flex-col gap-3", className)}
      {...props}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Heading id={headingId} className="text-sm font-medium text-foreground">
          {title}
        </Heading>
        <p className="text-xs text-muted-foreground tabular-nums">
          {kept.length > 0 ? `${kept.length} kept · ${replaceable.length} can be replaced` : `${items.length} results`}
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const isKept = keptIds.includes(item.id);
          const status = item.status ?? "done";
          return (
            <li
              key={item.id}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-lg border bg-card",
                isKept && "border-[1.5px] border-foreground"
              )}
            >
              <div
                style={{ aspectRatio }}
                className={cn(
                  "relative flex w-full items-center justify-center overflow-hidden bg-muted",
                  status === "failed" && "bg-agent-blocked-soft"
                )}
              >
                {status === "running" ? (
                  <span className="flex flex-col items-center gap-2 p-3 text-center">
                    <span
                      aria-hidden="true"
                      className="size-2.5 rounded-full bg-agent-working animate-[pd-cell-pulse_1.4s_ease-in-out_infinite] motion-reduce:animate-none"
                    />
                    <span className="text-xs text-muted-foreground">Generating…</span>
                  </span>
                ) : status === "failed" ? (
                  <span className="flex flex-col items-center gap-1.5 p-3 text-center">
                    <span className="text-xs font-medium text-agent-blocked">Didn't finish</span>
                    {item.note ? <span className="text-xs text-muted-foreground text-pretty">{item.note}</span> : null}
                    {onRetry ? (
                      <button
                        type="button"
                        onClick={() => onRetry(item.id)}
                        className="rounded-md border border-input bg-card px-2 py-1 text-xs font-medium text-foreground outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40"
                      >
                        Try this one again
                      </button>
                    ) : null}
                  </span>
                ) : (
                  item.preview
                )}
              </div>

              <div className="flex items-center justify-between gap-2 border-t px-2.5 py-2">
                <span className="min-w-0 truncate text-xs text-muted-foreground">
                  {item.label ?? ""}
                </span>
                {status === "done" ? (
                  <button
                    type="button"
                    aria-pressed={isKept}
                    aria-label={isKept ? `Stop keeping ${item.label ?? "this result"}` : `Keep ${item.label ?? "this result"}`}
                    onClick={() => toggleKeep(item.id)}
                    className={cn(
                      "relative shrink-0 rounded-md px-2 py-1 text-xs font-medium outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                      isKept
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {isKept ? "Kept" : "Keep"}
                  </button>
                ) : null}
              </div>

              {status === "done" && (onUse || onMore) ? (
                <div className="flex flex-wrap gap-1.5 border-t px-2.5 py-2">
                  {onUse ? (
                    <button
                      type="button"
                      onClick={() => onUse(item.id)}
                      className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/40"
                    >
                      {useLabel}
                    </button>
                  ) : null}
                  {onMore ? (
                    <button
                      type="button"
                      onClick={() => onMore(item.id)}
                      className="rounded-md border border-input px-2 py-1 text-xs font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
                    >
                      More like this
                    </button>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {onRegenerateRest ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <button
            type="button"
            disabled={replaceable.length === 0}
            onClick={() => onRegenerateRest(replaceable.map((item) => item.id))}
            className="rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50"
          >
            {replaceable.length === items.length
              ? "Regenerate all"
              : `Regenerate the other ${replaceable.length}`}
          </button>
          {/* The price of iterating, before the click. */}
          {regenerateCost ? (
            <p className="text-xs text-muted-foreground">{regenerateCost} · what you kept stays.</p>
          ) : (
            <p className="text-xs text-muted-foreground">What you kept stays.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}

export { VariationGrid };
