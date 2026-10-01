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
 *
 * `--pro` builds the Pro registry instead: `packages/ui/src/registry-pro` into
 * `registry-pro.json`, which `shadcn build` turns into `.registry-pro/`. That folder is
 * never under `public/`; the site serves it only through the key-checked
 * `/api/registry/[name]` route. Validation is the same either way.
 */
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, "..");
const repoRoot = resolve(webRoot, "../..");
const pro = process.argv.includes("--pro");
const registrySrc = resolve(repoRoot, pro ? "packages/ui/src/registry-pro" : "packages/ui/src/registry");
const tokensCssVars = resolve(repoRoot, "packages/tokens/dist/theme-cssvars.json");
const generatedSchemas = resolve(webRoot, "schemas.generated.json");

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

if (!existsSync(generatedSchemas)) {
  throw new Error(`Missing ${generatedSchemas}. Run \`tsx scripts/build-schemas.ts\` first.`);
}

type ItemSchema = {
  primary: string;
  components: Record<string, { component: string; element?: string; props: unknown; events: unknown[] }>;
};

const schemas = readJson<Record<string, ItemSchema>>(generatedSchemas);

// The Pro folder holds nothing until the first Pro component exists; that is an empty
// registry, not an error.
const dirs = existsSync(registrySrc)
  ? readdirSync(registrySrc, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
  : [];

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

  const meta = (item.meta ?? {}) as Record<string, string>;
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

  // A free item that pulled in a Pro one would fail to install for everyone without a key.
  const dependencies = (item.registryDependencies ?? []) as string[];
  if (!pro && dependencies.some((dependency) => dependency.startsWith("@pixeldosa-pro/"))) {
    problems.push(`${item.name}: a free item can't depend on a Pro item`);
  }

  if (item.type === "registry:theme") {
    item.cssVars = { ...themeVars, ...(item.cssVars ?? {}) };
  }

  // The generated prop contract rides along with the item, so anything that installs
  // or reads a component gets the same description of it that the compiler has.
  const itemSchema = schemas[item.name];
  if (itemSchema) {
    const { primary, components } = itemSchema;
    const subcomponents = Object.values(components).filter((c) => c.component !== primary);
    item.meta = {
      ...(item.meta ?? {}),
      schema: components[primary],
      ...(subcomponents.length > 0 ? { subcomponents } : {}),
    };
  } else if (item.type === "registry:ui") {
    problems.push(`${item.name}: no generated schema — is the component file named ${item.name}.tsx?`);
  }

  items.push(item);
}

if (problems.length > 0) {
  console.error("Registry validation failed:\n" + problems.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: pro ? "pixeldosa-pro" : "pixeldosa",
  homepage: "https://pixeldosa.akshayjayan.com",
  items,
};

// The Pro output must mirror the source exactly: an item deleted from registry-pro
// can't keep being served from an earlier build.
if (pro) rmSync(resolve(webRoot, ".registry-pro"), { recursive: true, force: true });

const outName = pro ? "registry-pro.json" : "registry.json";
writeFileSync(resolve(webRoot, outName), `${JSON.stringify(registry, null, 2)}\n`, "utf8");

console.log(`${outName} → ${items.length} item(s): ${items.map((i) => i.name).join(", ")}`);
