"use client";

import * as React from "react";

import { AgentPresence, type AgentState } from "@/registry/agent-presence/agent-presence";

/**
 * Runs a real agent lifecycle so the grammar is felt rather than described: the machine
 * states move, then `awaitingApproval` arrives and everything stops dead. The stop is
 * the point — it is what tells you it's your turn without a word.
 */
const SEQUENCE: { state: AgentState; ms: number; label?: string }[] = [
  { state: "queued", ms: 1100 },
  { state: "thinking", ms: 2000 },
  { state: "deciding", ms: 1300 },
  { state: "working", ms: 2200, label: "Searching invoices" },
  { state: "streaming", ms: 1800 },
  { state: "awaitingApproval", ms: 3200 },
  { state: "done", ms: 1400 },
];

export default function AgentPresenceDemo() {
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    const timer = window.setTimeout(
      () => setStep((value) => (value + 1) % SEQUENCE.length),
      SEQUENCE[step]!.ms
    );
    return () => window.clearTimeout(timer);
  }, [step]);

  const current = SEQUENCE[step]!;

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <AgentPresence
        state={current.state}
        label={current.label}
        form="orb"
        size="lg"
        onCancel={() => undefined}
      />

      <div className="flex w-full flex-col gap-4 border-t pt-6">
        <AgentPresence state={current.state} label={current.label} form="field" />
        <AgentPresence state={current.state} label={current.label} form="line" size="sm" />
      </div>
    </div>
  );
}
