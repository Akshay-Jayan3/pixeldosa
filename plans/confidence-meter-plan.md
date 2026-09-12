# Confidence Meter — Build Plan

Status: **built same session**. Fourth AI-tier component, and the first one that's
primarily an **extraction**, not new design — `Smart Field` and `Selection Actions`
both independently hand-rolled the identical tiered confidence indicator; this plan
promotes that duplicated logic into a real, shared, documented component and refactors
both call sites to use it.

---

# Research

Already done in `plans/smart-field-plan.md` and not re-litigated here — the load-bearing
findings carry forward unchanged:

- Confidence-threshold UX research (industry write-ups, 2026) shows a **tiered**
  presentation (not a raw percentage) as the honest shape — a model rarely has
  calibrated precision to the percentage point, and presenting one anyway is a
  trust-eroding pattern research flags repeatedly.
- The system's own token constraint reinforces the same call from a different
  direction: there is no "success"/"warning" hue in `@pixeldosa/tokens` — only
  `destructive` keeps real chroma — so a red/yellow/green confidence scale was never
  available anyway. A tiered bar (`bg-foreground` filled / `bg-border` unfilled) plus a
  text label is both the more honest choice and the one the token set actually
  supports.
- Confidence must never be colour-only (accessibility rule already standing elsewhere
  in this system) — the text label is the real signal, the bars are supplementary.

**The one new decision this plan makes:** keep the public contract to exactly the
three-tier enum, no numeric input. A numeric-score-to-tier bucketing mode was
considered and deliberately deferred — no current consumer in this codebase has a raw
calibrated score to bucket (both existing call sites already produce a tier directly),
and adding that path now would be solving a hypothetical need rather than an observed
one. Revisit only if a real consumer shows up with an actual probability to map.

# User Workflow

**Who:** a user reviewing any AI-proposed value, classification, or (later) approval
decision, who needs to gauge how much to trust it before acting.
**What:** a compact, consistent way to communicate "how sure is this" plus, optionally,
where it came from — reused verbatim everywhere confidence needs to be shown, instead
of every component re-deciding its own presentation.
**When it appears:** wherever a proposal, classification, or approval carries a
confidence value — inline next to the thing it's rating.

# Product Context

Not a standalone screen — a small, embedded primitive used by other AI-tier
components. Visible: the tier label and bar indicator, plus provenance if supplied.
Directly serves the roadmap's own framing ("reused by Smart Field, Diff Accept, and
approval flows") — `AI Approval Gate`, not yet built, is the next real consumer beyond
today's refactor.

# Component Strategy

**Primitive** — the simplest tier in this system's vocabulary. No internal state, no
async behaviour, a pure function of its props. Extracted specifically because two
independent components already needed the identical thing, which is the concrete
signal (per `SKILL.md`'s "component is not an island" rule) that it belongs as its own
piece rather than being re-derived a third time.

# UX Flow

Purely presentational — there is no interaction to design. The only "flow" is where it
sits relative to the thing it describes: immediately adjacent to the value/result it
rates, never separated from it by other content.

# Visual Direction

Unchanged from the pattern already proven in `Smart Field`/`Selection Actions`: three
`h-2.5 w-1` bars, filled count matching the tier (`low` → 1, `medium` → 2, `high` → 3),
`bg-foreground` for filled and `bg-border` for unfilled, immediately followed by the
tier's text label (`Low confidence` / `Medium confidence` / `High confidence`), text
size `text-xs text-muted-foreground` to match the caption weight both existing call
sites already use. An optional `provenance` string renders as a second, visually equal
`via {provenance}` caption alongside it — folding what both existing call sites already
render as a sibling element into the same component, so a consumer gets both from one
import instead of composing two.

# Motion Plan

None — a static presentational primitive with no state transitions of its own. Any
entrance/exit motion belongs to whatever container shows it (`Smart Field`'s proposal
panel already owns that), not to `Confidence Meter` itself, consistent with `Card`'s
precedent of motion belonging to what wraps a primitive, not the primitive itself.

# AI Opportunities

N/A beyond what's already stated — this component's entire job is representing an AI
system's calibrated uncertainty honestly, which is the opportunity in full.

# Variants

- **Default** — bars + label, the shape already proven twice.
- Deliberately not building: a numeric/percentage variant (see Research); a large
  "hero" size for a dedicated approval-review screen (no concrete consumer yet — `AI
  Approval Gate` will surface real requirements when it's built, not before).

# Public API

```tsx
export type ConfidenceTier = "low" | "medium" | "high";

<ConfidenceMeter confidence={tier} provenance={sourceString} />
```

- `confidence: ConfidenceTier` (required).
- `provenance?: string` — optional, renders as `via {provenance}` alongside the tier,
  replacing the sibling `<span>` both existing call sites hand-rolled separately.
- `className?: string` for layout composition, matching every other primitive in this
  registry.

# Registry Structure

- `name`: `confidence-meter`
- `categories`: `["ai-assisted", "content", "application"]`
- `dependencies`: none.
- `registryDependencies`: `["@pixeldosa/pixeldosa-theme"]`
- **Follow-up required as part of this same change** (not a separate ticket): refactor
  `smart-field.tsx` and `selection-actions.tsx` to import `ConfidenceMeter` instead of
  their local `ConfidenceIndicator`/`confidenceLabel`/`confidenceBars` copies, and add
  `@pixeldosa/confidence-meter` to both components' `registryDependencies`.

# Documentation Notes

**One-line:** A tiered (low/medium/high) confidence indicator with an optional
provenance caption, shared by every AI-tier component that needs to communicate
uncertainty honestly.
**When to use:** anywhere an AI-proposed value, classification, or decision carries a
confidence signal.
**When not to use:** a full sources/context/explanation surface — that's `AI Context /
Provenance Surface`, a richer, separate component; this one is a compact inline rating,
not an explanation panel.
**Key differentiators:** tiered, never a raw percentage, by deliberate design; bars are
supplementary to the text label, never the only signal; extracted from two real,
already-shipped consumers rather than designed speculatively.

# Pixeldosa Score

- **Design Value: 6/10** — small and quiet by design; the value is consistency, not
  novelty.
- **Developer Value: 8/10** — removes duplicated logic from two shipped components and
  gives every future one a single, correct import instead of a third hand-rolled copy.
- **Business Value: 7/10** — directly unblocks `AI Approval Gate`, a named future
  consumer.
- **Marketing Value: 4/10** — not a flagship demo piece on its own; it's infrastructure.
- **Reusability: 9/10** — already proven by two real consumers before it even existed
  as its own component.
- **Originality: 4/10** — an extraction, not new design, by definition.
- **Learning Value: 5/10** — straightforward; the interesting decision (tiered over
  numeric) was already made and documented in `Smart Field`'s plan.

Below-6 scores here (Marketing Value, Originality) are expected and acceptable for an
extraction-of-existing-logic component — the bar in `SKILL.md` is about *readiness*,
and duplicated logic already proven in two shipped components is about as ready as a
plan gets.

# Next Steps

1. Implement `confidence-meter.tsx` + `.demo.tsx` + `registry-item.json`.
2. Refactor `smart-field.tsx` and `selection-actions.tsx` to consume it, deleting their
   local copies.
3. QA: typecheck, registry build, browser pass confirming both refactored components
   still render and behave identically to before.
4. Wire into `registry-demos.ts`, `packages/ui/src/index.ts`, docs page; run
   `pnpm registry:build`.
5. Mark shipped in `ROADMAP.md`.
