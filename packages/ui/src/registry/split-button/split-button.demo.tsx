"use client";

import { useState } from "react";

import { SplitButton } from "@/registry/split-button/split-button";

/**
 * Interactive preview of a primary action and its related alternatives.
 */
export default function SplitButtonDemo() {
  const [lastAction, setLastAction] = useState("No action selected yet.");

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <SplitButton
        label="Publish"
        onClick={() => setLastAction("Published your changes.")}
        items={[
          {
            label: "Schedule publish",
            onClick: () => setLastAction("Publish scheduled."),
          },
          {
            label: "Copy preview link",
            onClick: () => setLastAction("Preview link copied."),
            separator: true,
          },
          {
            label: "Save as draft",
            onClick: () => setLastAction("Saved as a draft."),
          },
        ]}
      />
      <p className="min-h-5 text-center text-sm text-muted-foreground" aria-live="polite">
        {lastAction}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <SplitButton
          label="Continue"
          variant="outline"
          size="sm"
          onClick={() => setLastAction("Continued with the selected option.")}
          items={[
            {
              label: "Continue and review",
              onClick: () => setLastAction("Opened review."),
            },
          ]}
        />
        <SplitButton
          label="Saving"
          loading
          onClick={() => undefined}
          items={[]}
        />
        <SplitButton
          label="Unavailable"
          disabled
          onClick={() => undefined}
          items={[]}
        />
      </div>
    </div>
  );
}
