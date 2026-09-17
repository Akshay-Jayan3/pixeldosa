"use client";

import * as React from "react";

import { AgentFigure, type AgentPose } from "@/registry/agent-figure/agent-figure";
import { Button } from "@/registry/button/button";

type Step = { pose: AgentPose; text: string; ask?: true };

const STEPS: Step[] = [
  { pose: "listening", text: "Understanding your request" },
  { pose: "planning", text: "Planning the approach" },
  { pose: "searching", text: "Searching 5 sources" },
  { pose: "reading", text: "Reading pricing pages" },
  { pose: "comparing", text: "Comparing pricing models" },
  { pose: "asking", text: "Which pricing model comes first?", ask: true },
  { pose: "working", text: "Building the comparison" },
];

export default function AgentFigureDemo() {
  const [step, setStep] = React.useState(0);
  const [choice, setChoice] = React.useState<string | null>(null);
  const finished = step === STEPS.length;
  const current = STEPS[step];

  React.useEffect(() => {
    if (finished || current?.ask) return;
    const timer = window.setTimeout(() => setStep((s) => s + 1), 2200);
    return () => window.clearTimeout(timer);
  }, [step, finished, current]);

  const answer = (value: string) => {
    setChoice(value);
    setStep((s) => s + 1);
  };

  return (
    <div className="grid w-full max-w-xl gap-6 rounded-xl border bg-card p-5 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="flex min-w-0 flex-col gap-4">
        <p className="self-start rounded-lg bg-muted px-3 py-2 text-sm">Research the top 5 competitors.</p>

        <ol className="flex flex-col gap-0.5 text-sm">
          {STEPS.filter((s) => !s.ask).map((s) => {
            const index = STEPS.indexOf(s);
            const state = index < step ? "done" : index === step ? "now" : "later";
            return (
              <li
                key={s.text}
                className={
                  state === "now"
                    ? "rounded-md bg-agent-working-soft px-2 py-1 font-medium"
                    : state === "done"
                      ? "px-2 py-1"
                      : "px-2 py-1 text-muted-foreground"
                }
              >
                {state === "done" ? "✓ " : ""}
                {s.text}
              </li>
            );
          })}
        </ol>

        {current?.ask && (
          <div className="flex flex-col gap-3 rounded-lg border border-agent-waiting bg-agent-waiting-soft p-3">
            <p className="text-sm">I found two pricing models, per seat and flat. Which should the comparison lead with?</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => answer("Per-seat")}>
                Per seat
              </Button>
              <Button size="sm" variant="outline" onClick={() => answer("Flat")}>
                Flat
              </Button>
            </div>
          </div>
        )}

        {finished && (
          <div className="flex flex-col items-start gap-3 rounded-lg border p-3 text-sm">
            <p>Compared 5 competitors from 12 sources, with {choice?.toLowerCase()} pricing first.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setChoice(null);
                setStep(0);
              }}
            >
              Run again
            </Button>
          </div>
        )}
      </div>

      <AgentFigure
        pose={finished ? "done" : current!.pose}
        size="lg"
        labelPosition="below"
        label={finished ? "Summary ready" : undefined}
        announce
        className="justify-self-center"
      />
    </div>
  );
}
