"use client";

import * as React from "react";

import { GhostInput } from "@/registry/ghost-input/ghost-input";

/**
 * A small canned phrase bank standing in for a real completion model, so the docs
 * preview has no network dependency and no external state. Real usage passes a
 * `fetchSuggestion` that calls an actual model.
 */
const PHRASES = [
  "Thanks for reaching out — happy to help with that.",
  "Thank you for your patience while we looked into this.",
  "Following up on our conversation from last week.",
  "I wanted to check in on the status of this request.",
  "Please let me know if you have any questions.",
  "Looking forward to hearing your thoughts.",
];

async function fakeFetchSuggestion(value: string, signal: AbortSignal): Promise<string | null> {
  // Simulated network latency, cancellable like a real fetch would be.
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(resolve, 450);
    signal.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  const trimmed = value.trimStart();
  if (!trimmed) return null;

  const match = PHRASES.find(
    (phrase) => phrase.toLowerCase().startsWith(trimmed.toLowerCase()) && phrase.length > trimmed.length
  );

  return match ?? null;
}

export default function GhostInputDemo() {
  const [value, setValue] = React.useState("Thanks for reach");

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <label htmlFor="ghost-input-demo" className="text-sm font-medium">
        Reply
      </label>
      <GhostInput
        id="ghost-input-demo"
        value={value}
        onValueChange={setValue}
        fetchSuggestion={fakeFetchSuggestion}
        placeholder="Start typing a reply…"
      />
      <p className="text-xs text-muted-foreground">
        Try "Thank you for your", "Following up", or "I wanted to check" — pause, then press Tab.
      </p>
    </div>
  );
}
