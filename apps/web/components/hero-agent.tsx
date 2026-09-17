"use client";

import * as React from "react";

import { AgentFigure, type AgentPose } from "@pixeldosa/ui";

/** One research run, told by the agent's body. The question holds longer: it's your turn. */
const RUN: { pose: AgentPose; note: string; ms: number }[] = [
  { pose: "listening", note: "Research the top 5 competitors? On it.", ms: 2400 },
  { pose: "planning", note: "Here's my plan…", ms: 2400 },
  { pose: "searching", note: "Checking 5 sources…", ms: 2600 },
  { pose: "reading", note: "Reading pricing pages…", ms: 2600 },
  { pose: "asking", note: "Per seat or flat? Your call.", ms: 4200 },
  { pose: "working", note: "Putting it together…", ms: 2600 },
  { pose: "done", note: "Done. Here's the summary.", ms: 3600 },
];

/**
 * The homepage's hero: Agent Figure running through a research task on a loop, with the
 * handwritten note as its label. It advances on its own, so it can be paused (WCAG 2.2.2).
 */
export function HeroAgent() {
  const [step, setStep] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const current = RUN[step]!;

  React.useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => setStep((s) => (s + 1) % RUN.length), current.ms);
    return () => window.clearTimeout(timer);
  }, [step, paused, current.ms]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex size-64 items-center justify-center rounded-full border border-dashed sm:size-72">
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
