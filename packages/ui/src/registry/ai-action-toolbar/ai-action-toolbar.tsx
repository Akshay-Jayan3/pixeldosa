"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export type AIActionIntent = "primary" | "secondary" | "quiet";

export type AIAction = {
  id: string;
  label: string;
  /** Optional leading icon. No icon set is bundled — pass your own `size-4` icon. */
  icon?: React.ReactNode;
  /** Visual weight. Exactly one action should be `primary`. Defaults to `secondary`. */
  intent?: AIActionIntent;
  disabled?: boolean;
  /**
   * Owned by the consumer, not this component: the caller already holds the request
   * (and usually its AbortController), so the toolbar reflects that state rather than
   * keeping a second copy that can drift out of sync with it.
   */
  busy?: boolean;
};

const actionVariants = cva(
  cn(
    "relative inline-flex items-center gap-1.5 font-medium outline-none",
    // The visible control stays compact (~24px) to match the system's density, but the
    // hit area is extended vertically to ~44px by a transparent pseudo-element. Growing
    // the button itself would break the density; leaving it at 24px would break the
    // touch-target rule. Vertical only — the toolbar is a single row, so horizontal
    // expansion would erode the 6px gap between adjacent actions and invite mis-taps.
    "after:absolute after:inset-x-0 after:-inset-y-2.5 after:content-['']",
    "transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)]",
    "motion-reduce:transition-none",
    "focus-visible:ring-[3px] focus-visible:ring-ring/40",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:size-4"
  ),
  {
    variants: {
      intent: {
        primary: "rounded-md bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "rounded-md border border-input text-foreground hover:bg-accent hover:text-accent-foreground",
        quiet: "rounded-md text-foreground underline-offset-2 hover:underline",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: { intent: "secondary", size: "default" },
  }
);

export interface AIActionToolbarProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onSelect">,
    VariantProps<typeof actionVariants> {
  actions: AIAction[];
  onAction: (actionId: string) => void;
  /** Leading status text, e.g. "Changes applied." Renders before the actions. */
  message?: React.ReactNode;
  /** Accessible name for the toolbar. */
  label?: string;
}

function Spinner() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-4 animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The shared control strip for an AI-produced result — apply, explain, retry,
 * regenerate, undo, report. Visual weight runs fill → border → nothing, so the
 * recommended action stays dominant and Regenerate never out-shouts Apply.
 *
 * Implements the ARIA toolbar pattern properly: the whole strip is one tab stop and
 * arrow keys move within it, rather than the natural-tab-order approximation most
 * shipped versions of this pattern use.
 */
function AIActionToolbar({
  actions,
  onAction,
  message,
  label = "Result actions",
  size,
  className,
  ...props
}: AIActionToolbarProps) {
  const buttonRefs = React.useRef(new Map<string, HTMLButtonElement>());
  // Which action owns the toolbar's single tab stop. Kept as an id rather than an
  // index so it survives the actions array changing between renders.
  const [focusedId, setFocusedId] = React.useState<string | null>(null);

  const anyBusy = actions.some((action) => action.busy);
  // Effective disabled state, computed once: an action is unavailable either because
  // the caller disabled it, or because a *different* action is currently running.
  // Both the rendered `disabled` and the roving tab stop must agree on this — deriving
  // them separately is how the tab stop ends up parked on a disabled button.
  const isDisabled = (action: AIAction) =>
    Boolean(action.disabled) || (anyBusy && !action.busy);
  const enabled = actions.filter((action) => !isDisabled(action));

  // The roving tab stop must always point at a real, enabled action — otherwise a
  // toolbar whose first action just became disabled would have no tab stop at all.
  const tabStopId = enabled.some((action) => action.id === focusedId)
    ? focusedId
    : (enabled[0]?.id ?? null);

  const focusAction = (id: string) => {
    setFocusedId(id);
    buttonRefs.current.get(id)?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (enabled.length === 0) return;
    const current = enabled.findIndex((action) => action.id === tabStopId);

    let next: number | null = null;
    if (event.key === "ArrowRight") next = (current + 1) % enabled.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + enabled.length) % enabled.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = enabled.length - 1;

    if (next === null) return;
    event.preventDefault();
    focusAction(enabled[next]!.id);
  };

  // An empty shell helps nobody — same call as AI Context Surface.
  if (actions.length === 0 && !message) return null;

  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", className)}
      {...props}
    >
      {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}

      {actions.length > 0 ? (
        <div
          role="toolbar"
          aria-label={label}
          onKeyDown={onKeyDown}
          className="flex flex-wrap items-center gap-1.5"
        >
          {actions.map((action) => {
            const disabled = isDisabled(action);

            return (
              <button
                key={action.id}
                type="button"
                ref={(node) => {
                  if (node) buttonRefs.current.set(action.id, node);
                  else buttonRefs.current.delete(action.id);
                }}
                // Roving tabindex: one tab stop for the whole toolbar, arrows within.
                tabIndex={action.id === tabStopId ? 0 : -1}
                disabled={disabled}
                aria-busy={action.busy || undefined}
                onFocus={() => setFocusedId(action.id)}
                onClick={() => onAction(action.id)}
                className={cn(actionVariants({ intent: action.intent, size }))}
              >
                {action.busy ? <Spinner /> : action.icon}
                {action.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export { AIActionToolbar, actionVariants as aiActionToolbarVariants };
