"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type MediaAction = {
  id: string;
  label: string;
  /** The one action that takes the result forward. At most one. */
  primary?: boolean;
};

export interface MediaResultProps extends Omit<React.ComponentPropsWithoutRef<"figure">, "onSelect"> {
  /** The result itself: an `img`, a `video`, an audio player. Yours to render. */
  children: React.ReactNode;
  /** What it is, in the user's words: "Bottle on stone, warm light". */
  title?: string;
  /** Aspect ratio of the frame, so the layout never jumps while media loads. */
  aspectRatio?: string;
  /**
   * What made it and when, formatted by you. Shown with the result, not hidden in a
   * details panel.
   */
  madeBy?: string;
  /**
   * Content Credentials (C2PA) and any visible or invisible watermark. Since August 2026
   * the EU AI Act's Article 50 and California's SB 942 both require machine-readable
   * disclosure of AI-generated media, so this is a product requirement, not a nicety.
   */
  credentials?: {
    /** True once your pipeline has signed the file. */
    attached: boolean;
    /** "Content Credentials + SynthID", "C2PA manifest signed by Acme". */
    detail?: string;
    /** Where someone can check it. */
    href?: string;
  };
  /** Your own note: usage rights, model terms, "for internal use". */
  note?: string;
  actions?: MediaAction[];
  onAction?: (actionId: string) => void;
}

/**
 * A finished piece of generated media, with its provenance attached.
 *
 * Two laws that took effect in August 2026 — the EU AI Act's Article 50 and California's
 * SB 942 — require machine-readable disclosure of AI-generated media, and the major
 * generators now sign their output with Content Credentials and an invisible watermark.
 * So the frame states what made the result and whether credentials are attached, in
 * words, beside the thing itself. When they aren't attached it says so plainly rather
 * than staying quiet, because an unmarked file is the one a team needs to know about
 * before it ships.
 *
 * Holds completely still: the work is finished.
 */
function MediaResult({
  children,
  title,
  aspectRatio = "1 / 1",
  madeBy,
  credentials,
  note,
  actions,
  onAction,
  className,
  ...props
}: MediaResultProps) {
  const captionId = React.useId();

  return (
    <figure
      aria-labelledby={title ? captionId : undefined}
      className={cn("flex flex-col overflow-hidden rounded-lg border bg-card", className)}
      {...props}
    >
      <div style={{ aspectRatio }} className="flex w-full items-center justify-center overflow-hidden bg-muted">
        {children}
      </div>

      <figcaption className="flex flex-col gap-2 border-t p-3">
        {title ? (
          <p id={captionId} className="text-sm font-medium text-foreground text-pretty">
            {title}
          </p>
        ) : null}

        {madeBy ? <p className="text-xs text-muted-foreground text-pretty">{madeBy}</p> : null}

        {credentials ? (
          <p
            className={cn(
              "flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs",
              credentials.attached ? "text-muted-foreground" : "text-agent-waiting"
            )}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3.5 shrink-0">
              {credentials.attached ? (
                <path
                  d="M8 1.5 13.5 4v4c0 3-2.4 5.6-5.5 6.5C4.9 13.6 2.5 11 2.5 8V4L8 1.5Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              ) : (
                <>
                  <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M8 5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <circle cx="8" cy="11" r="0.8" fill="currentColor" />
                </>
              )}
            </svg>
            <span className="text-pretty">
              {credentials.attached
                ? credentials.detail
                  ? `Marked as AI-made · ${credentials.detail}`
                  : "Marked as AI-made, with content credentials"
                : "No content credentials attached yet"}
            </span>
            {credentials.href ? (
              <a
                href={credentials.href}
                className="rounded-sm font-medium underline underline-offset-4 outline-none hover:no-underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
              >
                Check them
              </a>
            ) : null}
          </p>
        ) : null}

        {note ? <p className="text-xs text-muted-foreground text-pretty">{note}</p> : null}

        {actions && actions.length > 0 && onAction ? (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => onAction(action.id)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                  action.primary
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </figcaption>
    </figure>
  );
}

export { MediaResult };
