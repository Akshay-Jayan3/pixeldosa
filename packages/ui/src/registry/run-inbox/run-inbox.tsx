"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type RunState = "needsYou" | "running" | "scheduled" | "done" | "failed";

export type AgentRun = {
  id: string;
  /** What it was asked to do, in the user's words. */
  title: string;
  state: RunState;
  /** Which agent, if you run more than one. */
  agent?: string;
  /** Why it needs you, what it's doing, or what it produced. One line. */
  note?: string;
  /** Formatted by you: "2 minutes ago", "Tomorrow at 9:00". */
  time?: string;
  /** Not looked at yet. */
  unread?: boolean;
};

export interface RunInboxProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title" | "onSelect"> {
  /** Level of the title heading, so it fits the outline of the page it's placed in. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  title?: string;
  runs: AgentRun[];
  onOpen: (id: string) => void;
  /** Shown on a run that is still going. */
  onStop?: (id: string) => void;
  emptyLabel?: string;
}

const GROUPS: { state: RunState; label: string }[] = [
  { state: "needsYou", label: "Needs you" },
  { state: "running", label: "Working" },
  { state: "failed", label: "Stopped with a problem" },
  { state: "done", label: "Finished" },
  { state: "scheduled", label: "Scheduled" },
];

/**
 * Every run in one place, with the ones that need a person at the top.
 *
 * The way people work with background agents now is: give it a job, close the laptop,
 * come back later. An inbox is the familiar shape for that, and the familiar failure is
 * strict chronology — the run that has been waiting three hours for an answer sits below
 * the one that finished a minute ago. So this groups by what the run needs rather than
 * when it happened: anything waiting on a person comes first, whatever its age, and each
 * group carries a count so the size of the pile is visible before you scroll.
 *
 * Motion means the machine is busy: only working runs move, and rows waiting on you hold
 * completely still.
 */
function RunInbox({
  headingLevel = 3,
  title = "Runs",
  runs,
  onOpen,
  onStop,
  emptyLabel = "No runs yet. Anything you start will land here.",
  className,
  ...props
}: RunInboxProps) {
  const Heading = `h${headingLevel}` as "h3";
  // Group headings sit one level below the section title, so the page outline never skips.
  const GroupHeading = `h${Math.min(6, headingLevel + 1)}` as "h4";
  const headingId = React.useId();
  const waiting = runs.filter((run) => run.state === "needsYou").length;

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
        <p className="text-xs text-muted-foreground tabular-nums">
          {waiting > 0 ? `${waiting} waiting on you · ` : ""}
          {runs.length} in total
        </p>
      </header>

      {runs.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground text-pretty">{emptyLabel}</p>
      ) : (
        GROUPS.map((group) => {
          const rows = runs.filter((run) => run.state === group.state);
          if (rows.length === 0) return null;
          return (
            <div key={group.state} className="flex flex-col">
              <GroupHeading className="flex items-baseline gap-2 border-b bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground">
                {group.label}
                <span className="tabular-nums">{rows.length}</span>
              </GroupHeading>
              <ul className="flex flex-col">
                {rows.map((run) => (
                  <li key={run.id} className="flex items-start gap-3 border-b px-4 py-3 last:border-b-0">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        run.state === "needsYou"
                          ? "bg-agent-waiting"
                          : run.state === "running"
                            ? "bg-agent-working animate-[pd-cell-pulse_1.6s_ease-in-out_infinite] motion-reduce:animate-none"
                            : run.state === "failed"
                              ? "bg-agent-blocked"
                              : run.state === "done"
                                ? "bg-agent-done"
                                : "bg-muted-foreground"
                      )}
                    />

                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => onOpen(run.id)}
                        className={cn(
                          "relative rounded-sm text-left text-sm text-foreground outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40",
                          run.unread && "font-medium"
                        )}
                      >
                        {run.title}
                        {run.unread ? <span className="sr-only"> (not opened yet)</span> : null}
                      </button>
                      {run.note ? (
                        <p className="text-xs text-muted-foreground text-pretty">{run.note}</p>
                      ) : null}
                      {run.agent || run.time ? (
                        <p className="text-xs text-muted-foreground">
                          {[run.agent, run.time].filter(Boolean).join(" · ")}
                        </p>
                      ) : null}
                    </div>

                    {onStop && run.state === "running" ? (
                      <button
                        type="button"
                        onClick={() => onStop(run.id)}
                        className="relative shrink-0 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground underline-offset-2 outline-none after:absolute after:inset-x-0 after:-inset-y-2 after:content-[''] hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
                      >
                        Stop
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      )}
    </section>
  );
}

export { RunInbox };
