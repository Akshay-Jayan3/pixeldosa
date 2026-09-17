"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface CodeBlockProps extends React.ComponentPropsWithoutRef<"div"> {
  code: string;
  language?: string;
  /** Shown instead of the language when the code belongs to a file. */
  filename?: string;
  /** The code is still arriving. Copy and Apply wait for the whole thing. */
  streaming?: boolean;
  /**
   * Bring your own highlighter (Shiki, Prism, …). Return the highlighted markup for the
   * whole block. Without one, code renders as plain text, which is correct, just unstyled.
   */
  highlight?: (code: string, language?: string) => React.ReactNode;
  /** Adds an Apply action. Resolve when done; reject to show a failure. */
  onApply?: () => void | Promise<void>;
  applyLabel?: string;
  showLineNumbers?: boolean;
  /** Longer blocks collapse behind "Show all N lines". Set to `Infinity` to never collapse. */
  collapseAfter?: number;
}

type ActionState = "idle" | "working" | "done" | "failed";

/**
 * Code in an AI answer — something people copy into real projects, so the details that
 * prevent mistakes come first.
 *
 * While the code is still streaming, the header says so and Copy and Apply wait. Half a
 * function copied into an editor is a worse outcome than a disabled button. Copy confirms
 * or says it failed, because a silent failure means pasting whatever was on the
 * clipboard before. Apply reports its own progress and result.
 *
 * Long blocks collapse after a threshold with the line count visible, so a 200-line file
 * doesn't bury the explanation after it. Long lines scroll by default, because wrapping
 * changes how code reads, and a Wrap toggle is there for narrow screens. Highlighting is
 * pluggable to keep the component free of a heavy grammar bundle.
 */
function CodeBlock({
  code,
  language,
  filename,
  streaming = false,
  highlight,
  onApply,
  applyLabel = "Apply",
  showLineNumbers = false,
  collapseAfter = 24,
  className,
  ...props
}: CodeBlockProps) {
  const [copy, setCopy] = React.useState<ActionState>("idle");
  const [apply, setApply] = React.useState<ActionState>("idle");
  const [wrap, setWrap] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState("");
  const copyTimer = React.useRef<number | undefined>(undefined);
  const regionId = React.useId();

  React.useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  // A trailing newline from a stream shouldn't add an empty numbered line.
  const text = code.replace(/\n$/, "");
  const lines = text.split("\n");
  const collapsible = !streaming && lines.length > collapseAfter;
  const collapsed = collapsible && !expanded;

  const doCopy = async () => {
    window.clearTimeout(copyTimer.current);
    try {
      await navigator.clipboard.writeText(text);
      setCopy("done");
      setAnnouncement("Copied to clipboard");
    } catch {
      setCopy("failed");
      setAnnouncement("Couldn't copy to clipboard");
    }
    copyTimer.current = window.setTimeout(() => setCopy("idle"), 2000);
  };

  const doApply = async () => {
    if (!onApply || apply === "working") return;
    setApply("working");
    try {
      await onApply();
      setApply("done");
      setAnnouncement("Applied");
    } catch {
      setApply("failed");
      setAnnouncement("Apply failed");
    }
  };

  const label = filename ?? language ?? "Code";

  return (
    <div
      role="group"
      aria-label={streaming ? `${label}, still being written` : label}
      aria-busy={streaming || undefined}
      className={cn("min-w-0 overflow-hidden rounded-lg border bg-muted/40 text-foreground", className)}
      {...props}
    >
      <div className="flex h-9 items-center justify-between gap-2 border-b pl-3 pr-1.5">
        <span className="flex min-w-0 items-center gap-2 text-xs">
          <span className={cn("truncate text-muted-foreground", filename && "font-mono text-foreground")}>{label}</span>
          {streaming ? <span className="shrink-0 text-muted-foreground pd-shimmer">Writing</span> : null}
        </span>

        <span className="flex shrink-0 items-center gap-0.5">
          <button type="button" aria-pressed={wrap} onClick={() => setWrap((value) => !value)} className={headerButton}>
            Wrap
          </button>
          <button type="button" onClick={doCopy} disabled={streaming} className={headerButton}>
            {copy === "done" ? "Copied" : copy === "failed" ? "Couldn't copy" : "Copy"}
          </button>
          {onApply ? (
            <button
              type="button"
              onClick={doApply}
              disabled={streaming || apply === "working" || apply === "done"}
              className={cn(
                headerButton,
                "ml-1 border border-input",
                apply === "failed" && "border-destructive/50 text-destructive"
              )}
            >
              {apply === "working" ? <span className="pd-shimmer">Applying</span> : apply === "done" ? "Applied" : apply === "failed" ? "Retry apply" : applyLabel}
            </button>
          ) : null}
        </span>
      </div>

      <div
        id={regionId}
        // Collapsed: 12 lines at 1.5rem plus the vertical padding.
        className={cn("relative", collapsed && "max-h-[19.5rem] overflow-hidden")}
      >
        <div className={cn("flex text-[0.8125rem] leading-6", !wrap && "overflow-x-auto")}>
          {showLineNumbers && !wrap ? (
            <div aria-hidden="true" data-pd-decorative className="shrink-0 select-none border-r py-3 pl-3 pr-2 text-right font-mono text-muted-foreground/60 tabular-nums">
              {lines.map((_, index) => (
                <div key={index}>{index + 1}</div>
              ))}
            </div>
          ) : null}
          <pre className={cn("min-w-0 flex-1 px-3 py-3 font-mono", wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre")}>
            <code>{highlight ? highlight(text, language) : text}</code>
          </pre>
        </div>

        {collapsed ? (
          <div className="absolute inset-x-0 bottom-0 flex justify-center border-t border-dashed bg-background py-2">
            <button
              type="button"
              aria-expanded={false}
              aria-controls={regionId}
              onClick={() => setExpanded(true)}
              className="relative rounded-full border bg-popover px-3 py-1 text-xs font-medium text-popover-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] after:absolute after:inset-x-0 after:-inset-y-2 after:content-[''] motion-reduce:transition-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              Show all <span className="tabular-nums">{lines.length}</span> lines
            </button>
          </div>
        ) : null}
      </div>

      {/* One message at a time: the latest result, never two joined together. */}
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}

const headerButton =
  "relative h-7 rounded-md px-2 text-xs font-medium text-muted-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] after:absolute after:inset-x-0 after:-inset-y-2 after:content-[''] motion-reduce:transition-none hover:bg-accent hover:text-foreground aria-pressed:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-40";

export type MarkdownSegment =
  | { type: "text"; content: string }
  | { type: "code"; content: string; language?: string; complete: boolean };

/**
 * Splits a (possibly still streaming) markdown string into text and fenced-code segments.
 * An unclosed fence at the end becomes a code segment with `complete: false`, so it can be
 * rendered as `<CodeBlock streaming>` instead of breaking the markdown renderer's layout
 * mid-stream.
 */
function splitCodeFences(markdown: string): MarkdownSegment[] {
  const segments: MarkdownSegment[] = [];
  const fence = /^(`{3,}|~{3,})[ \t]*([\w+#.-]*)[^\n]*\n/gm;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = fence.exec(markdown))) {
    const [opener, marker, language] = match;
    const start = match.index;
    if (start > cursor) segments.push({ type: "text", content: markdown.slice(cursor, start) });

    const bodyStart = start + opener.length;
    const closer = new RegExp(`^${marker![0] === "`" ? "`" : "~"}{${marker!.length},}[ \\t]*$`, "m");
    const rest = markdown.slice(bodyStart);
    const close = closer.exec(rest);

    if (!close) {
      segments.push({ type: "code", content: rest, language: language || undefined, complete: false });
      return segments;
    }

    segments.push({ type: "code", content: rest.slice(0, close.index), language: language || undefined, complete: true });
    cursor = bodyStart + close.index + close[0].length;
    if (markdown[cursor] === "\n") cursor += 1;
    fence.lastIndex = cursor;
  }

  if (cursor < markdown.length) segments.push({ type: "text", content: markdown.slice(cursor) });
  return segments;
}

export { CodeBlock, splitCodeFences };
