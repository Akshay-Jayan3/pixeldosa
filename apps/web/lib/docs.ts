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
