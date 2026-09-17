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
  | "ring"
  | AgentToken;

/**
 * The four agent markers. Everything else in the system is ink; these are the only
 * colours, and each has one job:
 *  - working: the agent is busy — progress, the step it's on, what it's reading;
 *  - waiting: it needs the person — a question or an approval (the only colour that asks);
 *  - blocked: something failed or is in the way, always shown with a way forward;
 *  - done: a finished result being handed over. Used sparingly.
 * Each has a `-soft` fill for the surface behind it. The strong colour reads as text on
 * the ground, the card and its own soft fill (≥4.5:1 in both themes), so a marker can be
 * a label, not only a dot.
 */
export type AgentToken =
  | "agent-working"
  | "agent-working-soft"
  | "agent-waiting"
  | "agent-waiting-soft"
  | "agent-blocked"
  | "agent-blocked-soft"
  | "agent-done"
  | "agent-done-soft";

export type ColorScale = Record<ColorToken, string>;

/**
 * Ink on paper. Light is the default: a warm off-white page, near-black ink, and a
 * pencil grey for secondary text. The look is a sketchbook, not a glowing screen, so
 * there are no tinted surfaces beyond the agent markers. Chosen 2026-09-16 from the
 * hand-drawn character study, where these values were set as sRGB and converted:
 * light — paper #f7f7f3, card #fdfdfb, ink #1c1d1f, pencil #5f6166, wash #efeee8,
 * rule #e2e1db; dark — ground #151614, card #1d1e1c, ink #ecebe6, pencil #a3a29b,
 * wash #282926, rule #30312e.
 *
 * Measured text contrast: ink on paper 15.7:1 (light) / 15.2:1 (dark); pencil on paper,
 * card and wash stays between 5.3:1 and 7.1:1 in both themes.
 *
 * Values are OKLCH so lightness steps stay perceptually even between the two themes.
 */
export const colorsLight: ColorScale = {
  background: "oklch(0.975 0.005 106)",
  foreground: "oklch(0.231 0.004 264)",
  card: "oklch(0.993 0.003 106)",
  "card-foreground": "oklch(0.231 0.004 264)",
  popover: "oklch(0.993 0.003 106)",
  "popover-foreground": "oklch(0.231 0.004 264)",
  primary: "oklch(0.231 0.004 264)",
  "primary-foreground": "oklch(0.993 0.003 106)",
  secondary: "oklch(0.948 0.008 99)",
  "secondary-foreground": "oklch(0.231 0.004 264)",
  muted: "oklch(0.948 0.008 99)",
  // Pencil sits on the wash (badges, kbd hints, code chips) as often as on the paper, so
  // it is set to clear 4.5:1 on both: 5.3 on the wash, 5.8 on the paper.
  "muted-foreground": "oklch(0.493 0.008 268)",
  accent: "oklch(0.948 0.008 99)",
  "accent-foreground": "oklch(0.231 0.004 264)",
  // Darker than the dark theme's red on purpose: destructive is used both as text on paper
  // ("High risk", field errors) and as a fill under light text.
  destructive: "oklch(0.55 0.22 27)",
  "destructive-foreground": "oklch(0.985 0.005 24)",
  border: "oklch(0.909 0.008 99)",
  input: "oklch(0.850 0.011 101)",
  ring: "oklch(0.493 0.008 268)",
  "agent-working": "oklch(0.506 0.182 265)",
  "agent-working-soft": "oklch(0.937 0.024 268)",
  "agent-waiting": "oklch(0.532 0.137 50)",
  "agent-waiting-soft": "oklch(0.949 0.031 71)",
  "agent-blocked": "oklch(0.523 0.171 28)",
  "agent-blocked-soft": "oklch(0.932 0.028 26)",
  "agent-done": "oklch(0.518 0.106 84)",
  "agent-done-soft": "oklch(0.957 0.046 94)",
};

export const colorsDark: ColorScale = {
  background: "oklch(0.198 0.004 129)",
  foreground: "oklch(0.939 0.007 97)",
  card: "oklch(0.233 0.004 129)",
  "card-foreground": "oklch(0.939 0.007 97)",
  popover: "oklch(0.233 0.004 129)",
  "popover-foreground": "oklch(0.939 0.007 97)",
  primary: "oklch(0.939 0.007 97)",
  "primary-foreground": "oklch(0.198 0.004 129)",
  secondary: "oklch(0.279 0.006 122)",
  "secondary-foreground": "oklch(0.939 0.007 97)",
  muted: "oklch(0.279 0.006 122)",
  "muted-foreground": "oklch(0.711 0.010 100)",
  accent: "oklch(0.285 0.006 122)",
  "accent-foreground": "oklch(0.939 0.007 97)",
  // Bright enough to read as text on the dark ground…
  destructive: "oklch(0.653 0.184 24)",
  // …which makes light text on it fail (3.3:1), so destructive fills carry dark text in
  // dark mode. One red can't serve both roles with light text on this ground.
  "destructive-foreground": "oklch(0.16 0.02 24)",
  border: "oklch(0.311 0.005 122)",
  input: "oklch(0.381 0.007 118)",
  ring: "oklch(0.711 0.010 100)",
  "agent-working": "oklch(0.731 0.122 267)",
  "agent-working-soft": "oklch(0.289 0.052 266)",
  "agent-waiting": "oklch(0.779 0.127 63)",
  "agent-waiting-soft": "oklch(0.299 0.038 69)",
  "agent-blocked": "oklch(0.712 0.147 26)",
  "agent-blocked-soft": "oklch(0.287 0.042 25)",
  "agent-done": "oklch(0.826 0.137 92)",
  "agent-done-soft": "oklch(0.302 0.041 94)",
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
