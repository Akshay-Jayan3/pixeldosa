"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type CodeBlockProps = {
  code: string;
  language?: string;
  className?: string;
  /** Collapse tall blocks behind a toggle — used for full component source. */
  collapsible?: boolean;
};

export function CodeBlock({ code, language, className, collapsible }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const [expanded, setExpanded] = React.useState(!collapsible);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={cn("relative overflow-hidden rounded-lg border bg-card", className)}>
      {language ? (
        <div className="flex items-center justify-between border-b px-4 py-2">
          <span className="font-mono text-xs text-muted-foreground">{language}</span>
        </div>
      ) : null}

      <button
        type="button"
        onClick={copy}
        className="absolute right-2 top-2 z-10 rounded-md border bg-background/80 px-2 py-1 font-mono text-xs text-muted-foreground backdrop-blur transition-colors duration-[var(--pd-duration-instant)] hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
      >
        {copied ? "copied" : "copy"}
      </button>

      <pre
        className={cn(
          "overflow-x-auto p-4 text-sm leading-relaxed",
          !expanded && "max-h-80"
        )}
      >
        <code className="font-mono">{code}</code>
      </pre>

      {collapsible ? (
        <div className="border-t">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="w-full px-4 py-2 text-sm text-muted-foreground transition-colors duration-[var(--pd-duration-instant)] hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
            aria-expanded={expanded}
          >
            {expanded ? "Collapse source" : "Expand source"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
