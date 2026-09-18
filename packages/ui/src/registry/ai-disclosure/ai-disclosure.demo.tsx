"use client";

import * as React from "react";

import { AIDisclosure } from "@/registry/ai-disclosure/ai-disclosure";

export default function AIDisclosureDemo() {
  const [decision, setDecision] = React.useState<"allowed" | "declined" | null>(null);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <AIDisclosure
        headingLevel={2}
        title="Written by AI, from your project"
        summary="A draft reply, prepared from this thread and your saved tone. Check it before sending."
        facts={[
          { id: "used", label: "What it used", value: "The last 20 messages in this thread and your tone settings." },
          { id: "kept", label: "How long it's kept", value: "The draft stays in this thread until you delete it." },
          { id: "training", label: "Training", value: "Your content isn't used to train the model." },
        ]}
        learnMoreHref="#"
      />

      {decision ? (
        <p className="animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] text-sm text-muted-foreground motion-reduce:animate-none">
          {decision === "allowed" ? "Recording and summarising this call." : "Not recording. The agent takes no notes."}{" "}
          <button
            type="button"
            onClick={() => setDecision(null)}
            className="font-medium underline underline-offset-2 hover:no-underline"
          >
            Ask again
          </button>
        </p>
      ) : (
        <AIDisclosure
          headingLevel={2}
          variant="consent"
          title="Record and summarise this call?"
          summary="Everyone on the call is told. You can stop it at any point."
          facts={[
            { id: "who", label: "Who can see it", value: "You and the three people on this call." },
            { id: "kept", label: "How long it's kept", value: "30 days, then deleted." },
          ]}
          allowLabel="Record and summarise"
          declineLabel="Don't record"
          onAllow={() => setDecision("allowed")}
          onDecline={() => setDecision("declined")}
        />
      )}
    </div>
  );
}
