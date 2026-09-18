"use client";

import * as React from "react";

import { AgentPlan, type PlanStep, type PlanStepStatus } from "@/registry/agent-plan/agent-plan";

const STEPS: PlanStep[] = [
  { id: "1", title: "Pull the 5 flagged invoices from Q3 Revenue Final.xlsx" },
  { id: "2", title: "Match them against the 14 August import batch", detail: "Reads ledger/august-import.json" },
  { id: "3", title: "Check billing contacts for duplicates" },
  { id: "4", title: "Draft a summary of the root cause" },
  { id: "5", title: "Email the summary to finance@acme.com", needsApproval: true },
];

/** What the caller's run would report at each step, including one that fails. */
const RUN: { status: PlanStepStatus; note?: string; runStatus: string; ms: number }[] = [
  { status: "running", runStatus: "Reading Q3 Revenue Final.xlsx", ms: 1800 },
  { status: "running", runStatus: "Matching the August import", ms: 2000 },
  { status: "running", runStatus: "Checking billing contacts", ms: 1800 },
  { status: "running", runStatus: "Drafting the summary", ms: 2200 },
  { status: "waiting", note: "Sends to 3 people. This can't be undone.", runStatus: "Waiting for your approval", ms: 4000 },
];

export default function AgentPlanDemo() {
  const [plan, setPlan] = React.useState<PlanStep[] | null>(null);
  const [step, setStep] = React.useState(0);
  const [failedOnce, setFailedOnce] = React.useState(false);
  const [statuses, setStatuses] = React.useState<Record<string, PlanStepStatus>>({});
  const [notes, setNotes] = React.useState<Record<string, string>>({});

  const current = plan?.[step];
  const script = RUN[step];
  const waiting = current ? statuses[current.id] === "waiting" : false;
  // A failed step stops the run until Retry, the same as a real one would.
  const halted = current ? statuses[current.id] === "failed" : false;
  const stopped = plan !== null && current === undefined;

  // Walks the plan the way a real run would: each step finishes, the third one fails the
  // first time round, and the last one stops for approval.
  React.useEffect(() => {
    if (!plan || !current || !script || waiting || halted) return;
    setStatuses((previous) => ({ ...previous, [current.id]: script.status }));
    if (script.note) setNotes((previous) => ({ ...previous, [current.id]: script.note! }));
    if (script.status === "waiting") return;

    const timer = window.setTimeout(() => {
      const fails = step === 2 && !failedOnce;
      setStatuses((previous) => ({ ...previous, [current.id]: fails ? "failed" : "done" }));
      if (fails) {
        setFailedOnce(true);
        setNotes((previous) => ({ ...previous, [current.id]: "The contacts service timed out." }));
      } else {
        setNotes((previous) => {
          const next = { ...previous };
          delete next[current.id];
          return next;
        });
        setStep((value) => value + 1);
      }
    }, script.ms);
    return () => window.clearTimeout(timer);
  }, [plan, current, script, step, failedOnce, waiting, halted]);

  const reset = () => {
    setPlan(null);
    setStep(0);
    setFailedOnce(false);
    setStatuses({});
    setNotes({});
  };

  if (!plan) {
    return (
      <div className="w-full max-w-lg">
        <AgentPlan headingLevel={2} steps={STEPS} onRun={setPlan} onCancel={() => undefined} />
      </div>
    );
  }

  const steps = plan.map((item) => ({
    ...item,
    status: statuses[item.id] ?? "pending",
    note: notes[item.id],
  }));

  return (
    <div className="flex w-full max-w-lg flex-col items-start gap-3">
      <AgentPlan
        headingLevel={2}
        steps={steps}
        runStatus={stopped ? undefined : script?.runStatus}
        onRun={() => undefined}
        onStop={reset}
        onRetryStep={(id) => {
          setStatuses((previous) => ({ ...previous, [id]: "running" }));
          setNotes((previous) => {
            const next = { ...previous };
            delete next[id];
            return next;
          });
        }}
      />
      {waiting && current ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setStatuses((previous) => ({ ...previous, [current.id]: "done" }));
              setNotes((previous) => {
                const next = { ...previous };
                delete next[current.id];
                return next;
              });
              setStep((value) => value + 1);
            }}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            Approve and send
          </button>
          <button
            type="button"
            onClick={() => {
              setStatuses((previous) => ({ ...previous, [current.id]: "skipped" }));
              setNotes((previous) => ({ ...previous, [current.id]: "You skipped this step." }));
              setStep((value) => value + 1);
            }}
            className="rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            Skip
          </button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        Start over
      </button>
    </div>
  );
}
