"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface ProgressiveRevealProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => React.Key;
  /** Shows a trailing "more incoming" indicator while true. */
  isStreaming?: boolean;
  /** `"stack"` (default) lays items in a vertical flex column; `"grid"` uses a CSS grid. */
  layout?: "stack" | "grid";
  className?: string;
}

/**
 * Reveals a growing collection of items (rows, cards) one at a time as they arrive,
 * with a stable layout and no per-character typewriter effect — the AI-tier's answer
 * to generic prose streaming, scoped specifically to structured collections. Each item
 * is given its entrance transition exactly once, enforced by React's own keyed
 * reconciliation: an item already present on a prior render keeps its existing DOM
 * node and never remounts, so it can never replay the animation.
 */
function ProgressiveReveal<T>({
  items,
  renderItem,
  keyExtractor,
  isStreaming = false,
  layout = "stack",
  className,
}: ProgressiveRevealProps<T>) {
  return (
    <div
      className={cn(
        layout === "stack" ? "flex flex-col gap-2" : "grid grid-cols-2 gap-3 sm:grid-cols-3",
        className
      )}
    >
      {items.map((item, index) => (
        <RevealItem key={keyExtractor ? keyExtractor(item, index) : index}>
          {renderItem(item, index)}
        </RevealItem>
      ))}
      {isStreaming ? <StreamingIndicator /> : null}
      <span role="status" aria-live="polite" className="sr-only">
        {items.length} {items.length === 1 ? "result" : "results"} loaded
        {isStreaming ? ", more loading" : ""}
      </span>
    </div>
  );
}

/**
 * Mounts once per unique key and flips from a closed to an open visual state on the
 * next animation frame — the same two-phase-mount pattern `Command Menu` and
 * `Selection Actions` use, so the fade+translate has a real "from" value. Because this
 * only mounts when its key first appears in the parent's list, an item that was
 * already on screen is never remounted by a later render and so never replays its
 * entrance — no manual "already seen" tracking required.
 */
function RevealItem({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      data-state={visible ? "open" : "closed"}
      className={cn(
        "opacity-0 translate-y-1 transition-[opacity,translate] duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)]",
        "data-[state=open]:opacity-100 data-[state=open]:translate-y-0",
        "motion-reduce:transition-none"
      )}
    >
      {children}
    </div>
  );
}

function StreamingIndicator() {
  return (
    <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-muted-foreground motion-safe:animate-pulse motion-reduce:opacity-50"
      />
      More loading…
    </div>
  );
}

export { ProgressiveReveal };
