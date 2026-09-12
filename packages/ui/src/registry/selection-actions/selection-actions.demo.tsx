"use client";

import * as React from "react";

import {
  SelectionActions,
  type SelectionAction,
  type SelectionActionResult,
} from "@/registry/selection-actions/selection-actions";

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={path} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const actions: SelectionAction[] = [
  { id: "explain", label: "Explain", icon: <Icon path="M12 18h.01M12 6a3 3 0 0 0-3 3M12 15v-2c1.5 0 2-1 2-2" /> },
  { id: "rewrite", label: "Rewrite", icon: <Icon path="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /> },
  { id: "translate", label: "Translate", icon: <Icon path="M4 5h7M9 3v2c0 4-2 7-5 8m3-4c1.5 1.5 3 2 5 2M14 21l4-9 4 9m-7-2h6" /> },
  { id: "classify", label: "Classify", icon: <Icon path="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM17 14v6M14 17h6" /> },
  { id: "extract", label: "Extract", icon: <Icon path="M4 6h16M4 12h10M4 18h6" /> },
];

/** Stands in for real model calls, shaped per action so the docs preview has no network dependency. */
async function fakeAction(
  actionId: string,
  selectedText: string,
  signal: AbortSignal
): Promise<SelectionActionResult> {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(resolve, 700);
    signal.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  switch (actionId) {
    case "rewrite":
      return { kind: "replacement", value: selectedText.replace(/is/g, "remains").replace(/quick/i, "swift") };
    case "translate":
      return { kind: "text", value: `[French] ${selectedText}` };
    case "classify":
      return { kind: "classification", label: "Neutral tone", confidence: "medium" };
    case "extract":
      return { kind: "list", items: selectedText.split(" ").filter((word) => /^[A-Z]/.test(word)) || ["No entities found"] };
    case "explain":
    default:
      return { kind: "text", value: `This describes a fast-moving subject performing a common action — a classic pangram used to test fonts.` };
  }
}

export default function SelectionActionsDemo() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [text, setText] = React.useState(
    "The quick brown fox jumps over the lazy dog. Selecting any part of this paragraph reveals a floating toolbar with AI actions."
  );

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <div
        ref={containerRef}
        className="rounded-md border bg-background p-4 text-sm leading-relaxed text-foreground"
      >
        {text}
      </div>
      <p className="text-xs text-muted-foreground">
        Select a few words above to reveal the toolbar. Try "Rewrite" to see the result
        routed through Diff Accept for review.
      </p>
      <SelectionActions
        containerRef={containerRef}
        actions={actions}
        onAction={fakeAction}
        onReplace={(merged, original) => setText((current) => current.replace(original, merged))}
      />
    </div>
  );
}
