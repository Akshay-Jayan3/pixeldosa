# Component creation workflow

Use this checklist whenever you add a new PixelDosa component.

## 1) Plan before writing code
- Define the user problem and workflow.
- Decide which product problem it solves.
- Confirm whether it is a primitive, pattern, or block.
- Ensure it fits a real Block or future template.
- Write the final plan in this order:
  1. Research
  2. User Workflow
  3. Product Context
  4. Component Strategy
  5. UX Flow
  6. Visual Direction
  7. Motion Plan
  8. AI Opportunities
  9. Variants
  10. Public API
  11. Registry Structure
  12. Documentation Notes
  13. Pixeldosa Score
  14. Next Steps

## 2) Files to create
For a component named `my-component`:

- `packages/ui/src/registry/my-component/my-component.tsx`
- `packages/ui/src/registry/my-component/my-component.demo.tsx`
- `packages/ui/src/registry/my-component/registry-item.json`
- `apps/web/content/docs/components/my-component.mdx`

Optional but common:
- update `packages/ui/src/index.ts`
- update `apps/web/components/registry-demos.ts`

## 3) Implementation rules
- Use CVA for variants.
- Export prop types and variant types.
- Import `cn` from `@/lib/utils`.
- Add `"use client"` if it has interaction state or handlers.
- Use Radix primitives for overlay/interaction patterns.
- Use token-based classes only: no hardcoded color, spacing, duration or easing.
- Keep keyboard and reduced-motion behavior accessible.

## 4) Registry requirements
Each `registry-item.json` must include:
- valid schema
- `name`, `title`, `description`
- practical `categories` starting with a primary category
- `dependencies`
- `registryDependencies`
- file target path
- `docs`
- `meta.engineeringNotes`
- `meta.motionNotes`

## 5) Documentation requirements
The MDX page should include:
- frontmatter with `title` and `description`
- `## Usage`
- `## Props`
- short guidance on accessibility and when not to use it

## 6) Validation checklist
Before shipping, confirm:
- `registry-item.json` validates
- `pnpm registry:build` passes
- component installs via shadcn add pattern
- docs preview renders from the actual demo file
- focus ring and keyboard behavior work
- reduced-motion fallback is present where motion exists
- light/dark theme remains correct
- there are no hardcoded design tokens

## 7) Final quality bar
Only ship when the component is reusable, presentable, and aligned with the repo's AI product patterns.
