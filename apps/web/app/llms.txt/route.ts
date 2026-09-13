import { isFoundation, groupFor } from "@/lib/component-groups";
import { SITE_URL, getAgentGuide, getComponentDoc } from "@/lib/docs";
import { getComponents, installCommand, type RegistryItem } from "@/lib/registry";

export const dynamic = "force-static";

/**
 * Each doc page's frontmatter description is a hand-written one-liner, which reads far
 * better in an index than any automatic cut of the long registry description — splitting
 * that on punctuation truncated summaries mid-thought (at "e.g.", for one).
 */
function line(item: RegistryItem): string {
  const summary = getComponentDoc(item.name)?.frontmatter.description || item.description;
  return `- [${item.title}](${SITE_URL}/llms/${item.name}.md): ${summary}`;
}

/**
 * The llms.txt index (llmstxt.org): what PixelDosa is, how to install it, the rules for
 * using it well, and a link to agent-readable markdown for every component. Generated
 * from the registry and the agent guide, so it cannot fall out of date.
 */
export function GET() {
  const items = getComponents();
  const blocks = items.filter((item) => groupFor(item) === "blocks");
  const ai = items.filter((item) => groupFor(item) === "ai" && !isFoundation(item));
  const foundation = items.filter((item) => isFoundation(item) || groupFor(item) === "product");

  const body = [
    "# PixelDosa",
    "",
    "> React components for AI products — AI embedded in real product interfaces, not a chat window. Plain components with no AI SDK or protocol dependency, distributed through the shadcn registry.",
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
