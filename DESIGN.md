# PixelDosa — DESIGN.md

A design engineering system for AI startups. This file is the standing reference for
**visual identity, UI/UX rules, and taste** — check it before generating or reviewing
any UI, the same way `SKILL.md` is checked before building a component. Where the two
overlap, `SKILL.md` governs *process* (research → plan → build → QA); this file governs
*what the result should look and feel like*.

Format follows the emerging [DESIGN.md convention](https://github.com/voltagent/awesome-design-md)
(Google Labs, Apache 2.0, 2026) — machine-readable tokens paired with human-readable
rationale, so any agent (not only Claude Code) can pick this up and stay consistent.

---

## 1. Identity, in one paragraph

Pure monochrome. No brand hue anywhere in the neutral or primary roles — `primary` is
foreground-on-background inverted (near-black on white in light, near-white on
near-black in dark), the same move Linear's secondary/default UI and Vercel/Geist make:
**contrast carries hierarchy, not colour.** `destructive` is the one token that keeps
real chroma, because "this is dangerous" is a signal a grayscale UI still needs to
send. Depth comes from `1px` borders, not heavy shadows. Corners are soft
(`--radius: 0.75rem` base) but not playful. The whole identity reads as **restrained,
not decorative** — closer to Linear/Framer's dark mode and shadcn's own neutral light
scale than to any "premium SaaS" gradient-and-glow aesthetic.

If a screen would look identical as a static Figma frame — no real state, no
manipulation, no motion earning its place — it is not on-brand for this system. See
§4 for the concrete filter.

---

## 2. Design tokens (machine-readable — source of truth is `packages/tokens/src/*.ts`, never hand-edit here)

```yaml
color:
  light:
    background: "oklch(1 0 0)"
    foreground: "oklch(0.145 0 0)"
    card: "oklch(1 0 0)"
    card-foreground: "oklch(0.145 0 0)"
    popover: "oklch(1 0 0)"
    popover-foreground: "oklch(0.145 0 0)"
    primary: "oklch(0.145 0 0)"
    primary-foreground: "oklch(0.985 0 0)"
    secondary: "oklch(0.97 0 0)"
    secondary-foreground: "oklch(0.205 0 0)"
    muted: "oklch(0.97 0 0)"
    muted-foreground: "oklch(0.556 0 0)"
    accent: "oklch(0.97 0 0)"
    accent-foreground: "oklch(0.205 0 0)"
    destructive: "oklch(0.653 0.184 24)"
    destructive-foreground: "oklch(0.985 0.005 24)"
    border: "oklch(0.922 0 0)"
    input: "oklch(0.922 0 0)"
    ring: "oklch(0.556 0 0)"
  dark:
    background: "oklch(0.139 0.003 246)"
    foreground: "oklch(0.978 0.003 240)"
    card: "oklch(0.172 0.003 248)"
    card-foreground: "oklch(0.978 0.003 240)"
    popover: "oklch(0.139 0.003 243)"
    popover-foreground: "oklch(0.978 0.003 240)"
    primary: "oklch(0.978 0.003 240)"
    primary-foreground: "oklch(0.139 0.003 246)"
    secondary: "oklch(0.24 0.006 250)"
    secondary-foreground: "oklch(0.978 0.003 240)"
    muted: "oklch(0.24 0.006 250)"
    muted-foreground: "oklch(0.649 0.014 263)"
    accent: "oklch(0.28 0.01 252)"
    accent-foreground: "oklch(0.978 0.003 240)"
    destructive: "oklch(0.653 0.184 24)"
    destructive-foreground: "oklch(0.98 0.005 24)"
    border: "oklch(0.299 0.011 254)"
    input: "oklch(0.32 0.012 254)"
    ring: "oklch(0.649 0.014 263)"

radius:
  base: 0.75rem   # --radius, everything else derives from this
  sm: "calc(var(--radius) - 4px)"   # 8px
  md: "calc(var(--radius) - 2px)"   # 10px
  lg: "var(--radius)"               # 12px
  xl: "calc(var(--radius) + 4px)"   # 16px

spacing:  # 4px base unit, rem values
  0: 0rem
  px: 1px
  1: 0.25rem
  2: 0.5rem
  3: 0.75rem
  4: 1rem
  5: 1.25rem
  6: 1.5rem
  8: 2rem
  10: 2.5rem
  12: 3rem
  16: 4rem
  20: 5rem
  24: 6rem

typography:
  # [font-size, line-height], rem. 5xl line-height is a unitless ratio, not rem.
  fontSize:
    xs: ["0.75rem", "1rem"]
    sm: ["0.875rem", "1.25rem"]
    base: ["1rem", "1.5rem"]
    lg: ["1.125rem", "1.75rem"]
    xl: ["1.25rem", "1.75rem"]
    2xl: ["1.5rem", "2rem"]
    3xl: ["1.875rem", "2.25rem"]
    4xl: ["2.25rem", "2.5rem"]
    5xl: ["3rem", "1.1"]
  fontWeight:
    normal: 400
    medium: 500
    semibold: 600
    bold: 700
  fontFamily: null  # NOT a token yet -- code uses Tailwind's default font-sans
                     # system stack (no next/font import). Do not invent a webfont.

motion:
  duration:  # seconds
    instant: 0.1   # sub-perceptual: hover tints, press states
    fast: 0.2      # small local changes: icon swaps, row highlights
    base: 0.3      # default for most enter/exit transitions
    slow: 0.5      # layout-affecting changes that need to be followable
    deliberate: 0.8  # attention-directing, use sparingly
  easing:  # cubic-bezier control points
    standard: [0.4, 0, 0.2, 1]     # symmetric -- starts and ends on screen
    decelerate: [0, 0, 0.2, 1]     # entering the viewport
    accelerate: [0.4, 0, 1, 1]     # leaving the viewport
    spring: { stiffness: 300, damping: 20 }  # continuous/interruptible only (drag, cursor tracking)
  stagger:  # seconds between siblings
    tight: 0.03
    base: 0.06
    loose: 0.1
  reducedMotion:
    duration: 0.01  # near-zero, not zero -- must still fire completion callbacks
    easing: standard
```

CSS custom property names (what actually ships in generated `tokens.css`):
`--background`, `--foreground`, `--primary`, `--border` etc. for color;
`--radius`, `--radius-sm/md/lg/xl` for radius; `--text-{key}` /
`--text-{key}--line-height` for type scale; `--pd-duration-*` / `--pd-ease-*` /
`--pd-stagger-*` for motion. **Never hardcode a hex, oklch(), px duration, or bezier
value in a component — reference the token.**

---

## 3. UI/UX rules — check these on every screen, not just every component

1. **Interaction is the value, or it's not on-brand.** Before building or approving
   any surface, ask: is the interaction itself the value, or is this a styled div? A
   card, badge, or layout wrapper that would look identical as a static frame gets
   deprioritized in favour of anything with real state, motion, or manipulation
   (streaming, drag, resize, command, filter, multi-step flow). This is the single
   filter every component in this registry has been checked against.
2. **Colour communicates state sparingly, decoration does the rest.** The token set
   has no "success"/"warning" hue — only `destructive` keeps real chroma. Do not
   invent a green/yellow accent for a confidence score, a diff, or a status. Use
   tiered indicators (filled/unfilled bars), text decoration (strikethrough for
   removed, underline for added), or plain text labels instead. This is a real
   constraint that has already shaped multiple shipped components (`Confidence
   Meter`'s tiered bars, `Diff Accept`'s decoration-not-colour diffing) — it is not a
   workaround, it is the house style, and it is also more accessible than a
   colour-only signal.
3. **Never fabricate "live generation."** If a value already exists in full at
   arrival time, reveal it with a plain fade/height-expansion — never
   character-by-character. A typewriter effect on already-complete content
   misrepresents what happened. This rule has been independently re-derived and
   applied in every AI-tier component so far (Ghost Input, Smart Field, Diff Accept,
   Progressive Reveal) — treat it as non-negotiable, not a per-component judgment
   call.
4. **Motion communicates state change, never decoration.** Every transition must map
   to a specific state change (open/close, loading, selected, arriving) and be
   describable in one sentence. If you can't name what state change a motion
   communicates, cut it.
5. **`prefers-reduced-motion` needs a fallback, not a removal.** Swap to
   `reducedMotion` (near-zero, non-zero duration) rather than deleting the
   transition or the animated element — completion callbacks must still fire, and
   the state change must stay legible without movement.
6. **Compose existing trust primitives instead of reinventing them.** Before
   building a new accept/reject, confidence, or provenance pattern, check whether
   `Diff Accept`, `Confidence Meter`, or `AI Context Surface` already solve it.
   `Selection Actions` composing `Diff Accept` for its Rewrite result (instead of a
   second accept/reject implementation) is the model to follow.
7. **Nothing commits silently.** Every AI-proposed change is a preview until
   explicitly accepted, with a one-step undo after. No auto-apply, no silent
   overwrite of a value the user already has.
8. **Accessibility is shipping criteria, not follow-up.** Keyboard-operable end to
   end, visible focus rings, correct ARIA roles, `aria-live` on state changes that
   aren't otherwise obvious, 44×44px minimum touch targets, responsive down to
   375px. A component that fails any of these is not done.
9. **Density matches `Field`'s existing rhythm.** Don't introduce a new spacing
   scale or padding convention per component — reuse what's already established.
10. **Motion means the machine is busy. Stillness means it's the user's turn.** See
    §3a — this is the system's signature grammar and it overrides any local instinct
    to pulse the thing that wants attention.
11. **Quantize, don't interpolate.** Continuous quantities coming from a model get
    expressed as discrete cells, not smooth bars or percentages. A model does not
    know it is 73.4% confident; cells structurally refuse to claim precision that
    isn't there. Already the shape of `Confidence Meter` (three tiers), `Diff Accept`
    (discrete hunks) and `Progressive Reveal` (one item at a time) — this names it as
    a rule rather than three coincidences.

---

## 3a. The turn-taking grammar (the signature)

Every AI product renders "thinking" and "waiting for your approval" in the same visual
register — something moving, plus a line of text. They are **opposites**. One means
*relax*; the other means *nothing proceeds until you act*.

> **Motion means the machine is busy. Stillness means it's your turn.**

- **Machine states move** — inward, self-contained, dimmed, unhurried. The user is a
  spectator and the motion says so.
- **Hand-off states stop.** The element resolves into a stable, brighter, oriented
  shape and holds *perfectly still*. The absence of motion is the signal.

This inverts the convention deliberately. It is learnable in about three interactions,
after which a user never has to read a word to know whether they're needed — which is
what actually produces confidence. Restraint again doing the work colour would
elsewhere.

**Every state must answer three questions without text:**

1. **Is it my turn or its turn?** → motion vs stillness.
2. **Can I stop it?** → a cancel affordance is visible during *every* machine state,
   never hidden behind a hover or an overflow menu.
3. **Is it safe to look away?** → a queued or long-running state must read differently
   from one about to finish, so the user can leave without anxiety.

**Shimmer the verb, never the content.** A status *verb* — "Thinking", "Reading",
"Generating" — may shimmer while the machine is genuinely working, because the activity
it names really is ongoing. Content, results, reasoning text and field values must never
shimmer: they are already determined, and animating them implies they are still being
composed. That is the same lie as a fake typewriter (§3.3), one layer up. The `pd-shimmer`
utility from the theme exists for exactly this and nothing else — apply it only to a
label describing work in progress, and drop it the moment the state is terminal.

The grammar is an **additional** channel, never the only one: every state still carries
a text label and an `aria-live` announcement (§3.8). A user who cannot perceive motion
loses nothing — under `prefers-reduced-motion` each state holds a *distinct static
configuration*, so the grammar survives with zero animation.

Full vocabulary, protocol mappings, and component set:
`plans/agent-expression-system-plan.md`.

---

## 4. Taste — the qualitative layer

- **Premium and timeless over trendy.** No gratuitous gradients, glowing borders,
  particle backgrounds, or glassmorphism. That territory is already well-served by
  Aceternity/Magic UI, and it is not this system's differentiation — see `ROADMAP.md`
  North Star for the full positioning.
- **Quiet until asked for.** Supporting information (provenance, confidence,
  explanation) defaults to collapsed/muted and expands on demand — it should never
  compete with the primary content for attention. `AI Context Surface`'s
  collapsed-by-default disclosure is the reference implementation of this instinct.
- **A confidence score is evidence, not a badge.** Prefer showing the actual source
  or reasoning behind an AI output over a bare number or decoration. If you can't
  show real evidence, say less, not more.
- **Restraint reads as trust.** This system's entire differentiation thesis is "AI
  embedded in ordinary product UI, not a chat product, not a visual-effects
  showcase" — every visual decision should reinforce that a human is still in
  control, never that the AI is putting on a show.
- **When in doubt, ask what Linear, Vercel, Raycast, or Notion would ship** — not
  what would look impressive in a screenshot. Reference points are structural
  inspiration only; never copy an asset.
- **Machine-native over organic.** Where a state needs a visual presence, prefer a
  form that reads as computation (cells, grids, structured point fields) over one that
  reads as biology (a breathing orb, a pulsing blob). An orb pretends to have a mind;
  a field shows work being done. The same honesty rule as §3.3's no-fake-typing, one
  layer up. The orb *form* is not banned — it's a legitimate showcase rendering — but
  it must express real states, never stand in for a spinner.
- **States morph, they never cut.** A transition between two agent states is a
  continuous reconfiguration of the same elements, not a swap between two animations.
  This is the hardest thing in the system to fake and the clearest available signal of
  craft — if a transition looks like a cross-fade between two GIFs, it isn't done.

---

## 5. Quick reference — do / don't

| Do | Don't |
|---|---|
| Reference a semantic token (`bg-primary`, `var(--pd-duration-fast)`) | Hardcode a hex, `oklch()`, px duration, or bezier curve |
| Use tiered bars or text decoration for state | Invent a red/yellow/green accent that doesn't exist in the token set |
| Fade/height-expand content that already fully exists | Reveal AI output character-by-character |
| Collapse supporting info by default, expand on demand | Force provenance/explanation into view by default |
| Compose `Diff Accept`/`Confidence Meter`/`AI Context Surface` | Re-implement accept/reject or confidence display from scratch |
| Require an explicit accept before anything commits | Auto-apply an AI-proposed change |
| Map every transition to a named state change | Animate for decoration |
| Provide a `prefers-reduced-motion` fallback that preserves legibility | Delete the animated element under reduced motion |
| Hold an agent state **still** when it's the user's turn | Pulse or animate the thing that wants attention |
| Keep cancel visible during every machine state | Hide cancel behind a hover or overflow menu |
| Quantize model output into discrete cells | Render a smooth bar or a raw percentage for a model's certainty |
| Morph continuously between agent states | Cross-fade between two separate animations |
| Shimmer a status verb while work is genuinely ongoing | Shimmer content, results or a finished state |

---

## 5a. Craft checklist — run before calling any component done

Details in this list are individually invisible. Collectively they are the entire
difference between a thoughtful interface and a sloppy one. Nobody audits an interface
detail by detail — they just *feel* whether it was cared about. A missed detail isn't a
bug report, it's the quiet signal that if this got missed, others probably did too.

**Type and numbers**
- [ ] Any number that changes in place uses `tabular-nums` — otherwise `9 → 10` shifts
      the whole line, because `1` and `4` are different widths.
- [ ] Headings that wrap use `text-pretty` (no single word alone on the last line);
      centred headings use `text-balance`.
- [ ] Truncation matches the content: end-truncation for labels, **middle**-truncation
      for filenames and URLs (`Screensho…14.32.08.png` beats `Screenshot 2026-…`).
- [ ] Value+unit never breaks across lines — `10MB`, `Mod+K`, `v1.2` stay glued.
- [ ] Rounding says only what's known: `52.4%`, not `52.3847%`.

**Geometry**
- [ ] Nested radius: `inner = outer − gap`. Equal radii read as too round; if the gap
      exceeds the outer radius, the inner element needs no rounding at all.
- [ ] Optical over mathematical centring — a play triangle nudges right, a checkmark
      nudges down. Perfectly centred is not visually centred.
- [ ] An icon beside multi-line text aligns to the **first line** (`height: 1lh`
      wrapper), not the centre of the block.

**Hit areas**
- [ ] Interactive targets reach ~44×44px. The *visible* control stays small — expand
      the hit area with padding or a pseudo-element instead of inflating the design.
- [ ] 4–8px of separation between adjacent targets, so a near-miss isn't a wrong action.
- [ ] A control's label is part of its hit area, and so is the gap between them — dead
      zones between a checkbox and its label feel broken.

**Invisible defaults**
- [ ] `select-none` on every decorative SVG, icon and drag handle. Stray highlight
      rectangles during a drag or a fast double-click are pure noise.
- [ ] Inputs declare the right keyboard: `type="tel"`, `type="email"`, `inputmode`.
- [ ] Inputs are ≥16px or iOS Safari zooms on focus. Never fix this with
      `maximum-scale=1` — that disables zoom for people who need it.
- [ ] Scrollable regions *show* they scroll: clip the last item, or fade the edge.
      A list that ends flush with its container looks finished when it isn't.

**Motion** (see also §3a and the motion pattern catalog in the skill)
- [ ] Transform origin is meaningful — a popover grows from its trigger, not from the
      centre of the screen.
- [ ] Enter/exit are spatially symmetric: in from the right, out to the right.
- [ ] One primary moving object plus at most one supporting response. Not six.
- [ ] Every animation is interruptible, and the user never waits for one to finish.
- [ ] Each non-trivial animation is explainable in one sentence. "It looks premium" is
      not a reason.

**The hesitation test** — walk the real flow and watch yourself, not the screen:
- [ ] Did you click twice? The first click had no acknowledgement.
- [ ] Did your cursor hover without landing? The target is unclear or too small.
- [ ] Did you reflexively undo? The action gave no feedback about what it did.
- [ ] Did you re-read a label? It's a wording problem, not your attention.

**Break it on purpose** — the ideal case is not the case that matters:
- [ ] Throttle to 3G. Every missing loading state appears at once.
- [ ] Replace placeholders with a 40-character unbroken string and a language with
      longer words.
- [ ] Empty everything. Does it read as *deliberately* empty, or as broken?
- [ ] Fail the request. Is there a recovery path, or just a dead end?
- [ ] Put the mouse away and drive it entirely by keyboard.
- [ ] Resize continuously — not to breakpoints, *between* them.
- [ ] Paste instead of typing: a phone number with spaces, a URL with query params.

When you find something, write down three things or it's worthless in a week: **what
broke**, **what you expected**, and **a one-line direction for the fix**.

---

## 6. Where to look for more

- `.agents/skills/pixeldosa-components/SKILL.md` — the full research → plan → build →
  QA process, registry metadata requirements, definition of done.
- `.agents/skills/design-engineering-interaction/SKILL.md` — the deep reference behind
  §3a and §5a: component anatomy, state matrices, the five jobs of motion, the motion
  pattern catalog (`button-to-progress`, `card-expand`, `agent-tool-call`…), AI
  temporal design, and the creative-exploration method. Read it when a component needs
  a motion decision, not a colour decision. Its §102/§103/§164 are written for this
  system specifically.
- `ROADMAP.md` — North Star positioning, niche (AI startups only), what's shipped,
  what's next, and the reconciliation record of what was considered and ruled out.
- `DESIGN-SYSTEM-STRATEGY.md` — how this token architecture benchmarks against
  Material 3, Carbon, Polaris, Spectrum.
- `packages/ui/src/registry/*/registry-item.json` — every shipped component's
  `engineeringNotes`/`motionNotes` are worked examples of §3 and §4 applied to a real
  decision; read a few before making a new one.
