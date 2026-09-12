# Diff Accept — Build Plan

Status: **built same session, per established "focus on building" direction**. Second
AI-tier component; reordered ahead of Selection Actions after a demand check (see
`ROADMAP.md` North Star, 2026-09-04 entry). Directly extends Smart Field's proposal
model to multi-region text changes.

---

# Research

**Pattern research.**

- **Cursor's inline diff review** — `Cmd/Ctrl+K` returns a colour-coded diff reviewed
  **hunk by hunk**, not all-or-nothing; "the editor where you remain the author." The
  single most cited reason developers prefer Cursor's diff UX over weaker tools: control
  and reviewability — inspect before applying, verify after. Tools lacking a visual
  diff interface push developers back to raw `git diff`, a named frustration. This is
  the demand signal that moved this component ahead of Selection Actions in the build
  order.
- **Google Docs suggested edits** — insertions shown in a distinct treatment, deletions
  struck through, Accept/Reject per individual suggestion. The precedent for "show both
  the old and new text at once, resolved one suggestion at a time" rather than replacing
  text silently.
- **GitHub suggested changes** — a diff-styled block with one-click accept; the
  reviewer never has to mentally diff two blobs themselves, the tool does it and
  presents the delta directly.

**Common mistakes across sources:** all-or-nothing accept/reject on a multi-part change
(forces accepting bad suggestions bundled with good ones); applying a diff computed
against text that has since drifted, silently overwriting a change the user made
elsewhere (a **conflict**, not a normal apply); relying on colour alone to distinguish
additions from removals — a real accessibility gap in more than one production diff UI
that colour-only encodes change type.

**Token constraint check** (same one Smart Field resolved for confidence tiers): the
system has no "success"/"added" hue — `destructive` is the only token keeping real
chroma. A traditional green-add/red-remove diff isn't available without inventing an
unapproved colour, which fails review outright. **Resolution:** lean on text
**decoration**, not colour, as the primary signal — struck-through for removed,
underlined for added — with `destructive` reserved for the removed text only (a
legitimate, already-approved use: removal is the one case that's semantically
danger-adjacent). This is also more accessible than a pure red/green scheme, not just a
constraint workaround.

# User Workflow

**Who:** a user reviewing an AI-proposed edit to a longer piece of text they already
have — a description, a bio, a paragraph of content — where accepting or rejecting the
whole thing at once isn't good enough because some parts of the suggestion are right and
others aren't.
**What:** see the proposed change as an inline diff against the current text, resolve
each changed region (hunk) individually — accept or reject — and apply the result, with
undo.
**When it appears:** the consumer already has a `proposedValue` (from their own AI
call, or composed with `Smart Field`) and renders `DiffAccept` to let the user reconcile
it against the current text.
**Before:** the field/text has its current value; a proposal exists for how it might
change.
**After:** either the resolved merge is applied (some hunks kept, some rejected) or the
whole thing is discarded — never a silent full overwrite.

# Product Context

Document/content editing, CRM record notes, AI-assisted rewrites of any existing text
field — anywhere "the AI improved this, but not every single part of it" is a real
outcome, not an edge case. Directly extends **Smart Field**: Smart Field is the
single-value, atomic case; Diff Accept is what the same trust model looks like once the
value is a longer text with multiple independently-reviewable regions. Visible: the
diffed text (unchanged + struck-through removals + underlined additions), a per-hunk
accept/reject control, a summary of how many hunks remain unresolved, an Apply action.
Hidden until relevant: the conflict banner, which only appears if the base text drifted.

# Component Strategy

**Pattern** — composes a diffing engine (see Public API) with PixelDosa's own visual/
interaction layer, the same relationship `Command Menu` has with `cmdk` and Data Table
will have with TanStack Table: **use `diff` (jsdiff) for the actual word-level diff
computation rather than hand-rolling a diff algorithm** — that's a solved problem with
real edge cases (Unicode, whitespace runs) not worth re-solving here. Not a full
workflow: it holds the resolution state for one diff session and hands the merged
result back to the consumer via `onApply`.

# UX Flow

- **Entry:** consumer renders `<DiffAccept baseValue value proposedValue onApply />`
  once a proposal exists.
- **Primary action:** resolve each hunk (Accept/Reject), then **Apply** to commit the
  merged result.
- **Secondary actions:** **Accept all** / **Reject all** bulk shortcuts above the diff;
  **Undo** after Apply, matching Smart Field's one-step-undo contract.
- **Conflict:** if `value !== baseValue` (the live text has changed since the proposal
  was generated against `baseValue`), the diff is **not** shown — a conflict banner
  explains the text has changed and offers a `onRegenerate` callback instead of risking
  a stale merge. This is the "conflict handling" requirement from the roadmap, resolved
  by refusing to guess rather than attempting an automatic three-way merge, which is a
  meaningfully larger and riskier problem this v1 does not take on.
- **Empty diff (no actual changes):** if the diff engine finds zero hunks (proposal is
  identical to current text), render nothing rather than an empty diff panel.
- **Responsive:** per-hunk controls are real buttons at a 44×44px minimum target, even
  though they render small inline — implemented as adequately padded hit areas around a
  visually compact icon.
- **Accessibility:** each hunk's resolution state change announced via
  `aria-live="polite"`; struck-through/underlined text alone is not the only signal —
  each hunk's accept/reject buttons carry accessible labels naming the actual text
  ("Accept: 'quarterly report'"), not just "Accept."
- **Keyboard:** every control (per-hunk accept/reject, bulk actions, Apply, Undo) is a
  real, keyboard-reachable button — no custom keybinding layer for v1, matching Smart
  Field's reasoning against overloading Enter/Tab in a form context.

# Visual Direction

Unchanged text renders as plain body text. Removed text: `text-destructive`
line-through. Added text: `text-foreground` underline, `bg-accent/40` background tint
so it's scannable at a glance without needing to read the decoration up close — decor
+ tint together, not colour alone. Per-hunk Accept/Reject render as small inline icon
buttons immediately after the changed span, not a separate row, so the control stays
spatially bound to what it acts on (matches Google Docs' inline-suggestion adjacency).
A slim summary bar above the diff reads "`{n}` of `{total}` changes reviewed" with
Accept all/Reject all as text-button shortcuts. The conflict banner uses the same
restrained `bg-muted border-border` treatment as Smart Field's proposal panel, not a
loud warning colour the token set doesn't have anyway.

# Motion Plan

A resolved hunk's decoration (strikethrough/underline/tint) transitions out via a plain
opacity/colour fade on `--pd-duration-fast`, settling to its resolved appearance
(removed text disappears from flow via a height-collapse using the same
grid-template-rows technique Smart Field's proposal panel uses; accepted text loses its
tint and reads as plain text). Apply plays the same brief settle-pulse Smart Field's
Accept does, for the same reason — confirms commitment without implying anything is
still "in progress." Under `prefers-reduced-motion`, all of the above become instant
state changes via `motion-reduce:transition-none`, consistent with every other
component in the system.

# AI Opportunities

This is the multi-region generalization of Smart Field's single-value proposal model —
the roadmap's own stated dependency. Explicit non-goal: this is not a full three-way
merge/conflict-resolution engine (that's a meaningfully bigger, separate problem); on
conflict it asks the consumer to regenerate rather than guessing.

# Variants

- **Default** — full per-hunk review UI as described above.
- **Compact** — same resolution model, tighter vertical rhythm, for use inside a
  smaller card/row context (anticipates `Bulk Prompt Table`, same rationale Smart
  Field's Compact variant anticipated it).
- Deliberately not building: automatic conflict resolution/three-way merge — flagged
  above as out of scope, not silently skipped.

# Public API

```tsx
<DiffAccept
  baseValue={original}
  value={currentValue}
  proposedValue={proposed}
  onApply={(mergedValue) => {...}}
  onRegenerate={() => {...}}
/>
```

- `diff` (jsdiff) computes word-level parts (`{ value, added, removed }`); adjacent
  added/removed runs are grouped into hunks — a hunk is one reviewable unit, not one
  word.
- `baseValue` vs `value` split is the conflict-detection mechanism: `baseValue` is
  whatever the proposal was generated against; `value` is the current live value. If
  they differ, no diff renders.
- No internal fetch — unlike `Smart Field`/`Ghost Input`, this component doesn't call
  an AI provider itself; it receives an already-computed `proposedValue` from the
  consumer (who may well have used `Smart Field`'s `fetchProposal` shape to get it).
  Keeps this component's responsibility to exactly "review and resolve a diff," not
  duplicate the fetch/staleness machinery those two already own.

# Registry Structure

- `name`: `diff-accept`
- `categories`: `["ai-assisted", "content", "application"]`
- `dependencies`: `["diff"]`
- `registryDependencies`: `["@pixeldosa/pixeldosa-theme"]`
- Related: `smart-field` (the single-value sibling this generalizes), future `bulk-
  prompt-table` (reuses the Compact variant per-row).

# Documentation Notes

**One-line:** Reviews an AI-proposed text change as an inline diff, resolved hunk by
hunk, with a conflict guard if the base text has drifted.
**When to use:** any existing text field being rewritten/edited by AI where "accept
some parts, reject others" is a real outcome.
**When not to use:** a single atomic value replacement with no internal structure to
partially accept — that's `Smart Field`.
**Key differentiators:** per-hunk resolution, not all-or-nothing; conflict detection
that refuses to guess rather than silently merging; decoration-based (not colour-only)
change encoding, both for accessibility and because the token set has no add/remove hue
pair to spend on it.

# Pixeldosa Score

- **Design Value: 8/10** — the diff-review pattern is well-understood, but doing it
  without a colour scale the system doesn't have, accessibly, is real craft.
- **Developer Value: 8/10** — hunk-grouping and conflict detection are easy to get
  subtly wrong; shipping them once saves every consumer re-solving it.
- **Business Value: 8/10** — the demand signal that moved this component up the queue;
  directly serves the AI-Assisted Form block same as Smart Field.
- **Marketing Value: 8/10** — visually legible in a single screenshot/GIF, and the
  "we found the demand signal and built the right thing next" story is itself good
  content.
- **Reusability: 8/10** — `Bulk Prompt Table`'s per-row review reuses this directly.
- **Originality: 6/10** — the interaction pattern is established (Cursor, Google Docs);
  the decoration-over-colour resolution is the original piece.
- **Learning Value: 7/10** — first component built on a real diffing engine.

No score below 6.

# Next Steps

1. Implement `diff-accept.tsx` + `.demo.tsx` + `registry-item.json`.
2. QA: typecheck, registry build, browser pass covering multi-hunk resolution, Accept
   all/Reject all, Apply + Undo, and the conflict-banner path.
3. Wire into `registry-demos.ts`, `packages/ui/src/index.ts`, docs page; run
   `pnpm registry:build`.
4. Mark shipped in `ROADMAP.md`.
