"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface ReasoningStreamProps extends React.ComponentPropsWithoutRef<"div"> {
  /**
   * Reasoning summary lines, oldest first, appended as they arrive. An array rather
   * than a raw string because providers emit reasoning *summaries* as discrete parts,
   * and deciding where one thought ends is the consumer's business, not this
   * component's.
   */
  steps: string[];
  isStreaming?: boolean;
  /** Measured elapsed time. Shown once streaming ends — never estimated. */
  durationMs?: number;
  /** Verb shown while streaming. */
  label?: string;
  defaultExpanded?: boolean;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn(
        "size-3.5 shrink-0 transition-transform duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
        open && "rotate-90"
      )}
    >
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * One reasoning line. Split out so React's keyed reconciliation owns the entrance: a
 * step already on screen keeps its DOM node and can never replay its fade, no matter
 * how often the parent re-renders. Same mechanism as Progressive Reveal — a timer would
 * get this wrong on the first re-render.
 */
function Step({ text }: { text: string }) {
  return (
    <p className="animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] text-sm leading-relaxed text-muted-foreground motion-reduce:animate-none">
      {text}
    </p>
  );
}

function formatDuration(ms: number): string {
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${Math.round(seconds % 60)}s`;
}

/**
 * An agent's reasoning as it arrives — a two-line ticker while it streams, folding to a
 * single "Thought for 12s" line once the answer exists.
 *
 * The fold-away is the point. Reasoning is scaffolding: useful while the thing is being
 * built, noise once it stands. A reasoning panel left expanded after the answer lands
 * makes every answer look like it needs justifying.
 */
function ReasoningStream({
  steps,
  isStreaming = false,
  durationMs,
  label = "Thinking",
  defaultExpanded = false,
  className,
  ...props
}: ReasoningStreamProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const [pinnedToEnd, setPinnedToEnd] = React.useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const panelId = React.useId();

  /**
   * Scroll anchoring. Following new content is only correct while the reader is
   * actually at the end — the moment they scroll up to read something, yanking them
   * back is the single most hostile thing a streaming surface can do. So: track
   * whether they are near the bottom, and only follow when they are.
   */
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromEnd = el.scrollHeight - el.scrollTop - el.clientHeight;
    setPinnedToEnd(distanceFromEnd < 24);
  };

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el || !pinnedToEnd) return;
    el.scrollTop = el.scrollHeight;
  }, [steps.length, pinnedToEnd, expanded]);

  // An empty shell helps nobody — same call as AI Context Surface.
  if (steps.length === 0 && !isStreaming) return null;

  const showTicker = isStreaming && !expanded;

  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((value) => !value)}
        className="relative inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] after:absolute after:inset-x-0 after:-inset-y-2.5 after:content-[''] motion-reduce:transition-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        <ChevronIcon open={expanded} />
        {isStreaming ? (
          // Only while reasoning is still arriving. Once it resolves to "Thought for
          // 12s" the label states a completed fact and holds still.
          <span className="pd-shimmer">{label}</span>
        ) : durationMs !== undefined ? (
          <>
            Thought for <span className="tabular-nums">{formatDuration(durationMs)}</span>
          </>
        ) : (
          "Reasoning"
        )}
      </button>

      {/* Ticker: the last two lines, anything taller cropped above. Reads as a process
          rather than a document, which is what it is while it's still running. */}
      {showTicker ? (
        <div
          id={panelId}
          className="relative max-h-11 overflow-hidden"
        >
          <div className="flex flex-col justify-end">
            {steps.slice(-2).map((step, index) => (
              <Step key={`${steps.length - 2 + index}`} text={step} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Expanded: the full trace, scroll-anchored. */}
      <div
        id={showTicker ? undefined : panelId}
        inert={!expanded}
        className={cn(
          // overflow-hidden is load-bearing, not cosmetic: a 0fr grid row does not clip
          // its own content, so without it the collapsed trace spills out of the
          // container and renders over whatever follows.
          "grid overflow-hidden transition-[grid-template-rows] duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0">
          <div className="relative rounded-md border bg-muted">
            <div
              ref={scrollRef}
              onScroll={onScroll}
              className="flex max-h-56 flex-col gap-2 overflow-y-auto p-3"
            >
              {steps.map((step, index) => (
                <Step key={index} text={step} />
              ))}
            </div>

            {!pinnedToEnd && isStreaming ? (
              <button
                type="button"
                onClick={() => {
                  setPinnedToEnd(true);
                  const el = scrollRef.current;
                  if (el) el.scrollTop = el.scrollHeight;
                }}
                className="absolute inset-x-0 bottom-2 mx-auto w-fit rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-sm outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
              >
                Jump to latest
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export { ReasoningStream };
