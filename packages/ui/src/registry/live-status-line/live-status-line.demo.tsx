"use client";

import * as React from "react";

import { LiveStatusLine } from "@/registry/live-status-line/live-status-line";
import type { AgentState } from "@/registry/agent-presence/agent-presence";

const RUN: { state: AgentState; status: string; detail?: string; ms: number }[] = [
  { state: "queued", status: "Queued", ms: 1000 },
  { state: "thinking", status: "Planning the reconciliation", ms: 2000 },
  { state: "working", status: "Reading", detail: "invoices/2026-q3.csv", ms: 1800 },
  { state: "working", status: "Reading", detail: "ledger/august-import.json", ms: 1600 },
  { state: "deciding", status: "Comparing billing contacts", ms: 1800 },
  { state: "streaming", status: "Writing the summary", ms: 2000 },
  { state: "done", status: "Reconciled 5 invoices", ms: 2600 },
];

export default function LiveStatusLineDemo() {
  const [step, setStep] = React.useState(0);
  const [startedAt, setStartedAt] = React.useState(() => Date.now());

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = (step + 1) % RUN.length;
      if (next === 0) setStartedAt(Date.now());
      setStep(next);
    }, RUN[step]!.ms);
    return () => window.clearTimeout(timer);
  }, [step]);

  const current = RUN[step]!;

  return (
    <div className="w-full max-w-md rounded-lg border bg-card px-3">
      <LiveStatusLine
        state={current.state}
        status={current.status}
        detail={current.detail}
        startedAt={startedAt}
        onCancel={() => undefined}
      />
    </div>
  );
}
