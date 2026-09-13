"use client";

import * as React from "react";

import { AITriageTable, type TriageItem } from "@/registry/ai-triage-table/ai-triage-table";

const ITEMS: TriageItem[] = [
  { id: "1", label: "Northwind Traders · Industry", before: "Retail", after: "Wholesale distribution", confidence: "low", provenance: "a single press mention" },
  { id: "2", label: "Globex · Headcount", before: "50–100", after: "1,000–5,000", confidence: "low", provenance: "an unverified LinkedIn estimate" },
  { id: "3", label: "Initech · Billing email", before: "billing@initech.co", after: "accounts@initech.com", confidence: "medium", provenance: "last 3 invoices" },
  { id: "4", label: "Umbrella · Country", after: "United Kingdom", confidence: "medium", provenance: "registered address" },
  { id: "5", label: "Acme Robotics · Legal name", before: "acme robotics", after: "Acme Robotics, Inc.", confidence: "high", provenance: "acme-robotics.com" },
  { id: "6", label: "Stark Industries · Website", after: "starkindustries.com", confidence: "high", provenance: "company registry" },
  { id: "7", label: "Wayne Enterprises · Phone", before: "5550100", after: "+1 555 0100", confidence: "high", provenance: "formatting only" },
  { id: "8", label: "Hooli · Legal name", before: "hooli", after: "Hooli, Inc.", confidence: "high", provenance: "hooli.com" },
];

const UNCHANGED = Array.from({ length: 40 }, (_, index) => ({
  id: `u${index}`,
  label: `Account ${index + 101} · all fields already correct`,
}));

export default function AITriageTableDemo() {
  const [applied, setApplied] = React.useState<number | null>(null);

  if (applied !== null) {
    return (
      <div className="flex w-full max-w-xl flex-col items-start gap-3">
        <p className="animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] rounded-md border bg-card p-3 text-sm text-foreground motion-reduce:animate-none">
          Applied {applied} {applied === 1 ? "change" : "changes"}. Everything else was left as it was.
        </p>
        <button
          type="button"
          onClick={() => setApplied(null)}
          className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Review again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl">
      <AITriageTable
        title="Enrich 48 accounts"
        items={ITEMS}
        unchanged={UNCHANGED}
        onApply={(ids) => setApplied(ids.length)}
      />
    </div>
  );
}
