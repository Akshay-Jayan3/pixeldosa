# Smart Field — Build Plan

Status: **draft, built same session per "focus on building" direction** — open decisions
resolved below rather than blocking on a review round-trip; flagged clearly for
after-the-fact correction if any call is wrong. First component in the AI tier (see
`ROADMAP.md` North Star and `plans/pixeldosa-component-catalog.md` Queue B0).

---

# Research

Two tracks, per the Planning phase in `.agents/skills/pixeldosa-components/SKILL.md`.

**Pattern research.**

- **Notion AI Autofill (2026)** — field-level, not form-level: hover a database
  property, click the property name, choose "AI Autofill." Two tiers: Basic (simple
  fills — summaries, tags, translation) and Custom Agent (multi-step, uses
  workspace/web search, costs credits). Takeaway: the trigger belongs on the field
  itself, not as a global "fill everything" action, and simple vs. complex fills carry
  different latency/cost expectations worth signalling separately later — v1 doesn't
  need the two-tier split, but the API should not foreclose it.
- **Clay / HubSpot / Attio CRM enrichment** — the field industry that lives entirely on
  this pattern. The load-bearing rule, confirmed across multiple sources: confidence
  gates *whether a proposal is allowed to overwrite an existing value at all* — high
  confidence can overwrite, low confidence only fills a blank field, never silently
  replaces something a human already entered. This is a concrete, adoptable rule, not
  just a display choice — informs the UX Flow section below.
- **GitHub Copilot's ghost-text accept/reject** — Tab accepts, Esc or continuing to type
  rejects, frictionless. Doesn't transfer directly here (that's `Ghost Input`'s job,
  already shipped) — Smart Field proposes a *complete* structured value, not an inline
  continuation, so the equivalent is an explicit preview state with Accept/Reject
  controls rather than inline ghost text.
- **Confidence-threshold UI research** (industry write-ups, not one single named
  product) — a practical, commonly cited calibration: auto-surface with a one-click
  accept above a confidence threshold, require an explicit verification step below it.
  Colour-coded tiers (e.g. green/yellow/red) appear frequently, but exact cut points are
  product-specific judgment calls, not a standard — treated here as a shape to follow
  (tiered, not raw percentage), not exact numbers to copy.
- **Perplexity's provenance model** — show evidence, not just a score: the actual
  source passage/record, not an abstract percentage. Directly adopted: Smart Field's
  provenance is consumer-supplied source text ("via linkedin.com/company/x", "via
  uploaded resume.pdf"), not a black-box number alone.

**Common mistakes across sources:** auto-committing a proposal without a review step;
overwriting a field the user already filled in without a stronger confidence bar than
filling a blank one; showing a confidence *score* with no evidence behind it, which
research consistently flags as trust-eroding rather than trust-building; animating the
proposed value in character-by-character, which misrepresents a value that was already
fully generated (the same mistake `Ghost Input`'s plan already ruled out for the same
reason).

**Visual research.** Linear, Vercel, Stripe and Notion all treat "proposed but not yet
committed" as a *quiet* state — a subtle tint or border change, not a saturated colour
block or a badge that competes with the page's real content. Provenance/confidence read
as small muted caption text, never louder than the proposed value itself. Accept/reject
render as compact icon buttons inline with the field, not full-width separate buttons,
because the field is usually one of many on a form and shouldn't dominate the layout the
moment AI touches it.

---

# User Workflow

**Who:** a user filling out or reviewing a record (form, CRM entry, settings panel)
where AI has enough context elsewhere (other fields, a linked document, a URL) to
propose a value for one specific field.
**What:** request an AI-proposed value, review it with its confidence and source before
it becomes real data, accept or reject it, and undo in one step if accepted by mistake.
**When it appears:** a small trigger next to a field — empty or filled — that the
consumer decides is eligible for AI assistance. Never fires automatically on page load
by default (see Variants for the opt-in auto-propose case) — matches `Ghost Input`'s
"nothing happens without an explicit ask" posture, now applied to fetching, not just
accepting.
**Before:** the field is empty, or has a value the user might want a second opinion on.
**After:** the field holds the accepted value (briefly undoable) or is untouched
(rejected/dismissed) — never a silent third state.

# Product Context

Forms, CRM/business records, settings and profile panels, document metadata, onboarding
— anywhere a single structured field can be filled from context available elsewhere in
the product. Directly serves the MVP's stated promise ("a developer can install the
theme and a focused set of components, then assemble... an AI-assisted form... in an
afternoon" — `pixeldosa-mvp-plan.md`) and is literally item 1 of the AI tier. Visible:
the field, a trigger affordance, loading state, and — once a proposal exists — the
proposed value, its confidence, and its source. Hidden until relevant: confidence and
provenance only appear once there is something to be confident or transparent *about*.
The decision this speeds up: "do I trust and accept this AI-filled value," made faster
by real evidence (source, confidence tier) instead of a silent autofill or a bare score.

# Component Strategy

**Pattern**, matching `Ghost Input`'s tier: a fixed arrangement of parts (input,
trigger, proposal preview, accept/reject) that always appear together, not a compound
API like `Field`'s sub-components — there's no meaningful way to rearrange these pieces,
so a single component with an injected `fetchProposal` behaviour (mirroring `Ghost
Input`'s `fetchSuggestion` shape for consistency across the AI tier) is the right
weight. Not a workflow: it owns exactly one field's proposal lifecycle and delegates the
actual generation to the consumer. Explicitly the **foundation `Diff Accept` builds on**
per the roadmap's own note ("Depends on Field and Smart Field's proposal model") — the
proposal state shape below is designed so a later multi-field/hunk-level version can
generalize it rather than reinvent it.

# UX Flow

- **Entry:** click the trigger (an icon button, icon supplied by the consumer — same
  "no bundled icon set" convention as `Button`/`CommandMenuItem`) next to the field.
- **Primary action:** Accept — commits the proposed value as the real field value.
- **Secondary actions:** Reject/dismiss — discards the proposal, field reverts to its
  prior state, no trace left. Undo — available for a short window immediately after
  accepting, reverts to the pre-accept value in one action.
- **Loading:** trigger swaps to a spinner; the field itself stays interactive rather
  than locking, because a user who starts typing while a proposal is in flight has
  changed their mind about waiting, not asked to be blocked.
- **Empty (no proposal yet):** just the trigger, unobtrusive, no placeholder proposal
  UI taking up space pre-emptively.
- **Error:** inline message near the trigger with a retry action, never a toast that can
  be missed while attention is on the field.
- **Success/after accept:** value commits immediately; a compact "Undo" affordance
  stays visible briefly, then fades — the one-step-undo requirement from the roadmap.
- **Edge cases:**
  - User starts typing while a fetch is in flight → cancel the request (same
    `AbortController`-per-keystroke staleness pattern `Ghost Input` already
    established, reused here for consistency across the AI tier).
  - User starts typing once a proposal is already shown (not yet accepted) → typing
    implicitly dismisses the proposal; manual input always wins over an unaccepted
    suggestion.
  - **Confidence gates overwrite, not just display** (adopted directly from the Clay/
    HubSpot/Attio research above): if the field already has a non-empty value, a
    **low**-confidence proposal still shows for review but is visually flagged as
    lower-trust; a field that was empty has no such downside, so confidence only
    affects framing, never whether the proposal is offered at all — v1 does not block
    low-confidence proposals outright, it just never pretends they're equivalent to a
    high-confidence one when overwriting existing data.
- **Responsive:** trigger/accept/reject are real `<button>` elements at a minimum
  44×44px hit target; provenance/confidence text wraps rather than truncating unreadably
  on narrow widths.
- **Accessibility:** every state change (proposal arrived, accepted, rejected, error)
  announced via `aria-live="polite"`; confidence communicated as **text**, never colour
  alone (matches the "accessible status text, not colour alone" rule already used
  elsewhere in the AI tier's plan — see `Agent Health Grid` in the catalog).
- **Keyboard:** trigger is a real button, reachable and activatable by keyboard by
  default. Once a proposal is shown, Accept/Reject are real focused buttons — no
  special global keybind layered on top of them for v1 (avoids a Tab/Enter collision
  with normal form navigation and submission, which is a worse failure mode than asking
  for one extra Tab press).

# Visual Direction

The proposed-but-unaccepted state gets a quiet, restrained treatment: a subtle
`accent`-token background tint and border on the field, not a saturated or novel
colour — signals "provisional" without competing with the rest of the form. Confidence
renders as a small tiered indicator (`low` / `medium` / `high`) plus text, not a raw
percentage — precision the model doesn't actually have would be a false signal, and the
research above treats tiers as the more honest shape. Provenance renders as muted
caption text directly below the proposal: `via {source}`, where `source` is whatever
string the consumer supplies (a URL, a filename, "similar records") — never fabricated
if the consumer doesn't provide one. Accept/reject render as compact icon buttons
inline with the proposal, not full-width buttons, so the field doesn't visually take
over the form the moment AI touches it. Density matches `Field`'s existing rhythm — no
new spacing scale introduced.

# Motion Plan

Trigger → loading is an icon swap, not a layout shift. Loading → proposal appears via a
brief fade plus a smooth height expansion of the proposal region (never a
character-by-character reveal — the full value already exists, so animating it as if it
were "being typed" would misrepresent what happened, the exact reasoning `Ghost Input`'s
plan already established for the same failure mode). Accept plays a brief
success-toned background pulse that settles back to the field's normal state,
communicating "this is committed now." Reject collapses/fades the proposal region back
to nothing. The undo affordance fades in immediately after accept and fades out on
timeout or on the next interaction — never yanked away instantly. All durations and
easings come from `@pixeldosa/tokens`; under `prefers-reduced-motion`, the height
expansion and pulse are dropped in favour of an instant state change, with the colour/
text changes themselves left intact so every transition stays legible without motion.

# AI Opportunities

This is an `ai-assisted` component, so the relevant question is scope, not whether AI
belongs. Smart Field is deliberately the **simplest unit** in the AI tier: one field,
one proposal, one human decision. Explicit non-goals, each reserved for a different,
already-scoped component: inline continuation while typing (`Ghost Input`, shipped);
multi-field or long-text diffing with per-hunk review (`Diff Accept`, next); risk-gated
review of a consequential action (`AI Approval Gate`, later). Smart Field's proposal
state shape is designed to generalize into `Diff Accept`'s model rather than being
thrown away once that component exists.

# Variants

- **Default** — manual trigger, icon button, user-initiated fetch.
- **Auto-propose** — fetches automatically once mounted with enough context (e.g. a
  field left empty after other fields are filled). Flagged as a variant, not the
  default: an unsolicited network call the moment a field mounts contradicts the
  "nothing happens without an explicit ask" posture this whole AI tier is built on,
  even though some real products (Notion's Custom Agent tier) do run automatically.
  Left as an explicit opt-in prop rather than cut entirely, since it's a real, requested
  pattern elsewhere.
- **Compact** — icon-only accept/reject, denser layout for row-level use inside a table
  or grid — directly anticipates `Bulk Prompt Table` (roadmap Queue B2), which applies
  this same accept/reject unit per row.
- Deliberately not building: a "multiple competing proposals" picker variant — no
  concrete workflow has asked for it yet, and it would meaningfully complicate the
  proposal state shape for a hypothetical need.

# Public API

```tsx
<SmartField
  value={value}
  onValueChange={setValue}
  fetchProposal={fetchProposal}
  onAcceptProposal={(value, proposal) => {...}}
  triggerIcon={<SparkleIcon />}
/>
```

```ts
type SmartFieldProposal = {
  value: string;
  confidence?: "low" | "medium" | "high";
  provenance?: string;
};

type FetchProposal = (
  currentValue: string,
  signal: AbortSignal
) => Promise<SmartFieldProposal | null | undefined>;
```

- Mirrors `Ghost Input`'s shape deliberately (`value`/`onValueChange` controlled-only,
  `fetchX` behaviour injection, an `AbortSignal` for cancellation) so the AI tier reads
  as one consistent family rather than each component inventing its own contract.
  `fetchProposal` differs from `fetchSuggestion` only in returning a structured
  `SmartFieldProposal` instead of a plain string, since a complete value needs
  confidence/provenance attached, a continuation tail does not.
  **Resolved here rather than left open:** confidence is a **three-tier enum**, not a
  raw number — matches the Visual Direction call above and keeps the public contract
  stable even if the underlying model's actual scoring changes.
- `triggerIcon` is the only required visual customization point beyond tokens — no
  bundled icon set, consistent with `Button`/`CommandMenuItem`.
- Not exposing an `auto` prop in the same interface shown above — the Auto-propose
  variant is a separate, explicitly-named prop (`autoPropose?: boolean`) so the default
  path is never accidentally auto-fetching.
- Drops into `<FieldControl>` the same way `Ghost Input` does — forwards `ref`, `id`,
  `aria-invalid`, `aria-describedby`.

# Registry Structure

- `name`: `smart-field`
- `categories`: `["ai-assisted", "forms", "application"]`
- `dependencies`: none — plain input plus built-in UI, no external library, matching
  `Ghost Input`.
- `registryDependencies`: `@pixeldosa/pixeldosa-theme`, `@pixeldosa/field`.
- Docs page: `apps/web/content/docs/components/smart-field.mdx` — Usage section shows
  a realistic `fetchProposal` implementation; Props table covers `SmartField` and the
  `SmartFieldProposal` type.
- Related components: `field` (composition), `ghost-input` (sibling AI-tier pattern,
  contrast the two in docs so consumers pick correctly), future `diff-accept` (builds
  on this), future `confidence-meter` (v1 ships a minimal inline tiered indicator; once
  a real `Confidence Meter` component exists, Smart Field should switch to composing it
  instead of its own inline version — recorded here so that migration isn't lost,
  matching the precedent `Command Menu` set for its own deferred `kbd` primitive).
- Future blocks unlocked: `AI-Assisted Form` (the MVP's flagship block).

# Documentation Notes

**One-line description:** An AI-proposed value for a single field, shown with
confidence and source before it becomes real data, with one-step undo after accepting.
**Problem solved:** removes manual entry for one field without ever silently
overwriting what a user already trusts is correct.
**When to use:** CRM/record enrichment, settings or profile fields, any single
structured field where AI has enough surrounding context to propose a value.
**When not to use:** inline predictive continuation while typing (`Ghost Input`
instead); multi-field or long-text diffing (`Diff Accept`, once built); a consequential
or risky action needing full review (`AI Approval Gate`, once built).
**Key differentiators:** explicit propose → preview → accept lifecycle that never
auto-commits; provenance shown as real source text, not a bare score; confidence gates
how an overwrite is framed, not just how it's displayed; the same staleness-safe
cancellation model as `Ghost Input`, so the AI tier behaves consistently end to end.

# Pixeldosa Score

- **Design Value: 8/10** — a well-scrutinized pattern (propose/review/accept), and
  doing the confidence/provenance honestly instead of decoratively is the actual
  differentiator this whole tier is betting on.
- **Developer Value: 8/10** — a real state machine (idle/loading/proposed/accepted/
  error) with a staleness edge case that's easy to get subtly wrong; shipping it
  correctly once saves every consumer from re-solving it.
- **Business Value: 9/10** — directly the MVP's first AI-tier deliverable and a direct
  dependency of the flagship `AI-Assisted Form` block.
- **Marketing Value: 7/10** — solid, relatable demo material ("watch AI fill a field,
  then undo it") though quieter than a flagship interaction like Command Menu.
- **Reusability: 9/10** — foundation for `Diff Accept`, `Bulk Prompt Table`, and the
  `AI-Assisted Form` block.
- **Originality: 6/10** — the propose/accept interaction itself is well established
  elsewhere; the originality is in the rigor (real provenance, confidence-gated
  overwrite framing, clean undo), not in inventing a new interaction shape.
- **Learning Value: 8/10** — the first real "AI proposal state machine" in the
  registry; sets the contract `Diff Accept` and `AI Approval Gate` extend rather than
  reinvent.

No score below 6 — plan is ready to build.

# Next Steps

1. Implement `smart-field.tsx` + `.demo.tsx` + `registry-item.json`.
2. Local QA: typecheck, registry build, and a real browser pass covering propose →
   accept → undo, propose → reject, the in-flight-typing cancellation edge case, and
   reduced motion.
3. Wire into `registry-demos.ts`, `packages/ui/src/index.ts`, the docs page; run
   `pnpm registry:build`.
4. Mark shipped in `ROADMAP.md`.
