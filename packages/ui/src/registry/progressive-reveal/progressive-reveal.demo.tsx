"use client";

import * as React from "react";

import { ProgressiveReveal } from "@/registry/progressive-reveal/progressive-reveal";

type Result = { id: string; title: string; snippet: string };

const RESULTS: Result[] = [
  { id: "1", title: "Design tokens explained", snippet: "Semantic layers, primitives, and theming." },
  { id: "2", title: "Building accessible forms", snippet: "Labels, descriptions, and error states." },
  { id: "3", title: "Motion that earns its place", snippet: "Durations, easing, and reduced-motion." },
  { id: "4", title: "Command palettes done right", snippet: "Keyboard-first navigation patterns." },
  { id: "5", title: "Reviewing AI-proposed changes", snippet: "Per-hunk diffs and trust models." },
];

export default function ProgressiveRevealDemo() {
  const [items, setItems] = React.useState<Result[]>([]);
  const [streaming, setStreaming] = React.useState(false);

  function start() {
    setItems([]);
    setStreaming(true);
    RESULTS.forEach((result, index) => {
      setTimeout(() => {
        setItems((current) => [...current, result]);
        if (index === RESULTS.length - 1) setStreaming(false);
      }, (index + 1) * 500);
    });
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <button
        type="button"
        onClick={start}
        disabled={streaming}
        className="self-start rounded-md border border-input px-3 py-1.5 text-xs font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        {streaming ? "Streaming…" : "Run search"}
      </button>

      <ProgressiveReveal
        items={items}
        keyExtractor={(item) => item.id}
        isStreaming={streaming}
        renderItem={(item) => (
          <div className="rounded-md border bg-background p-3">
            <p className="text-sm font-medium text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.snippet}</p>
          </div>
        )}
      />
    </div>
  );
}
