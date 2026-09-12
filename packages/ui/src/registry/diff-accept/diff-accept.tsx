"use client";

import * as React from "react";
import { diffWords, type Change } from "diff";

import { cn } from "@/lib/utils";

type Resolution = "pending" | "accepted" | "rejected";

type TextSegment = { type: "text"; value: string };
type HunkSegment = { type: "hunk"; index: number; removed: string; added: string };
type Segment = TextSegment | HunkSegment;

/**
 * Groups a word-level diff into reviewable units: each maximal run of consecutive
 * added/removed parts becomes one hunk (removed text + its replacement, if any),
 * separated by plain unchanged text. A hunk is the smallest thing a user should be
 * asked to accept or reject individually — reviewing word-by-word would be noise,
 * reviewing the whole diff at once would be the all-or-nothing problem this
 * component exists to avoid.
 */
function buildSegments(parts: Change[]): Segment[] {
  const segments: Segment[] = [];
  let hunkIndex = 0;
  let pendingHunk: { removed: string; added: string } | null = null;

  const flushHunk = () => {
    if (!pendingHunk) return;
    segments.push({ type: "hunk", index: hunkIndex, ...pendingHunk });
    hunkIndex++;
    pendingHunk = null;
  };

  for (const part of parts) {
    if (!part.added && !part.removed) {
      flushHunk();
      if (part.value) segments.push({ type: "text", value: part.value });
      continue;
    }

    pendingHunk ??= { removed: "", added: "" };
    if (part.removed) pendingHunk.removed += part.value;
    if (part.added) pendingHunk.added += part.value;
  }

  flushHunk();
  return segments;
}

function mergeSegments(segments: Segment[], resolutions: Record<number, Resolution>): string {
  return segments
    .map((segment) => {
      if (segment.type === "text") return segment.value;
      // Unresolved ("pending") hunks default to the original text, not the proposed
      // one — an AI change only lands in the merged result if explicitly accepted.
      return resolutions[segment.index] === "accepted" ? segment.added : segment.removed;
    })
    .join("");
}

export interface DiffAcceptProps {
  /** The text the proposal was generated against. Compared to `value` to detect conflicts. */
  baseValue: string;
  /** The current live value. If it no longer matches `baseValue`, a conflict banner renders instead of the diff. */
  value: string;
  /** The AI-proposed replacement text. */
  proposedValue: string;
  /** Fires with the merged result once the user applies their resolutions. */
  onApply: (mergedValue: string) => void;
  /** Shown on conflict instead of the diff. Typically re-requests a fresh proposal against the current value. */
  onRegenerate?: () => void;
  /** How long the Undo affordance stays visible after applying, in ms. */
  undoWindowMs?: number;
  className?: string;
}

/**
 * Reviews an AI-proposed text change as an inline word-level diff, resolved hunk by
 * hunk rather than all-or-nothing, with a conflict guard if the underlying text has
 * changed since the proposal was generated. The multi-region generalization of
 * `SmartField`'s single-value proposal model.
 */
function DiffAccept({
  baseValue,
  value,
  proposedValue,
  onApply,
  onRegenerate,
  undoWindowMs = 6000,
  className,
}: DiffAcceptProps) {
  const [resolutions, setResolutions] = React.useState<Record<number, Resolution>>({});
  // "reviewing" shows the diff; "applied" shows the brief Undo affordance; "done" is
  // terminal (the undo window expired without a click) and renders nothing further —
  // reverting to "reviewing" here would silently re-show a diff the user already
  // committed. Undo returns to "reviewing" rather than "done" so a change of mind can
  // pick different hunks the second time.
  const [status, setStatus] = React.useState<"reviewing" | "applied" | "done">("reviewing");
  const [announcement, setAnnouncement] = React.useState("");

  const previousValueRef = React.useRef<string | null>(null);
  const undoTimerRef = React.useRef<number | undefined>(undefined);

  const conflict = value !== baseValue;

  const segments = React.useMemo(
    () => (conflict ? [] : buildSegments(diffWords(baseValue, proposedValue))),
    [conflict, baseValue, proposedValue]
  );

  const hunkCount = React.useMemo(
    () => segments.filter((segment): segment is HunkSegment => segment.type === "hunk").length,
    [segments]
  );

  const pendingCount = React.useMemo(() => {
    let count = 0;
    for (let index = 0; index < hunkCount; index++) {
      if ((resolutions[index] ?? "pending") === "pending") count++;
    }
    return count;
  }, [resolutions, hunkCount]);

  const resolveHunk = (index: number, resolution: Resolution) => {
    setResolutions((prev) => ({ ...prev, [index]: resolution }));
  };

  const resolveAll = (resolution: Resolution) => {
    const next: Record<number, Resolution> = {};
    for (let index = 0; index < hunkCount; index++) next[index] = resolution;
    setResolutions(next);
  };

  const clearUndoTimer = React.useCallback(() => window.clearTimeout(undoTimerRef.current), []);
  React.useEffect(() => clearUndoTimer, [clearUndoTimer]);

  const applyChanges = () => {
    const merged = mergeSegments(segments, resolutions);
    previousValueRef.current = value;
    onApply(merged);
    setStatus("applied");
    setAnnouncement("Changes applied.");
    clearUndoTimer();
    undoTimerRef.current = window.setTimeout(() => {
      setStatus("done");
      previousValueRef.current = null;
    }, undoWindowMs);
  };

  const undoApply = () => {
    if (previousValueRef.current === null) return;
    onApply(previousValueRef.current);
    setAnnouncement("Undone.");
    clearUndoTimer();
    setStatus("reviewing");
    previousValueRef.current = null;
  };

  if (status === "done") return null;

  if (status === "applied") {
    return (
      <p className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
        Changes applied.
        <button
          type="button"
          onClick={undoApply}
          className="font-medium text-foreground underline-offset-2 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          Undo
        </button>
        <span role="status" aria-live="polite" className="sr-only">
          {announcement}
        </span>
      </p>
    );
  }

  if (hunkCount === 0 && !conflict) return null;

  if (conflict) {
    return (
      <div className={cn("flex flex-col gap-2 rounded-md border bg-muted p-3", className)}>
        <p className="text-sm text-foreground">
          This text has changed since this suggestion was generated, so it can't be
          safely applied.
        </p>
        {onRegenerate ? (
          <button
            type="button"
            onClick={onRegenerate}
            className="self-start rounded-md border border-input px-2.5 py-1 text-xs font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            Regenerate suggestion
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2 rounded-md border bg-muted p-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        {/* tabular-nums: without it the line jumps as the count crosses 9 → 10, since
            1 and 4 are different widths in the proportional face. */}
        <span className="tabular-nums">
          {hunkCount - pendingCount} of {hunkCount} {hunkCount === 1 ? "change" : "changes"}{" "}
          reviewed
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => resolveAll("accepted")}
            className="font-medium text-foreground underline-offset-2 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => resolveAll("rejected")}
            className="font-medium text-foreground underline-offset-2 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            Reject all
          </button>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-foreground">
        {segments.map((segment, i) => {
          if (segment.type === "text") return <React.Fragment key={i}>{segment.value}</React.Fragment>;

          const resolution = resolutions[segment.index] ?? "pending";
          return (
            <DiffHunk
              key={i}
              removed={segment.removed}
              added={segment.added}
              resolution={resolution}
              onAccept={() => resolveHunk(segment.index, "accepted")}
              onReject={() => resolveHunk(segment.index, "rejected")}
            />
          );
        })}
      </p>

      <button
        type="button"
        onClick={applyChanges}
        className="self-start rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        Apply changes
      </button>

      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}

function DiffHunk({
  removed,
  added,
  resolution,
  onAccept,
  onReject,
}: {
  removed: string;
  added: string;
  resolution: Resolution;
  onAccept: () => void;
  onReject: () => void;
}) {
  if (resolution === "accepted") return <span>{added}</span>;
  if (resolution === "rejected") return <span>{removed}</span>;

  const label = (added || removed).trim().slice(0, 40);

  return (
    <span className="inline">
      {removed ? (
        <span className="text-destructive line-through motion-reduce:transition-none">
          {removed}
        </span>
      ) : null}
      {added ? (
        <span className="rounded bg-accent/40 text-foreground underline decoration-accent-foreground/40 motion-reduce:transition-none">
          {added}
        </span>
      ) : null}
      <span className="mx-1 inline-flex items-center gap-0.5 align-middle">
        <button
          type="button"
          aria-label={`Reject: "${label}"`}
          onClick={onReject}
          className="inline-flex size-5 items-center justify-center rounded text-muted-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-3.5">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          aria-label={`Accept: "${label}"`}
          onClick={onAccept}
          className="inline-flex size-5 items-center justify-center rounded text-muted-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-3.5">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </span>
    </span>
  );
}

export { DiffAccept };
