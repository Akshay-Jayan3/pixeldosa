/**
 * Heading-id generation shared between the MDX renderer (mdx-components.tsx,
 * which stamps the same id onto the actual `<h2>`/`<h3>` it renders) and the
 * page-level table of contents (which needs to link to that id before the MDX
 * has rendered). Keeping both call sites on this one function is what keeps
 * the TOC's links and the page's anchors in sync.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type TocHeading = { id: string; text: string; level: 2 | 3 };

/** Pulls `## `/`### ` lines out of a doc's raw markdown body, in document order. */
export function extractHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    const match = /^(##|###)\s+(.+)$/.exec(line.trim());
    if (!match) continue;
    const level = match[1]!.length === 2 ? 2 : 3;
    const text = match[2]!.trim();
    headings.push({ id: slugify(text), text, level });
  }

  return headings;
}
