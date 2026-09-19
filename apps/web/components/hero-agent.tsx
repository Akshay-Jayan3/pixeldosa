"use client";

import * as React from "react";

import { AgentFigure, type AgentPose } from "@pixeldosa/ui";

/** One research run, told by the agent's body. The question holds longer: it's your turn. */
const RUN: { pose: AgentPose; note: string; ms: number; yourTurn?: true }[] = [
  { pose: "listening", note: "Research the top 5 competitors? On it.", ms: 2400 },
  { pose: "planning", note: "Here's my plan…", ms: 2400 },
  { pose: "searching", note: "Checking 5 sources…", ms: 2600 },
  { pose: "reading", note: "Reading pricing pages…", ms: 2600 },
  { pose: "asking", note: "Per seat or flat? Your call.", ms: 4200, yourTurn: true },
  { pose: "working", note: "Putting it together…", ms: 2600 },
  { pose: "done", note: "Done. Here's the summary.", ms: 3600, yourTurn: true },
];

/**
 * The homepage's hero: Agent Figure running through a research task on a loop, with the
 * handwritten note as its label. The dashed ring ticks round only while the agent is
 * working and stops dead on your turn, so the hero demonstrates the system's one rule
 * instead of describing it. It advances on its own, so it can be paused (WCAG 2.2.2).
 */
export function HeroAgent() {
  const [step, setStep] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const current = RUN[step]!;
  const busy = !current.yourTurn && !paused;

  React.useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => setStep((s) => (s + 1) % RUN.length), current.ms);
    return () => window.clearTimeout(timer);
  }, [step, paused, current.ms]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex size-64 items-center justify-center sm:size-72">
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          data-busy={busy}
          className="pd-ring absolute inset-0 size-full text-border"
        >
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 3" />
          {/* One inked tick, so the rotation is visible and reads as a dial. */}
          <path d="M50 1 L50 6" stroke="var(--foreground)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <AgentFigure pose={current.pose} size="lg" hideLabel label={current.note} className="[&_svg]:size-48" />
      </div>
      <p className="min-h-8 text-center font-hand text-xl leading-snug text-foreground" aria-live="polite">
        {current.note}
      </p>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        className="rounded-md px-2 py-1 text-xs text-muted-foreground underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        {paused ? "Play the run" : "Pause the run"}
      </button>
    </div>
  );
}
