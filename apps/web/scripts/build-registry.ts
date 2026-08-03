/**
 * Assembles `apps/web/registry.json` from the per-component `registry-item.json`
 * files in `packages/ui/src/registry/*`, then hands off to the official
 * `shadcn build` command (see the `registry:build` script).
 *
 * Why generate the manifest instead of hand-maintaining it: shadcn's registry.json
 * requires items to be inlined, but Section 5 makes the per-component
 * registry-item.json the authored artefact. Generating the manifest is what lets
 * both be true — one file per component to write, one manifest for the CLI to read.
 *
 * The theme item's cssVars are injected from `@pixeldosa/tokens` build output so
 * the published theme can never drift from the token modules.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, "..");
const repoRoot = resolve(webRoot, "../..");
const registrySrc = resolve(repoRoot, "packages/ui/src/registry");
const tokensCssVars = resolve(repoRoot, "packages/tokens/dist/theme-cssvars.json");

type RegistryItem = {
  name: string;
  type: string;
  files?: { path: string; target?: string; type: string }[];
  cssVars?: Record<string, Record<string, string>>;
  meta?: Record<string, unknown>;
  [key: string]: unknown;
};

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, "utf8")) as T;

if (!existsSync(tokensCssVars)) {
  throw new Error(
    `Missing ${tokensCssVars}. Run \`pnpm --filter @pixeldosa/tokens build\` first.`
  );
}

const themeVars = readJson<Record<string, Record<string, string>>>(tokensCssVars);

const dirs = readdirSync(registrySrc, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const items: RegistryItem[] = [];
const problems: string[] = [];

for (const dir of dirs) {
  const itemPath = join(registrySrc, dir, "registry-item.json");
  if (!existsSync(itemPath)) {
    problems.push(`${dir}: no registry-item.json`);
    continue;
  }

  const item = readJson<RegistryItem>(itemPath);

  if (item.name !== dir) {
    problems.push(`${dir}: item name "${item.name}" does not match its directory`);
  }

  // Section 4: these are the differentiation layer, so their absence is a build
  // failure rather than a lint warning.
  const meta = (item.meta ?? {}) as Record<string, string>;
  if (!meta.pillar) problems.push(`${item.name}: meta.pillar is missing`);
  if (!meta.engineeringNotes || meta.engineeringNotes.length < 80) {
    problems.push(`${item.name}: meta.engineeringNotes is missing or too thin`);
  }
  if (!meta.motionNotes || meta.motionNotes.length < 80) {
    problems.push(`${item.name}: meta.motionNotes is missing or too thin`);
  }
  if (typeof item.description !== "string" || item.description.length < 120) {
    problems.push(
      `${item.name}: description is missing or too short for cold LLM comprehension`
    );
  }

  for (const file of item.files ?? []) {
    if (!existsSync(resolve(webRoot, file.path))) {
      problems.push(`${item.name}: file not found → ${file.path}`);
    }
  }

  if (item.type === "registry:theme") {
    item.cssVars = { ...themeVars, ...(item.cssVars ?? {}) };
  }

  items.push(item);
}

if (problems.length > 0) {
  console.error("Registry validation failed:\n" + problems.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "pixeldosa",
  homepage: "https://pixeldosa.dev",
  items,
};

writeFileSync(
  resolve(webRoot, "registry.json"),
  `${JSON.stringify(registry, null, 2)}\n`,
  "utf8"
);

console.log(`registry.json → ${items.length} item(s): ${items.map((i) => i.name).join(", ")}`);
