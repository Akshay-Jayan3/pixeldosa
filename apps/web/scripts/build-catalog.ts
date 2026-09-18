/**
 * Writes `public/r/catalog.json`: every component's prop contract, events and design
 * guidance in one fetchable document.
 *
 * The per-component files under `public/r/` exist to install source code. This exists
 * to be *read* — by a coding agent deciding which component fits, by a generative-UI
 * runtime that renders from JSON, by an A2UI or AG-UI client assembling its catalogue
 * of approved components, by an MCP server. They all want the same thing and none of
 * them want to download 53 files to get it.
 *
 * Deliberately protocol-neutral. It describes the components in plain JSON Schema and
 * stops there: no A2UI types, no AG-UI envelope, no framework adapter. Those specs are
 * young and they disagree with each other, so the mapping belongs in an adapter that
 * can be thrown away, never in the component or in the contract it publishes. What a
 * consumer needs to do its own mapping is here — the props, the events with their
 * arguments, and which element the component renders.
 *
 * `guidance` carries the engineering and motion notes. Those are the reason to pick
 * this catalogue over a bag of primitives: "phrase `note` as the thing a person needs
 * to decide" is design knowledge that a model can act on at generation time, and it is
 * otherwise stranded in a docs page no runtime will ever read.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, "..");
const outFile = resolve(webRoot, "public/r/catalog.json");

const HOMEPAGE = "https://pixeldosa.akshayjayan.com";

type ComponentSchema = {
  component: string;
  element?: string;
  props: Record<string, unknown>;
  events: { name: string; required: boolean; params: { name: string; type: string }[]; description?: string }[];
};

type RegistryItem = {
  name: string;
  type: string;
  title?: string;
  description?: string;
  categories?: string[];
  dependencies?: string[];
  meta?: {
    schema?: ComponentSchema;
    subcomponents?: ComponentSchema[];
    engineeringNotes?: string;
    motionNotes?: string;
  };
};

const registry = JSON.parse(readFileSync(resolve(webRoot, "registry.json"), "utf8")) as {
  items: RegistryItem[];
};

const components = registry.items
  // Blocks (the composed experiences) are as renderable as the single components, so
  // anything carrying a schema is listed; `kind` tells a consumer which it is holding.
  .filter((item) => item.meta?.schema)
  .map((item) => {
    const schema = item.meta!.schema!;
    return {
      name: item.name,
      component: schema.component,
      kind: item.type === "registry:block" ? "block" : "component",
      title: item.title,
      description: item.description,
      categories: item.categories ?? [],
      /** Where the component lives once installed, and what to import from it. */
      import: { from: `@/components/ui/${item.name}`, named: schema.component },
      install: `npx shadcn@latest add ${HOMEPAGE}/r/${item.name}.json`,
      docs: `${HOMEPAGE}/docs/components/${item.name}`,
      /** The DOM element the component renders and spreads its remaining props onto. */
      element: schema.element,
      props: schema.props,
      /**
       * Callbacks. No JSON format can carry a function, so a runtime maps these onto
       * however it sends interactions home; the parameter list is what it needs to.
       */
      events: schema.events,
      ...(item.meta!.subcomponents ? { subcomponents: item.meta!.subcomponents } : {}),
      guidance: {
        engineering: item.meta?.engineeringNotes,
        motion: item.meta?.motionNotes,
      },
    };
  });

const catalog = {
  name: "pixeldosa",
  title: "PixelDosa",
  description:
    "Interface components for AI products: agent state, approval and handoff, generation workspaces, and run management. Each entry carries a JSON Schema for its props, its callbacks with their arguments, and the design reasoning behind it. Protocol-neutral — map it onto A2UI, AG-UI, an MCP server or your own renderer.",
  homepage: HOMEPAGE,
  registry: `${HOMEPAGE}/r/registry.json`,
  license: "MIT",
  components,
};

writeFileSync(outFile, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

const eventTotal = components.reduce((total, component) => total + component.events.length, 0);
console.log(`catalog.json → ${components.length} component(s), ${eventTotal} event(s)`);
