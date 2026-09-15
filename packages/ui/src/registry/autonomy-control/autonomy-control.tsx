"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type AutonomyLevel = "ask" | "balanced" | "act";
export type ActionRisk = "low" | "medium" | "high";

export type AutonomyAction = {
  id: string;
  /** A concrete action, in the user's words: "Send an email", "Edit a draft". */
  label: string;
  risk: ActionRisk;
};

export interface AutonomyControlProps extends Omit<React.ComponentPropsWithoutRef<"div">, "onChange"> {
  /** Level of the title heading, so it fits the outline of the page it's placed in. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  level: AutonomyLevel;
  onLevelChange: (level: AutonomyLevel) => void;
  /** The agent's real actions. The level is explained through these, not in the abstract. */
  actions: AutonomyAction[];
  /** Action ids the user has pinned to "Asks first" regardless of level. */
  alwaysAsk?: string[];
  onAlwaysAskChange?: (ids: string[]) => void;
  label?: string;
}

const LEVELS: { value: AutonomyLevel; title: string; summary: string }[] = [
  { value: "ask", title: "Ask me first", summary: "Proposes everything. Nothing happens until you approve." },
  { value: "balanced", title: "Ask when it matters", summary: "Handles small, reversible things. Asks before anything bigger." },
  { value: "act", title: "Act, then tell me", summary: "Gets on with it and reports back. Still asks before anything high-risk." },
];

/**
 * The risk floor. High-risk actions ask at every level. That is not a setting, because an
 * autonomy control that can switch off the approval for an irreversible send is a trap
 * with a friendly label.
 */
function asksFirst(level: AutonomyLevel, risk: ActionRisk) {
  if (risk === "high") return true;
  if (level === "ask") return true;
  if (level === "balanced") return risk !== "low";
  return false;
}

/**
 * How much the agent may do without asking — "be less autonomous with me" — as a setting
 * you can actually read.
 *
 * Autonomy settings usually fail by being abstract: a slider from "cautious" to
 * "autonomous" tells nobody what will happen to their inbox. Here every level is
 * explained by the agent's real actions, each marked "Asks first" or "Does it, tells you",
 * so choosing a level is choosing concrete outcomes.
 *
 * Risk sets a floor the user can raise but never lower. Any action can be pinned to
 * "Always ask", and high-risk actions ask at every level. That keeps the control
 * from becoming a way to switch off the approvals that protect people.
 */
function AutonomyControl({
  level,
  onLevelChange,
  actions,
  alwaysAsk = [],
  onAlwaysAskChange,
  label = "How much the agent does on its own",
  headingLevel = 3,
  className,
  ...props
}: AutonomyControlProps) {
  const Heading = `h${headingLevel}` as "h3";
  const name = React.useId();
  const headingId = React.useId();
  const pinned = new Set(alwaysAsk);

  const togglePin = (id: string) => {
    if (!onAlwaysAskChange) return;
    onAlwaysAskChange(pinned.has(id) ? alwaysAsk.filter((value) => value !== id) : [...alwaysAsk, id]);
  };

  const unaskedCount = actions.filter((action) => !pinned.has(action.id) && !asksFirst(level, action.risk)).length;

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-foreground">{label}</legend>
        {LEVELS.map((option) => {
          const checked = option.value === level;
          return (
            <label
              key={option.value}
              className={cn(
                "relative flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/40",
                checked ? "border-foreground/40 bg-accent/60" : "hover:bg-accent/40"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onLevelChange(option.value)}
                className="mt-0.5 size-4 shrink-0 accent-[var(--foreground)] outline-none"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{option.title}</span>
                <span className="text-xs text-muted-foreground text-pretty">{option.summary}</span>
              </span>
            </label>
          );
        })}
      </fieldset>

      {actions.length > 0 ? (
        <section aria-labelledby={headingId} className="flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <Heading id={headingId} className="text-sm font-medium text-foreground">
              What that means
            </Heading>
            {/* Announced, because changing the level silently changes every row below. */}
            <p role="status" aria-live="polite" className="text-xs text-muted-foreground tabular-nums">
              {unaskedCount === 0
                ? "Asks before every action"
                : `Does ${unaskedCount} of ${actions.length} without asking`}
            </p>
          </div>
          <ul className="flex flex-col divide-y rounded-md border">
            {actions.map((action) => {
              const floor = action.risk === "high";
              const isPinned = pinned.has(action.id);
              const asks = floor || isPinned || asksFirst(level, action.risk);
              return (
                // Same two-line shape at every width: action over outcome, override on the
                // right. A wrapping row would put the outcome in a different place per row.
                <li key={action.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 px-3 py-2">
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm text-foreground text-pretty">{action.label}</span>
                    <span className={cn("text-xs", asks ? "font-medium text-foreground" : "text-muted-foreground")}>
                      {asks ? "Asks first" : "Does it, tells you"}
                    </span>
                  </span>
                  <span className="flex items-center justify-end">
                    {floor ? (
                      <span className="text-right text-xs text-muted-foreground">High risk · always asks</span>
                    ) : onAlwaysAskChange ? (
                      <label className="relative flex cursor-pointer items-center justify-end gap-1.5 text-xs text-muted-foreground after:absolute after:inset-x-0 after:-inset-y-2.5 after:content-['']">
                        <input
                          type="checkbox"
                          checked={isPinned}
                          aria-label={`Always ask before: ${action.label}`}
                          onChange={() => togglePin(action.id)}
                          className="size-3.5 accent-[var(--foreground)] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
                        />
                        Always ask
                      </label>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export { AutonomyControl };
