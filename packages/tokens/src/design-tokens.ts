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
 * The PixelDosa identity, revision 3: pure monochrome. No brand hue anywhere in
 * the neutral or primary roles — `primary` is just foreground-on-background
 * inverted (near-black on white in light, near-white on near-black in dark), the
 * same move Linear's own secondary/default UI and Vercel/Geist's whole system
 * make: contrast carries the hierarchy, not a colour accent. `destructive` is the
 * one token that keeps real chroma, because "this is dangerous" is a semantic
 * signal a grayscale UI still needs to send.
 *
 * Dark neutrals are cool and near-black, referencing Linear and Framer — deep,
 * low-chroma canvases (`background`/`popover` sit around L 0.14–0.17, hue ~243–248,
 * chroma ~0.003, i.e. essentially achromatic with a faint cool cast) with
 * high-contrast near-white text, depth communicated through `1px` borders rather
 * than heavy shadows. The specific values were derived by converting a measured
 * snapshot of linear.app's shipped CSS (background `#0f1011`/`#08090a`, text
 * `#f7f8f8`/`#8a8f98`, border `#2a2e33`; see https://designmd.cc/benchmarks/linear)
 * from sRGB to OKLCH — the hue/lightness relationships are sourced, not guessed,
 * though the conversion was done by hand without a colour library, so treat these
 * as a close approximation rather than a bit-exact match. Referenced as
 * structural inspiration only, per this file's "never copy" research rule — no
 * Linear brand asset is reproduced.
 *
 * Light neutrals reference shadcn/ui's own default "neutral" base-colour scale
 * (this repo's `apps/web/components.json` already declares `baseColor: "neutral"`,
 * so this brings the token values in line with the config that was already chosen)
 * — true 0-chroma grays, the same axis Componentry's light theme uses.
 *
 * Values are OKLCH so that lightness steps are perceptually even, which keeps the
 * light and dark scales visually symmetrical without hand-tuning each pair.
 */
export const colorsLight: ColorScale = {
  background: "oklch(1 0 0)",
  foreground: "oklch(0.145 0 0)",
  card: "oklch(1 0 0)",
  "card-foreground": "oklch(0.145 0 0)",
  popover: "oklch(1 0 0)",
  "popover-foreground": "oklch(0.145 0 0)",
  primary: "oklch(0.145 0 0)",
  "primary-foreground": "oklch(0.985 0 0)",
  secondary: "oklch(0.97 0 0)",
  "secondary-foreground": "oklch(0.205 0 0)",
  muted: "oklch(0.97 0 0)",
  "muted-foreground": "oklch(0.556 0 0)",
  accent: "oklch(0.97 0 0)",
  "accent-foreground": "oklch(0.205 0 0)",
  destructive: "oklch(0.653 0.184 24)",
  "destructive-foreground": "oklch(0.985 0.005 24)",
  border: "oklch(0.922 0 0)",
  input: "oklch(0.922 0 0)",
  ring: "oklch(0.556 0 0)",
};

export const colorsDark: ColorScale = {
  background: "oklch(0.139 0.003 246)",
  foreground: "oklch(0.978 0.003 240)",
  card: "oklch(0.172 0.003 248)",
  "card-foreground": "oklch(0.978 0.003 240)",
  popover: "oklch(0.139 0.003 243)",
  "popover-foreground": "oklch(0.978 0.003 240)",
  primary: "oklch(0.978 0.003 240)",
  "primary-foreground": "oklch(0.139 0.003 246)",
  secondary: "oklch(0.24 0.006 250)",
  "secondary-foreground": "oklch(0.978 0.003 240)",
  muted: "oklch(0.24 0.006 250)",
  "muted-foreground": "oklch(0.649 0.014 263)",
  accent: "oklch(0.28 0.01 252)",
  "accent-foreground": "oklch(0.978 0.003 240)",
  destructive: "oklch(0.653 0.184 24)",
  "destructive-foreground": "oklch(0.98 0.005 24)",
  border: "oklch(0.299 0.011 254)",
  input: "oklch(0.32 0.012 254)",
  ring: "oklch(0.649 0.014 263)",
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
