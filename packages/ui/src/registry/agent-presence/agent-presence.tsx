"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The agent's turn. Motion belongs to the machine; stillness belongs to the user.
 * That inversion is the whole grammar — see DESIGN.md §3a.
 */
export type AgentState =
  // Machine's turn — these move.
  | "queued"
  | "thinking"
  | "deciding"
  | "working"
  | "streaming"
  | "done"
  | "failed"
  | "cancelled"
  // User's turn — these hold perfectly still.
  | "suggesting"
  | "asking"
  | "awaitingApproval";

export type AgentPresenceForm = "field" | "orb" | "line";

type StateConfig = {
  /** Whose turn it is. Drives the single most important visual decision. */
  turn: "machine" | "user";
  label: string;
  /** Seconds per rotation for the orb; undefined means it holds still. */
  spin?: number;
  /** Resting dot scale. */
  scale: number;
  /** Dot opacity — user-turn states sit brighter, because they want an answer. */
  opacity: number;
};

const STATES: Record<AgentState, StateConfig> = {
  queued: { turn: "machine", label: "Queued", spin: 24, scale: 0.5, opacity: 0.35 },
  thinking: { turn: "machine", label: "Thinking", spin: 12, scale: 0.75, opacity: 0.6 },
  deciding: { turn: "machine", label: "Choosing an action", spin: 7, scale: 0.8, opacity: 0.7 },
  working: { turn: "machine", label: "Working", spin: 4, scale: 0.9, opacity: 0.8 },
  streaming: { turn: "machine", label: "Responding", spin: 9, scale: 0.85, opacity: 0.75 },
  done: { turn: "machine", label: "Done", scale: 0.55, opacity: 0.3 },
  failed: { turn: "machine", label: "Failed", scale: 0.4, opacity: 0.35 },
  cancelled: { turn: "machine", label: "Stopped", scale: 0.4, opacity: 0.25 },

  suggesting: { turn: "user", label: "Has a suggestion", scale: 1, opacity: 1 },
  asking: { turn: "user", label: "Needs your input", scale: 1, opacity: 1 },
  awaitingApproval: { turn: "user", label: "Waiting for your approval", scale: 1, opacity: 1 },
};

const SIZE: Record<"sm" | "default" | "lg", { px: number; dot: number; grid: number; points: number }> = {
  sm: { px: 24, dot: 1.5, grid: 5, points: 48 },
  default: { px: 40, dot: 2, grid: 7, points: 96 },
  lg: { px: 88, dot: 3, grid: 11, points: 180 },
};

export interface AgentPresenceProps extends React.ComponentPropsWithoutRef<"div"> {
  state: AgentState;
  form?: AgentPresenceForm;
  size?: "sm" | "default" | "lg";
  /** Overrides the state's default label. For `working`, name the actual tool. */
  label?: string;
  /** Hide the text label and show only the indicator. The label is still announced. */
  hideLabel?: boolean;
  /** Shown while it is the machine's turn. Never hidden behind a hover. */
  onCancel?: () => void;
}

/** Deterministic per-dot value, so a dot keeps its character between renders. */
function hash(index: number): number {
  const x = Math.sin(index * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Points evenly distributed on a sphere via the Fibonacci spiral — an even distribution
 * rather than the flat ring of dots most "AI orbs" use, which is what makes it read as
 * a volume instead of a circle. Positions are static; the parent rotates in CSS, and
 * perspective does the depth scaling for free.
 */
function spherePoints(count: number, radius: number) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    return {
      x: +(Math.cos(theta) * r * radius).toFixed(2),
      y: +(y * radius).toFixed(2),
      z: +(Math.sin(theta) * r * radius).toFixed(2),
    };
  });
}

/**
 * The agent's state, expressed rather than described. Motion means the machine is
 * busy; stillness means it is your turn — so a user learns in about three interactions
 * to read "am I needed?" without reading a word.
 *
 * Three forms share one state vocabulary: `field` (cell matrix, the system's
 * signature), `orb` (a true Fibonacci sphere, for hero surfaces), and `line` (inline,
 * for status bars and table rows).
 */
function AgentPresence({
  state,
  form = "field",
  size = "default",
  label,
  hideLabel,
  onCancel,
  className,
  ...props
}: AgentPresenceProps) {
  const config = STATES[state];
  const dims = SIZE[size];
  const text = label ?? config.label;

  // The single decision everything else follows from.
  const moving = config.turn === "machine" && Boolean(config.spin);

  const points = React.useMemo(
    () => (form === "orb" ? spherePoints(dims.points, dims.px / 2 - dims.dot) : []),
    [form, dims.points, dims.px, dims.dot]
  );

  const indicator = (
    <span
      aria-hidden="true"
      data-turn={config.turn}
      data-state={state}
      className={cn(
        "relative inline-block shrink-0 transition-opacity duration-[var(--pd-duration-base)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
        form === "line" && "inline-flex items-center gap-[3px]"
      )}
      style={{
        width: form === "line" ? undefined : dims.px,
        height: form === "line" ? undefined : dims.px,
        opacity: config.opacity,
      }}
    >
      {form === "orb" ? (
        <span
          className={cn(
            "absolute inset-0 [transform-style:preserve-3d]",
            // Stillness is the signal: a user-turn orb does not rotate at all.
            moving && "animate-[pd-orb-spin_var(--pd-orb-duration)_linear_infinite]",
            "motion-reduce:animate-none"
          )}
          style={
            {
              perspective: `${dims.px * 3}px`,
              ["--pd-orb-duration" as string]: `${config.spin ?? 0}s`,
            } as React.CSSProperties
          }
        >
          {points.map((point, index) => (
            <span
              key={index}
              className="absolute left-1/2 top-1/2 rounded-full bg-foreground transition-transform duration-[var(--pd-duration-slow)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none"
              style={{
                width: dims.dot,
                height: dims.dot,
                transform: `translate3d(${point.x}px, ${point.y}px, ${point.z}px) scale(${
                  Math.round((config.scale * (0.7 + hash(index) * 0.5)) * 100) / 100
                })`,
              }}
            />
          ))}
        </span>
      ) : form === "field" ? (
        <span
          className="grid size-full"
          style={{
            gridTemplateColumns: `repeat(${dims.grid}, 1fr)`,
            gridTemplateRows: `repeat(${dims.grid}, 1fr)`,
          }}
        >
          {Array.from({ length: dims.grid * dims.grid }, (_, index) => (
            <span key={index} className="flex items-center justify-center">
              <span
                className={cn(
                  "block aspect-square w-[52%] rounded-full bg-foreground will-change-transform",
                  moving
                    ? "animate-[pd-cell-pulse_var(--pd-cell-duration)_ease-in-out_infinite] motion-reduce:animate-none"
                    : "transition-transform duration-[var(--pd-duration-slow)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none"
                )}
                style={
                  moving
                    ? ({
                        ["--pd-cell-duration" as string]: `${(config.spin ?? 8) / 4}s`,
                        animationDelay: `${-(Math.round(hash(index) * 100) / 100) * 2}s`,
                      } as React.CSSProperties)
                    : { transform: `scale(${config.scale})` }
                }
              />
            </span>
          ))}
        </span>
      ) : (
        Array.from({ length: 3 }, (_, index) => (
          <span
            key={index}
            className={cn(
              "block rounded-full bg-foreground will-change-transform",
              moving
                ? "animate-[pd-cell-pulse_1.2s_ease-in-out_infinite] motion-reduce:animate-none"
                : "transition-transform duration-[var(--pd-duration-slow)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none"
            )}
            style={{
              width: dims.dot + 1,
              height: dims.dot + 1,
              animationDelay: moving ? `${index * 0.16}s` : undefined,
              transform: moving ? undefined : `scale(${config.scale})`,
            }}
          />
        ))
      )}
    </span>
  );

  return (
    <div className={cn("flex items-center gap-2.5", className)} {...props}>
      {indicator}

      {/* The text is the real signal; the indicator is supplementary and aria-hidden. */}
      <span
        role="status"
        aria-live="polite"
        className={cn(
          "text-sm",
          hideLabel && "sr-only",
          config.turn === "user" ? "font-medium text-foreground" : "text-muted-foreground",
          // Shimmers only while the machine is actually working — a terminal state like
          // `done` or `failed` describes a finished fact, not an ongoing activity.
          !hideLabel && moving && "pd-shimmer"
        )}
      >
        {text}
      </span>

      {onCancel && config.turn === "machine" && Boolean(config.spin) ? (
        <button
          type="button"
          onClick={onCancel}
          className="relative rounded-md px-1.5 py-0.5 text-xs font-medium text-muted-foreground underline-offset-2 outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] after:absolute after:inset-x-0 after:-inset-y-2.5 after:content-[''] motion-reduce:transition-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          Stop
        </button>
      ) : null}
    </div>
  );
}

export { AgentPresence, STATES as agentPresenceStates };
