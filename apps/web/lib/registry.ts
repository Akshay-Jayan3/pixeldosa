import "server-only";

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

export type Pillar = "core" | "ai" | "motion";

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
    pillar: Pillar;
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

export const PILLARS: { id: Pillar; label: string; blurb: string }[] = [
  {
    id: "core",
    label: "Core",
    blurb: "The primitives everything else is built on. Boring on purpose.",
  },
  {
    id: "ai",
    label: "AI",
    blurb: "Interfaces designed for streaming, tool calls and uncertainty.",
  },
  {
    id: "motion",
    label: "Motion",
    blurb: "High-craft experience components where motion earns its place.",
  },
];

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

/** Items that represent an installable component (excludes theme/lib items). */
export function getComponents(): RegistryItem[] {
  return getRegistryItems().filter((item) => item.type === "registry:ui");
}

export function getComponentsByPillar(pillar: Pillar): RegistryItem[] {
  return getComponents().filter((item) => item.meta?.pillar === pillar);
}

/** Neighbours in the same title-sorted order the sidebar renders, for prev/next paging. */
export function getAdjacentComponents(name: string): {
  prev: RegistryItem | null;
  next: RegistryItem | null;
} {
  const items = getComponents();
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
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}

/**
 * Source for one example: `examples/[slug].tsx` if the component has that
 * directory (multi-example components like card), otherwise the component's
 * single `[name].demo.tsx` (every other component's one and only example).
 */
export function getExampleSource(name: string, slug: string): string | null {
  const examplePath = join(REGISTRY_SRC, name, "examples", `${slug}.tsx`);
  if (existsSync(examplePath)) return readFileSync(examplePath, "utf8");

  const demoPath = join(REGISTRY_SRC, name, `${name}.demo.tsx`);
  return existsSync(demoPath) ? readFileSync(demoPath, "utf8") : null;
}

export function installCommand(name: string): string {
  return `npx shadcn@latest add @pixeldosa/${name}`;
}
