# Progressive Reveal — Build Plan

Status: **built same session**. Fifth AI-tier component (B1).

---

# Research

Carried forward from this session's earlier generative-UI research (2026 AI-interface
write-ups, cited when Command Menu and the North Star reconciliation were built): the
concrete bar for real streaming UI is **layout-stable arrival** — new content should
expand smoothly into place, never causing a visible jump in what's already on screen —
plus a visible "still working" signal while more is expected. The system's own
recurring, already-applied rule (Ghost Input's plan, Smart Field's plan, Diff Accept's
plan all state it independently): **never animate content character-by-character when
the full value already exists at arrival time** — a typewriter reveal fabricates a
sense of "being generated live" for something that was already fully generated before
it reached the client. `Progressive Reveal` is the one component whose entire job is
enforcing that rule at the *collection* level (rows/cards arriving over time) rather
than the single-value level those other components already cover.

**The one structural decision that follows directly from this:** an append-only list of
discrete items is inherently more layout-stable than a single growing block of prose —
new rows appear below existing ones without reflowing them, whereas a single expanding
text blob can push surrounding UI around as it grows. This is why `Progressive Reveal`
is scoped to **rows, cards, and sections** (per its own name in the roadmap), not
prose streaming — Vercel AI Elements already owns prose streaming well (see the North
Star Reconciliation table), and prose is also the one shape where append-only ordering
doesn't help with layout stability the way it does for a list.

# User Workflow

**Who:** a user watching results arrive from an agent/tool call that returns multiple
items over time — search results, table rows, generated cards — rather than one
answer.
**What:** each item fades smoothly into place as it arrives, in order, with no jump to
already-visible items and no per-character reveal of any one item's content.
**When it appears:** any time a consumer's `items` array grows over time from a
streaming or incrementally-loading source.
**Before:** whatever items have already arrived, static.
**After:** the same items, permanently settled — the entrance animation for an item
never replays once it has appeared.

# Product Context

Search results, table/list rows populated by an agent tool call, generated card grids,
any collection whose full membership isn't known upfront. Visible: each item as it
arrives, plus an optional trailing "more incoming" indicator while streaming continues.
Hidden until relevant: the trailing indicator only exists while `isStreaming` is true.

# Component Strategy

**Primitive** — a thin wrapper around whatever the consumer already renders per item.
It owns exactly one thing: giving each newly-arrived item its entrance transition
exactly once, by relying on React's own keyed-reconciliation identity rather than
tracking "seen" state by hand. No internal data-fetching, no async behaviour of its
own — the consumer already owns the stream; this component only owns how each new
member of it appears.

# UX Flow

- **Entry:** the consumer's `items` array gains a new entry (matched by `keyExtractor`
  or array index); the newly-keyed item mounts fresh and plays its entrance transition.
  An item whose key was already present on a prior render is not remounted, so it never
  replays the animation — this is enforced structurally by React's reconciliation, not
  by a hand-rolled "already seen" tracker.
- **Streaming indicator:** while `isStreaming` is true, a trailing low-weight row
  signals more items are expected — the same restrained, non-decorative posture every
  other loading state in this system already uses (no full-block spinner overlay).
- **Empty:** renders nothing extra when `items` is empty and not streaming; the
  streaming indicator is the only thing shown if items haven't arrived yet but more are
  expected.
- **Responsive / accessibility:** each item's arrival is announced via a shared
  `aria-live="polite"` region reporting the running count, not one announcement per
  item (which would spam a screen reader on a fast stream); the trailing indicator
  carries `aria-live="polite"` text ("More results loading…") rather than being purely
  decorative.

# Visual Direction

Each item's entrance is a plain opacity + small upward translate (`translate-y-1` to
`0`), using the same two-phase-mount pattern (`Command Menu`, `Selection Actions`)
so the browser has a real "from" state to animate away from. The trailing streaming
indicator reuses the muted, quiet caption language already established (`text-xs
text-muted-foreground`), with a simple pulsing dot rather than a full skeleton block,
since a skeleton implies "content will appear here" for a specific known shape, and a
progressively-revealed list's next item's shape isn't necessarily knowable in advance.

# Motion Plan

Per-item entrance: `--pd-duration-fast`/`--pd-ease-standard`, opacity + translate,
identical timing language to every other "content arriving" transition in this system.
The trailing indicator's pulse uses a plain CSS `animate-pulse`-equivalent driven by
opacity oscillation on the same token scale — under `prefers-reduced-motion`, the
per-item entrance drops to an instant appearance (`motion-reduce:transition-none`) and
the trailing pulse stops oscillating but the indicator's text remains, so the "more is
coming" signal survives motion removal.

# AI Opportunities

This *is* the AI-tier answer to generic streaming, per the North Star Reconciliation
table's existing verdict — nothing further to add here; the differentiation is already
decided (structured collections, never prose, never per-character).

# Variants

- **Default** — vertical stack, one item per row.
- **Grid** — same entrance/streaming behaviour, items laid out in a CSS grid instead of
  a stack, for card collections.
- Deliberately not building: automatic re-sorting/re-ordering of already-revealed items
  — if a consumer's stream reorders, that's a data-model decision outside this
  component's job; it only ever appends.

# Public API

```tsx
<ProgressiveReveal
  items={items}
  keyExtractor={(item) => item.id}
  renderItem={(item) => <ResultCard result={item} />}
  isStreaming={isLoadingMore}
/>
```

- `items: T[]` and `renderItem: (item: T, index: number) => React.ReactNode` — the
  consumer owns the actual per-item rendering; this component owns only the reveal
  transition wrapping it.
- `keyExtractor?: (item: T, index: number) => React.Key` — defaults to array index if
  omitted, though a real key is strongly recommended so items don't lose their "already
  seen" identity if the array is ever spliced rather than purely appended.
- `isStreaming?: boolean` — shows the trailing indicator.
- No `forwardRef` — nothing here needs an imperative handle, so the component stays a
  plain generic function rather than fighting `forwardRef`'s poor generic-type support.

# Registry Structure

- `name`: `progressive-reveal`
- `categories`: `["ai-assisted", "content", "application"]`
- `dependencies`: none.
- `registryDependencies`: `["@pixeldosa/pixeldosa-theme"]`

# Documentation Notes

**One-line:** Reveals a growing collection of items (rows, cards) one at a time as
they arrive, with a stable layout and no per-character typewriter effect.
**When to use:** streaming/incrementally-loading search results, tool-call output
rows, generated card grids.
**When not to use:** streaming prose (use an existing chat/response component, e.g.
Vercel AI Elements) or a single value that changes (that's `Smart Field`/`Diff Accept`
territory, not a collection).
**Key differentiators:** entrance-once-per-item enforced by React's own keyed
reconciliation rather than manual "seen" tracking; append-only by design, since that's
what actually keeps a growing list layout-stable.

# Pixeldosa Score

- **Design Value: 7/10** — the "why not a typewriter effect" reasoning is the real
  craft; the visual execution itself is intentionally quiet.
- **Developer Value: 7/10** — the keyed-reconciliation trick for "animate once, never
  replay" is a small but genuinely easy thing to get wrong by hand.
- **Business Value: 7/10** — the named answer to a common, recurring need (any
  agent-populated list).
- **Marketing Value: 6/10** — a pleasant but quiet demo; not a flagship interaction on
  its own.
- **Reusability: 8/10** — generic enough for search results, tool-call rows, or card
  grids without modification.
- **Originality: 5/10** — the reveal pattern itself is common; the specific "why
  structured collections, not prose" reasoning is this system's own.
- **Learning Value: 6/10** — a clean example of leaning on React reconciliation instead
  of hand-rolled state for a UI problem that looks like it needs manual tracking.

No score below 6.

# Next Steps

1. Implement `progressive-reveal.tsx` + `.demo.tsx` + `registry-item.json`.
2. QA: typecheck, registry build, browser pass confirming items appended over time
   animate in once and never replay on re-render.
3. Wire into `registry-demos.ts`, `packages/ui/src/index.ts`, docs page; run
   `pnpm registry:build`.
4. Mark shipped in `ROADMAP.md`.
