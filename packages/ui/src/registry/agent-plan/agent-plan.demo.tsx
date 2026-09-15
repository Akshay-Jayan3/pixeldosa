"use client";

import * as React from "react";

import { AgentPlan, type PlanStep } from "@/registry/agent-plan/agent-plan";

const STEPS: PlanStep[] = [
  { id: "1", title: "Pull the 5 flagged invoices from Q3 Revenue Final.xlsx" },
  { id: "2", title: "Match them against the 14 August import batch", detail: "Reads ledger/august-import.json" },
  { id: "3", title: "Check billing contacts for duplicates" },
  { id: "4", title: "Draft a summary of the root cause" },
  { id: "5", title: "Email the summary to finance@acme.com", needsApproval: true },
];

export default function AgentPlanDemo() {
  const [ran, setRan] = React.useState<PlanStep[] | null>(null);

  if (ran) {
    return (
      <div className="flex w-full max-w-lg flex-col items-start gap-3">
        <ol className="animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] list-decimal space-y-1 rounded-md border bg-card p-3 pl-8 text-sm text-foreground motion-reduce:animate-none">
          {ran.map((step) => (
            <li key={step.id}>{step.title}</li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => setRan(null)}
          className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Edit the plan again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <AgentPlan headingLevel={2} steps={STEPS} onRun={setRan} onCancel={() => undefined} />
    </div>
  );
}
