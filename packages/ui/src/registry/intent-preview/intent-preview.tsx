"use client";

import * as React from "react";

import { AIActionToolbar, type AIAction } from "@/registry/ai-action-toolbar/ai-action-toolbar";
import { cn } from "@/lib/utils";

export type IntentAssumption = {
  id: string;
  /** What the agent had to decide, e.g. "Dataset". */
  label: string;
  /** The agent's best guess. */
  value: string;
  /** Other reasonable readings. When present, the guess can be corrected in place. */
  options?: string[];
};

export interface IntentPreviewProps extends React.ComponentPropsWithoutRef<"section"> {
  /** The request restated as the agent understood it — one plain sentence. */
  interpretation: string;
  /** The guesses the agent made to fill gaps in the request. */
  assumptions?: IntentAssumption[];
  /** What the agent will deliberately not do. Boundaries are part of intent. */
  boundaries?: string[];
  onStart: (values: Record<string, string>) => void;
  /** Send the user back to rephrase the request. */
  onRephrase?: () => void;
  onCancel?: () => void;
  startLabel?: string;
}

/**
 * The agent restates what it understood — and the guesses it made — before any work
 * starts.
 *
 * A model that misreads a request early builds every later step on the mistake, so the
 * cheapest correction in an agentic run is the first one. The guesses arrive already
 * filled in: when they are right, confirming costs a single click; when one is wrong, it
 * is corrected in place rather than by rewriting the prompt.
 *
 * Distinct from Agent Ask, which blocks until the user supplies something the agent
 * cannot guess. This is for when the agent *could* proceed, and being wrong would be
 * expensive. Holds perfectly still — it is the user's turn.
 */
function IntentPreview({
  interpretation,
  assumptions = [],
  boundaries = [],
  onStart,
  onRephrase,
  onCancel,
  startLabel = "Start",
  className,
  ...props
}: IntentPreviewProps) {
  const [values, setValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(assumptions.map((assumption) => [assumption.id, assumption.value]))
  );
  const headingId = React.useId();

  const changedCount = assumptions.filter((assumption) => values[assumption.id] !== assumption.value).length;

  const actions: AIAction[] = [
    { id: "start", label: changedCount > 0 ? `${startLabel} with changes` : startLabel, intent: "primary" },
    ...(onRephrase ? [{ id: "rephrase", label: "Rephrase", intent: "quiet" as const }] : []),
    ...(onCancel ? [{ id: "cancel", label: "Cancel", intent: "quiet" as const }] : []),
  ];

  return (
    <section
      aria-labelledby={headingId}
      className={cn("flex flex-col gap-4 rounded-lg border bg-card p-4", className)}
      {...props}
    >
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-muted-foreground">Here&apos;s what I&apos;ll do</p>
        <h3 id={headingId} className="text-sm font-medium text-foreground text-pretty">
          {interpretation}
        </h3>
      </div>

      {assumptions.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">I assumed</p>
          <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
            {assumptions.map((assumption) => {
              const changed = values[assumption.id] !== assumption.value;
              return (
                <React.Fragment key={assumption.id}>
                  <dt className="text-xs text-muted-foreground">{assumption.label}</dt>
                  <dd className="flex min-w-0 items-center gap-2">
                    {assumption.options && assumption.options.length > 0 ? (
                      <select
                        aria-label={assumption.label}
                        value={values[assumption.id]}
                        onChange={(event) =>
                          setValues((previous) => ({ ...previous, [assumption.id]: event.target.value }))
                        }
                        // A native select: correct on every input method, and on phones it
                        // opens the platform picker rather than a tiny custom dropdown.
                        className="h-8 min-w-0 max-w-full truncate rounded-md border border-input bg-transparent px-2 text-base text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:text-sm"
                      >
                        {[assumption.value, ...assumption.options.filter((option) => option !== assumption.value)].map(
                          (option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          )
                        )}
                      </select>
                    ) : (
                      <span className="truncate text-foreground">{assumption.value}</span>
                    )}
                    {changed ? (
                      <span className="shrink-0 text-xs text-muted-foreground">changed</span>
                    ) : null}
                  </dd>
                </React.Fragment>
              );
            })}
          </dl>
        </div>
      ) : null}

      {boundaries.length > 0 ? (
        <div className="flex flex-col gap-1.5 border-t pt-3">
          <p className="text-xs text-muted-foreground">I won&apos;t</p>
          <ul className="flex flex-col gap-1 text-sm text-foreground">
            {boundaries.map((boundary) => (
              <li key={boundary} className="flex gap-2">
                <span aria-hidden="true" className="text-muted-foreground">
                  –
                </span>
                {boundary}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <AIActionToolbar
        label="Confirm intent"
        actions={actions}
        onAction={(id) => {
          if (id === "start") onStart(values);
          if (id === "rephrase") onRephrase?.();
          if (id === "cancel") onCancel?.();
        }}
      />
    </section>
  );
}

export { IntentPreview };
