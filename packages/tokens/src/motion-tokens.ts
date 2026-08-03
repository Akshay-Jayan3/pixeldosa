/**
 * PixelDosa motion tokens — the single source of truth for every duration, easing
 * curve and stagger interval in the system.
 *
 * Most component libraries bolt motion values on per-component and end up with a
 * dozen slightly different "fast" fades. Centralising them here means the whole
 * system shares one rhythm, and tuning that rhythm is a one-file change.
 *
 * Rule (Section 6): a component that hardcodes a duration or easing value fails review.
 */

/** Durations in seconds — the unit Motion expects, so no conversion at call sites. */
export const duration = {
  /** Sub-perceptual feedback: hover tints, press states. */
  instant: 0.1,
  /** Small local changes: icon swaps, tooltip fades. */
  fast: 0.2,
  /** The default for most enter/exit transitions. */
  base: 0.3,
  /** Layout-affecting changes that need to be followable. */
  slow: 0.5,
  /** Deliberate, attention-directing motion. Use sparingly. */
  deliberate: 0.8,
} as const;

/**
 * Cubic-bezier control points, typed as 4-tuples so Motion accepts them directly.
 */
export type Bezier = readonly [number, number, number, number];

export const easing = {
  /** Symmetric — for changes that both start and end on screen. */
  standard: [0.4, 0, 0.2, 1] as Bezier,
  /** Fast out, slow in — for elements entering the viewport. */
  decelerate: [0, 0, 0.2, 1] as Bezier,
  /** Slow out, fast in — for elements leaving the viewport. */
  accelerate: [0.4, 0, 1, 1] as Bezier,
  /**
   * Spring config for continuous, interruptible motion (cursor tracking, drag).
   * Prefer this over any duration above when the animation has no fixed end state.
   */
  spring: { stiffness: 300, damping: 20 },
} as const;

/** Delay between siblings in a staggered sequence, in seconds. */
export const stagger = {
  tight: 0.03,
  base: 0.06,
  loose: 0.1,
} as const;

/**
 * The reduced-motion contract. Section 5 requires a *fallback*, not a disabled
 * animation: state changes must still be legible, they just stop translating or
 * scaling. Components read this and swap their transition config rather than
 * removing the animated element.
 */
export const reducedMotion = {
  /** Near-zero but non-zero, so React/Motion still fire completion callbacks. */
  duration: 0.01,
  easing: easing.standard,
} as const;

export type Duration = keyof typeof duration;
export type Easing = keyof typeof easing;
export type Stagger = keyof typeof stagger;
