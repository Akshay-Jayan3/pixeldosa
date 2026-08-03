/**
 * PixelDosa design tokens — the single source of truth for every colour, radius,
 * spacing and type value in the system.
 *
 * Why this file exists rather than per-component Tailwind classes: components are
 * distributed via the shadcn registry, which means they land in codebases we do not
 * control. Anchoring every visual decision to a small set of semantic CSS variables
 * is what lets a PixelDosa component look correct in a host app that has its own
 * theme, and lets us restyle the whole system without touching component source.
 *
 * The CSS custom properties consumed by components are generated from this file by
 * `scripts/build-css.ts`. Never hand-edit the generated CSS.
 */

/**
 * Semantic colour roles. Components reference these roles — never raw palette
 * values — so that light/dark and future themes are a token-layer concern.
 */
export type ColorToken =
  | "background"
  | "foreground"
  | "card"
  | "card-foreground"
  | "popover"
  | "popover-foreground"
  | "primary"
  | "primary-foreground"
  | "secondary"
  | "secondary-foreground"
  | "muted"
  | "muted-foreground"
  | "accent"
  | "accent-foreground"
  | "destructive"
  | "destructive-foreground"
  | "border"
  | "input"
  | "ring";

export type ColorScale = Record<ColorToken, string>;

/**
 * The PixelDosa identity: warm stone neutrals (hue ~70, low chroma) against a
 * toasted-copper primary. Deliberately off the default shadcn zinc/blue axis —
 * Section 11 requires the system be distinguishable from a default theme at a glance.
 *
 * Values are OKLCH so that lightness steps are perceptually even, which keeps the
 * light and dark scales visually symmetrical without hand-tuning each pair.
 */
export const colorsLight: ColorScale = {
  background: "oklch(0.991 0.004 92)",
  foreground: "oklch(0.216 0.012 68)",
  card: "oklch(1 0 0)",
  "card-foreground": "oklch(0.216 0.012 68)",
  popover: "oklch(1 0 0)",
  "popover-foreground": "oklch(0.216 0.012 68)",
  primary: "oklch(0.598 0.163 43)",
  "primary-foreground": "oklch(0.988 0.008 85)",
  secondary: "oklch(0.955 0.011 88)",
  "secondary-foreground": "oklch(0.278 0.014 68)",
  muted: "oklch(0.955 0.011 88)",
  "muted-foreground": "oklch(0.532 0.017 72)",
  accent: "oklch(0.936 0.028 82)",
  "accent-foreground": "oklch(0.278 0.014 68)",
  destructive: "oklch(0.554 0.196 27)",
  "destructive-foreground": "oklch(0.985 0.006 85)",
  border: "oklch(0.905 0.012 84)",
  input: "oklch(0.905 0.012 84)",
  ring: "oklch(0.598 0.163 43)",
};

export const colorsDark: ColorScale = {
  background: "oklch(0.181 0.011 66)",
  foreground: "oklch(0.958 0.008 88)",
  card: "oklch(0.222 0.013 68)",
  "card-foreground": "oklch(0.958 0.008 88)",
  popover: "oklch(0.222 0.013 68)",
  "popover-foreground": "oklch(0.958 0.008 88)",
  primary: "oklch(0.724 0.158 52)",
  "primary-foreground": "oklch(0.196 0.024 48)",
  secondary: "oklch(0.276 0.014 70)",
  "secondary-foreground": "oklch(0.958 0.008 88)",
  muted: "oklch(0.276 0.014 70)",
  "muted-foreground": "oklch(0.706 0.016 76)",
  accent: "oklch(0.318 0.026 62)",
  "accent-foreground": "oklch(0.958 0.008 88)",
  destructive: "oklch(0.638 0.194 26)",
  "destructive-foreground": "oklch(0.985 0.006 85)",
  border: "oklch(0.305 0.014 70)",
  input: "oklch(0.335 0.014 70)",
  ring: "oklch(0.724 0.158 52)",
};

/**
 * Radius scale. `base` is intentionally larger than the shadcn default (0.5rem) —
 * softer corners are part of the identity, and every other step derives from it so
 * a single change re-proportions the system.
 */
export const radius = {
  base: "0.75rem",
  sm: "calc(var(--radius) - 4px)",
  md: "calc(var(--radius) - 2px)",
  lg: "var(--radius)",
  xl: "calc(var(--radius) + 4px)",
} as const;

/** 4px-based spacing scale. Keys are the Tailwind-facing step names. */
export const spacing = {
  "0": "0rem",
  px: "1px",
  "1": "0.25rem",
  "2": "0.5rem",
  "3": "0.75rem",
  "4": "1rem",
  "5": "1.25rem",
  "6": "1.5rem",
  "8": "2rem",
  "10": "2.5rem",
  "12": "3rem",
  "16": "4rem",
  "20": "5rem",
  "24": "6rem",
} as const;

/** Type scale: [font-size, line-height]. */
export const fontSize = {
  xs: ["0.75rem", "1rem"],
  sm: ["0.875rem", "1.25rem"],
  base: ["1rem", "1.5rem"],
  lg: ["1.125rem", "1.75rem"],
  xl: ["1.25rem", "1.75rem"],
  "2xl": ["1.5rem", "2rem"],
  "3xl": ["1.875rem", "2.25rem"],
  "4xl": ["2.25rem", "2.5rem"],
  "5xl": ["3rem", "1.1"],
} as const;

export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export type DesignTokens = {
  colorsLight: ColorScale;
  colorsDark: ColorScale;
  radius: typeof radius;
  spacing: typeof spacing;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
};
