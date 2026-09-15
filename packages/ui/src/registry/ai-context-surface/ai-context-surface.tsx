"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type ProvenanceSource = { label: string; url?: string; snippet?: string };

export interface AIContextSurfaceProps {
  explanation?: string;
  sources?: ProvenanceSource[];
  model?: string;
  generatedAt?: string | Date;
  /** Accessible label and visible text for the collapsed trigger. */
  triggerLabel?: string;
  className?: string;
}

const relativeFormatter =
  typeof Intl !== "undefined" ? new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }) : null;

function formatTimestamp(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);

  if (relativeFormatter && Math.abs(diffMinutes) < 60 * 24) {
    if (Math.abs(diffMinutes) < 1) return "just now";
    if (Math.abs(diffMinutes) < 60) return relativeFormatter.format(diffMinutes, "minute");
    return relativeFormatter.format(Math.round(diffMinutes / 60), "hour");
  }

  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/**
 * A collapsed-by-default "why this?" disclosure showing an AI-produced value's
 * explanation, sources, and model metadata — the folded-together answer to Citation
 * Card, Source Viewer, and Thinking Indicator, all of which only make sense inside a
 * chat thread. This works with no chat thread at all: inside a form field, a table
 * row, a card, anywhere a value needs transparency available on demand rather than
 * forced into view.
 */
function AIContextSurface({
  explanation,
  sources,
  model,
  generatedAt,
  triggerLabel = "Why this?",
  className,
}: AIContextSurfaceProps) {
  const [open, setOpen] = React.useState(false);
  const panelId = React.useId();
  // "12 minutes ago" depends on the viewer's clock and locale, so it can't be rendered on
  // the server: the prerendered text never matches and React throws away the page on
  // hydration. It's formatted after mount instead; the model name shows immediately.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const hasContent = Boolean(explanation || (sources && sources.length > 0) || model || generatedAt);
  if (!hasContent) return null;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className={cn(
            "size-3.5 transition-transform duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
            open && "rotate-90"
          )}
        >
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {triggerLabel}
      </button>

      <div
        id={panelId}
        // A 0fr row hides the panel visually but leaves its source links focusable and
        // exposed to assistive technology; inert removes them while collapsed.
        inert={!open}
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)]",
          "motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0">
          <div className="flex flex-col gap-2 rounded-md border bg-muted p-3 text-sm">
            {explanation ? <p className="text-foreground">{explanation}</p> : null}

            {sources && sources.length > 0 ? (
              <ol className="flex flex-col gap-1.5">
                {sources.map((source, index) => (
                  <li key={index} className="flex gap-1.5 text-foreground">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    <span className="flex flex-col">
                      {source.url ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium underline-offset-2 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
                        >
                          {source.label}
                        </a>
                      ) : (
                        <span className="font-medium">{source.label}</span>
                      )}
                      {source.snippet ? (
                        <span className="text-xs text-muted-foreground">{source.snippet}</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}

            {model || generatedAt ? (
              <p className="text-xs text-muted-foreground">
                {[model, generatedAt && mounted ? formatTimestamp(generatedAt) : null].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export { AIContextSurface };
