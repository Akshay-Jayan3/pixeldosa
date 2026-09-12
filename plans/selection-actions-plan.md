# Selection Actions — Build Plan

Status: **built same session, per established "focus on building" direction**. Third
AI-tier component, next in the reordered queue after Smart Field and Diff Accept.

---

# Research

**Pattern research.**

- **Windows Notepad / TextEdit / browser "Ai-rewrite" extensions** — select text,
  right-click or a floating button, choose Rewrite. Confirms the pattern is now
  table-stakes across platforms, but also confirms it's commodity — the
  differentiation is craft in the toolbar itself and what happens *after* the action,
  not the trigger pattern.
- **Floating toolbar mechanics** (Notion, Medium, Linear, Lexical/TipTap editors) — the
  toolbar centers itself **after** the selection completes, not while the user is still
  dragging, to avoid jitter. Every interactive element needs a logical tab order and a
  visible focus indicator; some editors switch to a bottom-anchored toolbar on mobile
  to stay in thumb reach rather than floating over the exact selection.
- **AI action taxonomy** (industry UX pattern write-ups, 2026): actions split into
  *restructuring* (rewrite/reframe — same modality, changed content), *restyling*
  (tone/formality — same content, changed voice), and *transformational* (changed
  modality entirely — text → summary, text → structured data). This maps directly onto
  the five actions in scope: **Explain** and **Translate** are transformational (new
  text, doesn't replace the selection); **Rewrite** is restructuring (a real
  replacement candidate); **Classify** and **Extract** are transformational into
  structured data (a label, or a list), not prose.
- **Confidence/result presentation varies by action type** — a percentage or badge for
  classification, a source link for retrieval, in every case reviewed transparently
  rather than hidden. Reinforces reusing the tiered (low/medium/high) confidence
  language already established in `Smart Field`, not inventing a new scale per action.

**The one architectural decision this research settles:** Rewrite's output is exactly
the "AI proposes replacement text, human reviews and accepts/rejects" problem `Diff
Accept` already solves. Selection Actions should not reinvent that — it should compose
`Diff Accept` for the Rewrite result specifically, and keep its own scope to detecting
the selection, positioning the toolbar, dispatching the action, and presenting
non-replacement results (Explain/Translate/Classify/Extract).

**A real, honest accessibility limit, not glossed over:** keyboard-only users generally
cannot create an arbitrary text selection in static, non-editable content at all — this
is a platform-level gap browsers don't solve, not something a floating-toolbar
component can fix. The accessibility guarantee this component *can* make is narrower
and still real: once any selection exists (by mouse, by platform accessibility tooling,
or by keyboard inside an editable/input context where keyboard selection does work),
the toolbar itself is fully keyboard-operable — reachable, every action triggerable
without a mouse.

# User Workflow

**Who:** a user reading or editing content in a product surface who wants an AI action
on a specific piece of text without leaving where they are.
**What:** select text, a floating toolbar appears near the selection, pick an action,
review the result inline, either replace the selection (Rewrite, via Diff Accept) or
read/copy the result (Explain, Translate, Classify, Extract).
**When it appears:** only once a non-empty selection exists inside a container the
consumer opts in; never on an empty click or a collapsed cursor.
**Before:** plain selected text, no visible affordance until selected.
**After:** either the selection is replaced (accepted rewrite) or the result is
dismissed — never a silent change.

# Product Context

Any content surface in an AI-startup's product where a user reviews text an AI might
help with — a generated document, a support ticket, a note, a description field.
Visible: the floating toolbar (once selected), then a result popover anchored to the
same selection. Hidden until relevant: the result popover only exists after an action
is dispatched. The decision this speeds up: "do something with this specific piece of
text" without a context switch to a separate prompt/chat surface.

# Component Strategy

**Pattern**, composing **Diff Accept** for the one result type that's actually a
replacement (Rewrite) rather than reimplementing accept/reject a second time. Not a
workflow: it owns exactly one active selection's toolbar-and-result lifecycle and
delegates both the actual AI call (`onAction`, consumer-supplied, mirroring `Smart
Field`/`Ghost Input`'s injection pattern) and any real replacement of content in the
consumer's own document model — this component cannot know how the consumer's content
is structured (plain string, contentEditable, a rich-text doc), so replacement is
communicated via a callback, never performed by reaching into the DOM itself.

# UX Flow

- **Entry:** a non-empty selection settles inside the container (detected via
  `selectionchange`, debounced so the toolbar appears once the selection has *stopped*
  changing — matches the "center after completion, not during" research finding, and
  incidentally covers both mouse-drag and keyboard-extend selections with one
  mechanism).
- **Primary action:** click a toolbar action; it fires `onAction(actionId,
  selectedText)` and shows a loading state in place of the toolbar.
- **Result presentation, by kind:**
  - `replacement` (Rewrite) → renders `DiffAccept` with `baseValue`/`proposedValue` set
    from the selection and the result; the consumer's `onApply` wiring performs the
    actual document replacement.
  - `text` (Explain, Translate) → shown as prose in the result popover with Copy and
    Dismiss.
  - `classification` (Classify) → a label plus the same tiered confidence indicator
    `Smart Field` uses (never a raw percentage, never colour-only).
  - `list` (Extract) → a compact bullet list, each item copyable.
- **Loading:** the toolbar's clicked action shows a spinner in place of its icon; other
  actions are disabled meanwhile (one action in flight at a time, not stacked).
- **Error:** inline message in the result popover with retry, mirroring `Smart
  Field`'s error affordance.
- **Dismiss:** clicking outside the popover, pressing Escape, or the browser selection
  collapsing (user clicks elsewhere) all close it.
- **Edge cases:** clicking a toolbar button must not collapse the browser selection
  before the click fires — handled via `preventDefault` on `mousedown` for the
  toolbar, the standard rich-text-editor-toolbar trick (contentEditable formatting
  toolbars have solved this same problem for years, not worth reinventing).
- **Responsive:** 44×44px minimum targets on toolbar buttons; below a width threshold
  the toolbar anchors to the bottom of the viewport instead of floating over the
  selection, matching the mobile pattern the research found, since a small selection
  target and a floating toolbar directly over it fight each other on touch.
- **Accessibility:** `role="toolbar"` with an `aria-label`; every action is a real
  `<button>` in natural tab order (a full roving-tabindex arrow-key pattern is
  deliberately deferred — the toolbar is small enough that Tab order alone is
  reasonable for v1, and `Command Menu` already owns the more complex composite-widget
  keyboard pattern this system needs). Result popover announced via
  `aria-live="polite"`. See the honest accessibility limit noted in Research.
- **Keyboard:** Escape dismisses the toolbar or result popover from anywhere within it.

# Visual Direction

The toolbar is a single-row, compact, icon-plus-label-on-hover surface using the same
`bg-popover`/`border` language as `Overlay`-composed surfaces, positioned above the
selection by default (below if there isn't room above — a simple viewport-edge flip,
not a full collision-detection engine). The result popover reuses `Smart Field`'s
proposal-panel visual language (`bg-muted`, `border`) for `text`/`classification`/
`list` results, and composes `Diff Accept`'s own panel wholesale for `replacement`
results rather than re-skinning it.

# Motion Plan

Toolbar fade+scale-in on `--pd-duration-fast`/`--pd-ease-standard` (matches the
system's shared overlay signature); no motion while the selection itself is still
changing — the toolbar simply doesn't exist yet during that phase, which is itself the
correct "don't animate mid-selection" behaviour research confirms, achieved by the
debounce rather than a suppressed-animation flag. Result content swaps in via a plain
fade, never a per-character reveal, consistent with every other AI-tier component's
"the value already exists in full" reasoning. Under `prefers-reduced-motion`, the
toolbar's fade/scale drops to an instant appearance via `motion-reduce:transition-none`.

# AI Opportunities

The AI-native identity here is squarely in composing `Diff Accept` for Rewrite rather
than re-deciding "replace or not" from scratch — this is the tier's proposal/review
model applied at the selection-of-text granularity instead of the whole-field
granularity. Non-goals: this is not a chat surface (no follow-up conversation about
the result — that's out of scope per the system's standing "not a chat product"
thesis) and not a multi-selection batch tool (`Bulk Prompt Table`'s job, later).

# Variants

- **Default** — five actions (Explain, Rewrite, Translate, Classify, Extract), full
  toolbar.
- **Consumer-configured action set** — the action list is a prop, not hardcoded;
  ships with the five above as the documented default but any subset/superset is
  supported, since not every product needs Translate or Classify.
- Deliberately not building: a persistent/pinned toolbar, or a right-click context-menu
  variant — the floating-on-selection trigger is the one pattern in scope for v1.

# Public API

```tsx
type SelectionAction = { id: string; label: string; icon: React.ReactNode };

type SelectionActionResult =
  | { kind: "replacement"; value: string }
  | { kind: "text"; value: string }
  | { kind: "classification"; label: string; confidence?: "low" | "medium" | "high" }
  | { kind: "list"; items: string[] };

<SelectionActions
  containerRef={containerRef}
  actions={actions}
  onAction={(actionId, selectedText, signal) => Promise<SelectionActionResult>}
  onReplace={(mergedValue) => {...}}   // only called for an accepted `replacement` result
/>
```

- `containerRef` scopes selection detection to one region of the page rather than the
  whole document, so a product with multiple independent text areas doesn't get a
  toolbar fighting over which selection is "the" selection.
- `onAction` mirrors `fetchProposal`/`fetchSuggestion`'s injection shape and
  cancellation contract (an `AbortSignal`, consistent staleness handling) rather than
  inventing a fourth shape for the same family of problem.
- `onReplace` is the only side effect this component can trigger on the consumer's
  actual content — deliberately narrow, since replacement semantics are content-model
  specific and not this component's job to guess at.

# Registry Structure

- `name`: `selection-actions`
- `categories`: `["ai-assisted", "content", "application"]`
- `dependencies`: none new.
- `registryDependencies`: `["@pixeldosa/pixeldosa-theme", "@pixeldosa/diff-accept"]`
- Related: composes `diff-accept` directly; shares confidence-tier language with
  `smart-field`.

# Documentation Notes

**One-line:** A floating, selection-triggered toolbar for AI actions on a piece of
text — explain, rewrite (reviewed via Diff Accept), translate, classify, extract.
**When to use:** any read or editable content surface where per-selection AI actions
add value without a context switch to chat.
**When not to use:** a whole-field or whole-document action — that's `Smart Field`
(one field) or `Diff Accept` directly (a full rewrite already proposed elsewhere).
**Key differentiators:** composes `Diff Accept` for its one replacement-shaped result
instead of re-deciding accept/reject from scratch; result presentation adapts to the
actual shape of the output (prose, label, list) instead of forcing every action through
one generic "result text" box.

# Pixeldosa Score

- **Design Value: 7/10** — the trigger pattern is commodity now; the craft is in
  composing existing trust primitives correctly rather than reinventing them.
- **Developer Value: 7/10** — selection detection with correct debounce/positioning/
  keyboard behaviour is fiddly to get right; shipping it once is real value.
- **Business Value: 7/10** — completes the B0 AI-tier foundation set.
- **Marketing Value: 7/10** — a satisfying, easy-to-demo interaction.
- **Reusability: 7/10** — the toolbar-and-result-popover shell is reusable wherever
  selection-triggered actions matter; `Diff Accept` composition is the differentiator.
- **Originality: 5/10** — the trigger pattern is explicitly commodity (named in the
  demand check that reordered this behind Diff Accept); the composition with Diff
  Accept is the original piece.
- **Learning Value: 6/10** — first component built on `selectionchange`/Selection API
  handling.

No score below 6.

# Next Steps

1. Implement `selection-actions.tsx` + `.demo.tsx` + `registry-item.json`.
2. QA: typecheck, registry build, browser pass covering selection detection (mouse and
   programmatic), all four result kinds, the Diff-Accept-composed Rewrite path, and
   dismiss-on-outside-click/Escape.
3. Wire into `registry-demos.ts`, `packages/ui/src/index.ts`, docs page; run
   `pnpm registry:build`.
4. Mark shipped in `ROADMAP.md`.
