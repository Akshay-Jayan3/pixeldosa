"use client";

import * as React from "react";

import { HumanHandoff, type HandoffStage } from "@/registry/human-handoff/human-handoff";

export default function HumanHandoffDemo() {
  const [stage, setStage] = React.useState<HandoffStage>("waitingForPerson");

  return (
    <div className="w-full max-w-lg">
      <HumanHandoff
        headingLevel={2}
        stage={stage}
        waitingFor="Waiting 6 minutes"
        person="Dana in support"
        reason={
          stage === "waitingForPerson"
            ? "The customer asked for a refund outside the policy window. I can't decide this one."
            : stage === "personHandling"
              ? "Dana has the conversation. I'll keep the notes up to date."
              : "Back with the agent, with everything Dana added."
        }
        context={[
          { id: "customer", label: "Customer", value: "Priya Menon · acme.com · 3 years, no refunds before" },
          { id: "order", label: "Order", value: "#48120 · £240 · delivered 31 days ago" },
          { id: "asked", label: "They asked", value: "A full refund; the product stopped working after 4 weeks." },
          { id: "tried", label: "I already tried", value: "Offered a replacement and a 30% credit. Both declined." },
          { id: "policy", label: "Policy", value: "Refunds within 30 days. This is day 31." },
        ]}
        onTakeOver={() => setStage("personHandling")}
        onReturnToAgent={() => setStage("returnedToAgent")}
      />
    </div>
  );
}
