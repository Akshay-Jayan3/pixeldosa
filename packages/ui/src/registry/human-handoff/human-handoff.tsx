"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type HandoffStage = "agentHandling" | "waitingForPerson" | "personHandling" | "returnedToAgent";

export type HandoffFact = {
  id: string;
  /** "Customer", "Order", "Tried already". */
  label: string;
  value: string;
};

export interface HumanHandoffProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title"> {
  /** Level of the title heading, so it fits the outline of the page it's placed in. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  title?: string;
  stage: HandoffStage;
  /** Why the agent is stepping back, in its own words. */
  reason?: string;
  /** What the person receives: the facts they'd otherwise have to ask for again. */
  context?: HandoffFact[];
  /** Who has it now, once a person took over: "Dana in support". */
  person?: string;
  /** How long the person has been waiting, formatted by you. */
  waitingFor?: string;
  onTakeOver?: () => void;
  takeOverLabel?: string;
  onReturnToAgent?: () => void;
  returnLabel?: string;
}

const STAGE_TEXT: Record<HandoffStage, string> = {
  agentHandling: "The agent is handling this.",
  waitingForPerson: "Waiting for a person to take over.",
  personHandling: "A person has taken over.",
  returnedToAgent: "Handed back to the agent.",
};

/**
 * When a person takes over from the agent — and what they're handed.
 *
 * Handoffs usually lose everything: the customer repeats themselves, the person taking
 * over re-reads a transcript to find three facts, and nobody records what the agent
 * already tried. So the useful part of this component isn't the button, it's the
 * context: the facts a person would otherwise ask for again, stated as a short list, with
 * the reason the agent stepped back. The handoff also works in both directions, because a
 * person finishing a job and returning it to the agent is the half that products forget.
 *
 * Holds completely still while it waits: it's a person's turn.
 */
function HumanHandoff({
  headingLevel = 3,
  title = "Handover",
  stage,
  reason,
  context,
  person,
  waitingFor,
  onTakeOver,
  takeOverLabel = "Take over",
  onReturnToAgent,
  returnLabel = "Hand back to the agent",
  className,
  ...props
}: HumanHandoffProps) {
  const Heading = `h${headingLevel}` as "h3";
  const headingId = React.useId();
  const waiting = stage === "waitingForPerson";

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-4",
        waiting && "border-[1.5px] border-agent-waiting bg-agent-waiting-soft",
        className
      )}
      {...props}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Heading id={headingId} className="text-sm font-medium text-foreground">
          {title}
        </Heading>
        <p className="text-xs text-muted-foreground">
          {STAGE_TEXT[stage]}
          {waiting && waitingFor ? ` ${waitingFor}.` : ""}
          {stage === "personHandling" && person ? ` ${person}.` : ""}
        </p>
      </div>

      {reason ? <p className="text-sm text-foreground text-pretty">{reason}</p> : null}

      {context && context.length > 0 ? (
        <dl className="grid gap-x-4 gap-y-1.5 rounded-md border bg-card p-3 text-xs sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)]">
          {context.map((fact) => (
            <React.Fragment key={fact.id}>
              <dt className="text-muted-foreground">{fact.label}</dt>
              <dd className="text-foreground text-pretty">{fact.value}</dd>
            </React.Fragment>
          ))}
        </dl>
      ) : null}

      {onTakeOver || onReturnToAgent ? (
        <div className="flex flex-wrap gap-2">
          {onTakeOver && stage !== "personHandling" ? (
            <button
              type="button"
              onClick={onTakeOver}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              {takeOverLabel}
            </button>
          ) : null}
          {onReturnToAgent && stage === "personHandling" ? (
            <button
              type="button"
              onClick={onReturnToAgent}
              className="rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              {returnLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export { HumanHandoff };
