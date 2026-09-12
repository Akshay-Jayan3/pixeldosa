# AI Context / Provenance Surface — Build Plan

Status: **built same session**. Sixth AI-tier component (B1), completing everything in
B1 except AI Action Toolbar.

---

# Research

Carried forward from this session's earlier reconciliation research (already cited
when Citation Card/Source Viewer/Thinking Indicator were folded into this single
component): Perplexity's provenance model — **show evidence, not just a score** — the
actual source passage or record behind an answer, not an abstract confidence number
alone. That finding is the entire reason this component exists as one thing instead of
three: Vercel AI Elements' `Reasoning`/citation components are excellent but
chat-message-scoped; this system's real need is the same transparency **with no chat
thread present at all** — inside a form field, a table row, a card — which is a
different, harder problem and the more defensible build (per the North Star
Reconciliation table).

**The one interaction-pattern decision this plan makes:** a disclosure (collapsed by
default, expands on demand), not an always-visible panel. Provenance detail is
important to have but wrong to force onto every view by default — it competes with the
actual content for attention the moment it's always open, and `Smart Field`'s own
plan already established the same restraint for its inline `via {provenance}` caption.
This component is the *expanded* version of that same instinct: quiet until asked for.

# User Workflow

**Who:** a user looking at an AI-influenced value, summary, or decision who wants to
know *why* — what it was based on, what model produced it, when.
**What:** click a small, low-weight trigger to expand a panel showing whichever of
{explanation, sources, model metadata} the consumer supplied; collapse it again when
satisfied.
**When it appears:** the trigger is always present wherever a consumer attaches it;
the expanded content only renders once opened.
**Before:** just the trigger, unobtrusive.
**After:** collapsed again — nothing about the underlying value changes; this
component is read-only, it never proposes or commits anything.

# Product Context

Anywhere an AI-produced value, summary, or recommendation needs a "why" available
without forcing it into view — a `Smart Field` proposal, a table cell, a generated
report line, a classification result from `Selection Actions`. Visible: the trigger,
always. Hidden until relevant: explanation, sources, and metadata, all collapsed by
default. The decision this speeds up: "should I trust this," answered with real
evidence on demand instead of either hiding it entirely or forcing it on every view.

# Component Strategy

**Pattern** — a disclosure composing a few optional content sections (explanation
prose, a sources list, a metadata line), not a primitive, since it has real internal
structure (multiple independently-optional parts) but isn't a multi-step workflow of
its own — it's read-only and stateless beyond open/closed.

# UX Flow

- **Entry:** click the trigger button (icon + accessible label, default "Why this?").
- **Primary action:** toggle expand/collapse — a real disclosure, `aria-expanded` and
  `aria-controls` wired correctly, not a custom non-standard widget.
- **Content, in order when present:** explanation prose first (the plain-language
  "why"), then a numbered sources list (each optionally a link, each optionally
  carrying a short snippet), then a quiet metadata footer line (model name / generated
  timestamp) in the smallest, most muted text in the panel.
- **Empty:** if the consumer supplies none of explanation/sources/model/generatedAt,
  render nothing at all — a trigger with an empty panel behind it is worse than no
  component.
- **Dismiss:** click the trigger again, or Escape while focus is inside the panel.
- **Responsive/accessibility:** trigger is a real button; panel content is normal
  reading-order text, not a floating overlay, so it reflows naturally at any width
  and needs no special mobile handling; the expand/collapse state itself is
  communicated via `aria-expanded`, not by icon rotation alone.

# Visual Direction

The trigger is a small, muted icon-plus-text button (`text-muted-foreground`,
matching every other secondary action in this system), never the same visual weight as
the primary content it explains. The expanded panel uses the same quiet `bg-muted
border` language as `Smart Field`'s proposal panel and `Diff Accept`'s conflict
banner — consistent "this is supporting information" visual grammar across the whole
AI tier. Sources render as a simple numbered list, each a link when a `url` is
supplied (external-link affordance, opens in a new tab) or plain text otherwise, with
an optional one-line snippet in muted text beneath the label. The metadata line sits
last, smallest, quietest — model name and a relative/absolute timestamp, never louder
than the actual explanation above it.

# Motion Plan

Expand/collapse uses the same CSS `grid-template-rows` (`0fr` → `1fr`) technique
`Smart Field`'s proposal panel and `Diff Accept`'s conflict banner already use, on
`--pd-duration-fast`/`--pd-ease-standard` — proven, token-free height animation with
no `ResizeObserver` needed. Under `prefers-reduced-motion`, the transition drops via
`motion-reduce:transition-none`, leaving the open/closed state instant but fully
legible.

# AI Opportunities

This component *is* the AI opportunity already decided in the Reconciliation table —
folding Citation Card, Source Viewer, and Thinking Indicator into one surface that
works without a chat thread. Nothing further to scope here.

# Variants

- **Default** — full disclosure with all three optional sections.
- Deliberately not building: an always-open/pinned variant (contradicts the
  "quiet until asked" reasoning above) or a modal/overlay presentation (the content
  reads better inline, in normal document flow, than interrupting with a dialog for
  what is fundamentally supporting, not blocking, information).

# Public API

```tsx
export type ProvenanceSource = { label: string; url?: string; snippet?: string };

<AIContextSurface
  explanation="Matched based on similar historical records with the same domain."
  sources={[{ label: "acme-robotics.com", url: "https://acme-robotics.com" }]}
  model="claude-opus"
  generatedAt={new Date()}
  triggerLabel="Why this suggestion?"
/>
```

- Every content prop is optional; the component renders nothing if none are supplied
  (see UX Flow's Empty case).
- `generatedAt` accepts `string | Date` and is formatted for display, not left to the
  consumer to pre-format, since every consumer would otherwise reimplement the same
  relative-or-absolute formatting decision.
- No `forwardRef` — a disclosure has no imperative surface a consumer would need a
  ref for.

# Registry Structure

- `name`: `ai-context-surface`
- `categories`: `["ai-assisted", "content", "application"]`
- `dependencies`: none.
- `registryDependencies`: `["@pixeldosa/pixeldosa-theme"]`

# Documentation Notes

**One-line:** A collapsed-by-default "why this?" disclosure showing an AI-produced
value's explanation, sources, and model metadata — the folded-together, no-chat-thread
answer to Citation Card, Source Viewer, and Thinking Indicator.
**When to use:** anywhere an AI-influenced value needs transparency available on
demand — a Smart Field proposal, a table cell, a report line, a classification result.
**When not to use:** a full chat/conversation transcript (out of this system's scope
entirely) or an always-visible provenance caption for a single short value (that's
Smart Field's own inline `provenance` prop, already built).
**Key differentiators:** works with zero chat thread required; disclosure, not
always-on, so it never competes with the content it explains; folds three previously
separate ideas (citations, sources, reasoning) into one consistent surface.

# Pixeldosa Score

- **Design Value: 7/10** — the "works with no chat thread" constraint is real,
  differentiated design work, not a skin over an existing pattern.
- **Developer Value: 7/10** — one component instead of three (citation, source,
  reasoning) that would otherwise each need their own disclosure/accessibility
  plumbing.
- **Business Value: 7/10** — directly completes the trust story `Smart Field` and
  `Diff Accept` started; a natural composition target for both.
- **Marketing Value: 6/10** — solid but quiet; supporting-information components
  rarely carry a demo on their own.
- **Reusability: 8/10** — every AI-tier component that produces a value with a "why"
  can compose this without modification.
- **Originality: 6/10** — the disclosure pattern itself is standard; folding three
  previously-separate concepts into one no-chat-thread surface is the original piece.
- **Learning Value: 5/10** — mostly reuses patterns already proven elsewhere in this
  system (the grid-template-rows expand trick, the quiet `bg-muted` panel language).

No score below 6.

# Next Steps

1. Implement `ai-context-surface.tsx` + `.demo.tsx` + `registry-item.json`.
2. QA: typecheck, registry build, browser pass covering expand/collapse, sources with
   and without URLs, the all-empty-props render-nothing case.
3. Wire into `registry-demos.ts`, `packages/ui/src/index.ts`, docs page; run
   `pnpm registry:build`.
4. Mark shipped in `ROADMAP.md`.
