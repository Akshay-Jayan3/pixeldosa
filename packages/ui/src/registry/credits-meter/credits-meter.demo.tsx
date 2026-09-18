"use client";

import * as React from "react";

import { CreditsMeter } from "@/registry/credits-meter/credits-meter";

const SIZES = [
  { label: "4 images · 1024 × 1024", cost: 40 },
  { label: "8 images · 1024 × 1024", cost: 80 },
  { label: "4 images · upscaled to 4K", cost: 260 },
];

export default function CreditsMeterDemo() {
  const [index, setIndex] = React.useState(0);
  const remaining = 120;
  const action = SIZES[index]!;

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <CreditsMeter
        remaining={`${remaining} credits`}
        allowance="2,000 this month"
        used={1 - remaining / 2000}
        low
        nextAction={{
          label: action.label,
          cost: `${action.cost} credits`,
          affordable: action.cost <= remaining,
        }}
        resets="Resets on 1 October"
        recent="12 refunded yesterday when a batch failed"
        onTopUp={() => undefined}
      />
      <div className="flex flex-wrap gap-1.5">
        {SIZES.map((size, i) => (
          <button
            key={size.label}
            type="button"
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
            className={
              i === index
                ? "rounded-full border border-foreground bg-foreground px-2.5 py-1 text-xs text-background"
                : "rounded-full border border-input px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }
          >
            {size.label}
          </button>
        ))}
      </div>
    </div>
  );
}
