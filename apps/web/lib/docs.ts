import "server-only";

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import matter from "gray-matter";

import type { RegistryItem } from "./registry";

export type Doc = {
  frontmatter: { title: string; description: string };
  body: string;
};

const DOCS_DIR = resolve(process.cwd(), "content/docs/components");

export function getComponentDoc(name: string): Doc | null {
  const path = resolve(DOCS_DIR, `${name}.mdx`);
  if (!existsSync(path)) return null;

  const { data, content } = matter(readFileSync(path, "utf8"));
  return {
    frontmatter: {
      title: String(data.title ?? name),
      description: String(data.description ?? ""),
    },
    body: content,
  };
}

/**
 * Assembles the same information the page renders — description, usage/props MDX,
 * engineering and motion notes — into plain markdown for the "Copy as Markdown"
 * action. This is the LLM-cold-read philosophy SKILL.md requires of every registry
 * description, applied to the doc page itself rather than just the JSON metadata.
 */
export function buildComponentMarkdown(item: RegistryItem, doc: Doc | null): string {
  const sections = [`# ${item.title}`, "", doc?.frontmatter.description || item.description];

  if (doc?.body) {
    sections.push("", doc.body.trim());
  }

  if (item.meta?.engineeringNotes) {
    sections.push("", "## Engineering notes", "", item.meta.engineeringNotes);
  }

  if (item.meta?.motionNotes) {
    sections.push("", "## Motion notes", "", item.meta.motionNotes);
  }

  return sections.join("\n");
}

export const SITE_URL = "https://pixeldosa.akshayjayan.com";

const AGENT_GUIDE_PATH = resolve(
  process.cwd(),
  "../../packages/ui/src/registry/pixeldosa-agent-guide/SKILL.md"
);

/** The agent guide without its skill frontmatter — the single source for agent-facing rules. */
export function getAgentGuide(): string {
  const { content } = matter(readFileSync(AGENT_GUIDE_PATH, "utf8"));
  return content.trim();
}

/**
 * Docs MDX mixes real usage with docs-site-only wrappers. An agent reading it would copy
 * `<PreviewStack>` or a `*Specimen` component into a project where neither exists, so
 * those are stripped or mapped back to the real component before publishing to agents.
 */
function sanitizeForAgents(markdown: string): string {
  return markdown
    .split("\n")
    .filter((line) => !/^\s*<\/?(Preview|PreviewStack)>\s*$/.test(line))
    .filter((line) => !/^\s*<AIFormFillSpecimen\s*\/>\s*$/.test(line))
    .join("\n")
    .replace(/ActionToolbarSpecimen/g, "AIActionToolbar")
    .replace(/\n{3,}/g, "\n\n");
}

/** Per-component markdown for coding agents: install line, what it composes, usage, notes. */
export function buildAgentMarkdown(
  item: RegistryItem,
  doc: Doc | null,
  installCommand: string
): string {
  const composes = (item.registryDependencies ?? [])
    .filter((dependency) => dependency !== "@pixeldosa/pixeldosa-theme")
    .map((dependency) => `\`${dependency.replace("@pixeldosa/", "")}\``);

  const sections = [
    `# ${item.title}`,
    "",
    `> ${doc?.frontmatter.description || item.description}`,
    "",
    "```bash",
    installCommand,
    "```",
  ];

  if (composes.length > 0) {
    sections.push("", `Composes (installed automatically): ${composes.join(", ")}.`);
  }

  if (item.docs) sections.push("", `**Before you use it:** ${item.docs}`);
  if (doc?.body) sections.push("", sanitizeForAgents(doc.body.trim()));
  if (item.meta?.engineeringNotes) {
    sections.push("", "## Why it works this way", "", item.meta.engineeringNotes);
  }

  sections.push(
    "",
    "---",
    "",
    `Follow the PixelDosa UX rules when building with this component: ${SITE_URL}/llms.txt`
  );

  return sections.join("\n");
}
