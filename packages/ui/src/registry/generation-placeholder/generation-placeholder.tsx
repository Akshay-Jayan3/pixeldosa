"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type GenerationStatus = "queued" | "generating" | "processing" | "done" | "failed";
/**
 * Four ways to say "this much is done", because different media make different
 * promises about what "done" looks like:
 * - `field`  — dot density resolving. The system's default signature.
 * - `mosaic` — blocks subdividing coarse → fine, the way an image actually gains
 *              resolution. Reads as detail arriving rather than area filling.
 * - `sweep`  — a soft-edged develop frontier crossing the surface, closest to the
 *              gradient wash people recognise from Gemini-style generation.
 * - `bars`   — for audio, where a rectangle would misrepresent the medium.
 */
export type GenerationForm = "field" | "mosaic" | "sweep" | "bars";

export interface GenerationPlaceholderProps extends React.ComponentPropsWithoutRef<"div"> {
  status: GenerationStatus;
  /**
   * 0–1, and only when the backend actually reports it (diffusion steps, encoded
   * frames). Omit for indeterminate — the component never fabricates a percentage or
   * creeps toward 90%, because a made-up number is worse than an honest "still working".
   */
  progress?: number;
  /**
   * Reserves the artifact's final bounds so nothing shifts when it arrives. Required,
   * not optional: a media placeholder that resizes on completion causes a layout jump
   * at exactly the moment the user is looking at it.
   */
  aspectRatio: string;
  /** Visible and announced status text, e.g. "Generating image". */
  label: string;
  form?: GenerationForm;
  density?: "sm" | "default" | "lg";
  onCancel?: () => void;
  /** Recovery path for `failed`. Without it the failure state explains but can't be acted on. */
  onRetry?: () => void;
  /** The finished artifact. Revealed when `status` is `done`. */
  children?: React.ReactNode;
}

const DENSITY: Record<NonNullable<GenerationPlaceholderProps["density"]>, { cols: number; rows: number }> = {
  sm: { cols: 12, rows: 8 },
  default: { cols: 24, rows: 16 },
  lg: { cols: 36, rows: 24 },
};

const BAR_COUNT: Record<NonNullable<GenerationPlaceholderProps["density"]>, number> = {
  sm: 16,
  default: 32,
  lg: 48,
};

/**
 * A stable pseudo-random value in [0,1) for a cell. Deterministic from the index, so a
 * cell keeps the same threshold across every render — otherwise the pattern would
 * reshuffle on each progress tick and read as noise instead of a resolve.
 */
function threshold(index: number): number {
  const x = Math.sin(index * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * A layout-reserving placeholder for AI-generated media. Encodes real generation
 * progress as a resolving dot field — each cell carries a stable threshold and
 * resolves once progress passes it, which is ordered-dither logic rather than
 * decoration — then cross-fades into the finished artifact.
 *
 * Progress is spatial, not temporal: the pattern itself carries the information, so
 * the component stays fully legible with every animation removed.
 */
function GenerationPlaceholder({
  status,
  progress,
  aspectRatio,
  label,
  form = "field",
  density = "default",
  onCancel,
  onRetry,
  children,
  className,
  ...props
}: GenerationPlaceholderProps) {
  const reduced = usePrefersReducedMotion();
  const active = status === "generating" || status === "processing";
  const determinate = typeof progress === "number" && status === "generating";
  /**
   * Indeterminate motion runs as a pure CSS animation with a per-cell negative delay,
   * not a requestAnimationFrame loop. The rAF version re-rendered several hundred React
   * nodes every frame just to nudge a transform, which is what made it stutter; this
   * version hands the whole thing to the compositor and React never re-renders at all.
   */
  const waving = active && !determinate && !reduced;

  const done = status === "done";
  const clamped = determinate ? Math.min(1, Math.max(0, progress)) : 0;

  const cellCount =
    form === "bars" ? BAR_COUNT[density] : DENSITY[density].cols * DENSITY[density].rows;

  /**
   * Mosaic block edge, in cells. Steps rather than eases: resolution genuinely arrives
   * in doublings, and a smoothly shrinking block would look like a zoom instead of a
   * refinement.
   */
  const blockSize = !determinate ? 4 : clamped < 0.25 ? 8 : clamped < 0.5 ? 4 : clamped < 0.8 ? 2 : 1;

  /**
   * The wave already recomputes every cell's scale on every animation frame, so a CSS
   * transition on top of it is a second animation racing the first: each frame sets a
   * new target 16ms before the previous 300ms transition can finish, and the result
   * stutters. The transition belongs only to *discrete* progress updates, where a real
   * backend jumps from step 18 to 19 and something has to smooth the gap.
   *
   * Linear, not eased: an eased transition restarts its curve on every interruption,
   * and progress updates interrupt constantly — so easing reads as uneven speed.
   */
  const cellMotion = waving
    ? "animate-[pd-cell-pulse_2s_ease-in-out_infinite]"
    : determinate
      ? "transition-transform duration-[var(--pd-duration-fast)] ease-linear motion-reduce:transition-none"
      : "transition-none";

  /**
   * How far a cell has resolved, 0–1.
   * - determinate: progress vs the cell's own threshold, with a short ramp so the
   *   frontier reads as a soft edge rather than a hard line.
   * - indeterminate: a travelling wave over the same thresholds.
   * - queued: everything at rest.
   */
  const cellScale = (index: number): number => {
    const raw = (): number => {
      if (status === "queued") return 0.26;
      if (status === "failed") return 0.2;
      // The multiplier is the softness of the frontier. Steep (≈6) makes progress very
      // readable but renders almost binary — every cell is either full or minimum.
      // 2.4 keeps roughly a third of cells mid-transition at any moment, which reads as
      // a density gradient while still encoding progress exactly.
      if (determinate) return Math.min(1, Math.max(0.26, (clamped - threshold(index)) * 2.4 + 0.5));
      return 0.5; // resting scale; the CSS animation takes over when `waving`
    };
    // Rounded because the value is serialised into an inline style: an unrounded float
    // stringifies differently on the server than on the client and trips React's
    // hydration check. Three decimals is far finer than a sub-pixel difference.
    return Math.round(raw() * 1000) / 1000;
  };

  /**
   * Per-cell style. When waving, the negative `animationDelay` offsets each cell into a
   * different point of the same loop — the threshold that orders the determinate
   * dissolve also orders the wave, so both modes read as the same material.
   */
  const cellStyle = (index: number, axis: "scale" | "scaleY"): React.CSSProperties =>
    waving
      ? { animationDelay: `${-(Math.round(threshold(index) * 1000) / 1000) * 2}s` }
      : { transform: `${axis}(${cellScale(index)})` };

  const grid = DENSITY[density];

  return (
    <div
      className={cn("relative overflow-hidden rounded-lg border bg-card", className)}
      style={{ aspectRatio }}
      {...props}
    >
      {/* The artifact. Mounted only once done, cross-fading over the field. */}
      {done ? (
        <div className="absolute inset-0 animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] motion-reduce:animate-none [&>*]:size-full [&>img]:object-cover">
          {children}
        </div>
      ) : null}

      {!done ? (
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 flex items-center justify-center p-4",
            // Collapsed to a faint remnant behind the failure panel: the field shows
            // how far it got, without competing with the message on top of it.
            status === "failed" && "opacity-25"
          )}
        >
          {form === "mosaic" ? (
            /**
             * Blocks subdivide as progress climbs — 6px-ish blocks at the start, single
             * cells at the end. Cells inside a block share one threshold, so they read
             * as a block rather than as noise. This is what an image actually does while
             * it generates: it gains *resolution*, not area, which is why this form
             * communicates "nearly there" better than a bar ever could.
             */
            <div
              className="grid size-full overflow-hidden rounded-md"
              style={{
                gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
                gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
              }}
            >
              {Array.from({ length: cellCount }, (_, index) => {
                const row = Math.floor(index / grid.cols);
                const col = index % grid.cols;
                const block = Math.floor(row / blockSize) * grid.cols + Math.floor(col / blockSize);
                const t = threshold(block);
                const opacity = determinate
                  ? Math.min(0.9, Math.max(0.06, (clamped - t) * 2 + 0.45))
                  : 0.28;
                return (
                  <span
                    key={index}
                    className={cn(
                      "block bg-foreground will-change-[opacity]",
                      waving
                        ? "animate-[pd-cell-pulse-opacity_2.4s_ease-in-out_infinite]"
                        : "transition-opacity duration-[var(--pd-duration-fast)] ease-linear motion-reduce:transition-none"
                    )}
                    style={
                      waving
                        ? { animationDelay: `${-(Math.round(t * 1000) / 1000) * 2.4}s` }
                        : { opacity: Math.round(opacity * 100) / 100 }
                    }
                  />
                );
              })}
            </div>
          ) : form === "sweep" ? (
            /**
             * A develop frontier: everything behind it is settled, everything ahead is
             * empty, and the edge itself is a soft gradient rather than a hard line —
             * which is what makes it read as developing rather than as a progress bar
             * wearing a costume. The frontier sits exactly at `progress`, so the visual
             * and the number can never disagree.
             */
            <div className="absolute inset-0 overflow-hidden rounded-md">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 bg-gradient-to-r from-foreground/[0.06] via-foreground/[0.10] to-foreground/25",
                  determinate
                    ? "transition-[width] duration-[var(--pd-duration-fast)] ease-linear motion-reduce:transition-none"
                    : "w-full animate-[pd-sweep_2.4s_ease-in-out_infinite] motion-reduce:animate-none motion-reduce:opacity-40"
                )}
                style={determinate ? { width: `${Math.round(clamped * 1000) / 10}%` } : undefined}
              />
              {determinate ? (
                <div
                  className="absolute inset-y-0 w-16 -translate-x-1/2 bg-gradient-to-r from-transparent via-foreground/30 to-transparent transition-[left] duration-[var(--pd-duration-fast)] ease-linear motion-reduce:transition-none"
                  style={{ left: `${Math.round(clamped * 1000) / 10}%` }}
                />
              ) : null}
            </div>
          ) : form === "field" ? (
            <div
              className="grid size-full"
              style={{
                gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
                gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
              }}
            >
              {Array.from({ length: cellCount }, (_, index) => (
                <span key={index} className="flex items-center justify-center">
                  <span
                    className={cn(
                      "block aspect-square w-[42%] rounded-full bg-foreground will-change-transform",
                      cellMotion
                    )}
                    style={cellStyle(index, "scale")}
                  />
                </span>
              ))}
            </div>
          ) : (
            <div className="flex size-full items-center justify-center gap-[2px]">
              {Array.from({ length: cellCount }, (_, index) => (
                <span
                  key={index}
                  className={cn(
                    "block h-[60%] w-full max-w-1.5 origin-center rounded-full bg-foreground will-change-transform",
                    cellMotion
                  )}
                  style={cellStyle(index, "scaleY")}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Failure takes the whole surface. A dimmed field with a red caption reads as
          "still working, but sad"; a stopped state should visibly stop. */}
      {status === "failed" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/80 p-6 text-center backdrop-blur-sm">
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-full border border-destructive/40 text-destructive"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-4">
              <path
                d="M12 8v5m0 3h.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <p role="status" aria-live="polite" className="text-sm text-foreground text-pretty">
            {label}
          </p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="relative rounded-md border border-input px-2.5 py-1 text-xs font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] after:absolute after:inset-x-0 after:-inset-y-2.5 after:content-[''] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              Try again
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Status line. The real signal — the field is supplementary and aria-hidden. */}
      {!done && status !== "failed" ? (
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
          <p className="text-xs text-muted-foreground">
            <span role="status" aria-live="polite">
              {label}
            </span>
          </p>

          <div className="flex items-center gap-2">
            {onCancel && active ? (
              <button
                type="button"
                onClick={onCancel}
                className="relative rounded-md border border-input bg-background/80 px-2 py-1 text-xs font-medium text-foreground outline-none backdrop-blur transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] after:absolute after:inset-x-0 after:-inset-y-2.5 after:content-[''] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
              >
                Cancel
              </button>
            ) : null}

            {/* The percentage is the one piece of hard information on this surface, so
                it gets a surface of its own rather than sitting inline with the label.
                tabular-nums keeps the pill from resizing as digits change. */}
            {determinate ? (
              <span className="rounded-full border bg-background/80 px-2.5 py-1 text-sm font-semibold text-foreground tabular-nums backdrop-blur">
                {Math.round(clamped * 100)}%
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { GenerationPlaceholder };
