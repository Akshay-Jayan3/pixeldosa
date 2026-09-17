"use client";

import * as React from "react";

import { ThinkingExperience } from "@/registry/thinking-experience/thinking-experience";
import type { AgentState } from "@/registry/agent-presence/agent-presence";

type Phase = {
  state: AgentState;
  status: string;
  detail?: string;
  reasoningUpTo: number;
  ms: number;
};

const REASONING = [
  "Checking the invoice table for duplicate payment warnings.",
  "Found five flagged invoices across the last quarter.",
  "Three share the same billing contact.",
  "All three came from the 14 August import batch.",
];

/**
 * A full run: work, a question, more work, an approval, a result. The whole point of
 * the block is that one state drives which surface is on screen — so the demo drives
 * exactly one state.
 */
const RUN: Phase[] = [
  { state: "queued", status: "Queued", reasoningUpTo: 0, ms: 900 },
  { state: "thinking", status: "Planning the reconciliation", reasoningUpTo: 2, ms: 2200 },
  { state: "working", status: "Reading", detail: "ledger/august-import.json", reasoningUpTo: 4, ms: 1800 },
  { state: "asking", status: "Needs your input", reasoningUpTo: 4, ms: 6000 },
  { state: "deciding", status: "Preparing the summary", reasoningUpTo: 4, ms: 1600 },
  { state: "awaitingApproval", status: "Waiting for your approval", reasoningUpTo: 4, ms: 7000 },
  { state: "done", status: "Reconciled 5 invoices", reasoningUpTo: 4, ms: 5000 },
];

export default function ThinkingExperienceDemo() {
  const [step, setStep] = React.useState(0);
  const [startedAt, setStartedAt] = React.useState(() => Date.now());

  const advance = React.useCallback(() => {
    setStep((current) => {
      const next = (current + 1) % RUN.length;
      if (next === 0) setStartedAt(Date.now());
      return next;
    });
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(advance, RUN[step]!.ms);
    return () => window.clearTimeout(timer);
  }, [step, advance]);

  const phase = RUN[step]!;

  return (
    <div className="w-full max-w-lg">
      <ThinkingExperience
        headingLevel={2}
        expression="full"
        state={phase.state}
        status={phase.status}
        detail={phase.detail}
        startedAt={startedAt}
        reasoning={REASONING.slice(0, phase.reasoningUpTo)}
        reasoningMs={phase.state === "done" ? 6400 : undefined}
        onCancel={() => undefined}
        ask={{
          source: "finance-db",
          question: "Which dataset should I reconcile against?",
          explanation: "Two datasets match and they disagree by $4,200.",
          fields: [
            {
              name: "dataset",
              type: "select",
              label: "Dataset",
              required: true,
              options: [
                { value: "final", label: "Q3 Revenue Final.xlsx", hint: "Edited 3 days ago" },
                { value: "draft", label: "Q3 Revenue.xlsx", hint: "Edited 6 weeks ago" },
              ],
            },
          ],
          onRespond: advance,
          onDecline: advance,
        }}
        approval={{
          action: "Send the reconciliation summary to 243 contacts",
          risk: "high",
          reversible: false,
          impact: [
            { label: "Recipients", value: "243" },
            { label: "Attachments", value: "2" },
          ],
          confidence: "medium",
          provenance: "the 14 August import batch",
          explanation:
            "Three invoices share a billing contact, which accounts for the duplicate-payment warning.",
          onApprove: advance,
          onReject: advance,
        }}
        result={
          <p className="text-sm text-foreground">
            Reconciled 5 invoices. The duplicate-payment warning had one root cause: three
            invoices from the 14 August import share a billing contact.
          </p>
        }
        resultActions={[
          { id: "apply", label: "Apply", intent: "primary" },
          { id: "explain", label: "Explain", intent: "quiet" },
        ]}
        onResultAction={() => undefined}
      />
    </div>
  );
}
