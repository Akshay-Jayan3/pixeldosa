"use client";

import * as React from "react";

import { AIActionToolbar } from "@/registry/ai-action-toolbar/ai-action-toolbar";
import { cn } from "@/lib/utils";

export type PlanStep = {
  id: string;
  title: string;
  detail?: string;
  /** The step has an external effect and will stop for approval when it runs. */
  needsApproval?: boolean;
};

export interface AgentPlanProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title"> {
  /** The agent's proposed plan, in order. */
  steps: PlanStep[];
  title?: string;
  /** Runs the plan as the user left it — reordered, trimmed, or extended. */
  onRun: (steps: PlanStep[]) => void;
  onCancel?: () => void;
  /** Let the user add their own steps. */
  allowAdd?: boolean;
}

type Row = PlanStep & { removed?: boolean; addedByUser?: boolean };

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
  className,
  ...props
}: AgentPlanProps) {
  const [rows, setRows] = React.useState<Row[]>(steps);
  const [draft, setDraft] = React.useState("");
  const [announcement, setAnnouncement] = React.useState("");
  const headingId = React.useId();
  const addId = React.useId();

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
        <h3 id={headingId} className="text-sm font-medium text-foreground">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground tabular-nums">
          {active.length} {active.length === 1 ? "step" : "steps"}
          {approvals > 0 ? ` · ${approvals} will ask for approval` : ""}
          {edited ? " · edited" : ""}
        </p>
      </header>

      <ol className="flex flex-col">
        {rows.map((row, index) => {
          if (!row.removed) visibleNumber += 1;
          return (
            <li
              key={row.id}
              className="flex items-start gap-3 border-b px-4 py-3 last:border-b-0"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 w-5 shrink-0 text-right text-xs text-muted-foreground tabular-nums",
                  row.removed && "invisible"
                )}
              >
                {visibleNumber}
              </span>

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
                {row.detail && !row.removed ? (
                  <p className="text-xs text-muted-foreground text-pretty">{row.detail}</p>
                ) : null}
                {!row.removed && (row.needsApproval || row.addedByUser) ? (
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

              {row.removed ? (
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

      {allowAdd ? (
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
              onRun(active.map(({ removed: _removed, addedByUser: _added, ...step }) => step));
            }
            if (id === "cancel") onCancel?.();
          }}
        />
      </footer>

      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </section>
  );
}

export { AgentPlan };
