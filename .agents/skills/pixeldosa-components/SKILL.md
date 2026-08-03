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

## The three pillars

Every component belongs to exactly one, declared as `meta.pillar`:

- **`core`** — primitives: buttons, dialogs, tabs, form fields. These earn trust.
  Consistency beats novelty here.
- **`ai`** — chat surfaces, streaming responses, prompt inputs, agent-pattern UI.
  Design for streaming, tool calls and uncertainty states as first-class — not a
  chat bubble with a spinner bolted on.
- **`motion`** — cursor-reactive effects, scroll-driven animation, generated
  backgrounds. Novelty is earned here, and nowhere else.

**Motion must earn its place.** A component gets animation because the interaction
benefits — state change, feedback, orientation. Before shipping any animation, you
must be able to state in one sentence what interaction problem it solves. If you
cannot, remove it.

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
  "categories": ["<pillar>", "..."],
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
    "pillar": "core | ai | motion",
    "engineeringNotes": "...",
    "motionNotes": "..."
  }
}
```

- `name` must equal the directory name. `files[].path` is relative to
  `apps/web/registry.json`, which is why it starts with `../../`.
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
