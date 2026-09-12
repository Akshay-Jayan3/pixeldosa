# AI Action Toolbar — Build Plan

Status: **planned 2026-09-08**. Sixth AI-tier component, and the second one that is
primarily an **extraction** rather than new design (after `Confidence Meter`). The
roadmap line — "shared apply/explain/retry/regenerate/undo/report actions" — describes
something three shipped components have already each hand-rolled independently.

---

# Research

## Internal research (the load-bearing evidence)

This component is justified by duplication that already exists in this repo, not by an
external trend. Auditing the three shipped AI-tier components that render post-generation
actions:

| Call site | Actions rendered | Treatment |
| --- | --- | --- |
| `smart-field.tsx:254` | Retry (on error) | quiet underline |
| `smart-field.tsx:287` | Reject / Accept | bordered / primary |
| `smart-field.tsx:308` | "Value accepted." + Undo | message + quiet underline |
| `diff-accept.tsx:161` | "Changes applied." + Undo | message + quiet underline |
| `diff-accept.tsx:188` | Regenerate suggestion (on conflict) | bordered |
| `selection-actions.tsx:234` | Retry (on error) | bordered |
| `selection-actions.tsx:298` | Dismiss | quiet underline |

Three button treatments recur **verbatim** across all three files:

1. **primary** — `rounded-md bg-primary px-2.5 py-1 text-xs font-medium
   text-primary-foreground … hover:bg-primary/90 focus-visible:ring-[3px]
   focus-visible:ring-ring/40`
2. **secondary** — `rounded-md border border-input px-2.5 py-1 text-xs font-medium
   text-foreground … hover:bg-accent hover:text-accent-foreground …`
3. **quiet** — `font-medium text-foreground underline-offset-2 hover:underline …`

The busy spinner SVG is also duplicated character-for-character between
`smart-field.tsx:243` and `selection-actions.tsx:217`, and the
`message + Undo + aria-live` confirmation row is duplicated between `smart-field.tsx:308`
and `diff-accept.tsx:161`.

Per `SKILL.md`'s "a component is not an island" rule, duplication proven across three
shipped consumers is the concrete signal that this belongs as its own piece — the same
argument that justified `Confidence Meter`, and the same evidence standard.

## Pattern research

The post-generation action strip is the most standardised surface in AI product UI:
every assistant output in ChatGPT, Claude, Copilot, Notion AI, Linear and Perplexity
terminates in a small row of regenerate / copy / feedback controls. Two things
consistently distinguish good implementations from bad, and both are load-bearing here:

- **The destructive-ish action is never the visually dominant one.** Regenerate and
  Report sit quieter than Apply. Products that make Regenerate prominent train users to
  reroll instead of read.
- **Feedback ("Report") is a first-class action, not an afterthought.** It is the only
  channel through which a bad generation becomes signal. Bundling it into the same
  toolbar as Apply is what makes it get used.

**Where there is room to improve on the state of the art:** almost every shipped example
of this pattern uses `role="toolbar"` (or no role at all) while relying on natural tab
order, so a five-action strip costs a keyboard user five Tab presses to traverse and
five more to escape. The ARIA APG toolbar pattern specifies **roving tabindex** — one
tab stop for the whole toolbar, arrow keys within it. This component implements the
spec properly. That is a small, real, verifiable improvement, and it also fixes a gap
in this system's own `Selection Actions`, whose docs currently admit to "natural tab
order".

Never copied: no asset, markup or icon from any of the above is reproduced. The
references establish *which actions belong together* and *how they should be weighted*,
nothing visual.

# User Workflow

**Who:** someone who has just been handed an AI-produced result — a rewritten paragraph,
an enriched field, a generated summary — and now has to decide what to do about it.

**What:** one consistent, keyboard-navigable strip of the decisions available at that
moment: take it (Apply/Accept), understand it (Explain), get a different one
(Retry/Regenerate), take it back (Undo), or flag it as wrong (Report).

**When it appears:** immediately after a result is produced, attached to that result.
**Before:** a generation completed. **After:** the value is committed, discarded, or
regenerated.

# Product Context

Not a screen — an embedded control strip. It is the shared vocabulary layer beneath the
AI-tier set, in exactly the way `Confidence Meter` is the shared uncertainty layer.

Named consumers, all of which already exist and already hand-roll it: `Smart Field`
(proposal row, error row, undo row), `Diff Accept` (applied row, conflict row),
`Selection Actions` (error row, dismiss). Named future consumers from the roadmap:
`AI Approval Gate`, `Risk-Aware Approval Card`, `Live Tool-Call Console`,
`Change Summary List`.

Visible: the actions available *right now*, with the recommended one weighted highest.
Hidden: nothing — a toolbar that hides actions behind an overflow menu at this size is
solving a problem this component does not have.

# Component Strategy

**Primitive.** No async behaviour of its own, no data fetching, no ownership of the
result it acts on. It renders actions, manages toolbar keyboard semantics, reflects busy
state, and announces changes. Everything about *what the actions do* stays with the
consumer, which is what lets one component serve seven different existing call sites.

Deliberately **not** a workflow component: it does not own the undo timer. Both
`Smart Field` and `Diff Accept` already run that timer inside their own state machines
(`undoWindowMs` → `setTimeout` → status transition), and moving it in here would fight
those machines rather than simplify them. The toolbar renders the undo *affordance*; the
consumer owns *when it exists*.

# UX Flow

- **Entry:** rendered by the consumer once a result exists.
- **Primary action:** exactly one action may carry `intent="primary"`; it is the
  recommended decision (Apply/Accept).
- **Secondary actions:** bordered — reversible alternatives (Regenerate, Reject).
- **Quiet actions:** underline-only — meta actions that don't change the result
  (Explain, Report, Undo, Dismiss).
- **Loading:** the acting button swaps its icon for a spinner, sets `aria-busy`, and
  **stays mounted and focusable** (`SKILL.md` accessibility rule — never swap an
  interactive element for a spinner). Other actions disable while one is running, since
  two concurrent actions on one result is never a coherent request.
- **Error:** not this component's job. The consumer renders the message via `message`
  and offers Retry as an action — matching how all three existing call sites already
  behave.
- **Empty:** renders `null` with no actions and no message, following
  `AI Context Surface`'s precedent of not rendering an empty shell.
- **Keyboard:** one tab stop. `←`/`→` move between actions, `Home`/`End` jump to the
  ends, wrapping at both edges. Disabled actions are skipped.
- **Responsive:** wraps rather than scrolls at 375px; labels stay visible because an
  icon-only AI action ("what does this arrow do?") is exactly the ambiguity this
  component exists to remove.

# Visual Direction

Reuses the three treatments already proven across the three existing call sites verbatim
— this is an extraction, so inventing a fourth look would defeat the point. `text-xs`,
`px-2.5 py-1`, `rounded-md`, `gap-1.5` between actions, matching `Smart Field`'s existing
proposal row exactly so a refactored call site is pixel-identical to what shipped.

Optional leading `message` in `text-xs text-muted-foreground`, so the confirmation rows
("Changes applied.", "Value accepted.") are the same component as the decision rows.

No colour is introduced. Weight is carried by fill (primary) → border (secondary) →
nothing (quiet), which is the system's monochrome hierarchy rule (DESIGN.md §3.2)
applied to a control strip.

# Motion Plan

Deliberately minimal, and that is the decision, not an omission.

- **Colour transitions only** on hover/focus, `--pd-duration-instant`
  (100ms) with `--pd-ease-standard` — matching every other control in the system.
- **The spinner** is the one continuous animation, and it is the honest one: it maps to
  a real in-flight request, and it stops when the request settles.
- **No entrance animation.** The toolbar's appearance is already framed by whatever
  container reveals it (`Smart Field`'s proposal panel owns a
  `grid-template-rows` expand; `Selection Actions` owns a fade+scale). A second
  entrance here would double-animate. Same reasoning as `Confidence Meter`'s
  "motion belongs to what wraps a primitive, not the primitive itself."
- **Reduced motion:** `motion-reduce:transition-none` on colour transitions; the
  spinner keeps rotating because removing it would leave a busy state with no visible
  indication at all — the state must stay legible, which is a fallback, not a removal
  (DESIGN.md §3.5).

# AI Opportunities

This *is* the AI surface — it is the decision layer over a model output. The specific
AI-product decisions encoded:

- **Nothing commits silently** (DESIGN.md §3.7): Apply is a deliberate, weighted action
  and Undo is a peer action, not a hidden gesture.
- **Report is included by default in the documented vocabulary**, because a system that
  makes it easy to reroll a bad generation and hard to report one learns nothing.
- **Regenerate is deliberately not the primary action.** Weighting it below Apply is a
  product stance: read the result, don't reflexively reroll it.

# Variants

- **`intent`**: `primary` | `secondary` | `quiet` — the three treatments already in use.
- **`size`**: `sm` | `default` — `sm` for dense contexts (a table row in
  `Bulk Prompt Table`), `default` everywhere else.
- Deliberately **not** building: an overflow menu (not needed at 3–6 actions); an
  icon-only mode (ambiguity is the problem this solves); a vertical orientation (no
  consumer, and the roving-tabindex key bindings would have to change with it).

# Public API

```tsx
export type AIActionIntent = "primary" | "secondary" | "quiet";

export type AIAction = {
  id: string;
  label: string;
  icon?: React.ReactNode;   // optional; no icon set is bundled, per house rule
  intent?: AIActionIntent;  // default "secondary"
  disabled?: boolean;
  busy?: boolean;           // consumer-owned, so it can reflect a real request
};

<AIActionToolbar
  actions={actions}
  onAction={(id) => …}
  message="Changes applied."   // optional leading status text
  label="Result actions"       // accessible name for the toolbar
  size="default"
/>
```

`busy` is a per-action prop rather than internal state on purpose: the consumer already
owns the request (all three existing call sites hold an `AbortController`), so the
toolbar must reflect that truth rather than keep a second, divergent copy of it.

# Registry Structure

- `name`: `ai-action-toolbar`
- `categories`: `["ai-assisted", "actions", "application"]`
- `dependencies`: none.
- `registryDependencies`: `["@pixeldosa/pixeldosa-theme"]`
- **Required follow-up, tracked in ROADMAP:** refactor `smart-field.tsx`,
  `diff-accept.tsx` and `selection-actions.tsx` onto this component and delete their
  local button markup. Deliberately *not* bundled into this change — those are three
  shipped components with their own state machines, and each needs its own QA pass;
  `Confidence Meter` refactored its two consumers inline because the swap was a pure
  presentational substitution with no state involved, which is not true here.

# Documentation Notes

**One-line:** A keyboard-navigable toolbar of the standard post-generation actions —
apply, explain, retry, regenerate, undo, report — with a three-level visual hierarchy
that keeps the recommended action dominant.

**When to use:** attached to any AI-produced result the user must now decide about.
**When not to use:** a selection-triggered floating toolbar is `Selection Actions`; a
single accept/reject over a text diff is `Diff Accept`; a whole-field proposal is
`Smart Field`. This is the shared control strip those compose, not a replacement for any
of them.
**Key differentiators:** implements the real ARIA toolbar pattern (roving tabindex),
which most shipped examples of this pattern skip; weights Regenerate below Apply as a
deliberate product stance; extracted from seven real call sites across three shipped
components rather than designed speculatively.

# Pixeldosa Score

- **Design Value: 7/10** — the visual hierarchy decision (fill → border → nothing) is
  the real design content; the rest is consistency.
- **Developer Value: 9/10** — collapses three duplicated button treatments, a duplicated
  spinner, and a duplicated confirmation row into one import.
- **Business Value: 8/10** — directly unblocks four named roadmap components
  (`AI Approval Gate`, `Risk-Aware Approval Card`, `Live Tool-Call Console`,
  `Change Summary List`).
- **Marketing Value: 6/10** — not a hero demo alone, but "we implement the ARIA toolbar
  pattern that everyone else skips" is a credible, checkable claim.
- **Reusability: 10/10** — seven existing call sites, before it even exists.
- **Originality: 5/10** — an extraction plus one genuine accessibility improvement.
- **Learning Value: 7/10** — roving tabindex is a pattern most developers have read
  about and not implemented; this is a compact, correct reference.

No score below 6, so the plan is ready.

# Next Steps

1. `ai-action-toolbar.tsx` + `.demo.tsx` + `registry-item.json`.
2. Docs MDX with Features + Variants (live previews — props are fully serializable).
3. Wire into `registry-demos.ts` and `packages/ui/src/index.ts`.
4. `pnpm registry:build`, typecheck, production build.
5. Browser QA — keyboard traversal especially, per the memory note about hidden-pane
   animation readings.
6. Mark shipped in `ROADMAP.md`, and add the three-consumer refactor as its own
   roadmap line.
