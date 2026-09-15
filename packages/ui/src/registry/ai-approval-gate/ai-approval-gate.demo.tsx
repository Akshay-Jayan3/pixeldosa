"use client";

import * as React from "react";

import { AIApprovalGate } from "@/registry/ai-approval-gate/ai-approval-gate";

export default function AIApprovalGateDemo() {
  const [outcome, setOutcome] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<"approve" | "reject" | null>(null);

  const settle = (next: "approve" | "reject", message: string) => {
    setBusy(next);
    window.setTimeout(() => {
      setBusy(null);
      setOutcome(message);
    }, 1100);
  };

  if (outcome) {
    return (
      <div className="flex w-full max-w-md flex-col items-start gap-3">
        <p className="animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] rounded-md border bg-card p-3 text-sm text-foreground motion-reduce:animate-none">
          {outcome}
        </p>
        <button
          type="button"
          onClick={() => setOutcome(null)}
          className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Reset
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <AIApprovalGate
        headingLevel={2}
        action="Send the Q3 reconciliation summary to 243 contacts"
        risk="high"
        reversible={false}
        busy={busy}
        impact={[
          { label: "Recipients", value: "243" },
          { label: "Attachments", value: "2" },
          { label: "Sends from", value: "finance@acme.com" },
        ]}
        confidence="medium"
        provenance="the 14 August import batch"
        explanation="Three invoices share a billing contact, which accounts for the duplicate-payment warning. The summary explains the grouping and the corrected totals."
        sources={[
          { label: "invoices/2026-q3.csv", snippet: "5 flagged rows, 3 sharing a contact." },
          { label: "ledger/august-import.json" },
        ]}
        onApprove={() => settle("approve", "Sent to 243 contacts.")}
        onReject={() => settle("reject", "Rejected — nothing was sent.")}
        onEdit={() => setOutcome("Opened the draft for editing before sending.")}
      />
    </div>
  );
}
