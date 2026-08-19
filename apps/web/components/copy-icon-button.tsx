"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Icon-only copy button meant to sit inside a `<Link>` (a grid tile that
 * otherwise navigates to the example's detail page) — preventDefault plus
 * stopPropagation keep a copy click from also triggering navigation.
 */
export function CopyIconButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy code"}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground",
        "transition-colors duration-[var(--pd-duration-instant)] hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
        className
      )}
    >
      {copied ? (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-3.5">
          <path
            d="M20 6 9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-3.5">
          <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M5 15V6a2 2 0 0 1 2-2h9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
