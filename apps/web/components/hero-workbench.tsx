"use client";

import * as React from "react";
import Link from "next/link";

import { AgentFigure } from "@pixeldosa/ui";

const STATES = ["plan", "working", "review"] as const;
type State = (typeof STATES)[number];

const STATE_COPY: Record<State, { label: string; title: string; detail: string; pose: "planning" | "working" | "done" }> = {
  plan: {
    label: "Before it runs",
    title: "Make the next move explicit.",
    detail: "The agent turns a vague request into a plan you can edit before anything happens.",
    pose: "planning",
  },
  working: {
    label: "While it works",
    title: "See what the agent is doing.",
    detail: "Tools, sources and progress stay visible while the run is in motion.",
    pose: "working",
  },
  review: {
    label: "When you review",
    title: "Receive a result you can check.",
    detail: "The finished answer carries its sources and the next action, not a black box.",
    pose: "done",
  },
};

const PLAN_STEPS = ["Read the request", "Search the repository", "Summarize the finding"];

export function HeroWorkbench() {
  const [state, setState] = React.useState<State>("working");
  const [paused, setPaused] = React.useState(false);
  const current = STATE_COPY[state];

  React.useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => {
      setState((value) => STATES[(STATES.indexOf(value) + 1) % STATES.length]!);
    }, 4200);
    return () => window.clearTimeout(timer);
  }, [state, paused]);

  return (
    <div className="w-full max-w-xl rounded-2xl border bg-card text-card-foreground shadow-[0_20px_70px_-30px_var(--foreground)]">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <AgentFigure variant="mark" size="sm" pose={current.pose} hideLabel aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Research assistant</p>
            <p className="text-xs text-muted-foreground">A readable run, from intent to result</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          className="shrink-0 rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          {paused ? "Play" : "Pause"}
        </button>
      </div>

      <div className="grid gap-5 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">{current.label}</p>
            <h2 className="mt-1 text-lg font-medium tracking-tight">{current.title}</h2>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
            <span className={state === "working" ? "size-1.5 rounded-full bg-[var(--agent-working)]" : "size-1.5 rounded-full bg-foreground/50"} />
            {state === "working" ? "Running" : state === "review" ? "Ready" : "Draft"}
          </span>
        </div>

        <div className="grid gap-3 rounded-xl border bg-background p-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Task</p>
            <p className="mt-1 text-sm font-medium">Compare the top five competitors</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{current.detail}</p>
          </div>
          <div className="flex items-center justify-center rounded-lg bg-muted/60 p-2">
            <AgentFigure pose={current.pose} size="sm" hideLabel aria-hidden="true" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {PLAN_STEPS.map((step, index) => {
            const complete = state === "review" || (state === "working" && index < 2);
            const active = state === "working" && index === 2;
            return (
              <div key={step} className="flex items-center gap-3 text-sm">
                <span
                  className={
                    complete
                      ? "flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-background"
                      : active
                        ? "flex size-5 shrink-0 items-center justify-center rounded-full border border-foreground text-foreground"
                        : "flex size-5 shrink-0 items-center justify-center rounded-full border text-muted-foreground"
                  }
                >
                  {complete ? "✓" : index + 1}
                </span>
                <span className={complete || active ? "text-foreground" : "text-muted-foreground"}>{step}</span>
                {active ? <span className="ml-auto text-xs text-muted-foreground pd-shimmer">Working</span> : null}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 border-t pt-3">
          <div className="flex gap-1 rounded-lg bg-muted p-1" role="tablist" aria-label="Preview state">
            {STATES.map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={state === value}
                onClick={() => setState(value)}
                className="rounded-md px-2.5 py-1.5 text-xs capitalize text-muted-foreground outline-none transition-colors hover:text-foreground aria-selected:bg-background aria-selected:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
              >
                {value}
              </button>
            ))}
          </div>
          <Link href="/docs/components/ai-chat-experience" className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Open full block →
          </Link>
        </div>
      </div>
    </div>
  );
}
