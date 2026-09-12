# Generation Placeholder — Build Plan

Status: **planned 2026-09-09**. First component of the multimodal output family, and the
first concrete rendering of the system's quantization signature (DESIGN.md §3, rule 11).

---

# Research

## The gap this fills

`plans/agent-expression-system-plan.md` built a state vocabulary from AG-UI, OpenAI
Responses, AI SDK and LangGraph — all of which are **text and tool-call shaped**. Media
generation is temporally different in three ways that vocabulary cannot express:

1. **Progress is genuinely measurable.** Diffusion step 18/40, frame 240/900. Text
   streaming has no known endpoint, which is exactly why `Confidence Meter` refuses a
   percentage — but refusing one *here* would discard real information. The rule is not
   "never show a number", it is **"never invent precision you don't have."** A measured
   step count is not an invented number.
2. **It refines in place rather than appending.** `Progressive Reveal` appends whole
   items; an image resolves from noise through coarse to fine in the same pixels. A
   different temporal model needs a different component.
3. **There is a post-generation phase.** Upscaling and encoding are neither generating
   nor done. `processing` is a real state that no surveyed library expresses.

## Prior art

transitions.dev ships "Image generation placeholder — dot noise wakes, then resolves
into image" and "Matrix dot loader — 16-dot matrix pulses in four patterns", which
confirms the dot-field is a recognised direction rather than an invention. Neither is
tied to real progress or reserves layout, which is where this version differs.

The dominant convention elsewhere is a spinner over a grey box, or a skeleton. Both
discard the one thing media generation actually has: **measurable, spatially
expressible progress.**

## The load-bearing craft decision

**The placeholder must reserve the artifact's exact final bounds.** A media placeholder
that resizes when the artifact arrives causes a layout shift at the precise moment the
user's attention is on it — the skill's anti-pattern list names this outright ("layout
shifts caused by loading/success states"). So `aspectRatio` is required, not optional,
and the component is a *container* that reveals its children rather than a sibling that
gets swapped out.

---

# User Workflow

**Who:** someone who asked for an image, video, or audio clip and is now waiting.
**What:** honest, spatially-encoded progress in the exact place the result will appear.
**Before:** a generation request. **After:** the artifact, or a recoverable failure.

The specific anxiety being designed against: *"is this working, and how long?"* A
spinner answers neither. A dot field whose density maps to real progress answers both
without a word.

---

# Product Context

Any AI product that produces media: design tools, marketing generators, video editors,
avatar/asset pipelines. Named future consumers in this repo: `Bulk Prompt Table` (a
grid of generating cells) and the `Agent Presence` `field` form, which shares this
component's cell-rendering core.

---

# Component Strategy

**Primitive.** No fetching, no polling, no ownership of the generation. It takes
`status` and `progress` and renders. The caller already owns the request — the same
boundary every other AI-tier component in this system holds.

---

# UX Flow

- **Entry:** rendered as soon as the request is made, at the artifact's final size.
- **`queued`** — sparse, still, dim. Accepted but not started.
- **`generating`** — cells resolve as progress climbs. Determinate when `progress` is
  supplied, a travelling wave when it isn't.
- **`processing`** — post-phase (upscale/encode). Indeterminate, visibly different from
  generating so "nearly there" doesn't read as "stalled".
- **`done`** — children cross-fade in; the field fades out. Never a pop.
- **`failed`** — field collapses, `destructive` text, recovery action via the caller.
- **Cancel** is visible during every active state (DESIGN.md §3a, question 2).
- **Empty/edge:** no `progress` is valid and common — indeterminate is the honest
  default when the backend doesn't report steps.

# Visual Direction

A grid of dots on the system's monochrome scale. Each cell holds a **stable
pseudo-random threshold**; a cell is resolved when its threshold is below `progress`.
That produces an organic dissolve that is nonetheless an exact function of real
progress — ordered-dither logic, not decoration.

Dot *scale* carries resolution, not colour. `queued` cells sit at minimum scale;
resolved cells reach full. Reference: the user-supplied dot-density field, which is the
same idea with size as the encoding channel.

Two forms, one threshold engine:
- **`field`** — the dot grid, for image and video (both are rectangles).
- **`bars`** — a row of vertical bars, for audio, where a rectangle of dots would be a
  lie about the medium's shape.

# Motion Plan

- Cells transition scale at `--pd-duration-base`, staggered by their own threshold so
  the resolve reads as a wave rather than a switch.
- Indeterminate mode: a travelling threshold offset, `--pd-duration-deliberate`,
  looping — the one continuous animation, and it maps to real ongoing work.
- `done`: field fades at `--pd-duration-fast` while children fade in — a cross-fade, so
  states morph rather than cut (DESIGN.md §4).
- **Reduced motion is unusually strong here:** progress is encoded *spatially*, in the
  pattern, not temporally in the motion. Under `prefers-reduced-motion` the cells snap
  to their correct scale with no transition and the component loses nothing — the
  progress is still fully legible. Indeterminate mode stops travelling and holds a
  static sparse pattern, with the text label carrying the "still working" signal.

# AI Opportunities

This is the AI surface. The specific decisions:
- **A percentage only when it was measured.** `progress` is optional and there is no
  fake fallback — no synthetic creep toward 90%. If the backend doesn't report steps,
  the component says so by being indeterminate.
- **`processing` is separate from `generating`** so a user isn't told "done" while an
  encode is still running.

# Variants

- `form`: `field` | `bars`
- `status`: `queued` | `generating` | `processing` | `done` | `failed`
- `density`: cell count — `sm` for a table cell, `default`, `lg` for a hero surface.
- Deliberately not building: a percentage ring (redundant with the field), a
  time-remaining estimate (a fabricated number, and always wrong).

# Public API

```tsx
<GenerationPlaceholder
  status="generating"
  progress={0.41}            // 0–1. Omit for indeterminate — never faked.
  aspectRatio="16 / 9"       // required: reserves the artifact's bounds
  label="Generating image"   // accessible + visible status text
  form="field"
  onCancel={() => abort()}
>
  <img src={url} alt="…" />  {/* revealed on status="done" */}
</GenerationPlaceholder>
```

# Registry Structure

- `name`: `generation-placeholder`
- `categories`: `["ai-assisted", "content", "application"]`
- `dependencies`: none. `registryDependencies`: `["@pixeldosa/pixeldosa-theme"]`

# Documentation Notes

**One-line:** A layout-reserving placeholder for AI-generated media that encodes real
generation progress as a resolving dot field, then cross-fades into the finished
artifact.
**When to use:** any image, video, or audio being generated.
**When not to use:** text streaming is `Progressive Reveal`; agent activity with no
artifact is `Agent Presence`; a generic content skeleton is not this — this component
exists because generation progress is *measurable*, and a skeleton throws that away.

# Pixeldosa Score

- **Design Value: 9/10** — spatial progress encoding is the idea, and it's a good one.
- **Developer Value: 8/10** — solves layout reservation and progress in one primitive.
- **Business Value: 8/10** — every multimodal AI product needs exactly this.
- **Marketing Value: 9/10** — the most visually striking thing in the system so far.
- **Reusability: 8/10** — shares its cell engine with `Agent Presence`'s `field` form.
- **Originality: 8/10** — the threshold-dissolve mapped to true progress is unclaimed.
- **Learning Value: 7/10** — ordered dithering as a progress encoding is a transferable
  idea.

# Next Steps

1. Build `generation-placeholder.tsx` + demo + registry item + docs.
2. QA: determinate, indeterminate, reduced motion, 375px, both themes.
3. Extract the cell engine when `Agent Presence` needs it — not before, to avoid
   designing a shared abstraction against a single consumer.
