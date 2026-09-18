"use client";

import * as React from "react";

import { ConfidenceMeter, type ConfidenceTier } from "@/registry/confidence-meter/confidence-meter";
import { cn } from "@/lib/utils";

/** One thing the run will spend on, in the user's words. */
export type CostItem = {
  id: string;
  /** "Reads 240 pages", "12 image generations". */
  label: string;
  /** What it costs, already formatted by you: "$0.40", "120 credits", "~2 min". */
  amount?: string;
  detail?: string;
};

export type CostRange = {
  /** Formatted by you, in your currency or unit: "$1.20", "600 credits". */
  low: string;
  /** Leave out for a single figure you're sure of. */
  high?: string;
};

export interface CostEstimateProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title"> {
  /** Level of the title heading, so it fits the outline of the page it's placed in. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  title?: string;
  /** What the run is, in the user's words: "Research the top 5 competitors". */
  task?: string;
  /** What it will spend. A range is the honest shape of an estimate. */
  cost: CostRange;
  /** How long it will take: "about 3 to 5 minutes". Plain words, not a countdown. */
  duration?: string;
  /**
   * How good the estimate is. Tiers, never a percentage: an estimate that claims
   * precision it doesn't have is worse than no estimate.
   */
  confidence?: ConfidenceTier;
  /** Where the estimate comes from: "your last 20 runs". */
  basis?: string;
  /** What the spend is made of. Shown as a short list, never a chart. */
  items?: CostItem[];
  /** What's left, if the user has a budget or a credit balance. */
  balance?: {
    /** "1,250 credits left", "$18.40 of $50 left". */
    label: string;
    /** 0–1, measured. Renders a bar; leave it out when you only have words. */
    used?: number;
    /** Set when this run would take them past their budget. */
    exceeds?: boolean;
  };
  runLabel?: string;
  onRun?: () => void;
  onCancel?: () => void;
  /** "Use a cheaper model", "Narrow the sources". */
  adjustLabel?: string;
  onAdjust?: () => void;
}

/**
 * What a run will cost and how long it will take, before it starts.
 *
 * People decide whether to let an agent run on two numbers nobody usually shows them:
 * money and time. The component's whole job is to state both honestly. Estimates are a
 * **range**, not a single confident figure; the confidence is a tier rather than a
 * percentage; the basis is named ("from your last 20 runs"), so the number can be
 * judged rather than taken on faith; and a run that would exceed the remaining budget
 * says so before the button, not after.
 *
 * Holds completely still: this is the user's turn.
 */
function CostEstimate({
  headingLevel = 3,
  title = "Before this runs",
  task,
  cost,
  duration,
  confidence,
  basis,
  items,
  balance,
  runLabel = "Run it",
  onRun,
  onCancel,
  adjustLabel,
  onAdjust,
  className,
  ...props
}: CostEstimateProps) {
  const Heading = `h${headingLevel}` as "h3";
  const headingId = React.useId();
  const amount = cost.high ? `${cost.low} to ${cost.high}` : cost.low;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("flex flex-col rounded-lg border bg-card", className)}
      {...props}
    >
      <header className="flex flex-col gap-1 border-b p-4">
        <Heading id={headingId} className="text-sm font-medium text-foreground">
          {title}
        </Heading>
        {task ? <p className="text-sm text-muted-foreground text-pretty">{task}</p> : null}
      </header>

      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
          <p className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Estimated cost</span>
            <span className="text-2xl font-medium text-foreground tabular-nums">{amount}</span>
          </p>
          {duration ? (
            <p className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Estimated time</span>
              <span className="text-2xl font-medium text-foreground">{duration}</span>
            </p>
          ) : null}
        </div>

        {confidence ? <ConfidenceMeter confidence={confidence} provenance={basis} /> : null}
        {!confidence && basis ? <p className="text-xs text-muted-foreground">Based on {basis}</p> : null}

        {items && items.length > 0 ? (
          <ul className="flex flex-col divide-y rounded-md border">
            {items.map((item) => (
              <li key={item.id} className="flex items-baseline justify-between gap-4 px-3 py-2">
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm text-foreground text-pretty">{item.label}</span>
                  {item.detail ? (
                    <span className="text-xs text-muted-foreground text-pretty">{item.detail}</span>
                  ) : null}
                </span>
                {item.amount ? (
                  <span className="shrink-0 text-sm text-muted-foreground tabular-nums">{item.amount}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        {balance ? (
          <div className="flex flex-col gap-1.5">
            {/* Measured, so a proportion is honest here — unlike the estimate above. */}
            {balance.used !== undefined ? (
              <span aria-hidden="true" className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <span
                  className={cn(
                    "block h-full rounded-full",
                    balance.exceeds ? "bg-agent-blocked" : "bg-foreground"
                  )}
                  style={{ width: `${Math.round(Math.min(1, Math.max(0, balance.used)) * 100)}%` }}
                />
              </span>
            ) : null}
            <p
              className={cn(
                "text-xs",
                balance.exceeds ? "font-medium text-agent-blocked" : "text-muted-foreground"
              )}
            >
              {balance.label}
              {balance.exceeds ? " · this run would go over it" : ""}
            </p>
          </div>
        ) : null}
      </div>

      {onRun || onCancel || onAdjust ? (
        <footer className="flex flex-wrap items-center gap-2 border-t p-4">
          {onRun ? (
            <button
              type="button"
              onClick={onRun}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              {runLabel}
            </button>
          ) : null}
          {onAdjust && adjustLabel ? (
            <button
              type="button"
              onClick={onAdjust}
              className="rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              {adjustLabel}
            </button>
          ) : null}
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="relative rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground underline-offset-2 outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              Cancel
            </button>
          ) : null}
          <p className="w-full text-xs text-muted-foreground text-pretty sm:w-auto sm:flex-1 sm:text-right">
            An estimate, not a quote.
          </p>
        </footer>
      ) : null}
    </section>
  );
}

export { CostEstimate };
