import "server-only";

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import matter from "gray-matter";

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
