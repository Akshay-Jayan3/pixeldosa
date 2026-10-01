# Pro components

Everything in this folder is PixelDosa Pro. Its source leaves the repo only through the
key-checked `/api/registry/[name]` route on the site, never through `public/`.

## Adding a Pro component

Same layout as `../registry/`: `<name>/<name>.tsx`, `<name>/<name>.demo.tsx` and
`<name>/registry-item.json`.

- `files[].path` points at `../../packages/ui/src/registry-pro/<name>/<name>.tsx`.
- A Pro component may use free components (`@/registry/...` imports and `@pixeldosa/...` in
  `registryDependencies`) and other Pro components (`@/registry-pro/...` and
  `@pixeldosa-pro/...`). A free component may never use a Pro one; the build fails if it does.
- The name must not exist in `../registry/` too; the build fails if it does.
- Register the demo in `apps/web/components/registry-demos.ts` for its preview and thumbnail.
  The docs page, sidebar badge, install line, llms entry and catalogue entry follow
  automatically.

## How the build keeps it private

- `pnpm --filter web registry:build` writes the Pro items to `apps/web/.registry-pro/`
  (gitignored, never public).
- `pnpm --filter web build` ends with `scripts/check-pro-leaks.ts`, which fails the deploy
  if any Pro source turns up in `public/`, a rendered page or an llms file.

## Keys

The route accepts the keys listed in `PIXELDOSA_PRO_KEYS` (comma-separated, set in Vercel,
and in `apps/web/.env.local` for local testing). Buyers set their key as `PIXELDOSA_PRO_KEY`
and add the `@pixeldosa-pro` registry to their `components.json`.

When the first real Pro component ships, add the Pro setup to the agent guide
(`../registry/pixeldosa-agent-guide/SKILL.md`). llms.txt already shows it once a Pro item exists.
