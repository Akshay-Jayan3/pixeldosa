---
name: pixeldosa-components
description: Build or extend components in the PixelDosa design engineering system. Use this whenever adding a new component to the PixelDosa monorepo, editing an existing one, or wiring a component into the registry and docs site. Covers file anatomy, token usage, the three-pillar model, registry metadata requirements, and the definition of done.
---

# Building PixelDosa components

PixelDosa is a design engineering system distributed through the shadcn registry
protocol. It is not a UI kit: every component ships with the reasoning behind it
attached as registry metadata, and that metadata is a shipping requirement, not
documentation polish.

Follow this file exactly. If a request conflicts with it, say so rather than
silently deviating.

**A component is not an island.** Nothing in `packages/ui/src/registry` is built to
stand alone forever — every Level 1 component exists to be composed into a Level 2
Block, and Blocks exist to be composed into Templates (which live outside this repo).
If a proposed component can't name at least one Block it will plug into, that's a
signal to check the roadmap before building it, not a reason to skip composability. In
practice this means: favour a composed sub-component API (see `field`, `overlay`) over
a single monolithic prop-driven one wherever the component has real internal
structure, since monolithic APIs are the ones that end up forked instead of reused
inside a Block.

## Practical categories

Components are grouped by the job a developer is trying to do, not by internal
engineering pillars. Every registry item begins its `categories` array with one
primary navigation category:

- **`actions`** — buttons and controls that trigger work.
- **`content`** — cards, lists, data and content presentation.
- **`forms`** — fields, inputs and form composition.
- **`ai-assisted`** — AI embedded inside conventional product UI.
- **`overlays`** — dialogs, sheets, popovers and overlay infrastructure.

Additional tags such as `application`, `marketing`, `business`, or `motion` may be
used for filtering, but they do not create separate navigation pillars. Motion still
needs a user-facing purpose: state change, feedback, or orientation.

## Where things live

| Thing | Path |
| --- | --- |
| Component source (source of truth) | `packages/ui/src/registry/[name]/[name].tsx` |
| Docs preview | `packages/ui/src/registry/[name]/[name].demo.tsx` |
| Registry metadata | `packages/ui/src/registry/[name]/registry-item.json` |
| Prose docs | `apps/web/content/docs/components/[name].mdx` |
| Design + motion tokens | `packages/tokens/src/` |
| Generated registry manifest | `apps/web/registry.json` — **generated, never hand-edit** |
| Published registry output | `apps/web/public/r/[name].json` — **generated, never hand-edit** |

Templates and starter kits do **not** live in this repo. They are separate
`pixeldosa-template-*` repositories that consume the published registry.

## Planning phase — before any code

A component is not a UI request until it has been thought through as a product decision.
Do not open an editor until this section is done. Skipping straight to Step "Adding a
component" for anything beyond a trivial variant tweak is itself a review failure.

**Never start from UI.** Start from the workflow: who is using this, what are they trying
to accomplish, what problem does it solve, when does it appear, what happens immediately
before and after it.

Work through the plan wearing each of these hats in turn — Product Designer, Design
Engineer, Frontend Architect, OSS Maintainer, Developer Advocate, Motion Designer, UX
Researcher, and (only when the component is AI-surface-facing) AI Product Designer:

1. **Research** — two tracks, both required.
   - *Pattern research*: why developers reach for this pattern, how products like
     Linear, Vercel, Cursor, Framer, Notion, Perplexity, Stripe, GitHub, Raycast and Arc
     handle it, the accessibility guidance that applies, the mistakes teams commonly
     make with it, and where there's real room to improve on the state of the art.
   - *Visual research*: study premium execution specifically for layout, typography,
     white space, motion, visual hierarchy, storytelling, CTA placement, grid systems,
     animation, and product-demo craft. Primary references: Framer, Vercel, Linear,
     Stripe, Cursor, Perplexity, Notion, Arc, Raycast, Apple. When the component is
     visually led — marketing surfaces, empty states, onboarding, hero moments — also
     pull from design galleries: Framer Marketplace, Awwwards, Landbook, Godly, Mobbin,
     Cosmos, Lapa Ninja, SaaSFrame, One Page Love.
   - Never copy. For every reference pulled in, write down *why* it works — which of the
     study dimensions above it nails and what problem that solves for the user — not
     just that it looks good. A reference with no stated reason isn't usable later to
     justify a decision.
2. **Product context** — which products or pages would use this, what user action
   triggers it, what business workflow depends on it, what information should be visible
   versus hidden, and what decision it should make faster.
3. **Component strategy** — decide whether this is a primitive, pattern, experience,
   workflow, system, registry block, or template section, and state why. Most Pixeldosa
   components should resolve to primitive or pattern; reach for something larger only
   when the workflow genuinely demands it.
4. **UX architecture** — entry, primary action, secondary actions, loading/empty/error/
   success states, edge cases, responsive behaviour, accessibility, keyboard shortcuts,
   touch interactions.
5. **Visual direction** — layout, spacing, typography, colour usage, hierarchy, icons,
   depth, borders, radius, density, interaction feedback. Premium and timeless over
   trendy; avoid visual noise.
6. **Motion plan** — entrance, exit, hover, focus, loading, progress, micro-interactions.
   Motion communicates state, not decoration — the same bar `meta.motionNotes` enforces
   below, just decided earlier.
7. **AI opportunities** — only for `ai`-pillar components: streaming, thinking,
   suggestions, context, memory, tool execution, approvals, agent collaboration. If AI
   adds no value here, say so explicitly and move on; forcing it is worse than skipping it.
8. **Variants** — compact, comfortable, dense, minimal, enterprise, marketing, dashboard,
   touch/mobile — whichever are actually useful for this component, not an exhaustive
   list for its own sake.
9. **Public API** — props, slots, composition, variants, hooks, events, theming, dark
   mode. Design this before writing implementation; it becomes the CVA variant matrix
   and exported prop types in the steps below.
10. **Registry planning** — category, collection, dependencies, install story, docs,
    example pages, related components, and any future template this unlocks.
11. **Content** — one-line description, problem solved, when to use, when not to use,
    key differentiators. This is the seed for `registry-item.json`'s `description` and
    the docs page intro — write it here first rather than backfilling it later.
12. **Pixeldosa Score** — rate Design Value, Developer Value, Business Value, Marketing
    Value, Reusability, Originality, and Learning Value out of 10 each, with a one-line
    justification per score. If more than one or two land below 6, the plan isn't ready —
    refine it, don't ship it.

Write the plan up in this order before touching code:

```
# Research
# User Workflow
# Product Context
# Component Strategy
# UX Flow
# Visual Direction
# Motion Plan
# AI Opportunities
# Variants
# Public API
# Registry Structure
# Documentation Notes
# Pixeldosa Score
# Next Steps
```

Before moving on, ask: would this be proudly showcased on the Pixeldosa homepage? If not,
keep refining the plan — do not compensate with polish in the code. Only once the plan
holds up does "Adding a component: the exact steps" begin.

## Adding a component: the exact steps

1. `packages/ui/src/registry/[name]/[name].tsx` — the implementation.
2. `packages/ui/src/registry/[name]/[name].demo.tsx` — default-exported, **no props,
   no external state**. The docs site imports this file directly; it is never copied.
3. `packages/ui/src/registry/[name]/registry-item.json` — see requirements below.
4. `apps/web/content/docs/components/[name].mdx` — frontmatter `title` and
   `description`, then a `## Usage` section and a `## Props` table, in that order.
   The page template supplies preview, install command, Engineering Notes and Motion
   Notes around your MDX, so do not write those sections yourself.
5. Register the demo in `apps/web/components/registry-demos.ts` — one import, one
   map entry.
6. If the component is exported from the package root, add it to
   `packages/ui/src/index.ts`.
7. Run `pnpm registry:build` from `apps/web`. This validates metadata, regenerates
   `registry.json`, and runs `shadcn build`. A validation failure is a hard stop.

## Implementation rules

- **Variants via CVA.** Never conditional `className` strings, never a bespoke
  variant system. Export the `cva` result (`[name]Variants`) so consumers can extend.
- **Props types are exported** and derive variants from CVA via `VariantProps`.
  TypeScript strict, no `any`.
- **JSDoc the main export**, describing purpose. Keep it consistent with the
  registry `description` — if you edit one, edit the other.
- **Import `cn` from `@/lib/utils`**, not from the workspace package. That is the
  path it resolves to in a consumer's project after `shadcn add`, and the docs site
  is configured to match, so the previewed file and the installed file are identical.
- **Radix primitives** for anything with interaction semantics (dialog, tabs, popover,
  slot). Do not reimplement focus trapping, roving tabindex or portalling by hand.
- **`"use client"`** at the top of any component with state, effects or event handlers.

## Token rules

Hardcoding a colour, spacing, radius, duration or easing value fails review.

- Colours: use the semantic Tailwind classes backed by tokens — `bg-primary`,
  `text-muted-foreground`, `border-input`, `ring-ring`. Never a literal hex, `oklch()`
  or a Tailwind palette class like `bg-orange-500`. Light and dark come for free.
- Radius: `rounded-sm | rounded-md | rounded-lg | rounded-xl`, all derived from
  `--radius`.
- Motion in JS (Motion library): import from `@pixeldosa/tokens`:

  ```ts
  import { duration, easing, stagger, reducedMotion } from "@pixeldosa/tokens";

  transition={{ duration: duration.base, ease: easing.decelerate }}
  ```

- Motion in CSS (components that need only a transition): use the generated custom
  properties — `duration-[var(--pd-duration-fast)]`,
  `ease-[var(--pd-ease-standard)]`. Prefer this over the Motion library when the
  animation is a simple state transition; do not force a JS animation runtime into a
  component that does not need one.
- To change a token value, edit `packages/tokens/src/*.ts` and rebuild. The CSS is
  generated from the TypeScript, never the other way round.

## Accessibility (shipping requirement, not follow-up)

- Keyboard operable end to end; correct ARIA roles and labels.
- Visible focus state on every interactive element.
- Icon-only controls require `aria-label`.
- Busy/loading states use `aria-busy` and keep the element mounted and focusable —
  never swap an interactive element out for a spinner, which drops focus to `<body>`.
- Responsive down to 375px.

## Reduced motion

`prefers-reduced-motion` requires a **fallback**, not a removal. The state change must
remain legible without the movement.

- CSS: `motion-reduce:transition-none` plus neutralising the transform
  (`motion-reduce:active:scale-100`), leaving colour and ring changes intact.
- Motion library: swap the transition config for `reducedMotion` from
  `@pixeldosa/tokens` rather than unmounting the animated element, so completion
  callbacks still fire.

## registry-item.json requirements

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "[name]",
  "title": "[Title Case]",
  "description": "...",
  "type": "registry:ui",
  "categories": ["<primary practical category>", "..."],
  "dependencies": ["npm packages the file imports"],
  "registryDependencies": ["@pixeldosa/pixeldosa-theme"],
  "files": [
    {
      "path": "../../packages/ui/src/registry/[name]/[name].tsx",
      "target": "components/ui/[name].tsx",
      "type": "registry:ui"
    }
  ],
  "docs": "Install-time caveats a consumer needs before the component works.",
  "meta": {
    "engineeringNotes": "...",
    "motionNotes": "..."
  }
}
```

- `name` must equal the directory name. `files[].path` is relative to
  `apps/web/registry.json`, which is why it starts with `../../`.
- **`categories`** must begin with one practical navigation category. Additional
  free-text tags such as `application`, `marketing`, `business`, or `motion` are
  welcome for docs-site filtering.
- **`description`** is written for an LLM reading it cold with no other context: what
  the component is, what it renders, what its options are, and when to use it versus
  a neighbouring component. Not marketing copy. The build enforces a minimum length
  because short descriptions are always under-specified.
- **`meta.engineeringNotes`** — the architectural decision and its alternative.
  "Uses X rather than Y because Z." Required for every component, including plain
  ones; a Button's note can be as short as why CVA over conditional classNames.
- **`meta.motionNotes`** — required whenever motion is present, and expected even
  when it is nearly absent (say so, and say why). Name the specific values used, why
  those and not others, and what the reduced-motion fallback preserves.
- Both notes are validated for length by `scripts/build-registry.ts`. Placeholder
  text fails the build.

## Definition of done

A component is not done until every line is true:

- [ ] `registry-item.json` validates and `pnpm registry:build` passes
- [ ] `description` written for cold LLM comprehension
- [ ] `meta.engineeringNotes` and `meta.motionNotes` present and specific
- [ ] Installs cleanly via `npx shadcn@latest add @pixeldosa/[name]` into an empty project
- [ ] Docs page renders the live preview from the actual `.demo.tsx`
- [ ] Keyboard operable, correct ARIA, visible focus
- [ ] `prefers-reduced-motion` fallback where motion is present
- [ ] Light and dark correct, via tokens only
- [ ] No hardcoded colour, spacing, duration or easing
- [ ] Responsive to 375px
- [ ] TypeScript strict, no `any`, exported prop types
- [ ] If animated: you can state in one sentence what interaction problem the motion solves
