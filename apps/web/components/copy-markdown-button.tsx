"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Copies the page's plain-markdown rendition (see lib/docs#buildComponentMarkdown)
 * to the clipboard — mirrors the copy-state pattern in CodeBlock rather than
 * introducing a second convention for the same interaction.
 */
export function CopyMarkdownButton({ markdown }: { markdown: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5",
        "text-sm font-medium transition-colors duration-[var(--pd-duration-instant)]",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
        <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M5 15V6a2 2 0 0 1 2-2h9"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      {copied ? "Copied" : "Copy as Markdown"}
    </button>
  );
}
