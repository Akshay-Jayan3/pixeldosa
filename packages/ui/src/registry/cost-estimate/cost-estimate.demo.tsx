"use client";

import * as React from "react";

import { CostEstimate } from "@/registry/cost-estimate/cost-estimate";

const SCOPES = {
  full: {
    label: "All 5 competitors, 12 sources",
    cost: { low: "$1.10", high: "$1.80" },
    duration: "4 to 6 minutes",
    items: [
      { id: "search", label: "Searching 12 sources", amount: "$0.30" },
      { id: "read", label: "Reading 40 pages", detail: "Long pages cost more", amount: "$0.60 to $1.20" },
      { id: "write", label: "Writing the comparison", amount: "$0.20" },
    ],
    used: 0.82,
    balance: "$8.20 of $50 left this month",
    exceeds: false,
  },
  narrow: {
    label: "Top 3 competitors, 6 sources",
    cost: { low: "$0.50", high: "$0.80" },
    duration: "2 to 3 minutes",
    items: [
      { id: "search", label: "Searching 6 sources", amount: "$0.15" },
      { id: "read", label: "Reading 18 pages", amount: "$0.25 to $0.50" },
      { id: "write", label: "Writing the comparison", amount: "$0.15" },
    ],
    used: 0.72,
    balance: "$14.00 of $50 left this month",
    exceeds: false,
  },
} as const;

export default function CostEstimateDemo() {
  const [scope, setScope] = React.useState<keyof typeof SCOPES>("full");
  const [ran, setRan] = React.useState(false);
  const current = SCOPES[scope];

  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <CostEstimate
        headingLevel={2}
        task={`Research the top 5 competitors · ${current.label}`}
        cost={current.cost}
        duration={current.duration}
        confidence="medium"
        basis="your last 20 runs"
        items={[...current.items]}
        balance={{ label: current.balance, used: current.used, exceeds: current.exceeds }}
        onRun={() => setRan(true)}
        adjustLabel={scope === "full" ? "Narrow the scope" : "Use the full scope"}
        onAdjust={() => setScope(scope === "full" ? "narrow" : "full")}
        onCancel={() => undefined}
      />
      {ran ? (
        <p className="animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] text-sm text-muted-foreground motion-reduce:animate-none">
          Started. The estimate is what you agreed to, not what you were charged.
        </p>
      ) : null}
    </div>
  );
}
