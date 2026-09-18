"use client";

import * as React from "react";

import { AIActionToolbar } from "@/registry/ai-action-toolbar/ai-action-toolbar";
import { cn } from "@/lib/utils";

/**
 * How a step is going once the plan runs. Leave it unset while the plan is still a
 * proposal: the first step that carries a status switches the component into its
 * running view, where the plan is a record rather than something to edit.
 */
export type PlanStepStatus = "pending" | "running" | "waiting" | "done" | "failed" | "skipped";

export type PlanStep = {
  id: string;
  title: string;
  detail?: string;
  /** The step has an external effect and will stop for approval when it runs. */
  needsApproval?: boolean;
  status?: PlanStepStatus;
  /** What happened, for a step that's running, waiting, failed or skipped. */
  note?: string;
};

export interface AgentPlanProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title"> {
  /** Level of the title heading, so it fits the outline of the page it's placed in. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** The agent's proposed plan, in order. */
  steps: PlanStep[];
  title?: string;
  /** Runs the plan as the user left it — reordered, trimmed, or extended. */
  onRun: (steps: PlanStep[]) => void;
  onCancel?: () => void;
  /** Let the user add their own steps. */
  allowAdd?: boolean;
  /**
   * Shown while the plan runs, beside the progress count — the one thing happening right
   * now, in the caller's words ("Reading pricing pages").
   */
  runStatus?: string;
  /** Shown throughout the run, never hidden behind a hover. */
  onStop?: () => void;
  /** Offered on a failed step. */
  onRetryStep?: (stepId: string) => void;
}

type Row = PlanStep & { removed?: boolean; addedByUser?: boolean };

const RUN_LABEL: Record<PlanStepStatus, string> = {
  pending: "Not started",
  running: "Running",
  waiting: "Waiting for you",
  done: "Done",
  failed: "Failed",
  skipped: "Skipped",
};

/**
 * The step's state as a mark, in the place the step number occupies before the run.
 * Motion belongs to the machine: only `running` moves, and `waiting` — the user's turn —
 * holds still in the waiting colour.
 */
function StepMark({ status, number }: { status: PlanStepStatus; number: number }) {
  if (status === "done") {
    return (
      <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
        <svg viewBox="0 0 16 16" fill="none" className="size-4 text-foreground">
          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-agent-blocked text-[0.6875rem] font-semibold leading-none text-card"
      >
        !
      </span>
    );
  }
  if (status === "running") {
    return (
      <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
        <span className="block size-2.5 rounded-full bg-agent-working animate-[pd-cell-pulse_1.4s_ease-in-out_infinite] motion-reduce:animate-none" />
      </span>
    );
  }
  if (status === "waiting") {
    return (
      <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
        <span className="block size-2.5 rounded-full bg-agent-waiting" />
      </span>
    );
  }
  if (status === "skipped") {
    return (
      <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-muted-foreground">
        –
      </span>
    );
  }
  return (
    <span aria-hidden="true" className="mt-0.5 w-5 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
      {number}
    </span>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      // 32px visible, 44px tall hit area. Expanded vertically only: these sit side by side,
      // and overlapping hit areas horizontally would turn a near-miss into the wrong action.
      className="relative inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-[''] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-30"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
        {children}
      </svg>
    </button>
  );
}

/**
 * The agent's plan, laid out for agreement before anything runs: reorder a step, remove
 * one, or add your own.
 *
 * Plans are where an agent's misunderstanding becomes visible while it is still free to
 * fix. Once execution starts, a wrong step costs a tool call, a side effect, or a cancel
 * and restart. This component is the agreement; Task Plan Runner is the execution.
 *
 * Removing a step never deletes it outright — it stays in place, struck through, with
 * Undo — because a plan edit that cannot be seen or reversed is exactly the kind of
 * silent change this system exists to prevent. Holds still: the user's turn.
 */
function AgentPlan({
  steps,
  title = "Proposed plan",
  onRun,
  onCancel,
  allowAdd = true,
  runStatus,
  onStop,
  onRetryStep,
  headingLevel = 3,
  className,
  ...props
}: AgentPlanProps) {
  const Heading = `h${headingLevel}` as "h3";
  const [rows, setRows] = React.useState<Row[]>(steps);
  const [draft, setDraft] = React.useState("");
  const [announcement, setAnnouncement] = React.useState("");
  const headingId = React.useId();
  const addId = React.useId();

  // The run has started as soon as the caller gives any step a status past "pending".
  const running = steps.some((step) => step.status && step.status !== "pending");
  const done = steps.filter((step) => step.status === "done" || step.status === "skipped").length;
  const failed = steps.some((step) => step.status === "failed");
  const yourTurn = steps.some((step) => step.status === "waiting");
  const finished = running && steps.every((step) => step.status && !["pending", "running", "waiting"].includes(step.status));

  // Announce each step as it finishes, not each render: a status that hasn't changed
  // must never speak again.
  const spoken = React.useRef<Record<string, PlanStepStatus | undefined>>({});
  // Was this component on screen before the run began?
  const sawProposal = React.useRef(false);
  const primed = React.useRef(false);

  React.useEffect(() => {
    if (!running) {
      sawProposal.current = true;
      return;
    }
    // Everything that happens after the run starts is news, including a step whose very
    // first status is `waiting` — the one announcement that asks for a person. But a
    // component mounted into a run already under way must not read the whole history
    // out at once, so in that case the first pass records silently.
    const speak = sawProposal.current || primed.current;
    for (const step of steps) {
      const previous = spoken.current[step.id];
      if (step.status && step.status !== previous) {
        spoken.current[step.id] = step.status;
        if (speak && ["done", "failed", "skipped", "waiting"].includes(step.status)) {
          setAnnouncement(`${step.title}: ${RUN_LABEL[step.status].toLowerCase()}.`);
        }
      }
    }
    primed.current = true;
  }, [steps, running]);

  const active = rows.filter((row) => !row.removed);
  const approvals = active.filter((row) => row.needsApproval).length;
  const edited =
    rows.some((row) => row.removed || row.addedByUser) ||
    active.map((row) => row.id).join() !== steps.map((step) => step.id).join();

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target]!, next[index]!];
    setRows(next);
    // Announce the position a sighted user sees, which skips removed steps.
    const position = next.slice(0, target + 1).filter((row) => !row.removed).length;
    setAnnouncement(`Moved “${rows[index]!.title}” to step ${position}.`);
  };

  const setRemoved = (id: string, removed: boolean) => {
    setRows((previous) => previous.map((row) => (row.id === id ? { ...row, removed } : row)));
    const row = rows.find((candidate) => candidate.id === id);
    setAnnouncement(`${removed ? "Removed" : "Restored"} “${row?.title}”.`);
  };

  const addStep = () => {
    const titleText = draft.trim();
    if (!titleText) return;
    setRows((previous) => [
      ...previous,
      { id: `user-${Date.now()}`, title: titleText, addedByUser: true },
    ]);
    setDraft("");
    setAnnouncement(`Added “${titleText}” as the last step.`);
  };

  let visibleNumber = 0;

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
        {running ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="tabular-nums">
              {done} of {steps.length} done
            </span>
            {runStatus && !finished ? (
              <span className={cn("text-foreground", !yourTurn && "pd-shimmer")}>{runStatus}</span>
            ) : null}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground tabular-nums">
            {active.length} {active.length === 1 ? "step" : "steps"}
            {approvals > 0 ? ` · ${approvals} will ask for approval` : ""}
            {edited ? " · edited" : ""}
          </p>
        )}
      </header>

      {running ? (
        // Real progress, so a proportion is honest here: it counts finished steps, never
        // an invented percentage.
        <div className="h-0.5 w-full bg-muted" aria-hidden="true">
          <div
            className={cn(
              "h-full transition-[width] duration-[var(--pd-duration-slow)] ease-[var(--pd-ease-decelerate)] motion-reduce:transition-none",
              failed ? "bg-agent-blocked" : finished ? "bg-agent-done" : "bg-agent-working"
            )}
            style={{ width: `${Math.round((done / Math.max(1, steps.length)) * 100)}%` }}
          />
        </div>
      ) : null}

      <ol className="flex flex-col">
        {(running ? (steps as Row[]) : rows).map((row, index) => {
          if (!row.removed) visibleNumber += 1;
          const status = row.status ?? "pending";
          const isCurrent = running && (status === "running" || status === "waiting");
          return (
            <li
              key={row.id}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex items-start gap-3 border-b px-4 py-3 last:border-b-0",
                isCurrent && (status === "waiting" ? "bg-agent-waiting-soft" : "bg-agent-working-soft")
              )}
            >
              {running ? (
                <StepMark status={status} number={visibleNumber} />
              ) : (
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 w-5 shrink-0 text-right text-xs text-muted-foreground tabular-nums",
                    row.removed && "invisible"
                  )}
                >
                  {visibleNumber}
                </span>
              )}

              <div className={cn("flex min-w-0 flex-1 flex-col gap-0.5", row.removed && "opacity-55")}>
                <p
                  className={cn(
                    "text-sm text-foreground text-pretty",
                    row.removed && "line-through decoration-muted-foreground/60"
                  )}
                >
                  {row.title}
                  {row.removed ? <span className="sr-only"> (removed)</span> : null}
                </p>
                {row.detail && !row.removed && (!running || isCurrent) ? (
                  <p className="text-xs text-muted-foreground text-pretty">{row.detail}</p>
                ) : null}
                {running ? (
                  <p className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted-foreground">
                    <span
                      className={cn(
                        status === "failed" && "text-agent-blocked",
                        status === "waiting" && "text-agent-waiting",
                        status === "done" && "text-agent-done"
                      )}
                    >
                      {RUN_LABEL[status]}
                    </span>
                    {row.note ? <span className="text-pretty">{row.note}</span> : null}
                  </p>
                ) : null}
                {!running && !row.removed && (row.needsApproval || row.addedByUser) ? (
                  <p className="flex flex-wrap gap-2 pt-0.5">
                    {row.needsApproval ? (
                      <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                        Asks for approval
                      </span>
                    ) : null}
                    {row.addedByUser ? (
                      <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                        Added by you
                      </span>
                    ) : null}
                  </p>
                ) : null}
              </div>

              {running ? (
                status === "failed" && onRetryStep ? (
                  <AIActionToolbar
                    size="sm"
                    label={`Retry ${row.title}`}
                    actions={[{ id: "retry", label: "Retry", intent: "secondary" }]}
                    onAction={() => onRetryStep(row.id)}
                    className="shrink-0"
                  />
                ) : null
              ) : row.removed ? (
                <AIActionToolbar
                  size="sm"
                  label={`Restore ${row.title}`}
                  actions={[{ id: "undo", label: "Undo", intent: "quiet" }]}
                  onAction={() => setRemoved(row.id, false)}
                  className="shrink-0"
                />
              ) : (
                <div role="group" aria-label={`Edit step: ${row.title}`} className="flex shrink-0 items-center gap-1.5">
                  <IconButton label={`Move “${row.title}” up`} disabled={index === 0} onClick={() => move(index, -1)}>
                    <path d="M12 19V5m0 0-6 6m6-6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </IconButton>
                  <IconButton
                    label={`Move “${row.title}” down`}
                    disabled={index === rows.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <path d="M12 5v14m0 0 6-6m-6 6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </IconButton>
                  <IconButton label={`Remove “${row.title}”`} onClick={() => setRemoved(row.id, true)}>
                    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </IconButton>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {allowAdd && !running ? (
        <form
          className="flex items-center gap-2 border-t px-4 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            addStep();
          }}
        >
          <label htmlFor={addId} className="sr-only">
            Add a step
          </label>
          <input
            id={addId}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a step…"
            className="h-9 min-w-0 flex-1 rounded-md border border-input bg-transparent px-3 text-base text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:text-sm"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="relative h-9 shrink-0 rounded-md border border-input px-3 text-sm font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50"
          >
            Add
          </button>
        </form>
      ) : null}

      {running ? (
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
          <p className="text-sm text-foreground text-pretty">
            {finished
              ? failed
                ? "Finished with a step that failed."
                : "All steps done."
              : yourTurn
                ? "Waiting for you."
                : "Working through the plan."}
          </p>
          {onStop && !finished ? (
            <AIActionToolbar
              label="Run controls"
              actions={[{ id: "stop", label: "Stop", intent: "quiet" }]}
              onAction={() => onStop()}
            />
          ) : null}
        </footer>
      ) : (
      <footer className="border-t p-4">
        <AIActionToolbar
          label="Run plan"
          actions={[
            {
              id: "run",
              label: edited ? "Run edited plan" : "Run plan",
              intent: "primary",
              disabled: active.length === 0,
            },
            ...(onCancel ? [{ id: "cancel", label: "Cancel", intent: "quiet" as const }] : []),
          ]}
          onAction={(id) => {
            if (id === "run") {
              // The caller gets the plan, not this component's bookkeeping.
              onRun(
                active.map((row) => {
                  const step: Row = { ...row };
                  delete step.removed;
                  delete step.addedByUser;
                  return step;
                })
              );
            }
            if (id === "cancel") onCancel?.();
          }}
        />
      </footer>
      )}

      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </section>
  );
}

export { AgentPlan };
