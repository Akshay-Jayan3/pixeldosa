"use client";

import * as React from "react";

import { AgentPresence, type AgentState } from "@/registry/agent-presence/agent-presence";
import { cn } from "@/lib/utils";

export interface LiveStatusLineProps extends React.ComponentPropsWithoutRef<"div"> {
  state: AgentState;
  /** The current micro-action. Replaced wholesale as work moves on — never accumulated. */
  status: string;
  /** What the action is acting on — a filename, a query, a table. Truncates before the verb does. */
  detail?: string;
  /**
   * When the run started. The component ticks the elapsed counter itself rather than
   * making the caller re-render once a second for a display detail — a deliberate
   * exception to this system's usual "the caller owns async state" rule.
   */
  startedAt?: number | Date;
  onCancel?: () => void;
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

const ACTIVE: AgentState[] = ["queued", "thinking", "deciding", "working", "streaming"];

/**
 * One line saying what the agent is doing right now — the status bar of an agent run.
 *
 * It **replaces** rather than accumulates, which is the whole distinction from its
 * neighbours: `Reasoning Stream` keeps a trace you can scroll, `Chain-of-Thought
 * Timeline` keeps the whole turn's history, and this keeps exactly one thing. That is
 * what makes it cheap enough to leave in permanent product chrome.
 */
function LiveStatusLine({
  state,
  status,
  detail,
  startedAt,
  onCancel,
  className,
  ...props
}: LiveStatusLineProps) {
  const active = ACTIVE.includes(state);
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (!active || startedAt === undefined) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active, startedAt]);

  const elapsed =
    startedAt === undefined
      ? null
      : formatElapsed(Math.max(0, now - (startedAt instanceof Date ? startedAt.getTime() : startedAt)));

  return (
    <div
      className={cn(
        // min-h keeps the line from reflowing its container as the text changes length.
        "flex min-h-8 items-center gap-2.5 text-sm",
        className
      )}
      {...props}
    >
      {/* The label is handed down rather than left to default: Agent Presence owns the
          only aria-live region here, so it must announce *this* status ("Comparing
          billing contacts") and not its own generic state name ("Choosing an action").
          Two announcement channels disagreeing is worse than either one alone. */}
      <AgentPresence
        state={state}
        form="line"
        size="sm"
        hideLabel
        label={detail ? `${status} ${detail}` : status}
        className="shrink-0"
      />

      {/* Keyed on the status text so React's reconciliation runs the swap exactly once
          per real change — a status that re-renders unchanged never re-animates. */}
      <p key={status} className="flex min-w-0 flex-1 items-baseline gap-1.5 animate-[pd-status-swap_var(--pd-duration-fast)_var(--pd-ease-decelerate)_both] motion-reduce:animate-none">
        <span className="shrink-0 text-foreground">{status}</span>
        {detail ? (
          // The object truncates before the verb does: "Reading" stays readable even
          // when the filename can't.
          <span className="truncate font-mono text-xs text-muted-foreground">{detail}</span>
        ) : null}
      </p>

      {elapsed ? (
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{elapsed}</span>
      ) : null}

      {onCancel && active ? (
        <button
          type="button"
          onClick={onCancel}
          className="relative shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium text-muted-foreground underline-offset-2 outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] after:absolute after:inset-x-0 after:-inset-y-2.5 after:content-[''] motion-reduce:transition-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          Stop
        </button>
      ) : null}
    </div>
  );
}

export { LiveStatusLine };
