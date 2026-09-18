"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type GenerationJobStatus = "queued" | "running" | "partial" | "done" | "failed" | "cancelled";

export interface GenerationJobProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title"> {
  /** Level of the title heading, so it fits the outline of the page it's placed in. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  status: GenerationJobStatus;
  /** What is being made, in the user's words: "4 product images, 1024×1024". */
  title: string;
  /**
   * Where it sits in the queue, and what the wait usually is at this moment — the thing
   * every generation tool hides. Both optional: say what you know, not what you guess.
   */
  queue?: { position?: number; typicalWait?: string };
  /** The current stage: "Rendering frame 12 of 48". Replaced as work moves on. */
  stage?: string;
  /**
   * Measured progress, 0–1. Leave it out while the extent is unknown: an invented bar is
   * the fake this component exists to avoid.
   */
  progress?: number;
  /** When the job started. The elapsed counter ticks internally. */
  startedAt?: number | Date;
  /** What it costs, formatted by you: "12 credits". */
  cost?: string;
  /** Your refund rule, stated before it fails: "Credits come back if it fails". */
  refundNote?: string;
  /** Finished outputs. Show them as they land, never only at the end. */
  children?: React.ReactNode;
  /** Why it failed, in plain words, plus what happened to the money. */
  error?: { message: string; refunded?: string };
  /** Lets someone leave: long jobs shouldn't hold a person at the screen. */
  notify?: boolean;
  onNotifyChange?: (notify: boolean) => void;
  notifyLabel?: string;
  onCancel?: () => void;
  onRetry?: () => void;
}

const STATUS_WORD: Record<GenerationJobStatus, string> = {
  queued: "In the queue",
  running: "Generating",
  partial: "Some are ready",
  done: "Done",
  failed: "Failed",
  cancelled: "Stopped",
};

const ACTIVE: GenerationJobStatus[] = ["queued", "running", "partial"];

function formatElapsed(ms: number) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

/**
 * A generation that takes minutes, told honestly.
 *
 * Every complaint about image and video tools lands here: people wait in a queue with no
 * idea how long, watch a progress bar that means nothing, lose credits to a failure with
 * no explanation, and can't leave the tab. So this component says where the job sits in
 * the queue and what the wait usually is, shows a bar **only** when progress is measured,
 * surfaces finished outputs the moment they exist rather than at the end, states the
 * refund rule before a failure and what happened to the money after one, and offers to
 * notify instead of asking someone to watch a spinner.
 *
 * Motion means the machine is busy: the stage shimmers while it works and everything
 * stops the moment the job ends.
 */
function GenerationJob({
  headingLevel = 3,
  status,
  title,
  queue,
  stage,
  progress,
  startedAt,
  cost,
  refundNote,
  children,
  error,
  notify,
  onNotifyChange,
  notifyLabel = "Tell me when it's done",
  onCancel,
  onRetry,
  className,
  ...props
}: GenerationJobProps) {
  const Heading = `h${headingLevel}` as "h3";
  const headingId = React.useId();
  const active = ACTIVE.includes(status);
  const started = startedAt === undefined ? undefined : startedAt instanceof Date ? startedAt.getTime() : startedAt;

  // Null until the browser has it. Reading the clock during render made the server and
  // the client disagree whenever a second ticked over between them, and React threw the
  // server's markup away over a counter.
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!active || started === undefined) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active, started]);

  const elapsed =
    started === undefined || now === null ? null : formatElapsed(Math.max(0, now - started));

  const measured = progress !== undefined && status === "running";

  return (
    <section
      aria-labelledby={headingId}
      className={cn("flex flex-col rounded-lg border bg-card", className)}
      {...props}
    >
      <header className="flex flex-col gap-2 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <Heading id={headingId} className="text-sm font-medium text-foreground text-pretty">
            {title}
          </Heading>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              aria-hidden="true"
              className={cn(
                "size-2 rounded-full",
                status === "failed"
                  ? "bg-agent-blocked"
                  : status === "done"
                    ? "bg-agent-done"
                    : status === "cancelled"
                      ? "bg-muted-foreground"
                      : "bg-agent-working",
                active && "animate-[pd-cell-pulse_1.6s_ease-in-out_infinite] motion-reduce:animate-none"
              )}
            />
            {STATUS_WORD[status]}
            {elapsed && active ? <span className="tabular-nums">· {elapsed}</span> : null}
          </p>
        </div>

        {/* What someone waiting actually wants to know. */}
        {status === "queued" ? (
          <p className="text-sm text-muted-foreground text-pretty">
            {queue?.position !== undefined ? `Number ${queue.position} in the queue. ` : ""}
            {queue?.typicalWait ? `Usually ${queue.typicalWait} at this time.` : "It will start as soon as there's capacity."}
          </p>
        ) : null}

        {status === "running" && stage ? (
          <p className="text-sm">
            <span className="pd-shimmer text-foreground">{stage}</span>
          </p>
        ) : null}

        {measured ? (
          <span aria-hidden="true" className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-agent-working transition-[width] duration-[var(--pd-duration-slow)] ease-linear motion-reduce:transition-none"
              style={{ width: `${Math.round(Math.min(1, Math.max(0, progress!)) * 100)}%` }}
            />
          </span>
        ) : null}

        {status === "failed" && error ? (
          <p className="text-sm text-foreground text-pretty">
            {error.message}
            {error.refunded ? <span className="text-muted-foreground"> {error.refunded}</span> : null}
          </p>
        ) : null}

        {cost || refundNote ? (
          <p className="text-xs text-muted-foreground text-pretty">
            {cost ? (status === "done" || status === "partial" ? `Used ${cost}.` : `${cost}.`) : ""}
            {refundNote && status !== "failed" ? ` ${refundNote}.` : ""}
          </p>
        ) : null}
      </header>

      {/* Finished work appears the moment it exists, even while the rest is still running. */}
      {children ? <div className="border-t p-4">{children}</div> : null}

      {onCancel || onRetry || onNotifyChange ? (
        <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t p-4">
          {onCancel && active ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              Stop
            </button>
          ) : null}
          {onRetry && (status === "failed" || status === "cancelled") ? (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              Try again
            </button>
          ) : null}
          {onNotifyChange && active ? (
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={Boolean(notify)}
                onChange={(event) => onNotifyChange(event.target.checked)}
                className="size-4 accent-[var(--foreground)] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
              />
              {notifyLabel}
            </label>
          ) : null}
        </footer>
      ) : null}

      {/* Announced once per real change, not once per tick of the counter. */}
      <span role="status" aria-live="polite" className="sr-only">
        {status === "queued"
          ? `In the queue${queue?.position !== undefined ? `, number ${queue.position}` : ""}.`
          : status === "running"
            ? stage ?? "Generating."
            : status === "failed"
              ? `Failed. ${error?.message ?? ""}`
              : STATUS_WORD[status]}
      </span>
    </section>
  );
}

export { GenerationJob };
