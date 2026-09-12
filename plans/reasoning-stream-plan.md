# Reasoning Stream — Build Plan

Status: **planned 2026-09-12.** The content half of thinking, where `Agent Presence` is
the indicator half. Un-folded from the reconciliation table on 2026-09-09 after it was
wrongly merged into `AI Context Surface`.

Protocol research is not repeated here — see `plans/agent-expression-system-plan.md`.
The load-bearing finding carried forward: **reasoning is a first-class stream**,
separate from output text, in both OpenAI Responses (`reasoning_summary` deltas) and AI
SDK v6 (a distinct `reasoning` part type). It is separate *because it is not the
answer*, and the UI must preserve that distinction rather than blur it.

---

# The real design problem

Reasoning text is **long, low-value-per-token, and usually not what the user wants to
read**. That creates a genuine bind:

- Show all of it → noise that buries the actual answer.
- Show none of it → the black box that destroys trust.

Every serious product converges on the same resolution: **a two-line ticker while it
streams, collapsing to a one-line summary once the answer arrives, expandable on
demand.** Reasoning is *scaffolding* — visible while being built, folded away once the
thing it supported exists.

That "fold away on completion" behaviour is the component's actual thesis. A reasoning
panel that stays expanded after the answer lands is the most common mistake in this
pattern, and it makes every answer look like it needs justifying.

# Decisions

1. **Never fake typing.** A step that has arrived is complete; it fades in whole
   (DESIGN.md §3.3). Character-by-character reveal of already-received text
   misrepresents what happened — the same rule Ghost Input, Smart Field, Diff Accept
   and Progressive Reveal all hold.
2. **Animate once, never replay.** Entrance is enforced by React's keyed
   reconciliation, not a timer — the `Progressive Reveal` mechanism, reused.
3. **Scroll anchoring is a correctness requirement, not a nicety.** Follow new content
   while the reader is at the bottom; the moment they scroll up, hold their position
   and offer "jump to latest". This is the standing requirement added from the
   2026-09-12 competitive scan, and this is its first implementation.
4. **Elapsed time is shown, because it is the thing users actually want.** "Thought for
   12s" answers *is this worth waiting for* better than any amount of reasoning text.
   It is measured, not estimated — the same honesty rule as `Generation Placeholder`'s
   percentage.
5. **Summaries only.** Where a provider exposes reasoning *summaries*, show them. Raw
   private chain-of-thought is never presented as fact — the roadmap's standing policy
   line, unchanged.

# UX Flow

- **Streaming** — a two-line ticker, newest at the bottom, older lines masked out at
  the top. Reads as a process, not a document.
- **Done** — collapses to `Thought for 12s` with a disclosure. The default is
  collapsed; this is the whole point.
- **Expanded** — the full trace, scrollable, scroll-anchored.
- **Empty** — renders nothing. No steps, no shell.

# Public API

```tsx
<ReasoningStream
  steps={["Checking the invoice table…", "Three share a billing contact…"]}
  isStreaming={status === "reasoning"}
  durationMs={elapsed}        // measured; shown once done
  label="Thinking"
  defaultExpanded={false}
/>
```

`steps` is an array rather than a raw string: providers emit reasoning *summaries* as
discrete parts, and splitting is the consumer's business, not the component's.

# Registry Structure

- `name`: `reasoning-stream`
- `categories`: `["ai-assisted", "content", "application"]`
- `dependencies`: none. `registryDependencies`: `["@pixeldosa/pixeldosa-theme"]`

# Documentation Notes

**When to use:** whenever a model exposes reasoning and the user benefits from seeing
the work — but not the raw trace.
**When not to use:** the agent's *activity state* is `Agent Presence`; the full
historical record across a whole turn is `Chain-of-Thought Timeline` (B2); a
collapsed "why this?" over a finished value is `AI Context Surface`.

# Pixeldosa Score

- Design Value 8 · Developer Value 8 · Business Value 8 · Marketing Value 6 ·
  Reusability 8 · Originality 6 · Learning Value 7.

Originality is the honest 6: the ticker-then-collapse pattern is convention. The
differentiation is the scroll anchoring and the fold-away-on-completion default, both of
which most implementations get wrong.

# Next Steps

1. Build, wire, document.
2. QA: streaming ticker, completion collapse, scroll anchoring under a user scroll-up,
   reduced motion, 375px.
3. Retrofit scroll anchoring onto `Progressive Reveal` once proven here.
