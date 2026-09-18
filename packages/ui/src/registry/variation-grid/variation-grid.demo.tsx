"use client";

import * as React from "react";

import { VariationGrid, type Variation } from "@/registry/variation-grid/variation-grid";

/** Stand-ins for real results: a numbered card, so the demo needs no assets. */
function Swatch({ n, tone }: { n: number; tone: string }) {
  return (
    <span className={`flex size-full items-center justify-center text-sm text-foreground ${tone}`}>{n}</span>
  );
}

const TONES = ["bg-agent-working-soft", "bg-agent-done-soft", "bg-agent-waiting-soft", "bg-muted"];

function build(round: number): Variation[] {
  return [1, 2, 3, 4].map((n) => ({
    id: `r${round}-${n}`,
    label: `Version ${n}`,
    status: round === 2 && n === 3 ? ("failed" as const) : ("done" as const),
    note: round === 2 && n === 3 ? "The model timed out. 10 credits refunded." : undefined,
    preview: <Swatch n={n} tone={TONES[(n + round) % TONES.length]!} />,
  }));
}

export default function VariationGridDemo() {
  const [items, setItems] = React.useState(() => build(1));
  const [kept, setKept] = React.useState<string[]>([]);
  const [round, setRound] = React.useState(1);

  const regenerate = (ids: string[]) => {
    const next = round + 1;
    setItems((previous) =>
      previous.map((item) => (ids.includes(item.id) ? { ...item, status: "running" as const } : item))
    );
    window.setTimeout(() => {
      const fresh = build(next);
      setItems((previous) =>
        previous.map((item, index) => (ids.includes(item.id) ? { ...fresh[index]!, label: item.label } : item))
      );
      setRound(next);
    }, 1400);
  };

  return (
    <div className="w-full max-w-2xl">
      <VariationGrid
        headingLevel={2}
        title="A dark bottle on a stone surface"
        items={items}
        keptIds={kept}
        onKeptChange={setKept}
        onRegenerateRest={regenerate}
        regenerateCost={`${items.filter((item) => !kept.includes(item.id)).length * 10} credits`}
        onUse={() => undefined}
        onMore={() => undefined}
        onRetry={(id) => regenerate([id])}
      />
    </div>
  );
}
