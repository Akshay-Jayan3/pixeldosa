# Pixeldosa Component & Block Roadmap

Two tiers: **Level 1 — Components** (small, reusable pieces) and **Level 2 — Blocks**
(composed experiences — this tier is what Pixeldosa is actually for). A third category,
**Widgets**, sits alongside both — see North Star for what it is and why it's not a
tier above Blocks.

> **What ships next, and in what order, lives in [`plans/beta-launch-plan.md`](plans/beta-launch-plan.md)**
> (2026-09-14): beta launch plus weekly drops. This file remains the full inventory and the
> record of what shipped and why.

## North star: premium interactive first

**Note on sourcing:** a more detailed, previously-written set of planning docs lives
in `plans/` — `pixeldosa-shipping-plan.md` (status: locked for MVP feedback release),
`pixeldosa-mvp-plan.md`, `pixeldosa-priority-roadmap.md`, `pixeldosa-component-catalog.md`,
and `command-menu-plan.md`. Those are the authoritative, execution-level source; this
section is the high-level index and stays reconciled with them. Where an earlier
version of this section disagreed with `plans/`, `plans/` wins — see "Reconciliation"
below for what changed and why.

**The filter for everything below:** before building anything, ask "is the
interaction itself the value, or is this a styled div?" If a component would look
identical as a static Figma frame — most cards, most badges, most single-purpose
layout wrappers — it is not where Pixeldosa wins, and it gets deprioritized in favour
of anything where real state, motion, or manipulation is the product: streaming,
drag, resize, command, filter, multi-step flow.

**The specific bet, per `plans/pixeldosa-priority-roadmap.md`:** high-trust AI
*embedded inside ordinary product interfaces* — forms, documents, tables, approvals,
operational workflows — not a chat product. Explicitly not competing with Vercel AI
Elements on generic chat/conversation primitives, and not competing with Magic
UI/Aceternity on landing-page effect volume. The differentiation is human attention to
detail — typography, hierarchy, spacing, state design, accessibility — applied to
components that show real product judgment, not visual novelty.

**Niche lock-in (2026-09-05):** the audience is **AI startups**, full stop — not
general/agency/marketing-site work. Everything already shipped (Smart Field, Diff
Accept, Command Menu) already served this audience implicitly; this makes it explicit
so it can shape what gets cut, not just what gets built. Two things this does NOT mean:
it doesn't mean "AI components only" in isolation — an AI startup's actual product
still needs Command Menu, Data Table, Document Preview, Navigation Shell to hold the AI
parts together, so the Product-tier foundation stays in scope as supporting
infrastructure for Blocks, not general-purpose padding. It does mean the Marketing
Components/Blocks and Business Components/Blocks tiers are **cut outright, not merely
deprioritized** — testimonial cards, invoice cards, CRM pipelines serve a generic
audience this system no longer has. Removed from the inventory below rather than left
as someday-maybe weight.

**The signature bet (2026-09-08) — identity is behavioural, not decorative.** AI has
made coding ability commodity; taste and crafted experience have not been commoditised,
and this system is the argument for that. The identity is therefore *not* a surface
treatment — jelly, 3D metallic, glassmorphism are the most copyable thing in software
and are already owned by Aceternity (~19K) and Magic UI (~18K), who ship them **without
`prefers-reduced-motion` by default**. Competing there means fighting incumbents with
their own weapons, a year late, in the one lane where PixelDosa's accessibility and
functionality advantages count for nothing.

The identity instead lives in **how agent state is expressed** — one grammar, felt in
every interaction rather than seen in a single hero screenshot, and distributed across
a hundred small decisions rather than sitting in one CSS file, which is what makes it
hard to copy. The rule, now standing in `DESIGN.md` §3a: **motion means the machine is
busy, stillness means it's your turn.** Every competitor renders "thinking" and
"waiting for your approval" in the same register; they are opposites, and treating them
as opposites is the differentiation. Second rule: **quantize** — discrete cells over
smooth bars, because a model does not know it is 73.4% confident.

The orb form is deliberately kept as a showcase rendering, with eyes open: the orb is
now platform furniture (Siri in the Dynamic Island, Gemini, ChatGPT). It earns its
place only because it expresses eleven real states where the references express
"loading" — as one form of a state system, never as a standalone effect.

Full spec: `plans/agent-expression-system-plan.md`. Component set: **B1.5** below.

**Reconciliation — "check the usage possibilities, even if Vercel/Cult already have
one, build a better version":** every AI atom from the previous pass was checked
against what Vercel AI Elements (20+ components; as of Jan 2026 also owns Voice,
Code/IDE, and Agent-config components — a deep, framework-vendor-backed, free
investment in chat/coding-agent UI) and Cult UI (interaction-craft components plus
100+ AI *agent template* patterns, not embedded-product trust components) actually
cover, and whether Pixeldosa could credibly out-craft them there. Result:

| Considered | Verdict | Why |
| --- | --- | --- |
| Streaming Response | **Replaced by Progressive Reveal** (already scoped) | Vercel's `Response`/`Message` streaming is deep, free, and chat-scoped. Pixeldosa's real need is structured streaming of *product data* — table rows, form fields, cards — with no typewriter effect, which Progressive Reveal already names precisely. |
| Citation Card, Source Viewer | **Replaced by AI Context / Provenance Surface** (shipped) | Vercel's citation patterns are chat-message-scoped. Pixeldosa's version needs to work with no chat thread present at all — inside a form field or a table row — which is a genuinely different, harder problem and the more defensible build. |
| ~~Thinking Indicator~~ | **Reversed 2026-09-09 — was wrongly folded into AI Context Surface** | The original call collapsed two jobs that differ in *time*, not scope: AI Context Surface answers "why this?" **after** an answer exists (retrospective provenance), while a thinking surface answers "what is it doing **right now**?" (live state). Only the retrospective half got built, leaving the system with no live-activity surface at all — the single most common thing an AI product must show. The Agent Expression plan then independently re-derived `thinking` as a first-class state grounded in OpenAI's *separate* reasoning stream and AI SDK's `reasoning` part type, contradicting this row without reconciling it. Now split into two real build targets in **B1.5**: `Agent Presence` (the indicator) and `Reasoning Stream` (the content). |
| Tool Call | **Replaced by Live Tool-Call Console** (already scoped) | Vercel's `Tool`/`Agent` components are excellent and getting deeper (Jan 2026 IDE/Commit/EnvironmentVariables additions) — competing head-on is a bad trade. Pixeldosa's operational-console framing (branded, structured states, retry) is a different job: ops visibility, not chat transcript.
| Diff Viewer | **Merged into Diff Accept** (already scoped) | Same component; `plans/` uses this name, kept for consistency. |
| Branch Picker | **Parked, not built** | Only meaningful inside a multi-turn conversation surface, and full chat/message/conversation primitives are explicitly out of MVP scope (`pixeldosa-mvp-plan.md`). No home for it without first building the thing Pixeldosa deliberately isn't building. Revisit only if a future AI Blocks item needs it. |
| Markdown Renderer, Code Block | **Integrate, don't build** | Pure rendering/parsing utilities with no state, trust, or interaction dimension — not where craft is visible, and Vercel's Code Block (header, filename, multi-language, Jan 2026) is already strong and free to wrap. |
| Inline/Slash Command | **Kept, rescoped** | Real usage inside Selection Actions and Ghost Input (trigger an AI action inline in a field) rather than as a generic block-editor slash menu — fits the embedded-in-product thesis directly. |
| Split View / Resizable Panes | **Kept** | Supporting primitive for Document Preview and Navigation Shell, both already scoped in `plans/`; not a redundant addition. |

**Competitive scan, 2026-09-12 — a peer AI component set.** Checked item by item against
what's shipped or scoped here. The value of the scan isn't the overlap, it's the two
gaps it exposed and the one behaviour worth stealing without building anything.

| Their component | Our position | Verdict |
| --- | --- | --- |
| Image Generation | `Generation Placeholder` **shipped**, with four progress forms | Ahead |
| Reasoning Steps | `Reasoning Stream` (B1.5) + `Chain-of-Thought Timeline` (B2) | Scoped |
| Question Card | `Agent Ask` (B1.5) | Scoped — and independently confirms the gap is real |
| Task List, Plan Card | `Task Plan Runner` (B2) | Scoped |
| File Diff | `Diff Accept` is *text*-level; `Change Summary List` (B2) is the turn-level roll-up | **Partial gap** — neither is a multi-file diff with a file tree and per-file `+N/-N`. Decide when a consumer needs it; don't pre-build. |
| **Inline Citations** | **Not covered.** `AI Context Surface` is *block-level* provenance — a collapsed panel beside a value | **Real gap, added below.** This is the same fold-away error as Thinking Indicator: "Citation Card / Source Viewer" were merged into AI Context Surface, but a superscript marker inside a sentence that resolves to its source is a different job from a panel attached to a whole answer. Claim-level vs answer-level. |
| **Chat Input** | Chat is out of scope — but a **structured prompt composer** is not | **Real gap, added below.** The thesis is "don't make every AI feature a blank chat box"; we have no component that actually demonstrates the alternative. |
| Streaming Text | `Progressive Reveal` covers *items*; prose streaming stays Vercel's | Skip, unchanged |
| Code Block | Rendering utility, no state or trust dimension | Skip, unchanged |
| Message, Message Scroller | Chat-thread primitives | Skip — **but see below** |

**Worth stealing without building it:** `Message Scroller` solves scroll anchoring —
follow new content while the user is at the bottom, but preserve their position the
moment they scroll up, and offer "jump to latest". That is a genuine correctness
requirement for *any* streaming surface, not a chat feature. It now applies as a
standing requirement to `Progressive Reveal`, `Reasoning Stream` and
`Live Tool-Call Console` rather than becoming a component of its own.

**Locked principle (2026-09-13) — pure components. Taste and UX are the moat, not
protocols.** PixelDosa takes **no dependency** on A2UI, the AI SDK, AG-UI, LangGraph,
MCP or any other agent stack, and never will as a requirement. Every component must be
usable by a team with nothing but React: props in, callbacks out, no provider, no
runtime, no protocol. Reasons, in order of weight:

1. **Protocols are young and moving.** A2UI is an early-stage public preview (v0.9.1
   production, v1.0 a release candidate, "expect changes"); the AI SDK broke its
   tool-call lifecycle between v5 and v6. Code copied into a consumer's repo cannot be
   patched when a protocol shifts under it.
2. **Protocol integration is commodity.** Any team — or any coding agent — can wire a
   stream to a prop in an afternoon. What they cannot shortcut is knowing that an
   approval must state reversibility, that a collapsed reasoning trace needs
   `overflow-hidden`, or that "Accept all" quietly destroys per-field review.
   **That judgment is the product.**
3. **The audience is AI startups on every stack** — Python backends, custom
   orchestration, no framework at all. A dependency excludes some of them; taste
   excludes none.

What this permits, and nothing more: **documentation recipes** (a mapping table, a
ten-line adapter snippet on a docs page) that show a team how their stack's events map
onto a component's props. Recipes are copy-paste examples, not packages, never imported
by a component, and never a registry dependency. The existing Agent Presence mapping
table is the model.

What it still asks of every component, because it's simply good design: plain-data
props wherever possible and named callbacks rather than opaque objects — which happens
to keep every protocol path open without committing to any of them.

~~**Forward bet — generative UI / A2UI compatibility**~~ *— superseded by the principle
above. Kept for the record of what was considered:* (2026-09-05, grounded in the actual
spec, not secondhand summary): the industry's 2026 convergence point for "AI
response as interactive component instead of text" is **Generative UI**, and Google's
open-sourced **A2UI protocol** (early preview, v0.9.1; local copy under `../a2ui` — an
earlier note here wrongly said v1.0) states the
model explicitly: *"defining your own catalog allows you to restrict the agent to
using exactly the components and visual language that exist in your application."* The
protocol's own `catalogs/basic/catalog.json` is a bare baseline (`Text`, `Button`,
`TextField`, `Card`, `Row`/`Column`, `ChoicePicker`, `Slider` — nothing with a
trust/proposal model). That is a real, concrete opportunity, not a metaphor: a
**PixelDosa A2UI catalog** — a JSON Schema mapping A2UI's component/action/data-binding
model onto real PixelDosa components (Smart Field's propose/accept lifecycle, Diff
Accept's per-hunk review) — would let an AI startup's own agent render *trustworthy,
review-before-commit* surfaces through the protocol, not just generic form fields. This
is exactly the same posture Smart Field and Diff Accept already have (nothing commits
without explicit accept) — A2UI needs that posture in its rendered components and the
Basic Catalog doesn't have it. **Not scheduled yet** — this is a post-MVP,
Application-tier-adjacent initiative (a catalog + a stream-consuming renderer, not a
single component), noted here so the shape of future AI-tier components (clean,
declarative, JSON-serializable props) keeps this path open rather than closing it by
accident.

**Forward bet — components an agent needs for its own interface, not just to assist a
human's (2026-09-05):** everything shipped so far (Smart Field, Diff Accept, Selection
Actions) answers "how does AI assist a human inside *their* product UI." A different,
related question: once PixelDosa builds its own agent (see below), what does *the
agent* need to render as *its own* interactive surface — the same question A2UI/MCP
Apps ask at the protocol level, now asked at the component level. Good news: most of
the answer is already scoped, just under the wrong mental frame — B2/B3 below (Task
Plan Runner, Live Tool-Call Console, Chain-of-Thought Timeline, Trace Waterfall, Agent
Health Grid, Error Replay Card, Bulk Prompt Table) *are* the agent-interface set, not a
separate "observability" afterthought. Re-read them that way when their turn comes.

Two gaps found by checking against the best available real-world prior art —
Claude Code's own interface, which this whole project is being built inside, live,
right now:

- **Live Status Line** — a single, low-weight, constantly-replacing line ("Reading
  file…", "Searching…") for an agent's current micro-action, distinct from the
  heavier `Chain-of-Thought Timeline` (a full reasoning history). Nearly every
  serious agent product (Claude Code, Cursor, ChatGPT's "Thinking…") has exactly this
  atom and it isn't on the list yet.
- **Change Summary List** — `Diff Accept` at the scale of one text region; an agent
  that touches many files/records in one turn needs a collapsed, scannable list (one
  line per change, a `+12/-3`-style diff-stat, expand-on-demand into the full `Diff
  Accept` view) rather than N full diff panels shown at once.

Both added to B2/B3 below. **Not scheduled ahead of their tier** — recorded now so the
list is right when the tier's turn comes, not built out of order for its own sake.

**The actual plan, stated plainly:** finish the AI-tier component set, then build a
real **PixelDosa Agent** — a working agent product whose entire interactive surface is
rendered from PixelDosa's own components. This is the dogfooding that proves the
generative-UI/catalog thesis for real rather than as a roadmap note, and it's a
stronger flagship story than any single component: "an agent you can actually use,
built entirely from the design system," is the whole pitch in one sentence. Sequencing
is intentional — an agent built before the component vocabulary exists would either
reinvent pieces ahead of schedule or ship on placeholder UI; building it after gives it
a real catalog to stand on.

**Forward bet — Widgets as a third category, not just React (2026-09-05):** surfaced
by a genuinely useful test — Claude itself composes interactive Artifacts constantly (a
single self-contained HTML file: no build step, no `npm install`, inline CSS/JS,
external `<script>`s only from a small CDN allowlist) and today has nothing from
PixelDosa to reach for, because the registry is React/TSX meant for `shadcn add` into a
project with a real bundler. An MCP Apps widget (see the MCP Apps note this session)
has the *identical* constraint: bundled HTML/JS shipped as one resource, no build
pipeline at render time. Same shape, three different names depending on who's talking
about it — Claude calls it an **Artifact**, MCP Apps/OpenAI's Apps SDK call it a
**widget**, this roadmap calls the category **Widgets** (the more neutral, host-agnostic
term) so it isn't confused with any one lab's branding.

**What a Widget actually is — a packaging format, not a new design tier.** A Widget is
not a differently-designed component; it is the *same* Smart Field, the *same* Diff
Accept — same tokens, same state machine, same accessibility contract — compiled down
to a standalone HTML/CSS + vanilla-JS (or small IIFE) bundle instead of React/TSX
source. That is why it does **not** sit at "Level 3" above Blocks: Blocks are built
*from* Components inside the same React codebase (a real dependency order); a Widget is
a different *output* of a component that already exists, produced by a build/export
step, not a new pass through SKILL.md's research → plan → build cycle. Concretely: a
"Diff Accept Widget" is Diff Accept's own logic and markup, re-targeted at a
build-step-free host — not a new component plan.

**Who needs it:** Claude building Artifacts, any MCP Apps widget author, and the
PixelDosa Agent itself if its interface ever needs to render somewhere outside a full
React app — three consumers from one investment. **Not scheduled** — same post-MVP tier
as the A2UI catalog bet — but cheap to spot-check earlier: the next Artifact built in
this project should deliberately try to build against PixelDosa's real tokens instead of
inventing colours from scratch, which tells us immediately whether the token layer
already clears this bar even before a real export step exists.

**Flagship build order** (matches `plans/pixeldosa-shipping-plan.md` §3, sequenced for
the "AI first, then application, then marketing, then blocks" direction):

1. **Foundation stabilization** — Button, Card, Field, Overlay, Ghost Input, Pixeldosa
   Theme audited against the definition of done. Not a new-component phase; nothing
   above it is safe to build on until this is real.
2. **Command Menu** — pilot, already in progress (`plans/command-menu-plan.md`,
   status: draft awaiting review, two open decisions: `cmdk` dependency, and whether
   keybind rendering needs a separate primitive). This is foundation work, not the
   application tier proper — it exists to validate `overlay` under real use, because
   AI Approval Gate and other AI-tier components compose `overlay` and need it
   trustworthy first.
3. **AI tier** (the priority, per your direction) — Ghost Input hardening, Smart
   Field (shipped), Diff Accept (reordered ahead of Selection Actions — see North
   Star flagship order for the demand-check reasoning), Selection Actions,
   Progressive Reveal, Confidence Meter, AI Context/Provenance Surface, AI Action
   Toolbar, then Bulk Prompt Table and AI Approval Gate. Full list and phased
   detail: `plans/pixeldosa-component-catalog.md`
   Queue B.
4. **Application tier** — Data Table, Split View/Resizable Panes, Empty State,
   Document Preview, File Upload/Attachment, Filter Builder, Navigation Shell. Kept in
   full per the niche lock-in above: an AI startup's product still needs these to hold
   its AI-tier components together — this is supporting infrastructure for Blocks, not
   general-purpose padding.
5. **Marketing tier — cut entirely**, not deprioritized. Niche lock-in (2026-09-05):
   the audience is AI startups, not general/agency work, so a commodity marketing card
   catalog serves no one this system is now built for. `Product Demo Carousel` also
   cut with the rest — if a demo surface is ever needed, it composes existing
   Application-tier components rather than reviving a dedicated marketing block.
6. **Blocks**, built only from shipped components — AI-Assisted Form and Document
   Review Workspace first, per `pixeldosa-mvp-plan.md`.

Motion Blocks (Cursor Spotlight, Scroll Story) and the remaining Product-tier inventory
below stay in scope long-term but are explicitly post-MVP — `plans/` calls for pausing
feature expansion after the first feedback release, not building the whole catalog in
one pass. Marketing and Business tiers (components and blocks) are removed from the
inventory below, not paused — see niche lock-in.

## How we're building this

Quality over quantity. Every item — component or block — goes through the full
Planning phase in `.agents/skills/pixeldosa-components/SKILL.md` before any code is
written: research (pattern + visual), product context, UX architecture, visual
direction, motion plan, public API, registry plan, and a Pixeldosa Score. One item at
a time. The plan gets reviewed before building; the built result gets reviewed against
the plan before it ships.

## Taxonomy: surface × pillar

Every component and block gets tagged on two independent axes (see `SKILL.md` for the
full rules):

- **Pillar** — `core` | `ai` | `motion` — the engineering discipline that governs how
  it's built.
- **Surface** — `application` | `marketing` — where it's deployed and what job it does
  there (operate a task vs. persuade/convert).

This replaces the flat five-bucket split below as the actual mental model. **Update,
2026-09-05 niche lock-in:** Marketing and Business Components/Blocks named below were
cut from the live inventory (see North Star) — kept in this section only as historical
record of how the taxonomy model was derived, not as live buckets. The surviving
buckets (Product, AI, Motion) resolve onto the two real axes like this:

- **Product Components (16)** → surface `application`, pillar `core`.
- **AI Components (22)** → pillar `ai`, surface `application` — meant to run inside a
  real product, not a chat surface or a marketing demo.
- **AI Blocks (12)** → pillar `ai`, surface `application` — real, functional
  experiences (Tool Execution, Agent Team).
- **Product Blocks (10)** → surface `application`, pillar `core`.
- **Motion Blocks (6)** → pillar `motion`, surface `application` (Product Tour is the
  clear fit; the rest apply to onboarding/in-product moments now that there's no
  marketing surface to attract into).

Removed for reference (no longer live): Marketing Components (10, surface
`marketing`), Business Components (15, surface `application`/`core`, scoped to CRM/
invoicing/booking — "business" was a `categories` tag, never a structural bucket),
Marketing Blocks (12, surface `marketing`), Business Blocks (10).

Every component is built to be composed into a Block, and every Block into a future
Template — see the "component is not an island" note in `SKILL.md`. If a component
can't name a Block it plugs into, sanity-check it against this roadmap before building.

## Visual language

Design tokens (`packages/tokens/src/design-tokens.ts`) were rebuilt away from the
original warm-stone/copper identity toward a cooler, more neutral system:

- **Dark mode** (default theme) — references Linear and Framer: near-black,
  low-chroma neutrals, high-contrast near-white text, depth via `1px` borders
  rather than heavy shadows. No brand hue — `primary` is foreground-on-background
  inverted, not a colored accent.
- **Light mode** — references shadcn's own default neutral scale and Componentry:
  crisp near-white/near-black, true 0-chroma grays throughout. Same monochrome
  `primary` treatment as dark mode, just inverted.
- **Not yet built, captured for later**: Aceternity and Cult UI's decorative
  background language — grid/dot patterns, sketch-like line textures, spotlight/aurora
  effects — is the reference point for a future `motion`-pillar, `marketing`-surface
  background primitive (candidate name: a "Pattern Background" or similar, not yet
  scoped as a roadmap item). Noted here so it isn't lost before that component gets
  planned.

## Suggested build order (dependency-aware)

Blocks compose Components. Building all 60 components before touching a single Block
would mean months with nothing visible to react to — so instead we build primitives
**just-in-time**: whatever a Block needs, we build (properly) when we get to that
Block, rather than front-loading the entire component tier. This section is the
dependency-aware detail underneath the "Flagship build order" in the North Star
section above — read that one for the *why*, this one for the *what's next literally*.

1. **Foundation stabilization**, then **pilot: Command Menu** (Level 1, Product) —
   self-contained, reuses the existing `overlay` primitive so it validates the
   foundation before AI Approval Gate and other overlay-composing AI components
   depend on it. `plans/command-menu-plan.md` has the full research and plan; two
   open decisions block implementation (`cmdk` dependency, separate keybind-render
   primitive or not).
2. **AI tier** — Smart Field (shipped), **Diff Accept next** (reordered ahead of
   Selection Actions 2026-09-04 after a demand check: Diff Accept — inline
   proposed-change review with accept/reject — is the pattern developers actively
   complain about when missing from AI coding tools right now, driven by the
   Cursor/Copilot wave; Selection Actions is real but increasingly commoditized,
   now built into Windows Notepad at the OS level. Diff Accept also directly
   extends Smart Field's proposal model, already fresh from B0), then Selection
   Actions, Progressive Reveal, Confidence Meter, AI Context/Provenance Surface, AI
   Action Toolbar, Bulk Prompt Table, AI Approval Gate. This is the actual
   differentiation wedge —
   AI embedded in ordinary product UI, not chat primitives — see North Star's
   Reconciliation table for what was considered and ruled out (Streaming Response,
   Tool Call, Citation Card, etc. all have better-version equivalents in this list
   already, or are explicitly parked/integrated instead of built).
3. **Application tier** — Data Table, Split View/Resizable Panes, Empty State,
   Document Preview, File Upload/Attachment, then Kanban Card / drag-and-drop
   primitives — the components where interaction depth is the entire value
   proposition.
4. **Marketing tier — cut entirely** (niche lock-in, 2026-09-05): audience is AI
   startups only, so the commodity marketing set (Hero Badge, testimonials, logo
   clouds, Product Demo Carousel included) is removed from the roadmap, not skipped
   temporarily.
5. **Blocks** — AI-Assisted Form and Document Review Workspace first, built only from
   components that have already shipped.
6. Motion Blocks (Cursor Spotlight, Scroll Story) and the remaining Product-tier
   inventory continue **only** when a flagship Block specifically needs them,
   post-MVP — not on a fixed schedule.

This order will flex as we go — a plan review may surface that a block needs an atom
we hadn't scoped yet, and that's fine; the point is no block gets built on primitives
that don't exist.

## Status legend

`[ ]` not started · `[~]` in research/plan · `[b]` building · `[x]` shipped

---

## Level 1 — Components (40)

Marketing Components (10) and Business Components (15) removed entirely per the
2026-09-05 niche lock-in (AI startups only) — see North Star. Not paused, cut.

### Product Components (16)
- [x] Command Menu — **pilot, shipped**: grouped results, fuzzy filter, live
  result-count announcer, keybind hints, keyboard nav, full-width mobile sheet.
  Ships with a CSS-transition entrance/exit instead of composing the shared
  `overlay` primitive — see the component's `engineeringNotes` for the confirmed
  upstream Motion/AnimatePresence bug that made that necessary.
- [ ] Search Input
- [ ] Sidebar
- [ ] Navbar
- [ ] Data Table
- [ ] Activity Item
- [ ] Notification Item
- [ ] Analytics Card
- [ ] Settings Section
- [ ] Upload Zone
- [ ] Multi-step Form
- [ ] Calendar
- [ ] Kanban Card
- [ ] Empty State
- [ ] Skeleton Loader
- [ ] Split View / Resizable Panes — **new, research pass 2026-09-04**: generalized
  primitive out of the resize-handle pattern (drag, pointer-capture, min/max clamp);
  Data Workspace and Command Workspace both need it.

### AI Components (24) ⭐

Finalized against `plans/pixeldosa-component-catalog.md` Queue B — the "AI embedded in
ordinary product UI" thesis, checked for real usage possibility against what Vercel AI
Elements and Cult UI already ship (see Reconciliation table above). Ghost Input is
excluded here because it already exists as a shipped foundation component, not a
build target.

**B0 — differentiating foundation**
- [x] Smart Field — **shipped**: propose → review (tiered confidence + provenance) →
  accept/reject → one-step undo, staleness-safe like Ghost Input. Plan:
  `plans/smart-field-plan.md`.
- [x] Selection Actions — **shipped**: floating selection-triggered toolbar
  (Explain/Rewrite/Translate/Classify/Extract); Rewrite's result composes `Diff
  Accept` directly for accept/reject review rather than reinventing it. Plan:
  `plans/selection-actions-plan.md`.

**B1 — trust and structured editing**
- [x] Progressive Reveal — **shipped**: per-item fade-in enforced by React's own
  keyed reconciliation (never replays), stack/grid layouts, streaming indicator.
  Plan: `plans/progressive-reveal-plan.md`.
- [x] Diff Accept — **shipped**: word-level diff (via `diff`/jsdiff) grouped into
  per-hunk accept/reject, Accept all/Reject all, conflict guard when the base text
  has drifted, one-step undo. Reordered ahead of Selection Actions after a demand
  check (see North Star). Plan: `plans/diff-accept-plan.md`.
- [x] Confidence Meter — **shipped**: tiered (low/medium/high) indicator + optional
  provenance caption. Extracted from duplicated logic in Smart Field and Selection
  Actions, both refactored to compose it. Plan: `plans/confidence-meter-plan.md`.
- [x] AI Context / Provenance Surface — **shipped**: collapsed-by-default "Why this?"
  disclosure over explanation, sources (link and/or snippet), and model metadata — the
  better-version answer to Citation Card, Source Viewer, and Thinking Indicator, all
  folded in here, since none of those make sense without a chat thread and this does.
  Renders `null` when given no content rather than offering an empty panel. Plan:
  `plans/ai-context-surface-plan.md`.
- [x] AI Action Toolbar — **shipped**: the shared control strip for an AI result —
  apply/explain/retry/regenerate/undo/report — with three levels of visual weight
  (filled primary → bordered secondary → quiet underline) so the recommended action
  stays dominant and Regenerate never out-shouts Apply. An extraction: seven call sites
  across Smart Field, Diff Accept and Selection Actions had each hand-rolled the same
  three button treatments, the same spinner SVG, and the same "applied → Undo" row.
  Implements the real ARIA toolbar pattern (roving tabindex, arrow/Home/End, disabled
  actions skipped) rather than the natural-tab-order approximation.
  Plan: `plans/ai-action-toolbar-plan.md`.
- [ ] **Refactor the three existing consumers onto AI Action Toolbar** — replace the
  hand-rolled button markup in `smart-field.tsx`, `diff-accept.tsx` and
  `selection-actions.tsx` with the shipped component and delete the local copies.
  Deliberately not bundled into the toolbar's own change: unlike Confidence Meter's
  refactor (a pure presentational substitution), each of these is entangled with its
  component's status state machine and needs its own QA pass.

**B1.5 — agent expression ⭐ the signature layer (added 2026-09-08)**

- [x] Generation Placeholder — **shipped 2026-09-09**: the first rendering of the
  quantization signature, and the first component of the **multimodal output family**.
  Reserves an artifact's exact bounds while image/video/audio generates, encodes real
  progress as a resolving dot field (each cell holds a stable threshold and resolves
  once progress passes it — ordered-dither logic, not decoration), then cross-fades into
  the artifact. Adds three states the text/tool-shaped vocabulary couldn't express:
  progress that is genuinely *measured* (diffusion steps, encoded frames — so a
  percentage is honest here where it is dishonest for confidence), refinement *in place*
  rather than appending, and a `processing` post-phase that is neither generating nor
  done. Because progress is encoded spatially, the reduced-motion state carries the
  identical information with every animation removed. Plan:
  `plans/generation-placeholder-plan.md`.
- [ ] **Multimodal family, remaining** — Generation Placeholder covers the *waiting*.
  Still open: a player/result surface for generated audio and video (scrubbing,
  waveform, poster frame), and a variation-grid for "generate 4 options" where each cell
  is its own job. Scope when a real consumer needs them, not before.

The bet that this system's identity is **behavioural, not decorative**. Full spec,
protocol research and state vocabulary: `plans/agent-expression-system-plan.md`.

The grammar, now also a standing rule in `DESIGN.md` §3a: **motion means the machine is
busy, stillness means it's your turn.** Machine states (`queued`, `thinking`,
`deciding`, `working`, `streaming`, `done`, `failed`, `cancelled`) move; hand-off
states (`suggesting`, `asking`, `awaitingApproval`) hold perfectly still. Every state
answers three questions without text: whose turn is it, can I stop it, is it safe to
look away.

The vocabulary is grounded in real protocol events, not invented — AG-UI's 16 events,
OpenAI Responses (including the under-used `queued` and `incomplete`), AI SDK v6
reasoning/tool parts, LangGraph's `interrupt()` and its approve/edit/reject/respond
decisions, and MCP elicitation (which *mandates* showing who is asking plus a decline).
**Core stays zero-AI-dependency**; neutrality ships as a documented mapping table, with
adapters only on demand as separate registry items. The state vocabulary is the
product, not an SDK binding — that makes PixelDosa the UI layer for any agent stack
rather than a second AI Elements.

- [x] Agent Presence — **shipped 2026-09-09. Flagship.** The turn-taking grammar made
  real: eleven protocol-grounded states across three forms, where machine states animate
  and hand-off states stop dead. Rotation speed *is* the state — 24s queued, 12s
  thinking, 4s working — so one object communicates urgency through tempo and states
  morph rather than cut. The orb is a true Fibonacci sphere in CSS 3D (`preserve-3d`,
  perspective supplying depth scaling), not the flat ring most AI orbs use, and no
  JavaScript runs per frame in any form. Verified: `thinking` spins at 12s, `working` at
  4s, `awaitingApproval` at `animation: none`. Ships with a mapping table from AG-UI,
  OpenAI Responses, AI SDK, LangGraph and MCP — zero AI dependencies.
  Plan: `plans/agent-expression-system-plan.md`.
- [x] Reasoning Stream — **shipped 2026-09-12.** The *content* half of thinking, where
  `Agent Presence` is the *indicator* half. A two-line ticker while streaming, folding
  to a measured "Thought for 12s" once the answer exists — the fold-away is the thesis,
  since reasoning is scaffolding and a panel left expanded makes every answer look like
  it needs justifying. **First implementation of the scroll-anchoring requirement**
  added from the 2026-09-12 scan: verified that a reader who scrolls up keeps their
  position while new content arrives, and gets a "Jump to latest" affordance instead of
  being yanked back. Maps to OpenAI reasoning-summary deltas and the AI SDK `reasoning`
  part, zero AI dependencies. Policy unchanged: summaries where the provider exposes
  them, never raw private chain-of-thought as fact.
  Plan: `plans/reasoning-stream-plan.md`.
- [ ] Retrofit scroll anchoring onto `Progressive Reveal` — the behaviour is now proven
  in `Reasoning Stream`; Progressive Reveal still auto-follows unconditionally.
- [x] Inline Citations — **shipped 2026-09-14.** `CitedText` + `Cite`. Built for the
  "users rarely verify" constraint: the supporting passage is shown in the popover beside
  the claim (zero navigation to compare), "Open at this passage" deep-links with a URL
  text fragment, support is a tier (quoted / paraphrased, never a score), and a `Cite`
  with no source gets a dashed "?" so uncited claims can't borrow credibility. Numbering
  from `sources` order (SSR-stable); popover in DOM order after its marker (Tab reaches
  the link) but shown in the top layer via the Popover API; hover with open delay and
  close grace, focus-visible, tap, outside-click, Escape returns focus; always-visible
  reference list as the no-hover fallback. Verified positioning clamps at 380px, the
  highlight clears after double open/close, text-fragment URLs encode `-` and `%`.
  Originally: **added 2026-09-12 from the competitive scan.** Claim-level
  provenance: a superscript marker inside a sentence that resolves to its source on
  hover/focus, with the cited span highlighted. Distinct from `AI Context Surface`,
  which is answer-level ("why this?" for a whole value) — a reader checking one
  sentence should not have to open a panel about the entire response. The same
  fold-away error as Thinking Indicator, caught the same way. Must be keyboard
  reachable and must degrade to a plain numbered reference list without hover.
- [x] Prompt Composer — **shipped 2026-09-14.** Text + structured `controls` as
  labelled pills (native select overlaid transparently so the pill sizes to the chosen
  value, not the longest option; changed-from-default pills outlined) + attachments
  (button, drop, paste; caller-owned upload status; send blocked with a visible,
  announced reason while uploading). Enter sends except during IME composition,
  autosize to 240px, count only in the last 10%, Send → Stop while busy, suggestions
  fill but never send. Verified IME guard, blocked-send reason, autosize shrink, pill
  widths and no overflow at 390px. Originally: **added 2026-09-12 from the competitive scan.** The system
  argues "don't make every AI feature a blank chat box" and then ships no alternative.
  A composer that pairs free text with *structured* controls (tone, length, audience,
  format) plus attachment context, so the interface carries the specification instead
  of making users learn prompt engineering. Explicitly not a chat input: no thread, no
  message history, no send-and-scroll.
- [x] Agent Ask — **shipped 2026-09-12.** The gap nothing surveyed covers: an agent
  needs structured input before it can continue. MCP-elicitation shaped — `source` is a
  *required* prop because the spec obliges a client to show which server is asking, and
  refusal is modelled as two distinct outcomes (decline this question vs cancel the
  operation) rather than one dismissal. Biases toward concrete options over free text:
  `select` renders labelled cards with hints, `confirm` renders explicit Yes/No rather
  than a checkbox, since an unchecked box can't distinguish "no" from "unanswered" —
  verified that answering *No* correctly satisfies a required field. Holds perfectly
  still, per the turn-taking grammar. Plan: covered by
  `plans/agent-expression-system-plan.md`.
- [x] Live Status Line — **shipped 2026-09-12.** One line for the agent's current
  micro-action, **replaced** rather than accumulated — which is the whole distinction
  from Reasoning Stream (scrollable trace) and Chain-of-Thought Timeline (whole-turn
  history), and what makes it cheap enough to live permanently in product chrome. The
  first component to genuinely compose `Agent Presence` rather than reimplement an
  indicator, so the turn-taking grammar holds here for free. Layout can't jitter:
  minimum row height, and the detail truncates before the verb. Deliberately breaks the
  system's caller-owns-async-state convention for the elapsed counter, which ticks
  internally rather than forcing a re-render per second for a display detail.
  **QA caught a real bug:** the composed indicator was announcing its own generic state
  name ("Choosing an action") through `aria-live` while the visible text said something
  else ("Comparing billing contacts") — two channels disagreeing. Fixed by handing the
  status down as the label; verified announced and visible text now match exactly.
- [x] AI Approval Gate — **shipped 2026-09-12.** The `awaitingApproval` state made
  real, and the payoff for everything already shipped: composes Confidence Meter,
  AI Context Surface and AI Action Toolbar rather than re-deriving any of them, so the
  decision strip inherits the real ARIA toolbar pattern (roving tabindex verified) for
  free. Two content decisions carry the value: `reversible` is a **required** prop
  rendered as a plain sentence, because whether something can be undone is the most
  decision-relevant fact on the surface and almost nothing surfaces it; and the
  `impact` list gives the blast radius as countable facts, since an approval without a
  scope is a yes/no question with the information removed. A `high` risk action renders
  Approve with the **destructive** treatment, never the primary one.
  **Surfaced a genuine gap in AI Action Toolbar** — it had no `destructive` intent,
  because nothing had needed one until an approval could be dangerous. Added there
  rather than special-cased here, since the rule is system-wide.
- [ ] Retrofit `stale` onto Diff Accept and `uncertain` onto Confidence Meter — both
  states already exist as local behaviour (Diff Accept's conflict guard is `stale`,
  invented here before anyone else had it); this promotes them to system-wide states.

**B1.6 — trust calibration ⭐ research-backed (added 2026-09-13)**

Synthesised from UX research (NN/g State of UX 2026, practitioner write-ups on AI UX
failure, agent UX studies) and from the model-side view of how agentic work actually
fails. The finding that reshapes priorities: **the gap is not "more trust", it is trust
that matches reliability.** Two opposite failures are both real — *over-trust* (users
rarely verify citations, despite saying citations raise their confidence) and
*under-trust* (the **audit burden**: AI produces work faster than people can review it,
so users stop doing less work and start supervising the machine). Every component in
B0–B1.5 enables review; almost none reduces how much review is needed. That is an honest
tension with this system's own "nothing commits silently" thesis, and this tier answers
it.

The agentic contract the tier completes: **Intent → Plan → Evidence → Action → Result →
Correction.** Action and Result are well covered. Intent, Plan and Correction are where
trust breaks, and where nothing here existed.

- [x] **AI Triage Table** — **shipped 2026-09-13.** The first component whose job is to
  *reduce* checking rather than enable it. Orders by attention — low confidence opens
  first, high confidence collapses to a count — and collapses what the AI left unchanged
  into one line ("40 checked and left unchanged"). Decisions are staged with per-row
  Undo; nothing is written until Apply, which states the count and that unreviewed items
  stay as they are. **Does not become Accept-all:** bulk accept exists only for the
  high-confidence group and only after it has been opened, with the reason stated in
  text. Verified: high group starts inert with "Open to review before accepting"; opening
  it reveals "Accept 4"; no bulk accept ever appears on low or medium; Undo and Apply
  commit exactly the staged count. **Surfaced a latent accessibility bug** in AI Context
  Surface and Reasoning Stream — collapsed `0fr` panels left their links and buttons
  tabbable while hidden — fixed with `inert` in both.
- [x] **Intent Preview** — **shipped 2026-09-13.** The agent restates the request in one
  sentence plus the guesses it made, pre-filled, before work starts — one click when
  right, an in-place correction (native select) when not. The start button becomes
  "Start with changes" only when something was corrected. Includes boundaries ("I
  won't…"). Distinct from Agent Ask: Ask blocks on information the agent can't guess;
  this is for when it could proceed but a wrong guess would be expensive. Verified a
  correction flows through to `onStart` alongside untouched guesses.
- [x] **Agent Plan** — **shipped 2026-09-13.** The plan as an agreement before it runs:
  reorder with explicit up/down (works identically by keyboard, touch, pointer), remove
  reversibly (struck through in place with Undo, never deleted), add steps ("Added by
  you"). Steps with external effects are labelled and counted so pauses are known up
  front. Verified: moves announce the visible position skipping removed steps, and
  `onRun` receives the edited order without removed steps. Execution stays with Task
  Plan Runner (B2).
- [x] **Agent Steer** — **shipped 2026-09-13.** Redirect a running agent without stopping
  it ("not that file — this one"). Status is caller-owned and comes from the agent —
  pending ("waiting for the agent", the only shimmer) → queued → applied, or declined
  with a reason — so a redirect never looks applied on Enter. Enter applies at the next
  step boundary; "Interrupt now" is a separate control because abandoning a tool call
  mid-flight can leave partial side effects. Unapplied redirects are withdrawable;
  suggestions fill the input, never send. Verified: withdraw-while-pending is never
  acted on, interrupt applies immediately, live region matches visible text, no overflow
  at 400px.
- [x] **Tool Call Card** — **shipped 2026-09-14.** What the agent *did* (read, searched,
  fetched, wrote, ran, called) versus what it asserted. A sentence summary (verb + exact
  target in mono), evidence (input/result, height-capped) one click away, and `effect`
  defaulted from kind so the few calls that changed something are labelled among the
  many that only looked. `ToolCallGroup` folds a run into one line ("Searched once, read
  2 files, wrote 1 file · 1 call made changes · 1 failed"), counting only finished calls,
  and swaps in the running call while one is in flight. Verified: running verb shimmers
  and target doesn't, collapsed panels inert, no overflow at 400px.
- **Idea parked (2026-09-14):** a "Using PixelDosa with your own tokens" recipe (e.g.
  Escala Tokens `variables.css` → shadcn vars) and an a11y/contrast checklist in the agent
  guide — see competitive scan note on Escala Tokens (neighbour layer, not a competitor).
- [x] **Autonomy & Memory Controls** — **shipped 2026-09-14** as two components.
  **Autonomy Control:** three levels (Ask me first / Ask when it matters / Act, then tell
  me) explained through the agent's real actions, each row "Asks first" or "Does it,
  tells you". Risk is a floor users can raise ("Always ask" per action) but never lower —
  high risk asks at every level, not configurable. Live "Does N of M without asking"
  count. **Agent Memory:** stated vs inferred memories in separate lists (inferred framed
  as guesses worth checking, with source); inline edit (an edited guess becomes stated);
  forget is immediate with in-place Undo and focus handoff; pause switch says it doesn't
  erase; Forget all needs a confirm with focus on Cancel. Verified policy table at all
  levels, focus return after forget/undo/edit, no overflow at 420px.
- **Design constraint on Inline Citations (B1.5):** users rarely verify sources, so
  treat citations as a comfort signal unless verification takes one click — design for
  the check actually happening.

**Stance reversal — own chat primitives (2026-09-13).** The earlier "deliberately
skipped, Vercel owns it" position is withdrawn. A startup wants one coherent system, not
Vercel for chat and something else for everything else. PixelDosa ships its own **Chat,
Message and Prompt Composer**, differentiated by carrying the trust layer and by taking
no SDK dependency — not by avoiding the category.

**Foundation priority — a startup must be able to build a whole product.** PixelDosa is
strong at the AI tier and thin underneath it. Promoted ahead of B2: **Data Table, Tabs,
Empty State, Skeleton**, plus the chat primitives above.

**Agent-readiness — shipped 2026-09-13.** AI coding agents are a primary audience: most
teams meet PixelDosa through one. Discovery already worked (the shadcn MCP server and CLI
search rank items correctly from descriptions written for cold LLM comprehension); using
the components *well* did not. Shipped: `pixeldosa-agent-guide` (a `registry:file`
installing a Claude Code skill with the component-selection table and UX rules),
generated `/llms.txt`, `/llms-full.txt` and `/llms/<name>.md`, and a Build with AI docs
page. All generated from the registry and the guide, so they cannot drift, and none adds
an SDK or protocol dependency.

**B2 — operational AI**
- [ ] Bulk Prompt Table — one instruction across rows, per-row status/retry/cancel
- → *AI Approval Gate — **moved to B1.5**, where it serves as the `awaitingApproval`
  state's real-world proof rather than a standalone approval widget.*
- [ ] Risk-Aware Approval Card — richer approval pattern, built once Approval Gate
  proves the contract
- [ ] Inline Edit Before Approve — schema-aware structured editing pre-approval
- [ ] Task Plan Runner — nested tasks with real execution states
- [ ] Live Tool-Call Console — streamed args/results, retry (the better-version answer
  to a generic Tool Call component — branded ops console, not a chat bubble)
- [ ] Chain-of-Thought Timeline — reasoning summaries only where product policy
  permits it; status events, never raw private chain-of-thought
- → *Live Status Line — **shipped 2026-09-12**, see B1.5.*
- [ ] Change Summary List — **new, 2026-09-05, agent-interface gap**: Diff Accept at
  the scale of a whole agent turn — a collapsed, one-line-per-change list with a
  `+N/-N` diff-stat, expanding on demand into the full Diff Accept view, for when an
  agent touches many files/records at once rather than one text region.

**B3 — observability and knowledge**
- [ ] Trace Waterfall — nested LLM/tool/sub-agent spans
- [ ] Live Cost / Token Meter — real-time budget-threshold states
- [ ] Agent Health Grid — multi-agent status aggregation (accessible, not colour-only)
- [ ] Error Replay Card — failure snapshot + safe replay
- [ ] Knowledge Graph Explorer — only once a real knowledge workflow exists
- [ ] Retrieval Relevance Inspector — ranked retrieved chunks + relevance explanation
- [ ] Freshness Badge — stale/verified metadata as real data, not decoration

**Dual-purpose, kept from this session's research pass**
- [ ] Inline/Slash Command — embedded palette (Notion `/`-trigger), distinct from the
  modal Command Menu; real usage inside Selection Actions and Ghost Input (trigger an
  AI action inline in a field), not a generic block-editor menu

**Parked or folded — not separate build targets** (kept here only so the reasoning
isn't lost): Branch Picker and Artifact Viewer parked — both need a chat/conversation
or artifact surface, and full chat primitives are explicitly out of MVP scope. Prompt
History folded into the same "no chat surface" parking, for the same reason. Prompt
Composer, AI Prompt Suggestions, Streaming Response, Markdown Renderer, Code Block —
integrate an existing solution (e.g. Vercel AI Elements) rather than build; no
differentiation angle, per `pixeldosa-component-catalog.md`'s explicit "do not
duplicate" list. Agent Card/Agent Status/Agent Timeline folded into Agent Health Grid
and the general (non-AI) Status/Progress vocabulary. Memory Card, Context Viewer, AI
Suggestion Card folded into AI Context/Provenance Surface and Smart Field
respectively — same job, no need for a second entry.

---

## Level 2 — Blocks (28) ⭐⭐⭐⭐⭐ — this is Pixeldosa

Marketing Blocks (12) and Business Blocks (10) removed entirely per the 2026-09-05
niche lock-in (AI startups only) — see North Star. Not paused, cut.

### AI Blocks (12)

- [x] Thinking Experience — **shipped 2026-09-12. The first Block in the system.**
  A complete agent run, orchestrated: one `state` decides which surface belongs on
  screen, from status and reasoning through a pending question or approval to the
  result and its action strip. Every visible element comes from an already-shipped
  component — what the Block contributes is the orchestration a consumer would
  otherwise re-derive: which surface appears when, that reasoning stops streaming the
  moment control passes to a human, that the elapsed counter freezes on terminal
  states, and what happens to the machine's own surfaces while a person is being asked
  something. **The turn-taking grammar scaled from a component to a layout:** at panel
  level it becomes relative emphasis — the agent's status and reasoning drop to 55%
  opacity while the interrupt takes a ring. Dimmed but deliberately never disabled
  (verified `pointer-events: auto`), because a run must stay stoppable even while it
  waits on you. Emphasis by ring rather than motion, since stillness is the signal on
  the user's turn. Composes Live Status Line, Reasoning Stream, Agent Ask, AI Approval
  Gate and AI Action Toolbar, transitively pulling Agent Presence, Confidence Meter and
  AI Context Surface. Shipped as the registry's first `registry:block`; the docs site
  gained a Blocks tier that leads the navigation.
- [ ] AI Chat Experience
- [ ] Artifact Generation
- [ ] Prompt → Result
- [ ] Tool Execution
- [ ] Agent Team
- [ ] AI Workflow
- [ ] Knowledge Search
- [ ] AI Playground
- [x] AI Form Fill — **shipped 2026-09-12.** Second Block. An agent filling a form the
  user is already looking at: one request proposes values for every field, but review
  stays per-field, each with its own confidence tier, provenance, accept/reject and undo.
  **Deliberately has no "Accept all"** — per-field review is the entire point of Smart
  Field, and one click taking twelve values across three confidence tiers would quietly
  undo it. Verified: one fill → 3 proposals at High/Medium/Low confidence with 3
  different sources, and every field value unchanged until explicitly accepted.
  Required a small consumer-driven addition to Smart Field — a `proposeToken` prop so a
  parent can make many fields propose together without any field surrendering ownership
  of its proposal state, undo window or in-flight request. The token ignores its first
  render, so mounting is never a request. Composes Smart Field, Field, AI Action Toolbar
  and Live Status Line.
- [ ] AI Research Flow
- [ ] AI Automation Flow

### Product Blocks (10)
- [ ] Dashboard Shell
- [ ] Analytics Dashboard
- [ ] Settings Page
- [ ] Profile Workspace
- [ ] Notification Center
- [ ] Search Experience
- [ ] Data Workspace
- [ ] Command Workspace
- [ ] Activity Feed
- [ ] Project Workspace

### Motion Blocks (6)
- [ ] Scroll Story
- [ ] Product Tour
- [ ] Workflow Animation
- [ ] Sticky Story Section
- [ ] Cursor Spotlight
- [ ] Reveal Sections

---

## Original phase priority (as given, for reference)

**Phase 1 — Marketing:** AI Hero, Bento Grid, Feature Showcase, Product Demo, Pricing Section

**Phase 2 — AI:** Prompt Composer, Streaming Response, Artifact Viewer, Thinking Experience, Tool Execution, Agent Card, Agent Timeline, Knowledge Search, AI Playground, AI Workflow

**Phase 3 — Product:** Dashboard Shell, Command Menu, Data Table, Activity Feed, Settings Layout

**Phase 4 — Business:** Proposal Builder, CRM Pipeline, Booking Flow, Customer Journey, Project Timeline

Note: Command Menu was pulled forward from Phase 3 to be the pilot — see "Suggested
build order" above for why.
