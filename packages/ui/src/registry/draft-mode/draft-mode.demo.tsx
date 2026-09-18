"use client";

import * as React from "react";

import { DraftMode, type DraftItem } from "@/registry/draft-mode/draft-mode";

const PREPARED: DraftItem[] = [
  {
    id: "1",
    title: "Email Dana about the renewal",
    target: "dana@acme.com",
    detail: "Answers her pricing question and attaches the Q3 summary.",
  },
  {
    id: "2",
    title: "Reply to the billing thread",
    target: "3 recipients",
    detail: "Confirms the duplicate invoice was cancelled.",
  },
  {
    id: "3",
    title: "Update the pricing page",
    target: "acme.com/pricing · live",
    detail: "Changes the per-seat figure to $18.",
    irreversible: true,
  },
];

export default function DraftModeDemo() {
  const [enabled, setEnabled] = React.useState(true);
  const [items, setItems] = React.useState(PREPARED);
  const [sent, setSent] = React.useState<string[]>([]);

  return (
    <div className="flex w-full max-w-lg flex-col items-start gap-3">
      <DraftMode
        headingLevel={2}
        enabled={enabled}
        onEnabledChange={setEnabled}
        items={items}
        onSend={(ids) => {
          setSent(items.filter((item) => ids.includes(item.id)).map((item) => item.title));
          setItems((previous) => previous.filter((item) => !ids.includes(item.id)));
        }}
        onDiscard={(ids) => setItems((previous) => previous.filter((item) => !ids.includes(item.id)))}
        onEdit={() => undefined}
      />
      {sent.length > 0 ? (
        <p className="animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] text-sm text-muted-foreground text-pretty motion-reduce:animate-none">
          Sent: {sent.join(", ")}.
        </p>
      ) : null}
      {items.length === 0 ? (
        <button
          type="button"
          onClick={() => {
            setItems(PREPARED);
            setSent([]);
          }}
          className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Let the agent prepare more
        </button>
      ) : null}
    </div>
  );
}
