"use client";

import * as React from "react";

import { AgentAsk } from "@/registry/agent-ask/agent-ask";

/**
 * The disambiguation case, which is what elicitation is mostly for in practice: the
 * agent found two plausible matches and cannot safely guess between them.
 */
export default function AgentAskDemo() {
  const [answer, setAnswer] = React.useState<string | null>(null);

  if (answer) {
    return (
      <div className="flex w-full max-w-md flex-col items-start gap-3">
        <p className="animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] rounded-md border bg-card p-3 text-sm text-foreground motion-reduce:animate-none">
          {answer}
        </p>
        <button
          type="button"
          onClick={() => setAnswer(null)}
          className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Ask again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <AgentAsk
        headingLevel={2}
        source="finance-db"
        question="Which quarter should I reconcile?"
        explanation="Two datasets match “Q3 revenue” and they disagree by $4,200."
        fields={[
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
          { name: "includeRefunds", type: "confirm", label: "Include refunds?", required: true },
        ]}
        onRespond={(values) =>
          setAnswer(
            `Reconciling ${values.dataset === "final" ? "Q3 Revenue Final.xlsx" : "Q3 Revenue.xlsx"}, ${
              values.includeRefunds ? "including" : "excluding"
            } refunds.`
          )
        }
        onDecline={() => setAnswer("Continued without reconciling — the warning stays open.")}
        onCancel={() => setAnswer("Stopped.")}
      />
    </div>
  );
}
