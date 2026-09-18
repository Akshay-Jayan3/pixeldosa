"use client";

import * as React from "react";

export type ScheduleTrigger = {
  id: string;
  /**
   * When it runs, in plain words: "Every weekday at 9:00", "When an invoice arrives
   * from a new supplier". Never a cron string.
   */
  when: string;
  /** What it will do, phrased as the consequence. */
  does: string;
  enabled: boolean;
  /** Formatted by you: "Tomorrow at 9:00". Left out when it's off. */
  nextRun?: string;
  /** How the last one went: "Ran yesterday · 3 invoices matched". */
  lastRun?: string;
  /** Set when the last run had a problem, so an off-schedule failure is visible. */
  lastFailed?: boolean;
  /** Set when a run of this will pause for approval. */
  asksFirst?: boolean;
};

import { cn } from "@/lib/utils";

export interface AgentScheduleProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title"> {
  /** Level of the title heading, so it fits the outline of the page it's placed in. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  title?: string;
  triggers: ScheduleTrigger[];
  onEnabledChange: (id: string, enabled: boolean) => void;
  onEdit?: (id: string) => void;
  /** Runs one now, without waiting for its schedule. */
  onRunNow?: (id: string) => void;
  emptyLabel?: string;
}

/**
 * When the agent runs on its own, in words anyone can check.
 *
 * Scheduled and triggered agents are where trust quietly breaks: the thing that runs at
 * 9:00 every morning is the thing nobody is watching, and most products express it as a
 * cron string or a rule builder that only its author can read. So every trigger here is a
 * sentence — when it runs, what it does — with the next run, how the last one went, and
 * whether it will stop and ask. Turning one off is one control, and a failed last run is
 * visible without opening anything, because a silent schedule that has been failing for a
 * week is the worst state this surface can hide.
 *
 * Holds completely still: it's a settings surface, not a run.
 */
function AgentSchedule({
  headingLevel = 3,
  title = "When this agent runs",
  triggers,
  onEnabledChange,
  onEdit,
  onRunNow,
  emptyLabel = "Nothing scheduled. This agent only runs when you ask it to.",
  className,
  ...props
}: AgentScheduleProps) {
  const Heading = `h${headingLevel}` as "h3";
  const headingId = React.useId();
  const active = triggers.filter((trigger) => trigger.enabled).length;

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
          {active} of {triggers.length} on
        </p>
      </header>

      {triggers.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground text-pretty">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col">
          {triggers.map((trigger) => (
            <li key={trigger.id} className="flex items-start gap-3 border-b px-4 py-3 last:border-b-0">
              {/* The accessible name says which schedule this is; `aria-checked` says
                  whether it's on. Carrying the state in both read it out twice ("Every
                  weekday at 9:00 on, switch, on") and renamed the control every time
                  someone used it, so it couldn't be found again by name. */}
              <button
                type="button"
                role="switch"
                aria-checked={trigger.enabled}
                aria-label={`${trigger.when}: ${trigger.does}`}
                onClick={() => onEnabledChange(trigger.id, !trigger.enabled)}
                className="relative mt-0.5 shrink-0 rounded-md outline-none after:absolute after:-inset-2 after:content-[''] focus-visible:ring-[3px] focus-visible:ring-ring/40"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-5 w-9 items-center rounded-full border p-0.5 transition-colors duration-[var(--pd-duration-fast)] motion-reduce:transition-none",
                    trigger.enabled ? "border-foreground bg-foreground" : "border-input bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "block size-3.5 rounded-full transition-transform duration-[var(--pd-duration-fast)] motion-reduce:transition-none",
                      trigger.enabled ? "translate-x-4 bg-card" : "translate-x-0 bg-muted-foreground"
                    )}
                  />
                </span>
              </button>

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                {/* A sentence, not a cron string. */}
                <p className={cn("text-sm text-pretty", trigger.enabled ? "text-foreground" : "text-muted-foreground")}>
                  {trigger.when}
                </p>
                <p className="text-xs text-muted-foreground text-pretty">{trigger.does}</p>
                <p className="flex flex-wrap gap-x-3 text-xs">
                  {trigger.enabled && trigger.nextRun ? (
                    <span className="text-muted-foreground">Next: {trigger.nextRun}</span>
                  ) : null}
                  {trigger.lastRun ? (
                    <span className={trigger.lastFailed ? "text-agent-blocked" : "text-muted-foreground"}>
                      {trigger.lastRun}
                    </span>
                  ) : null}
                  {trigger.asksFirst ? (
                    <span className="text-agent-waiting">Stops to ask you</span>
                  ) : null}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                {onRunNow ? (
                  <button
                    type="button"
                    onClick={() => onRunNow(trigger.id)}
                    className="rounded-md border border-input px-2 py-1 text-xs font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
                  >
                    Run now
                  </button>
                ) : null}
                {onEdit ? (
                  <button
                    type="button"
                    onClick={() => onEdit(trigger.id)}
                    className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
                  >
                    Edit
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export { AgentSchedule };
