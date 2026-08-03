# PixelDosa Vault — research findings and build list

Researched July 2026. Purpose: decide what is actually worth building, given what the
ecosystem already gives away for free. This is a vault for personal reuse, not a
competitor — so the only test that matters is *"would I reach for this again?"*

## Positioning

> **A design engineering toolkit for building modern AI-native products.**

This is the load-bearing sentence — every later decision in this doc traces back to it.
Read literally:

- **"design engineering"** — components ship with the reasoning attached
  (`meta.engineeringNotes` / `meta.motionNotes`), not just markup. This is the part that
  makes the vault useful to future-me, who won't remember why a decision was made.
- **"toolkit"**, not "component library" — the unit of value is whatever gets a real
  product screen built faster: a component, a block, or a whole kit. Not everything needs
  to be a single `.tsx` file.
- **"AI-native products"** is the center of gravity, not one of three equal pillars.
  Core and Motion exist *in service of* shipping AI-native product screens — a settings
  page, a dashboard, a form with AI in it — not as general-purpose categories competing
  for attention with shadcn, Magic UI, and Aceternity on their own turf.
- **"modern"** — 2026 baseline: streaming by default, tool calls and reasoning traces are
  ordinary UI states now, OAuth/passkey auth is table stakes, motion is judged against
  `prefers-reduced-motion` from day one.

Practical effect on scope (Part 3 already reflects this, this just makes it explicit):
Core stays deliberately thin — four components, only the ones AI-native screens actually
need underneath them (Field, Overlay primitive, Command palette) plus the pipeline
reference (Button). Motion and 3D are capped for the same reason: they're not the point,
they're what makes an AI-native product feel considered rather than assembled. The AI-in-
product pillar (Part 2/3) is where the toolkit's actual differentiation lives, because
that is the one shape of component nobody else is shipping yet.

---

## Part 1 — What the ecosystem already solved

### The single most important finding: the AI chat pillar is fully commoditized

Vercel's **AI Elements** is now ~50 components across four categories, official, free, and
shadcn-installable:

| Category | Components |
|---|---|
| Chatbot | Attachments, Chain of Thought, Checkpoint, Confirmation, Context, Conversation, Inline Citation, Message, Model Selector, Plan, Prompt Input, Queue, Reasoning, Shimmer, Sources, Suggestion, Task, Tool |
| Code | Agent, Artifact, Code Block, Commit, Environment Variables, File Tree, JSX Preview, Package Info, Sandbox, Schema Display, Snippet, Stack Trace, Terminal, Test Results, Web Preview |
| Voice | Audio Player, Mic Selector, Persona, Speech Input, Transcription, Voice Selector |
| Workflow | Canvas, Connection, Controls, Edge, Node, Panel, Toolbar |

**This kills three of the ten components in the original Phase 1 plan.** Prompt Input,
Streaming Message / Typewriter, and Chat Message List are all first-party now — and
`MessageResponse` is already optimised for incremental markdown streaming without
re-parsing on every chunk, which is the hard part. Rebuilding them would be strictly
worse than installing them.

**Agent Elements** (21st.dev) covers the second layer — Claude-Code-style agent UIs: tool
cards, plans, approvals, clarifying questions, live terminal output. Also free.

The gap I expected to find in agent UX — planning visibility, tool-use disclosure,
approval gates, recovery routing — is closed. Not worth entering.

### Marketing motion is saturated

- **Magic UI** — 150+ animated components, 21k+ stars. Animated beams, bento grids,
  marquees, text effects. Motion-first for landing pages.
- **Aceternity** — effect-first. 3D cards, glowing beams, magnetic buttons, particle
  backgrounds.
- **Tailark** — marketing page blocks.
- **Shadcnblocks** — 1,700+ premium blocks, 1,900+ components, 17 templates.

Anything generic — marquee, beam, spotlight card, infinite logo wall — already exists in
three places. Building another is pure cost.

### 3D already has the right pattern

**threecn** is a shadcn registry of React Three Fiber + drei scenes: ProductViewer,
ProductShowcase, ParticleField, FloatingCard3D, Text3D. Its key idea is a
`useShadcnTheme()` hook that bridges CSS variables into Three.js materials, so dark mode
and token changes propagate into the 3D scene.

That token-bridge idea is the part worth adopting. The scene catalogue is not worth
duplicating.

Platform context: Safari shipped WebGPU, so the Three.js WebGPU renderer hit production
maturity in 2026. R3F's WebGPU integration is still maturing (the working pattern is
passing the renderer via the `gl` prop). TSL compiles one shader to both WGSL and GLSL,
which removes the dual-maintenance problem.

### Core primitives are shadcn's job

shadcn/ui itself plus Origin UI (system-grade primitives) cover Dialog, Tabs, Input,
Select, Table and friends. The original plan's Dialog / Tabs / Input entries would be
clones with a different border-radius.

### shadcn CLI v4 (March 2026) changes our distribution options

- `registry:base` — distribute an entire design system as one payload: components,
  dependencies, CSS vars, fonts, config. One install, fully set up.
- `registry:font` — font distribution.
- **Presets** — pack a whole design-system config (colours, theme, icon library, fonts,
  radius) into a short shareable code.
- **shadcn/skills** — first-party agent context for primitives, APIs, patterns, registry
  workflows. Sits alongside our own `SKILL.md`, doesn't replace it.
- `--dry-run`, `--diff`, `--view` — inspect before applying. Built for agents.
- Templates for Next.js, Vite, Laravel, React Router, Astro, TanStack Start;
  `--monorepo` flag; `--base` flag to pick Radix or Base UI.
- `shadcn info` and `shadcn docs` commands.

---

## Part 2 — Where the actual gap is

Every existing library assumes AI lives **in a chat window**. AI Elements is
chat-, IDE-, voice- and workflow-shaped. Agent Elements is agent-console-shaped.

Nobody ships installable components for **AI embedded in an otherwise conventional
product UI** — the form, the table, the editor, the settings page. The patterns are
well-documented as *patterns* and essentially absent as *components*:

- Ghost-text inline completion — model predicts the continuation, renders as dim text at
  the caret, Tab or Right-Arrow to accept. Norm in editors, rare elsewhere. Documented
  rule: never insert on a mere pause, always require an explicit accept.
- Auto-fill — AI populates fields from context, user retains the caret.
- Prompt replication — apply one prompt across rows of a spreadsheet or a repeating
  workflow step.
- Selection → action — highlight content, get contextual AI actions.

This is the one category where building is clearly better than installing. It is also the
category most likely to be *personally* reusable, because it attaches AI to ordinary CRUD
surfaces rather than requiring a chat product.

**Recommendation: re-scope the `ai` pillar from "chat interfaces" to "AI inside
product UI", and depend on AI Elements for anything conversational.**

---

## Part 3 — The build list

Deliberately small. 24 components, 7 blocks, 3 kits.

### Core — 4 (thin by design)

Only where shadcn genuinely leaves a gap or where the system needs shared infrastructure.

| # | Component | Why it earns a slot |
|---|---|---|
| 1 | **Button** ✅ | Done. Reference implementation for the pipeline. |
| 2 | **Overlay motion primitive** | One shared enter/exit signature for Dialog, Sheet, Popover, Drawer, driven by motion tokens. Not a Dialog clone — the layer that makes every overlay in the system move identically. This is system work nobody else can ship for us. |
| 3 | **Field** | Label + description + error + full ARIA wiring, usable *without* react-hook-form. Every AI-in-product component below composes it. |
| 4 | **Command palette** | Cmd+K with async and grouped results. The single most-reused app surface; shadcn's is thin. |

### AI-in-product — 8 (the differentiator)

| # | Component | What it solves |
|---|---|---|
| 5 | **GhostInput** | Inline ghost-text completion. Tab/Right to accept, Esc to dismiss, debounced request, abort-on-keystroke, never auto-inserts. The hard parts are cancellation and caret integrity, not the visual. |
| 6 | **SmartField** | AI auto-fill for one field, with provenance ("filled from your last invoice") and one-keystroke undo. |
| 7 | **SelectionActions** | Select text → floating action bar (explain / rewrite / translate). Positioning, dismissal and keyboard reachability are the work. |
| 8 | **ProgressiveReveal** | Skeleton→content morph for *structured* streaming — table rows and cards, not prose. AI Elements only handles streaming text. |
| 9 | **DiffAccept** | Render an AI-proposed edit as an inline diff with per-hunk accept/reject. |
| 10 | **ConfidenceMeter** | Surface model confidence and a "why this answer" drawer. Trust surface for non-chat contexts. |
| 11 | **FeedbackCapture** | Thumbs + structured reason + regenerate, optimistic, with the reason taxonomy as a prop. |
| 12 | **BulkPromptTable** | Apply one prompt across rows with per-row status, partial failure and retry. The spreadsheet pattern, as a component. |

### Motion — 5 (only what gets reached for)

Generic effects are skipped — Magic UI and Aceternity own that ground.

| # | Component | Why this and not an effect |
|---|---|---|
| 13 | **Reveal** | Generic scroll-reveal wrapper with token-driven stagger. The workhorse that makes twelve one-off reveal components unnecessary. |
| 14 | **ScrollTextReveal** | Word/line reveal tied to scroll position. Demonstrates restraint — motion bound to real user action, never autoplay. |
| 15 | **MagneticDock** | Cursor-proximity magnification. Craft-parity check; single rAF-throttled listener, not per-item handlers. |
| 16 | **AnimatedNumber** | Token-driven number transitions. Used in both dashboards and marketing — the highest reuse-per-line ratio in the pillar. |
| 17 | **GradientField** | Animated gradient / dither background. Needed for our own marketing site, with a static poster under reduced-motion. |

### 3D — 3 (capped on purpose)

| # | Component | Note |
|---|---|---|
| 18 | **useSceneTokens** | Bridges PixelDosa CSS variables into Three.js materials, so 3D obeys the token layer and dark mode. Infrastructure first — adopted from threecn's approach, which is the correct one. |
| 19 | **HeroScene** | Shader plane, WebGPU with WebGL fallback, static poster under reduced-motion, deferred so it never blocks LCP. |
| 20 | **ProductViewer** | Orbit + GLTF, with loading and a non-3D accessible fallback. |

threecn covers more scenes than this. Three is the point.

### Blocks — 7 (compositions, `registry:block`)

| # | Block | Composes |
|---|---|---|
| 21 | **Hero** | GradientField or HeroScene + Reveal + Button. LCP-safe. |
| 22 | **Pricing** | Monthly/annual toggle + feature matrix, responsive to 375px. |
| 23 | **Auth screen** | OAuth + magic link + passkey affordance — the 2026 baseline. |
| 24 | **Settings shell** | Sub-nav sidebar + form column. |
| 25 | **Dashboard shell** | Sidebar + topbar + content, mobile-collapsing. |
| 26 | **AI-assisted form** | Field + SmartField + GhostInput + DiffAccept. The pillar's proof block. |
| 27 | **Onboarding checklist** | Empty-state / "complete your profile" surface. |

### Kits — 3 (`registry:base`, one install each)

| Kit | Contents |
|---|---|
| **pixeldosa-base** | Tokens + Core 4 + dashboard & settings shells. The thing every project starts from. |
| **pixeldosa-ai-product** | base + all 8 AI-in-product components + AI Elements as a registry dependency + the AI-assisted form block. |
| **pixeldosa-marketing** | base + Motion 5 + HeroScene + hero/pricing blocks. |

---

## Part 4 — Spec changes this research forces

These contradict the current build spec and need an explicit decision.

1. **§1 / §9 — drop the three chat components.** Prompt Input, Streaming Message and Chat
   Message List are commoditized. Re-scope the `ai` pillar to "AI inside product UI" and
   declare AI Elements a dependency rather than a competitor.
2. **§1 — three pillars becomes four.** Add `3d` as a `meta.pillar` value. Alternatively
   fold it under `motion`; a separate pillar is cleaner because the dependency profile
   (R3F, drei, WebGPU fallbacks) is completely different.
3. **§3 — "templates live in separate repos" is now half-wrong.** `registry:base` did not
   exist when that rule was written. Kits should ship *in this repo* as `registry:base`
   items — one install, fully configured. Only full runnable applications stay as separate
   `pixeldosa-template-*` repos.
4. **§2 / §8 — adopt CLI v4 affordances.** Add a Preset for the PixelDosa theme, and keep
   our `SKILL.md` alongside first-party `shadcn/skills` rather than duplicating what it
   covers.
5. **Registry item types expand** — `registry:block`, `registry:base`, `registry:font`
   join `registry:ui` and `registry:theme`. `scripts/build-registry.ts` validation needs
   to know about them.

## Part 5 — Suggested order

1. **Overlay motion primitive + Field** — everything downstream composes them, and the
   Overlay work sets the system's motion signature once.
2. **GhostInput** — hardest and most differentiating. If it lands well, the pillar is real.
3. **Reveal + GradientField** — unblocks our own marketing site.
4. **Command palette, AnimatedNumber, ProgressiveReveal** — high reuse, low risk.
5. **`pixeldosa-base` kit** — proves `registry:base` end-to-end while there are few
   components to bundle.
6. Everything else, in whatever order is useful at the time.

Rationale for that order: two infrastructure pieces, then the one thing that proves the
thesis, then the pieces the site itself needs, then the distribution mechanism while it's
still cheap to test.
