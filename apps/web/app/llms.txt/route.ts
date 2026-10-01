import { isFoundation, groupFor } from "@/lib/component-groups";
import { SITE_URL, getAgentGuide, getComponentDoc } from "@/lib/docs";
import { getComponents, installCommand, isPro, PRO_REGISTRY_CONFIG, type RegistryItem } from "@/lib/registry";

export const dynamic = "force-static";

/**
 * Each doc page's frontmatter description is a hand-written one-liner, which reads far
 * better in an index than any automatic cut of the long registry description — splitting
 * that on punctuation truncated summaries mid-thought (at "e.g.", for one).
 */
function line(item: RegistryItem): string {
  const summary = getComponentDoc(item.name)?.frontmatter.description || item.description;
  return `- [${item.title}](${SITE_URL}/llms/${item.name}.md)${isPro(item) ? " (Pro)" : ""}: ${summary}`;
}

/**
 * The llms.txt index (llmstxt.org): what PixelDosa UI is, how to install it, the rules for
 * using it well, and a link to agent-readable markdown for every component. Generated
 * from the registry and the agent guide, so it cannot fall out of date.
 */
export function GET() {
  const items = getComponents();
  const blocks = items.filter((item) => groupFor(item) === "blocks");
  const ai = items.filter((item) => groupFor(item) === "ai" && !isFoundation(item));
  const foundation = items.filter((item) => isFoundation(item) || groupFor(item) === "product");

  const body = [
    "# PixelDosa UI",
    "",
    "> The trust layer for AI products: React components for the moments people decide whether to trust an agent (before it runs, while it works, and when they review what it did), plus a complete chat stack. Plain components with no AI SDK or protocol dependency, distributed through the shadcn registry.",
    "",
    "## Install",
    "",
    "Add to `components.json`:",
    "",
    "```json",
    `"registries": { "@pixeldosa": "${SITE_URL}/r/{name}.json" }`,
    "```",
    "",
    "```bash",
    installCommand("pixeldosa-theme"),
    installCommand("pixeldosa-agent-guide"),
    "```",
    "",
    "Install `pixeldosa-theme` explicitly: as a dependency of a component it adds motion tokens but keeps colours the project already defines. Installed directly, it applies PixelDosa UI's WCAG AA palette.",
    // Said only once something is Pro: an agent told about a registry with nothing in it
    // would go looking for components that don't exist.
    ...(items.some(isPro)
      ? [
          "",
          "Components marked (Pro) install from a second registry that needs a PixelDosa UI Pro licence key. Add both registries, and set `PIXELDOSA_PRO_KEY` in `.env.local`. Only install a Pro component when that key is set; otherwise tell the user it's Pro, or use a free component.",
          "",
          "```json",
          PRO_REGISTRY_CONFIG,
          "```",
        ]
      : []),
    "",
    "## Blocks",
    "",
    ...blocks.map(line),
    "",
    "## AI components",
    "",
    ...ai.map(line),
    "",
    "## Foundation",
    "",
    ...foundation.map(line),
    "",
    "## Optional",
    "",
    `- [Full documentation](${SITE_URL}/llms-full.txt): every component's usage, props and design rationale in one file`,
    `- [Registry index](${SITE_URL}/r/registry.json): machine-readable shadcn registry`,
    `- [Component catalogue](${SITE_URL}/r/catalog.json): every component's props as JSON Schema, its callbacks with their arguments, and its design guidance — for rendering components from a model's output rather than writing code. Plain JSON Schema, not tied to any protocol.`,
    "",
    "---",
    "",
    getAgentGuide(),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
