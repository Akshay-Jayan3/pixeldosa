"use client";

import * as React from "react";

import { ConfidenceMeter, confidenceLabel, type ConfidenceTier } from "@/registry/confidence-meter/confidence-meter";
import { cn } from "@/lib/utils";

export type SmartFieldConfidence = ConfidenceTier;

export type SmartFieldProposal = {
  /** The complete proposed value — replaces the field's value on accept, not a tail. */
  value: string;
  confidence?: SmartFieldConfidence;
  /** Free-text source shown as "via {provenance}". Only rendered if supplied. */
  provenance?: string;
};

export type FetchProposal = (
  currentValue: string,
  signal: AbortSignal
) => Promise<SmartFieldProposal | null | undefined>;

type Status = "idle" | "loading" | "proposed" | "accepted" | "error";

export interface SmartFieldProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "value" | "onChange" | "children"> {
  /** Current field value. SmartField is controlled — there is no uncontrolled mode. */
  value: string;
  onValueChange: (value: string) => void;
  /** Fetches a proposal for the current value. Return null/undefined for "no proposal". */
  fetchProposal: FetchProposal;
  /** Fired after the user explicitly accepts a proposal. */
  onAcceptProposal?: (value: string, proposal: SmartFieldProposal) => void;
  /** Icon shown in the trigger button. No bundled icon set — supply your own, size-4 recommended. */
  triggerIcon: React.ReactNode;
  /** Accessible label for the trigger button. */
  triggerLabel?: string;
  /**
   * Fetch a proposal automatically once mounted, if `value` is empty. Off by default —
   * fetching without an explicit ask contradicts the AI tier's "nothing happens
   * unannounced" posture, but some products (e.g. Notion's Custom Agent autofill) do
   * want this, so it's an opt-in rather than cut entirely.
   */
  autoPropose?: boolean;
  /**
   * Changing this value requests a proposal. It exists so a parent can fill several
   * fields from one action — `AI Form Fill` bumps a single token and every field it
   * governs proposes at once — without this component giving up ownership of its own
   * proposal state. Ignored on first render, so mounting is never a request; use
   * `autoPropose` for that.
   */
  proposeToken?: number | string;
  /** How long the Undo affordance stays visible after accepting, in ms. */
  undoWindowMs?: number;
  wrapperClassName?: string;
}

/**
 * A single AI-proposed value for one field: request a proposal, review its confidence
 * and source, accept or reject it, and undo in one step if accepted by mistake. The
 * value never changes until the user explicitly accepts — this is the "preview before
 * commit" primitive the AI-embedded-in-product tier is built around.
 *
 * Renders a real `<input>` — `ref`, `id`, `aria-invalid` and `aria-describedby` all
 * forward onto it, so this drops directly into `<FieldControl>`.
 */
const SmartField = React.forwardRef<HTMLInputElement, SmartFieldProps>(function SmartField(
  {
    value,
    onValueChange,
    fetchProposal,
    onAcceptProposal,
    triggerIcon,
    triggerLabel = "Suggest a value with AI",
    autoPropose = false,
    proposeToken,
    undoWindowMs = 6000,
    className,
    wrapperClassName,
    id,
    ...props
  },
  forwardedRef
) {
  const [status, setStatus] = React.useState<Status>("idle");
  const [proposal, setProposal] = React.useState<SmartFieldProposal | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState("");

  const previousValueRef = React.useRef<string | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const undoTimerRef = React.useRef<number | undefined>(undefined);

  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

  const fieldId = id ?? "smart-field";

  const cancelInFlight = React.useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const clearUndoTimer = React.useCallback(() => {
    window.clearTimeout(undoTimerRef.current);
  }, []);

  React.useEffect(() => {
    return () => {
      cancelInFlight();
      clearUndoTimer();
    };
  }, [cancelInFlight, clearUndoTimer]);

  const requestProposal = React.useCallback(
    (forValue: string) => {
      cancelInFlight();
      clearUndoTimer();
      setProposal(null);
      setError(null);
      setStatus("loading");

      const controller = new AbortController();
      abortRef.current = controller;

      fetchProposal(forValue, controller.signal)
        .then((result) => {
          if (controller.signal.aborted) return;
          if (!result || !result.value) {
            setStatus("idle");
            return;
          }
          setProposal(result);
          setStatus("proposed");
          setAnnouncement(
            `Proposed value: ${result.value}.${
              result.confidence ? ` ${confidenceLabel[result.confidence]}.` : ""
            }`
          );
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          setStatus("error");
          setError(err instanceof Error ? err.message : "Couldn't get a suggestion.");
        });
    },
    [cancelInFlight, clearUndoTimer, fetchProposal]
  );

  // Auto-propose once, on mount, only for an empty field — never overrides a value the
  // user (or a prior accept) already put there.
  const autoProposeFired = React.useRef(false);
  React.useEffect(() => {
    if (!autoPropose || autoProposeFired.current || value.length > 0) return;
    autoProposeFired.current = true;
    requestProposal(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPropose]);

  // Parent-driven request. The first render is recorded rather than acted on, so simply
  // mounting with a token present is not a request — otherwise every field a parent
  // rendered would fetch immediately, which is exactly the unannounced behaviour
  // `autoPropose` exists to keep opt-in.
  const lastToken = React.useRef(proposeToken);
  React.useEffect(() => {
    if (proposeToken === undefined || proposeToken === lastToken.current) return;
    lastToken.current = proposeToken;
    requestProposal(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposeToken]);

  const dismissProposal = React.useCallback(() => {
    setProposal(null);
    setStatus("idle");
    setError(null);
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(event.target.value);

    // Manual input always wins: an in-flight fetch is now answering a question that no
    // longer matches what's on screen, and an unaccepted proposal is superseded by the
    // user just doing it themselves.
    if (status === "loading") cancelInFlight();
    if (status === "proposed" || status === "loading") {
      setProposal(null);
      setError(null);
      setStatus("idle");
    }
    if (status === "accepted") {
      clearUndoTimer();
      setStatus("idle");
      previousValueRef.current = null;
    }
  };

  const acceptProposal = () => {
    if (!proposal) return;
    previousValueRef.current = value;
    onValueChange(proposal.value);
    onAcceptProposal?.(proposal.value, proposal);
    setStatus("accepted");
    setAnnouncement(`Accepted: ${proposal.value}`);
    clearUndoTimer();
    undoTimerRef.current = window.setTimeout(() => {
      setStatus("idle");
      previousValueRef.current = null;
    }, undoWindowMs);
  };

  const undoAccept = () => {
    if (previousValueRef.current === null) return;
    onValueChange(previousValueRef.current);
    setAnnouncement("Undone.");
    clearUndoTimer();
    setStatus("idle");
    previousValueRef.current = null;
    setProposal(null);
  };

  const triggerBusy = status === "loading";
  const showProposalPanel = status === "proposed" && proposal;
  const showUndo = status === "accepted";

  return (
    <div className={cn("relative flex flex-col gap-2", wrapperClassName)}>
      <div className="relative">
        <input
          ref={inputRef}
          id={fieldId}
          type="text"
          value={value}
          onChange={handleChange}
          data-state={status === "proposed" ? "proposed" : undefined}
          className={cn(
            "h-9 w-full rounded-md border border-input bg-background px-3 pr-9 text-sm text-foreground outline-none",
            "placeholder:text-muted-foreground",
            "focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:border-ring",
            "disabled:pointer-events-none disabled:opacity-50",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
            "transition-colors duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
            "data-[state=proposed]:border-accent-foreground/30 data-[state=proposed]:bg-accent/40",
            className
          )}
          {...props}
        />

        <button
          type="button"
          aria-label={status === "error" ? "Retry AI suggestion" : triggerLabel}
          disabled={triggerBusy}
          onClick={() => requestProposal(value)}
          className={cn(
            "absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded",
            "text-muted-foreground outline-none",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:ring-[3px] focus-visible:ring-ring/40",
            "disabled:pointer-events-none disabled:opacity-50",
            "transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
            "[&_svg]:size-4",
            (status === "proposed" || status === "accepted") && "pointer-events-none opacity-0"
          )}
        >
          {triggerBusy ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-4 animate-spin">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            triggerIcon
          )}
        </button>
      </div>

      {status === "error" ? (
        <p className="flex items-center gap-2 text-sm text-destructive">
          {error}
          <button
            type="button"
            onClick={() => requestProposal(value)}
            className="font-medium underline-offset-2 hover:underline"
          >
            Retry
          </button>
        </p>
      ) : null}

      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)]",
          "motion-reduce:transition-none",
          showProposalPanel ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0">
          {showProposalPanel && proposal ? (
            <div className="flex flex-col gap-2 rounded-md border bg-muted p-3">
              <p className="text-sm text-foreground">{proposal.value}</p>
              <div className="flex flex-wrap items-center justify-between gap-2">
                {proposal.confidence ? (
                  <ConfidenceMeter confidence={proposal.confidence} provenance={proposal.provenance} />
                ) : proposal.provenance ? (
                  <span className="text-xs text-muted-foreground">via {proposal.provenance}</span>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={dismissProposal}
                    className="rounded-md border border-input px-2.5 py-1 text-xs font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={acceptProposal}
                    className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/40"
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {showUndo ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          Value accepted.
          <button
            type="button"
            onClick={undoAccept}
            className="font-medium text-foreground underline-offset-2 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            Undo
          </button>
        </p>
      ) : null}

      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
});

export { SmartField };
