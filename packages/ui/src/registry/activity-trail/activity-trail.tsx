"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type TrailActor = "agent" | "person" | "system";

export type TrailEntry = {
  id: string;
  /** Formatted by you: "14:02", "Yesterday 09:15". Never recomputed here. */
  time: string;
  actor: TrailActor;
  /** Who exactly: "Research agent", "Dana", "Scheduler". */
  actorName?: string;
  /** The consequence, in the user's words: "Emailed the summary to 3 people". */
  action: string;
  /** What it touched: a file, a record, a recipient list. */
  target?: string;
  /**
   * Why it was allowed to do this: "You approved it", "Autonomy: acts on low-risk
   * things", "Scheduled by Dana". The question every log leaves out.
   */
  authority?: string;
  /** What came of it: "Sent", "3 rows changed", "No matches". */
  result?: string;
  /** Set when this specific action can still be reversed. */
  undoable?: boolean;
};

export interface ActivityTrailProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title"> {
  /** Level of the title heading, so it fits the outline of the page it's placed in. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  title?: string;
  /** Newest last, the way a person reads a story. */
  entries: TrailEntry[];
  onUndo?: (id: string) => void;
  /** Hands the whole trail to your export: CSV, JSON, a compliance system. */
  onExport?: () => void;
  exportLabel?: string;
  emptyLabel?: string;
}

const ACTOR_LABEL: Record<TrailActor, string> = {
  agent: "Agent",
  person: "Person",
  system: "System",
};

/**
 * What the agent did, why it was allowed to, and what came of it.
 *
 * Audit logs are being written into law — the EU AI Act requires high-risk systems to
 * keep logs that can reconstruct a decision, and regulated industries now expect months
 * of retention — but those logs are built for compliance teams, not for the person whose
 * inbox the agent used. This is the readable version: one line per action phrased as its
 * consequence, the authority it acted under, the result, and Undo where the action can
 * still be reversed. `onExport` hands the same records to whatever your compliance
 * process needs, so the two views never drift apart.
 *
 * Holds completely still: everything here already happened.
 */
function ActivityTrail({
  headingLevel = 3,
  title = "What happened",
  entries,
  onUndo,
  onExport,
  exportLabel = "Export",
  emptyLabel = "Nothing yet.",
  className,
  ...props
}: ActivityTrailProps) {
  const Heading = `h${headingLevel}` as "h3";
  const headingId = React.useId();

  return (
    <section
      aria-labelledby={headingId}
      className={cn("flex flex-col rounded-lg border bg-card", className)}
      {...props}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b p-4">
        <Heading id={headingId} className="text-sm font-medium text-foreground">
          {title}
        </Heading>
        {onExport ? (
          <button
            type="button"
            onClick={onExport}
            className="rounded-md text-xs font-medium text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            {exportLabel}
          </button>
        ) : null}
      </header>

      {entries.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ol className="flex flex-col">
          {entries.map((entry) => (
            <li key={entry.id} className="flex gap-3 border-b px-4 py-3 last:border-b-0">
              <span className="w-20 shrink-0 text-xs text-muted-foreground tabular-nums">{entry.time}</span>

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-sm text-foreground text-pretty">
                  <span className="text-muted-foreground">
                    {entry.actorName ?? ACTOR_LABEL[entry.actor]}
                    {" · "}
                  </span>
                  {entry.action}
                </p>
                {entry.target ? (
                  <p className="font-mono text-xs text-muted-foreground text-pretty">{entry.target}</p>
                ) : null}
                <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                  {/* The question every audit log leaves out. */}
                  {entry.authority ? <span className="text-pretty">Allowed by: {entry.authority}</span> : null}
                  {entry.result ? <span className="text-pretty">Result: {entry.result}</span> : null}
                </p>
              </div>

              {onUndo && entry.undoable ? (
                <button
                  type="button"
                  onClick={() => onUndo(entry.id)}
                  className="relative shrink-0 self-start rounded-md border border-input px-2 py-1 text-xs font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
                >
                  Undo
                </button>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export { ActivityTrail };
