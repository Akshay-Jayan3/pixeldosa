# PixelDosa UI

Interface components for AI products — the moments where people decide whether to trust
an agent. Plain React: props in, callbacks out, no AI SDK or protocol required.
Distributed through the shadcn registry, so the source is copied into your project rather
than installed as a locked dependency.

**[pixeldosa.akshayjayan.com](https://pixeldosa.akshayjayan.com)** · [Components](https://pixeldosa.akshayjayan.com/docs/components) · [Build with AI](https://pixeldosa.akshayjayan.com/docs/ai) · [Changelog](https://pixeldosa.akshayjayan.com/changelog)

## What's here

- **Blocks** — complete experiences assembled from the components: a chat screen, an
  AI-filled form, an agent run panel, an image studio, an agent console.
- **AI components** — before a run (intent, plan, cost, autonomy), during it (presence,
  reasoning, steering, approvals), after it (citations, versions, feedback, triage), plus
  generation and agent-ops surfaces.
- **Foundation** — Button, Card, Field, Overlay, Command Menu.
- **Theme** — design and motion tokens, WCAG AA in both light and dark.
- **Agent guide** — the UX rules, installable as a Claude Code skill.

## Repository

```text
apps/web                          docs site, marketing site, and registry host
packages/ui                       component source of truth
packages/tokens                   design + motion tokens and generated CSS
packages/eslint-config            shared flat ESLint config
packages/typescript-config        shared TypeScript config
.agents/skills/pixeldosa-components/SKILL.md
                                  how humans and agents build with PixelDosa UI
```

## Commands

```bash
pnpm install
pnpm dev          # docs site on :3000
pnpm build        # tokens → registry → next build
pnpm typecheck
pnpm registry:build
```

On a memory-constrained machine the static build runs with one worker
(`experimental.cpus` in `apps/web/next.config.ts`); remove it if your CI has room.

## Registry build

From `apps/web`, `pnpm registry:build` runs, in order:

1. **`scripts/build-schemas.ts`** — derives a JSON Schema of every component's props from
   the TypeScript, plus its callbacks and their arguments.
2. **`scripts/build-registry.ts`** — validates every `registry-item.json`, regenerates
   `registry.json`, injects token CSS variables into the theme item, and folds each
   component's schema into its `meta`.
3. **`shadcn build`** — writes the published items to `public/r/*.json`.
4. **`scripts/postprocess-registry.ts`** — rewrites cross-component imports so installed
   components resolve in a consumer's project, and fails the build if any don't.
5. **`scripts/build-catalog.ts`** — writes `public/r/catalog.json`: every component's
   props, events and design guidance in one document.

## Generated files — never hand-edit

| File | Generated from |
| --- | --- |
| `packages/tokens/dist/tokens.css`, `theme-cssvars.json` | `packages/tokens/src` |
| `apps/web/schemas.generated.json` | the component TypeScript (gitignored) |
| `apps/web/registry.json` | the per-component `registry-item.json` files |
| `apps/web/public/r/*.json` | `registry.json`, via `shadcn build` |

## Adding a component

Read [`.agents/skills/pixeldosa-components/SKILL.md`](.agents/skills/pixeldosa-components/SKILL.md).
It is the operating spec for both humans and agents, and the build enforces the parts of
it that can be enforced — missing engineering or motion notes, a description too thin for
a cold model, a file that doesn't exist, or an import that would break on install.

## Consuming PixelDosa UI

```bash
npx shadcn@latest init
```

Add the namespace to `components.json`:

```json
"registries": { "@pixeldosa": "https://pixeldosa.akshayjayan.com/r/{name}.json" }
```

Then install the theme explicitly, and any component:

```bash
npx shadcn@latest add @pixeldosa/pixeldosa-theme
npx shadcn@latest add @pixeldosa/agent-console
```

Install `pixeldosa-theme` directly rather than letting it arrive as a dependency: pulled
in as a dependency it adds motion tokens but keeps the colours your project already
defines, while a direct install applies PixelDosa UI's palette.

## For coding agents and generative UI

| Resource | What it is |
| --- | --- |
| [`/llms.txt`](https://pixeldosa.akshayjayan.com/llms.txt) | Every component, how to install, and the rules for using them |
| [`/llms/<name>.md`](https://pixeldosa.akshayjayan.com/llms/agent-console.md) | One component, as markdown |
| [`/r/catalog.json`](https://pixeldosa.akshayjayan.com/r/catalog.json) | Props as JSON Schema, callbacks with their arguments, and design guidance — for rendering components from a model's output. Plain JSON Schema, tied to no protocol |
| `@pixeldosa/pixeldosa-agent-guide` | The UX rules, installed into your repo as a skill |
