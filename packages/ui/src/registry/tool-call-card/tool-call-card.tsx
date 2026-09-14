"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type ToolCallKind = "read" | "search" | "fetch" | "write" | "run" | "call";
export type ToolCallStatus = "running" | "done" | "failed" | "blocked";
/** What the call could do to the world. Read-only calls gather evidence; the others act. */
export type ToolCallEffect = "read-only" | "changes" | "external";

export interface ToolCallCardProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  kind: ToolCallKind;
  /** What it touched: a file path, a query, a URL, a command. */
  target: string;
  status: ToolCallStatus;
  /** The raw tool name (e.g. `fs.read_file`), shown for people who want the exact call. */
  name?: string;
  /** Defaults from `kind`: read, search and fetch are read-only; write, run and call change things. */
  effect?: ToolCallEffect;
  /** Arguments as sent. Objects are shown as formatted JSON. */
  input?: string | Record<string, unknown>;
  /** What came back — the evidence. */
  output?: React.ReactNode;
  /** Why it failed or was blocked. */
  error?: string;
  durationMs?: number;
  defaultOpen?: boolean;
}

const VERBS: Record<ToolCallKind, { running: string; done: string; failed: string }> = {
  read: { running: "Reading", done: "Read", failed: "Couldn't read" },
  search: { running: "Searching", done: "Searched", failed: "Couldn't search" },
  fetch: { running: "Fetching", done: "Fetched", failed: "Couldn't fetch" },
  write: { running: "Writing", done: "Wrote", failed: "Couldn't write" },
  run: { running: "Running", done: "Ran", failed: "Couldn't run" },
  call: { running: "Calling", done: "Called", failed: "Couldn't call" },
};

const DEFAULT_EFFECT: Record<ToolCallKind, ToolCallEffect> = {
  read: "read-only",
  search: "read-only",
  fetch: "read-only",
  write: "changes",
  run: "changes",
  call: "external",
};

const EFFECT_LABEL: Record<Exclude<ToolCallEffect, "read-only">, string> = {
  changes: "Made changes",
  external: "Outside this app",
};

function verbFor(kind: ToolCallKind, status: ToolCallStatus) {
  if (status === "blocked") return `Not allowed to ${kind}`;
  if (status === "running") return VERBS[kind].running;
  if (status === "failed") return VERBS[kind].failed;
  return VERBS[kind].done;
}

function formatDuration(ms: number) {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)}s`;
}

function KindIcon({ kind }: { kind: ToolCallKind }) {
  const paths: Record<ToolCallKind, React.ReactNode> = {
    read: (
      <>
        <path d="M4 2.5h5l3 3v8H4z" />
        <path d="M6.5 8.5h3M6.5 11h3" />
      </>
    ),
    search: (
      <>
        <circle cx="7" cy="7" r="3.75" />
        <path d="m10 10 3 3" />
      </>
    ),
    fetch: (
      <>
        <circle cx="8" cy="8" r="5.5" />
        <path d="M2.5 8h11M8 2.5c1.6 1.7 1.6 9.3 0 11M8 2.5c-1.6 1.7-1.6 9.3 0 11" />
      </>
    ),
    write: <path d="m10.5 3 2.5 2.5L6 12.5H3.5V10z" />,
    run: <path d="m4 5 3 3-3 3M8.5 11.5h4" />,
    call: <path d="M6 3.5c-1.5 0-2 .7-2 2v1c0 1-.5 1.5-1.5 1.5 1 0 1.5.5 1.5 1.5v1c0 1.3.5 2 2 2M10 3.5c1.5 0 2 .7 2 2v1c0 1 .5 1.5 1.5 1.5-1 0-1.5.5-1.5 1.5v1c0 1.3-.5 2-2 2" />,
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0"
    >
      {paths[kind]}
    </svg>
  );
}

/**
 * One thing an agent actually did — read a file, ran a search, called an API — shown as
 * a record rather than a claim.
 *
 * The distinction it exists for is between knowledge the agent retrieved and knowledge
 * it asserted. "The config sets a 30s timeout" means something different when a Read
 * of config.ts sits beside it. So the card leads with a plain sentence — verb, then the
 * exact target — and keeps the evidence (arguments and result) one click away, not
 * hidden and not dumped inline.
 *
 * The second distinction is between gathering and acting. Read-only calls stay quiet;
 * calls that changed something or reached outside the app carry a label, because those
 * are the ones a reviewer needs to find in a long run.
 */
function ToolCallCard({
  kind,
  target,
  status,
  name,
  effect = DEFAULT_EFFECT[kind],
  input,
  output,
  error,
  durationMs,
  defaultOpen = false,
  className,
  ...props
}: ToolCallCardProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const panelId = React.useId();
  const hasDetails = input !== undefined || output !== undefined || Boolean(error) || Boolean(name);
  const verb = verbFor(kind, status);
  const problem = status === "failed" || status === "blocked";
  // A blocked call never ran, so it didn't change anything, whatever its kind.
  const showEffect = effect !== "read-only" && status !== "blocked";

  const summary = (
    <>
      <span className={cn("mt-0.5 text-muted-foreground", problem && "text-destructive")}>
        <KindIcon kind={kind} />
      </span>
      <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-1.5">
        <span
          className={cn(
            "shrink-0 font-medium",
            problem ? "text-destructive" : "text-foreground",
            // Shimmer the verb, never the target: the target is content and must stay legible.
            status === "running" && "pd-shimmer"
          )}
        >
          {verb}
        </span>
        <span title={target} className="min-w-0 truncate font-mono text-[0.8125rem] text-muted-foreground">
          {target}
        </span>
      </span>
      {showEffect ? (
        <span className="shrink-0 rounded-sm border px-1.5 py-px text-[0.6875rem] font-medium text-foreground">
          {EFFECT_LABEL[effect]}
        </span>
      ) : null}
      {durationMs !== undefined && status !== "running" ? (
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatDuration(durationMs)}</span>
      ) : null}
    </>
  );

  return (
    <div
      data-status={status}
      className={cn("rounded-md border bg-card text-sm", problem && "border-destructive/40", className)}
      {...props}
    >
      {hasDetails ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="group flex w-full items-start gap-2 rounded-md px-3 py-2 text-left outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          {summary}
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
              open && "rotate-90"
            )}
          >
            <path d="m6 4 4 4-4 4" />
          </svg>
        </button>
      ) : (
        <div className="flex items-start gap-2 px-3 py-2">{summary}</div>
      )}

      {hasDetails ? (
        <div
          id={panelId}
          inert={!open}
          className={cn(
            // overflow-hidden is load-bearing: a 0fr row does not clip its content on its own.
            "grid overflow-hidden transition-[grid-template-rows] duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="min-h-0">
            <dl className="flex flex-col gap-3 border-t px-3 py-3">
              {name ? (
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-muted-foreground">Tool</dt>
                  <dd className="font-mono text-xs text-foreground">{name}</dd>
                </div>
              ) : null}
              {input !== undefined ? (
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-muted-foreground">Input</dt>
                  <dd>
                    <pre className="max-h-40 overflow-auto rounded-sm bg-muted px-2 py-1.5 font-mono text-xs text-foreground whitespace-pre-wrap break-words">
                      {typeof input === "string" ? input : JSON.stringify(input, null, 2)}
                    </pre>
                  </dd>
                </div>
              ) : null}
              {error ? (
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-muted-foreground">{status === "blocked" ? "Why it was blocked" : "Error"}</dt>
                  <dd className="text-xs text-destructive text-pretty">{error}</dd>
                </div>
              ) : null}
              {output !== undefined ? (
                <div className="flex flex-col gap-1">
                  <dt className="text-xs text-muted-foreground">Result</dt>
                  <dd>
                    {typeof output === "string" ? (
                      <pre className="max-h-48 overflow-auto rounded-sm bg-muted px-2 py-1.5 font-mono text-xs text-foreground whitespace-pre-wrap break-words">
                        {output}
                      </pre>
                    ) : (
                      output
                    )}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export type ToolCall = ToolCallCardProps & { id: string };

export interface ToolCallGroupProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  calls: ToolCall[];
  defaultOpen?: boolean;
}

const COUNT_VERBS: Record<ToolCallKind, [string, string]> = {
  read: ["read 1 file", "read {n} files"],
  search: ["searched once", "searched {n} times"],
  fetch: ["fetched 1 page", "fetched {n} pages"],
  write: ["wrote 1 file", "wrote {n} files"],
  run: ["ran 1 command", "ran {n} commands"],
  call: ["called 1 tool", "called {n} tools"],
};

function summarize(calls: ToolCall[]) {
  const counts = new Map<ToolCallKind, number>();
  // Only finished calls count as things the agent did; failures are reported separately.
  for (const call of calls) if (call.status === "done") counts.set(call.kind, (counts.get(call.kind) ?? 0) + 1);
  const parts = [...counts].map(([kind, n]) => COUNT_VERBS[kind][n === 1 ? 0 : 1].replace("{n}", String(n)));
  const text = parts.length ? parts.join(", ") : `${calls.length} tool ${calls.length === 1 ? "call" : "calls"}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * A run's tool calls folded into one line — "Read 4 files, searched twice, wrote 1 file" —
 * so a long run can be audited without scrolling past forty cards. The line names what
 * changed and what failed, because those are what a reviewer opens the list to find.
 * While a call is running, the line shows that call instead of the tally.
 */
function ToolCallGroup({ calls, defaultOpen = false, className, ...props }: ToolCallGroupProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const panelId = React.useId();
  const running = calls.find((call) => call.status === "running");
  const failed = calls.filter((call) => call.status === "failed" || call.status === "blocked").length;
  const changed = calls.filter(
    (call) => call.status === "done" && (call.effect ?? DEFAULT_EFFECT[call.kind]) !== "read-only"
  ).length;

  if (calls.length === 0) return null;

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="relative flex items-center gap-2 self-start rounded-sm text-left text-sm outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] after:absolute after:inset-x-0 after:-inset-y-3 after:content-[''] motion-reduce:transition-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
            open && "rotate-90"
          )}
        >
          <path d="m6 4 4 4-4 4" />
        </svg>
        <span className="flex flex-wrap items-baseline gap-x-2">
          {running ? (
            <span className="text-foreground">
              <span className="pd-shimmer font-medium">{VERBS[running.kind].running}</span>{" "}
              <span className="font-mono text-[0.8125rem] text-muted-foreground">{running.target}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{summarize(calls)}</span>
          )}
          {changed > 0 ? (
            <span className="text-xs font-medium text-foreground tabular-nums">
              {changed} {changed === 1 ? "call" : "calls"} made changes
            </span>
          ) : null}
          {failed > 0 ? <span className="text-xs font-medium text-destructive tabular-nums">{failed} failed</span> : null}
        </span>
      </button>

      <div
        id={panelId}
        inert={!open}
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        {/* Padding lives inside the min-h-0 child: padding on the grid item itself survives a 0fr row. */}
        <div className="min-h-0">
          <ol className="flex flex-col gap-2 pt-3" aria-label="Tool calls">
            {calls.map(({ id, ...call }) => (
              <li key={id}>
                <ToolCallCard {...call} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export { ToolCallCard, ToolCallGroup };
