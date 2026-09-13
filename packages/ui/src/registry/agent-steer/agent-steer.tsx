"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Where a steer really is. Owned by the caller, because only the agent knows whether it
 * has received and taken a redirect on board — the UI must never infer it.
 */
export type SteerStatus = "pending" | "queued" | "applied" | "declined";
export type SteerMode = "next" | "now";

export type SteerMessage = {
  id: string;
  text: string;
  mode: SteerMode;
  status: SteerStatus;
  /** Agent-supplied context: when it will apply, or why it couldn't. */
  note?: string;
};

export interface AgentSteerProps extends Omit<React.ComponentPropsWithoutRef<"div">, "onSubmit"> {
  /** Whether the agent is working. Steering only exists while there is a run to steer. */
  running: boolean;
  /** What the agent is doing now, so a redirect has something to be relative to. */
  currentStep?: string;
  steers?: SteerMessage[];
  /** One-tap redirects that fill the input for editing — never sent without the user. */
  suggestions?: string[];
  onSteer: (text: string, mode: SteerMode) => void;
  /** Take back a steer the agent hasn't applied yet. */
  onWithdraw?: (id: string) => void;
  placeholder?: string;
}

const STATUS_TEXT: Record<SteerStatus, string> = {
  pending: "Sent — waiting for the agent",
  queued: "Queued",
  applied: "Applied",
  declined: "Couldn't apply",
};

/**
 * Redirect a running agent without stopping it — "not that file, this one" — which is
 * how real use goes, and which today's agent UIs reduce to Stop or wait.
 *
 * Two choices carry the trust. First, a steer's status comes from the agent, not from
 * the moment the user pressed Enter: it reads "waiting for the agent" until the agent
 * confirms, so a redirect never appears to have taken effect when it hasn't. Second, the
 * default applies after the current step. Interrupting mid-step can leave a tool call
 * half-done, so it is a separate, deliberate control rather than the Enter key.
 */
function AgentSteer({
  running,
  currentStep,
  steers = [],
  suggestions = [],
  onSteer,
  onWithdraw,
  placeholder = "Redirect the agent…",
  className,
  ...props
}: AgentSteerProps) {
  const [draft, setDraft] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const inputId = React.useId();
  const listId = React.useId();

  const send = (mode: SteerMode) => {
    const text = draft.trim();
    if (!text || !running) return;
    onSteer(text, mode);
    setDraft("");
    inputRef.current?.focus();
  };

  const latest = steers[steers.length - 1];

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      {steers.length > 0 ? (
        <ul id={listId} aria-label="Redirects" className="flex flex-col gap-2">
          {steers.map((steer) => {
            const withdrawable = onWithdraw && (steer.status === "pending" || steer.status === "queued");
            return (
              <li key={steer.id} className="flex items-start justify-between gap-3 rounded-md border bg-card px-3 py-2">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="text-sm text-foreground text-pretty">{steer.text}</p>
                  <p className="flex flex-wrap items-center gap-x-2 text-xs">
                    <span className="text-muted-foreground">
                      {steer.mode === "now" ? "Interrupting" : "After this step"}
                    </span>
                    <span aria-hidden="true" className="text-muted-foreground">
                      ·
                    </span>
                    <span
                      className={cn(
                        steer.status === "declined" ? "text-destructive" : "text-muted-foreground",
                        steer.status === "applied" && "text-foreground",
                        // The only moving text: the one state where work is genuinely
                        // still happening on the agent's side.
                        steer.status === "pending" && "pd-shimmer"
                      )}
                    >
                      {STATUS_TEXT[steer.status]}
                      {steer.note ? `: ${steer.note}` : ""}
                    </span>
                  </p>
                </div>
                {withdrawable ? (
                  <button
                    type="button"
                    onClick={() => onWithdraw(steer.id)}
                    className="relative shrink-0 text-xs font-medium text-muted-foreground underline-offset-2 outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] after:absolute after:inset-x-0 after:-inset-y-3 after:content-[''] motion-reduce:transition-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
                  >
                    Withdraw
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      <span role="status" aria-live="polite" className="sr-only">
        {latest ? `Redirect ${STATUS_TEXT[latest.status].toLowerCase()}${latest.note ? `: ${latest.note}` : ""}` : ""}
      </span>

      {running && suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2" aria-label="Suggested redirects" role="group">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setDraft(suggestion);
                inputRef.current?.focus();
              }}
              className="relative rounded-full border border-input px-2.5 py-1 text-xs text-muted-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] after:absolute after:inset-x-0 after:-inset-y-2 after:content-[''] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send("next");
        }}
        className="flex flex-col gap-2"
      >
        <label htmlFor={inputId} className="text-xs text-muted-foreground">
          {running ? (currentStep ? `Agent is on: ${currentStep}` : "Agent is working") : "Nothing is running"}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            id={inputId}
            value={draft}
            disabled={!running}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={running ? placeholder : "Start a run to redirect it"}
            className="h-9 min-w-0 flex-1 basis-48 rounded-md border border-input bg-transparent px-3 text-base text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-50 sm:text-sm"
          />
          <button
            type="submit"
            disabled={!running || !draft.trim()}
            className="h-9 shrink-0 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50"
          >
            Steer
          </button>
          <button
            type="button"
            disabled={!running || !draft.trim()}
            onClick={() => send("now")}
            className="h-9 shrink-0 rounded-md px-2 text-sm font-medium text-muted-foreground underline-offset-2 outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50"
          >
            Interrupt now
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Steer applies after the current step. Interrupt stops it mid-step.
        </p>
      </form>
    </div>
  );
}

export { AgentSteer };
