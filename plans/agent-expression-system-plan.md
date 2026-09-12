# Agent Expression System — Plan

Status: **planned 2026-09-08**. This is not a component plan — it is the plan for
PixelDosa's **signature layer**: how an agent's state is expressed through UI rather
than through a sentence of text. It defines a state vocabulary grounded in real
protocol events, an interaction grammar, and the first set of components that carry it.

The strategic premise, in one line: **AI coding ability is now commodity; taste and
crafted experience are not.** This layer is where that claim gets made or lost.

---

# Research

## The state model is not invented — it is already in the protocols

Every event model in production converges on the same lifecycle. Mapping them side by
side is what makes PixelDosa's vocabulary adoptable rather than opinionated:

| Source | What it emits |
| --- | --- |
| **AG-UI** (16 events, CopilotKit) | `RUN_STARTED/FINISHED/ERROR`, `STEP_STARTED/FINISHED`, `TEXT_MESSAGE_START/CONTENT/END`, `TOOL_CALL_START/ARGS/END/RESULT`, `STATE_SNAPSHOT/DELTA`, `MESSAGES_SNAPSHOT`, `RAW`, `CUSTOM` |
| **OpenAI Responses API** | `created`, `queued`, `in_progress`, `completed`, `failed`, `incomplete`; a **separate reasoning stream**; per-tool-type call events |
| **Vercel AI SDK v6** | text / tool-call / tool-result / **reasoning** as distinct part types; `tool-<toolName>` per tool |
| **LangGraph HITL** | `interrupt()` pauses on a checkpoint; four human decisions — **approve / edit / reject / respond** |
| **MCP (2026-07-28)** | **elicitation** — the server pauses and asks the user; clients **must** show which server is asking and offer decline + cancel |

Four findings that most UIs collapse and shouldn't:

1. **Reasoning is a first-class stream**, separate from output text, in both OpenAI and
   AI SDK. "Thinking" is a protocol event, not a UI fiction.
2. **`TOOL_CALL_ARGS` streams before execution.** *Deciding what to do* is
   distinguishable from *doing it*. Nearly every UI renders both as one spinner.
3. **`queued` is a real state.** Accepted-but-not-started ≠ working.
4. **MCP mandates provenance and refusal on elicitation.** The spec itself requires
   showing who is asking and allowing a decline. PixelDosa's trust thesis is not a
   design preference here — it is protocol compliance.

## Competitive position

- **Vercel AI Elements** is "tightly integrated with AI SDK hooks like `useChat`" and
  chat-scoped. Correct for Vercel (it drives SDK adoption); a bad lane to copy.
- **Aceternity (~19K) / Magic UI (~18K)** own dramatic visual effects — 3D cards,
  glowing beams, glassmorphism, neon gradients — and ship **without
  `prefers-reduced-motion` by default**, and are "more focused on aesthetics than
  functionality." The flashy lane is accessibility-poor and functionality-thin.
- **The orb is now platform furniture.** Siri lives in the Dynamic Island as an
  expandable bubble; Gemini and ChatGPT are orb-and-glow. A generic particle orb reads
  as an OS clone, not as an identity.

**The open position:** nobody owns the *neutral, accessible, non-chat* expression layer
for agent state. That is the gap this system takes.

---

# The signature: a turn-taking grammar

Every product today renders "thinking" and "waiting for your approval" in the same
visual register — something moving, plus a line of text. They are **opposites**. One
means *relax*. The other means *nothing proceeds until you act*.

> **Motion means the machine is busy. Stillness means it is your turn.**

- **Machine states move** — inward, self-contained, dimmed, unhurried. No urgency,
  because none is warranted; the user is a spectator.
- **Hand-off states stop.** The form resolves into a stable, brighter, oriented shape
  and holds **perfectly still**. The absence of motion is the signal.

This inverts the convention (everyone pulses the thing that wants attention). It is
learnable in roughly three interactions, after which the user never reads a word to
know whether they are needed. It is monochrome-native, costs nothing to render, and it
is *felt* rather than seen — which is the definition of the premium being aimed at.

## The three questions every state must answer without text

1. **Is it my turn or its turn?** → motion vs stillness.
2. **Can I stop it?** → a cancel affordance is visible during *every* machine state,
   never hidden behind a hover or a menu. AG-UI supports cancel/resume; MCP elicitation
   mandates decline and cancel. Exposing it is both correct and reassuring.
3. **Is it safe to look away?** → `queued` and long `working` read differently from
   about-to-finish, so a user can decide to leave without anxiety.

Text labels and `aria-live` always accompany the visual — the grammar is an *additional*
channel, never the only one (DESIGN.md §3.2, §3.8).

---

# State vocabulary

## Machine's turn — motion

| State | Protocol origin | Reads as |
| --- | --- | --- |
| `queued` | OpenAI `queued` | Accepted, not started. Slow, sparse, patient. |
| `thinking` | reasoning stream (OpenAI, AI SDK) | Internal churn, no direction. |
| `deciding` | `TOOL_CALL_START` → `TOOL_CALL_ARGS` | Converging — choosing an action. |
| `working` | `TOOL_CALL_END` → awaiting `TOOL_CALL_RESULT` | Directed, purposeful; **names the tool**. |
| `streaming` | `TEXT_MESSAGE_CONTENT` | Output arriving, steady cadence. |
| `done` | `RUN_FINISHED` / `completed` | Settles and dims out. |
| `failed` | `RUN_ERROR` / `failed` | Collapses; the one state allowed `destructive` chroma. |
| `cancelled` | user abort | Distinct from failed — nothing went wrong. |

## Your turn — stillness

| State | Protocol origin | Reads as |
| --- | --- | --- |
| `suggesting` | proposal ready | Still, resolved, offered. Powers Smart Field / Diff Accept. |
| `asking` | **MCP elicitation** | Still, open, awaiting input. Must carry *who is asking* + decline. |
| `awaitingApproval` | **LangGraph `interrupt()`** | Still, held, highest weight. Nothing proceeds. |

## Novel states — where the invention is

Not covered by any component library found, and each maps to something real:

| State | Why it matters |
| --- | --- |
| `uncertain` | Completed, but low confidence. Today this is binary; reality has "done, but don't trust me." Promotes **Confidence Meter** from badge to *state*. |
| `stale` | Was correct when generated; inputs have since changed. **PixelDosa already invented this** — Diff Accept's conflict guard. Generalising it system-wide turns a local guard into a signature. |
| `incomplete` | Hit the token ceiling. OpenAI emits it; nothing designs for "I ran out of room." |
| `waitingOnAgent` | Multi-agent handoff. Blocked-on-a-peer ≠ working. |
| `idlePresent` | The ambient agent that is *there* and not invoked. This is the "not a chat interface" state, and the one that makes a product feel like a smart device rather than a form. |

---

# SDK strategy: headless core, documented adapters

**Decision: the core takes zero AI dependencies.** This is not a new stance — it is the
one already applied six times: Smart Field, Ghost Input and Selection Actions all take
`fetch*(…, signal)`; Diff Accept takes an already-generated value; AI Action Toolbar's
`busy` is caller-owned. The component never calls a model.

Reasons this matters more here than usual:

- The registry **copies code into consumer projects**. A dependency cannot be patched
  after it leaves the repo — and AI SDK v5→v6 already broke the tool-call streaming
  lifecycle.
- The niche makes coupling actively wrong: AI startups routinely run a Python agent
  backend (LangGraph, OpenAI Agents SDK) behind a TypeScript frontend.
- The ecosystem is converging on this split anyway — shadcn now ships `@shadcn/react`
  for headless logic with the registry item supplying the styling.

**The reframe:** the state vocabulary is the product, not the SDK binding. If the enum
maps cleanly from AG-UI, AI SDK, OpenAI Responses and LangGraph, PixelDosa becomes the
UI layer for *any* agent stack — a stronger and less contested claim than "components
for the AI SDK."

**Deliverable instead of an adapter package:** a **mapping table in the docs** showing
`AG-UI event → PixelDosa state`, `AI SDK part → state`, `LangGraph interrupt →
awaitingApproval`, `MCP elicitation → asking`. Zero maintenance, it proves the
neutrality claim, and it reveals which stack people actually ask for before any code is
committed to one. Adapters ship later, on demand, as separate registry items
(`@pixeldosa/agent-state-ai-sdk`) so the dependency never reaches people who don't want
it. The AI SDK may be used as a **devDependency of the docs site** for one genuinely
live streaming demo — that costs consumers nothing.

---

# Visual forms

One vocabulary, three renderings. Shipping the same state model in multiple forms is
itself the design-engineering argument: the *system* is the artifact, not the effect.

- **`field` (default, the signature).** A cell/pixel matrix that reconfigures per state.
  Machine-native rather than organic — it shows a machine working instead of faking a
  mind breathing, which is the honest metaphor for a system built on not overclaiming.
  Monochrome, no glow, no WebGL. Ties to the brand name.
- **`orb`.** A dot-cloud sphere — the form the category has converged on, executed to a
  higher craft bar than the reference examples: true 3D point distribution (Fibonacci
  sphere) with depth-based opacity and size, not a flat ring of dots. **This is
  deliberately included as a flagship/showcase form** — it is the most immediately
  striking artifact in the set and the best single proof of craft. The differentiation
  risk is real and is mitigated by it being *one form of a state system* rather than a
  standalone effect: the orb expresses eleven meaningful states, where the references
  express "loading."
- **`line`.** A minimal inline form for dense contexts — table rows, status bars, form
  fields. Proves the vocabulary survives outside a hero moment.

---

# Craft bar (non-negotiable, this is the point of the exercise)

1. **States morph, never cut.** Transitioning `thinking → deciding → working` is a
   continuous reconfiguration of the same particles/cells, not a swap between two
   animations. This is the single hardest thing to fake and the clearest signal of
   craft in the whole set.
2. **One signature settle curve**, shared system-wide, with a slight overshoot. What
   makes iOS feel like iOS: unscreenshotable, felt in every interaction.
3. **`transform` and `opacity` only** — 60fps, GPU-composited, no layout thrash. A
   presence indicator that stutters is worse than none.
4. **Sub-pixel motion.** No visible stepping; positions interpolate in float space.
5. **Reduced motion is a fallback, not a removal.** Under `prefers-reduced-motion` the
   forms hold a *distinct static configuration per state* — so the grammar still works
   with zero animation. This is the accessibility gap Aceternity and Magic UI ship with
   and it is a checkable competitive claim.
6. **Legible at 16px and at 200px.** Same component, hero and inline.
7. **Never colour-only.** Every state pairs with a text label and `aria-live`.

---

# First component set

Four components, ordered so each proves something different:

### 1. `Agent Presence` — the flagship
The state vocabulary made visible. `state` prop, `form` variant (`field` | `orb` |
`line`), `size`, optional `label`, optional `tool` name for `working`, `onCancel` for
machine states. Zero AI dependencies. **Proves: craft.**

### 2. `Agent Ask` — the gap nobody fills
The agent needs structured input to continue. MCP-elicitation shaped: shows **who is
asking**, renders a typed input, and always offers **decline** and **cancel** as
first-class actions. Holds still (your turn). Nothing in this registry or any surveyed
competitor covers this. **Proves: original thinking.**

### 3. `Live Status Line` — already on the roadmap (B2)
Single-line, inline agent status for real product chrome. Composes `Agent Presence`
in `line` form plus the current step, elapsed time, and cancel. **Proves: the system
works in ordinary product UI, not just as a demo piece.**

### 4. `AI Approval Gate` — already on the roadmap (B2)
The `awaitingApproval` state made real: what will happen, risk, confidence, and the
four LangGraph decisions — **approve / edit / reject / respond**. Composes
`Confidence Meter`, `AI Context Surface`, `Diff Accept` (for edit) and
`AI Action Toolbar`. **Proves: the trust thesis, and the highest business value.**

Deliberately **not** in the first set: `Chain-of-Thought Timeline`, `Live Tool-Call
Console`, `Task Plan Runner` — all real, all better built once the vocabulary is
proven, and all at risk of becoming trace-viewers rather than product UI if built first.

---

# What gets updated elsewhere

- **`DESIGN.md`** — new section for the turn-taking grammar, quantization, and the
  three questions. It becomes a checkable rule, not a note in a plan.
- **`ROADMAP.md`** — new **B1.5 — agent expression** tier holding the four components
  above, plus the `stale` / `uncertain` generalisations against existing components.

---

# Pixeldosa Score

- **Design Value: 9/10** — the turn-taking inversion is a genuine, defensible idea.
- **Developer Value: 8/10** — one vocabulary that maps to every major agent stack.
- **Business Value: 9/10** — this is the portfolio artifact and the differentiation.
- **Marketing Value: 9/10** — the orb form is the most shareable thing in the system;
  "we express eleven agent states, not one spinner" is a real claim.
- **Reusability: 9/10** — every AI-tier component adopts it.
- **Originality: 8/10** — the grammar and the `asking`/`stale` states are unclaimed.
- **Learning Value: 8/10** — protocol-grounded state modelling is rare and teachable.

# Next Steps

1. Update `DESIGN.md` and `ROADMAP.md` (this change).
2. Prototype `Agent Presence` — **validate the turn-taking grammar cheaply before
   specifying the rest.** If stillness-means-your-turn does not read, the whole layer
   changes and it is better to find that out in an afternoon.
3. Then `Agent Ask`, `Live Status Line`, `AI Approval Gate`.
4. Retrofit `stale` onto Diff Accept and `uncertain` onto Confidence Meter.
