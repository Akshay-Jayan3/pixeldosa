"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface CompareViewProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title"> {
  /** Level of the title heading, so it fits the outline of the page it's placed in. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  title?: string;
  /** What it was. Give it a real description: this is also its alt text. */
  before: { content: React.ReactNode; label: string };
  /** What the AI made of it. */
  after: { content: React.ReactNode; label: string };
  /** Start in `slider` (one image, a handle) or `side` (both, at once). */
  view?: "slider" | "side";
  /** Locks the view when your layout only fits one of them. */
  allowViewChange?: boolean;
  /** Keeps whichever one the person picks. */
  onChoose?: (choice: "before" | "after") => void;
  chooseBeforeLabel?: string;
  chooseAfterLabel?: string;
  /** Aspect ratio of the frame, so nothing jumps while the media loads. */
  aspectRatio?: string;
}

/**
 * Before and after, without the usual accessibility failure.
 *
 * Comparison sliders are everywhere in AI editing tools and almost all of them are
 * mouse-only: a draggable handle built from pointer maths, no keyboard, no announcement,
 * and often no description of either image. This one is a real `input[type=range]`, so
 * arrows, Home and End work, screen readers read a labelled slider, and the position is a
 * percentage anyone can hear. Both sides carry a required label, and a side-by-side view
 * is one click away for anyone who would rather see both at once.
 *
 * Holds still: comparing is the user's turn.
 */
function CompareView({
  headingLevel = 3,
  title = "Before and after",
  before,
  after,
  view: initialView = "slider",
  allowViewChange = true,
  onChoose,
  chooseBeforeLabel = "Keep the original",
  chooseAfterLabel = "Keep the new one",
  aspectRatio = "4 / 3",
  className,
  ...props
}: CompareViewProps) {
  const Heading = `h${headingLevel}` as "h3";
  const headingId = React.useId();
  const sliderId = React.useId();
  const [view, setView] = React.useState(initialView);
  const [position, setPosition] = React.useState(50);

  return (
    <section
      aria-labelledby={headingId}
      className={cn("flex flex-col gap-3", className)}
      {...props}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Heading id={headingId} className="text-sm font-medium text-foreground">
          {title}
        </Heading>
        {allowViewChange ? (
          <div className="inline-flex rounded-md border p-0.5">
            {(["slider", "side"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                onClick={() => setView(option)}
                className={cn(
                  "rounded-[5px] px-2 py-0.5 text-xs outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                  view === option ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option === "slider" ? "Slider" : "Side by side"}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {view === "side" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[before, after].map((side, index) => (
            <figure key={index} className="flex flex-col gap-1.5">
              <div style={{ aspectRatio }} className="overflow-hidden rounded-lg border bg-muted">
                {side.content}
              </div>
              <figcaption className="text-xs text-muted-foreground">{side.label}</figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div style={{ aspectRatio }} className="relative overflow-hidden rounded-lg border bg-muted">
            <div className="absolute inset-0">{before.content}</div>
            {/* The "after" is clipped rather than resized, so both sides stay aligned. */}
            <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
              {after.content}
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 w-0.5 bg-foreground"
              style={{ left: `${position}%` }}
            />
          </div>

          {/* A native range: keyboard, touch and screen readers come free, and there is no
              pointer maths to get wrong.

              The handle *is* the divider, so a higher value uncovers more of the original
              and less of the new one. `aria-valuetext` therefore counts down from the
              value, not up with it — announcing the raw number told a screen-reader user
              the opposite of what was on screen (at 0, the whole edit is visible). */}
          <label htmlFor={sliderId} className="sr-only">
            Slide to compare {before.label} with {after.label}
          </label>
          <input
            id={sliderId}
            type="range"
            min={0}
            max={100}
            step={1}
            value={position}
            onChange={(event) => setPosition(Number(event.target.value))}
            aria-valuetext={`${100 - position}% ${after.label} showing`}
            className="w-full accent-[var(--foreground)] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
          />
          <p className="flex justify-between text-xs text-muted-foreground">
            <span>{before.label}</span>
            <span>{after.label}</span>
          </p>
        </div>
      )}

      {onChoose ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChoose("after")}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            {chooseAfterLabel}
          </button>
          <button
            type="button"
            onClick={() => onChoose("before")}
            className="rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            {chooseBeforeLabel}
          </button>
        </div>
      ) : null}
    </section>
  );
}

export { CompareView };
