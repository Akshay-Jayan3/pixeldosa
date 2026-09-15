"use client";

import * as React from "react";

import { IntentPreview } from "@/registry/intent-preview/intent-preview";

export default function IntentPreviewDemo() {
  const [started, setStarted] = React.useState<Record<string, string> | null>(null);

  if (started) {
    return (
      <div className="flex w-full max-w-md flex-col items-start gap-3">
        <p className="animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] rounded-md border bg-card p-3 text-sm text-foreground motion-reduce:animate-none">
          Starting with {started.dataset}, for {started.audience?.toLowerCase()}, covering{" "}
          {started.period}.
        </p>
        <button
          type="button"
          onClick={() => setStarted(null)}
          className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Start over
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <IntentPreview
        headingLevel={2}
        interpretation="Reconcile this quarter's flagged invoices and draft a summary of what caused the duplicate-payment warning."
        assumptions={[
          {
            id: "dataset",
            label: "Dataset",
            value: "Q3 Revenue Final.xlsx",
            options: ["Q3 Revenue.xlsx"],
          },
          {
            id: "audience",
            label: "Summary for",
            value: "Finance team",
            options: ["Leadership", "External auditors"],
          },
          { id: "period", label: "Period", value: "July – September 2026" },
        ]}
        boundaries={["Change any invoice", "Send the summary without asking first"]}
        onStart={setStarted}
        onRephrase={() => undefined}
        onCancel={() => undefined}
      />
    </div>
  );
}
