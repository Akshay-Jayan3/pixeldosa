import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Hand-drawn marks for the docs site. They're the site's voice, not interface: every
 * one is decorative (`aria-hidden`), sits next to real text, and draws itself only when
 * motion is allowed (see `.pd-draw` in globals.css).
 */

const UNDERLINES = {
  wave: "M2 6 C 20 2, 40 9, 58 5 S 88 3, 98 6",
  swoosh: "M2 7 C 30 3, 60 3, 98 5 M 8 9 C 40 6, 70 7, 94 8",
  loop: "M2 6 C 25 9, 45 2, 60 6 C 70 9, 66 1, 58 4 C 70 6, 85 5, 98 5",
} as const;

const COLORS = {
  working: "var(--agent-working)",
  waiting: "var(--agent-waiting)",
  blocked: "var(--agent-blocked)",
  done: "var(--agent-done)",
  ink: "var(--foreground)",
} as const;

export function Scribble({
  children,
  variant = "wave",
  color = "working",
  delay,
  className,
}: {
  children: ReactNode;
  variant?: keyof typeof UNDERLINES;
  color?: keyof typeof COLORS;
  /** Seconds before the stroke starts drawing on load. */
  delay?: number;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-block whitespace-nowrap", className)}>
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
        className="pd-draw pointer-events-none absolute -left-[2%] bottom-[-0.08em] h-[0.22em] w-[104%] overflow-visible"
        style={delay === undefined ? undefined : ({ "--pd-draw-delay": `${delay}s` } as CSSProperties)}
      >
        <path
          d={UNDERLINES[variant]}
          pathLength={1}
          fill="none"
          stroke={COLORS[color]}
          strokeWidth="3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}

/** A handwritten note in the margin with a drawn arrow pointing at what it's about. */
export function MarginNote({
  children,
  arrow = "down-left",
  className,
}: {
  children: ReactNode;
  arrow?: "down-left" | "down-right" | "left" | "up-left";
  className?: string;
}) {
  const paths = {
    "down-left": { d: "M44 4 C 40 18, 26 28, 8 34 M8 34 L 18 35 M8 34 L 13 25", box: "0 0 48 40" },
    "down-right": { d: "M4 4 C 8 18, 22 28, 40 34 M40 34 L 30 35 M40 34 L 35 25", box: "0 0 48 40" },
    left: { d: "M44 14 C 32 8, 20 20, 6 16 M6 16 L 14 10 M6 16 L 13 22", box: "0 0 48 28" },
    "up-left": { d: "M44 36 C 40 22, 26 12, 8 6 M8 6 L 18 5 M8 6 L 13 15", box: "0 0 48 40" },
  }[arrow];

  return (
    <span className={cn("inline-flex items-start gap-1 font-hand text-base leading-tight text-muted-foreground", className)}>
      {arrow === "left" || arrow.endsWith("left") ? (
        <svg aria-hidden="true" viewBox={paths.box} className="pd-draw mt-1 h-8 w-10 shrink-0 overflow-visible">
          <path d={paths.d} pathLength={1} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
      <span className="max-w-[16ch] text-pretty">{children}</span>
      {arrow === "down-right" ? (
        <svg aria-hidden="true" viewBox={paths.box} className="pd-draw mt-1 h-8 w-10 shrink-0 overflow-visible">
          <path d={paths.d} pathLength={1} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  );
}

/** A marker swatch drawn like a quick fill with a felt pen, not a rounded box. */
export function MarkerSwatch({ color }: { color: "working" | "waiting" | "blocked" | "done" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 36 36" className="pd-draw size-9 shrink-0 overflow-visible">
      <path
        d="M6 8 C 14 6, 24 7, 30 6 C 31 14, 30 22, 31 30 C 22 31, 13 30, 5 31 C 6 22, 5 15, 6 8 Z"
        fill={`var(--agent-${color}-soft)`}
        stroke="none"
      />
      <path
        d="M9 12 L 27 10 M8 18 L 28 16 M9 24 L 27 23"
        pathLength={1}
        fill="none"
        stroke={`var(--agent-${color})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M6 8 C 14 6, 24 7, 30 6 C 31 14, 30 22, 31 30 C 22 31, 13 30, 5 31 C 6 22, 5 15, 6 8 Z"
        pathLength={1}
        fill="none"
        stroke={`var(--agent-${color})`}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A short pen rule under a page title: the page's signature, drawn on load. */
export function SketchRule({ color = "working", className }: { color?: keyof typeof COLORS; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 10"
      className={cn("pd-draw block h-2.5 w-28 overflow-visible", className)}
    >
      <path
        d="M2 6 C 22 2, 42 9, 62 5 S 100 3, 118 6"
        pathLength={1}
        fill="none"
        stroke={COLORS[color]}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A small drafting-board illustration for the marketing hero's margin. */
export function SketchStudy({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 160"
      className={cn("pd-draw size-40 overflow-visible", className)}
    >
      <path
        d="M24 25 137 21 140 135 20 139Z"
        fill="none"
        stroke="var(--foreground)"
        strokeOpacity=".38"
        strokeWidth="1"
      />
      <path
        d="M48 23 45 138M75 22 74 137M103 22 104 136M132 22 134 135M22 52 139 49M21 80 139 79M21 109 140 108M20 132 140 130"
        fill="none"
        stroke="var(--foreground)"
        strokeOpacity=".22"
        strokeWidth="1"
      />
      <path
        d="M52 64C57 48 74 41 91 44c18 3 31 19 29 37-2 20-17 34-36 35-20 1-36-13-37-31-.5-7 1-14 5-21Z"
        fill="var(--illustration-lilac)"
        fillOpacity=".88"
      />
      <path
        d="M113 44c6-5 14-3 17 3 3 7-1 14-8 15-6 1-11-4-11-10 0-3 1-6 2-8Z"
        fill="var(--illustration-peach)"
      />
      <path
        d="M38 112c5-4 12-2 14 3 3 6-1 12-7 13-6 1-10-3-10-8 0-3 1-6 3-8Z"
        fill="var(--illustration-butter)"
      />
      <path
        d="M51 65C58 48 75 42 92 45c17 3 29 18 27 36-2 18-17 32-35 34-19 1-34-12-36-29"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M15 34h12m-6-6v12M137 145h12m-6-6v12M12 128h10m-5-5v10M143 18h8m-4-4v8"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="25" cy="139" r="2.5" fill="var(--foreground)" />
      <circle cx="139" cy="22" r="2.5" fill="var(--foreground)" />
    </svg>
  );
}
