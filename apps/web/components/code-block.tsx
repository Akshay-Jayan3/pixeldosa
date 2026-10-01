"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type CodeBlockProps = {
  code: string;
  language?: string;
  className?: string;
};

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

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
        className="absolute right-4 top-2 z-10 rounded-md border bg-card px-2 py-1 font-mono text-xs text-muted-foreground transition-colors duration-[var(--pd-duration-instant)] hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
      >
        {copied ? "copied" : "copy"}
      </button>

      {/* Focusable so keyboard users can scroll a long or wide snippet. */}
      <pre
        tabIndex={0}
        className="overflow-x-auto p-4 text-sm leading-relaxed outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/40"
      >
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
