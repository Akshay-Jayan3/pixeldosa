import * as React from "react";

import { cn } from "@/lib/utils";

export interface CreditsMeterProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** What's left, formatted by you: "1,250 credits", "$18.40". */
  remaining: string;
  /** The full allowance, when there is one: "2,000 credits this month". */
  allowance?: string;
  /**
   * How much of the allowance is already spent, 0–1, measured. Renders a bar; leave it
   * out when you only have words. The bar draws what is *left*, so it empties as the
   * figure beside it falls.
   */
  used?: number;
  /**
   * What the next action will take, named and priced: the thing reviewers say is missing
   * everywhere. "4 images · 40 credits".
   */
  nextAction?: { label: string; cost: string; affordable?: boolean };
  /** When the balance resets or expires, in plain words: "Resets on 1 October". */
  resets?: string;
  /** Recent movement, including refunds: "12 refunded yesterday when a batch failed". */
  recent?: string;
  /** Set when the balance is low enough to say so. */
  low?: boolean;
  onTopUp?: () => void;
  topUpLabel?: string;
  label?: string;
}

/**
 * What's left, and what this will cost — before the click.
 *
 * Credits are the single loudest complaint in generation tools: people can't tell what an
 * action will take until it's gone, refunds are invisible, and balances expire quietly. So
 * this shows the balance, names the next action and its price together, says when the
 * balance resets, and gives refunds somewhere to appear. Every figure is formatted by the
 * caller, and the only proportion drawn is measured.
 *
 * Holds completely still.
 */
function CreditsMeter({
  remaining,
  allowance,
  used,
  nextAction,
  resets,
  recent,
  low = false,
  onTopUp,
  topUpLabel = "Top up",
  label = "Credits",
  className,
  ...props
}: CreditsMeterProps) {
  const labelId = React.useId();
  const short = nextAction?.affordable === false;

  return (
    <div
      aria-labelledby={labelId}
      role="group"
      className={cn("flex flex-col gap-2 rounded-lg border bg-card p-3", className)}
      {...props}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p id={labelId} className="text-xs text-muted-foreground">
          {label}
        </p>
        <p className={cn("text-sm font-medium tabular-nums", low ? "text-agent-waiting" : "text-foreground")}>
          {remaining}
          {allowance ? <span className="font-normal text-muted-foreground"> of {allowance}</span> : null}
        </p>
      </div>

      {/* The bar shows what is left, not what was spent: it sits directly under a figure
          that counts down, and a bar filling up beside a balance running out reads as
          "plenty left" at exactly the moment it isn't. */}
      {used !== undefined ? (
        <span aria-hidden="true" className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <span
            className={cn("block h-full rounded-full", low ? "bg-agent-waiting" : "bg-foreground")}
            style={{ width: `${Math.round((1 - Math.min(1, Math.max(0, used))) * 100)}%` }}
          />
        </span>
      ) : null}

      {nextAction ? (
        <p
          className={cn(
            "flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 rounded-md px-2 py-1.5 text-xs",
            short ? "bg-agent-blocked-soft text-agent-blocked" : "bg-muted text-muted-foreground"
          )}
        >
          <span className="text-pretty">{nextAction.label}</span>
          <span className="font-medium tabular-nums">
            {nextAction.cost}
            {short ? " · more than you have" : ""}
          </span>
        </p>
      ) : null}

      {resets || recent ? (
        <p className="text-xs text-muted-foreground text-pretty">
          {[resets, recent].filter(Boolean).join(" · ")}
        </p>
      ) : null}

      {onTopUp ? (
        <button
          type="button"
          onClick={onTopUp}
          className="self-start rounded-md border border-input px-2.5 py-1 text-xs font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          {topUpLabel}
        </button>
      ) : null}
    </div>
  );
}

export { CreditsMeter };
