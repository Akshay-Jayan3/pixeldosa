import "server-only";

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { GROUP_ORDER, groupFor, isFoundation } from "./component-groups";

export type RegistryFile = {
  path: string;
  target?: string;
  type: string;
};

export type RegistryItem = {
  name: string;
  title: string;
  description: string;
  type: string;
  categories?: string[];
  dependencies?: string[];
  registryDependencies?: string[];
  files?: RegistryFile[];
  cssVars?: Record<string, Record<string, string>>;
  docs?: string;
  meta?: {
    engineeringNotes: string;
    motionNotes?: string;
  };
};

/**
 * Registry items are read straight from `packages/ui` rather than from the
 * generated `public/r/*.json`. The docs site and the published registry therefore
 * share one authored source; if a doc page renders, the registry item exists.
 */
const REGISTRY_SRC = resolve(process.cwd(), "../../packages/ui/src/registry");

export const COMPONENT_CATEGORIES = [
  { id: "actions", label: "Actions" },
  { id: "content", label: "Content" },
  { id: "forms", label: "Forms" },
  { id: "ai-assisted", label: "AI-assisted" },
  { id: "overlays", label: "Overlays" },
] as const;

let cache: RegistryItem[] | null = null;

export function getRegistryItems(): RegistryItem[] {
  if (cache) return cache;

  const items = readdirSync(REGISTRY_SRC, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(REGISTRY_SRC, entry.name, "registry-item.json"))
    .filter((path) => existsSync(path))
    .map((path) => JSON.parse(readFileSync(path, "utf8")) as RegistryItem)
    .sort((a, b) => a.title.localeCompare(b.title));

  cache = items;
  return items;
}

export function getRegistryItem(name: string): RegistryItem | undefined {
  return getRegistryItems().find((item) => item.name === name);
}

/**
 * Items with a docs page — Level 1 components and Level 2 Blocks. Excludes theme and
 * lib items, which install but have nothing to preview.
 */
export const DOCUMENTED_TYPES = ["registry:ui", "registry:block"];

export function getComponents(): RegistryItem[] {
  return getRegistryItems().filter((item) => DOCUMENTED_TYPES.includes(item.type));
}

export function isBlock(item: { type: string }): boolean {
  return item.type === "registry:block";
}

export function getComponentsByCategory(category: string): RegistryItem[] {
  return getComponents().filter((item) => item.categories?.[0] === category);
}

/**
 * Neighbours in the exact order the sidebar renders — grouped, with foundation
 * primitives excluded. Deriving this from the same grouping the nav uses is the point:
 * a "next" arrow that jumps to a component the sidebar doesn't show, or that skips
 * around the visible order, is the kind of small wrongness a user feels without being
 * able to name it.
 *
 * A foundation page reached directly by URL still gets arrows, falling back to the
 * full title-sorted list so it is never a dead end.
 */
export function getAdjacentComponents(name: string): {
  prev: RegistryItem | null;
  next: RegistryItem | null;
} {
  const all = getComponents();
  const navOrder = GROUP_ORDER.flatMap((group) =>
    all.filter((item) => !isFoundation(item) && groupFor(item) === group)
  );

  const items = navOrder.some((item) => item.name === name) ? navOrder : all;
  const index = items.findIndex((item) => item.name === name);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? (items[index - 1] ?? null) : null,
    next: index < items.length - 1 ? (items[index + 1] ?? null) : null,
  };
}

/** The literal source of the component's first file, for the docs source view. */
export function getComponentSource(name: string): string | null {
  const file = getRegistryItem(name)?.files?.[0];
  if (!file) return null;

  const path = resolve(process.cwd(), file.path);
  // Shown as the file someone gets after install, so composed imports use installed paths.
  return existsSync(path) ? toInstalledImports(readFileSync(path, "utf8")) : null;
}

/**
 * Source for one example: `examples/[slug].tsx` if the component has that
 * directory (multi-example components like card), otherwise the component's
 * single `[name].demo.tsx` (every other component's one and only example).
 */
function readExampleSource(name: string, slug: string): string | null {
  const examplePath = join(REGISTRY_SRC, name, "examples", `${slug}.tsx`);
  if (existsSync(examplePath)) return readFileSync(examplePath, "utf8");

  const demoPath = join(REGISTRY_SRC, name, `${name}.demo.tsx`);
  return existsSync(demoPath) ? readFileSync(demoPath, "utf8") : null;
}

const REGISTRY_IMPORT = /@\/registry\/([a-z0-9-]+)\/[a-z0-9-]+(?=["'])/g;

/**
 * Example source as someone would paste it into their own project. Demos import siblings
 * through the monorepo's `@/registry/...` alias, which doesn't exist after install; this
 * rewrites those to the paths `shadcn add` actually writes (`components/ui`, or
 * `components/blocks` for blocks), the same mapping the registry build applies to
 * component files. Found by a fresh-project install test: copied demos didn't resolve.
 */
export function getExampleSource(name: string, slug: string): string | null {
  const source = readExampleSource(name, slug);
  return source ? toInstalledImports(source) : null;
}

function toInstalledImports(source: string): string {
  return source.replace(REGISTRY_IMPORT, (_match, imported: string) => {
    const folder = getRegistryItem(imported)?.type === "registry:block" ? "blocks" : "ui";
    return `@/components/${folder}/${imported}`;
  });
}

/** Everything `shadcn add` installs for an item: its registry dependencies, transitively. */
function installedWith(name: string, seen = new Set<string>()): Set<string> {
  if (seen.has(name)) return seen;
  seen.add(name);
  for (const dependency of getRegistryItem(name)?.registryDependencies ?? []) {
    installedWith(dependency.replace(/^@pixeldosa\//, ""), seen);
  }
  return seen;
}

/**
 * Components an example imports that installing the component itself doesn't bring in —
 * e.g. the Agent Steer demo also renders Live Status Line. Without these, a copied example
 * fails to compile, so the docs page lists them with a single install command.
 */
export function getExampleExtras(name: string, slug: string): string[] {
  const source = readExampleSource(name, slug) ?? "";
  const installed = installedWith(name);
  const imported = new Set([...source.matchAll(REGISTRY_IMPORT)].map((match) => match[1]!));
  return [...imported].filter((dependency) => !installed.has(dependency) && getRegistryItem(dependency)).sort();
}

export function installCommand(name: string | string[]): string {
  const names = Array.isArray(name) ? name : [name];
  return `npx shadcn@latest add ${names.map((item) => `@pixeldosa/${item}`).join(" ")}`;
}
