"use client";

import * as React from "react";

import { Message, MessageContent } from "@/registry/message/message";
import { Suggestions } from "@/registry/suggestions/suggestions";

export default function SuggestionsDemo() {
  const [draft, setDraft] = React.useState("");
  const [asked, setAsked] = React.useState<string | null>(null);

  return (
    <div className="flex w-full max-w-xl flex-col gap-5">
      <Message role="assistant" author="Assistant">
        <MessageContent>
          <p>
            Churn rose in August mostly among teams that never finished setup. Accounts that completed the checklist
            kept renewing at the usual rate.
          </p>
        </MessageContent>
      </Message>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">Fill: edit before asking</p>
        <Suggestions
          items={["Which teams didn't finish setup?", "Draft an onboarding email", "Compare with July"]}
          onSelect={(prompt) => setDraft(prompt)}
        />
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask a follow-up…"
          aria-label="Follow-up"
          className="h-9 rounded-md border border-input bg-transparent px-3 text-base text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:text-sm"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">Send: ask immediately</p>
        <Suggestions
          mode="send"
          layout="list"
          items={[
            { id: "segments", label: "Break churn down by plan and team size" },
            { id: "forecast", label: "What happens to Q4 revenue if this continues?" },
          ]}
          onSelect={(prompt) => setAsked(prompt)}
        />
        {asked ? (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Sent: &ldquo;{asked}&rdquo;
          </p>
        ) : null}
      </div>
    </div>
  );
}
