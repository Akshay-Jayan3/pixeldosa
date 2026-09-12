import type { ReactNode } from "react";
import { Children, isValidElement } from "react";
import type { MDXComponents } from "mdx/types";

import * as PixelDosaUI from "@pixeldosa/ui";

import { ActionToolbarSpecimen } from "@/components/mdx-specimens";
import { slugify } from "@/lib/toc";

/**
 * MDX prose styling. Written as an explicit element map rather than a typography
 * plugin so that doc pages and the template-rendered sections (Installation,
 * Engineering Notes) share exactly one set of heading and text styles.
 *
 * h2/h3 stamp an `id={slugify(text)}` so the page's "On this page" TOC (built
 * server-side from the same raw markdown via `lib/toc.ts`) can link straight to
 * them — both sides must derive the id from text the same way, or the links go
 * to nothing.
 */
function textContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textContent).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textContent(node.props.children);
  return "";
}

function headingId(children: ReactNode): string | undefined {
  const text = textContent(Children.toArray(children));
  return text ? slugify(text) : undefined;
}

/**
 * A live specimen box for MDX-authored Variants/Examples sections. A variant
 * shown only as a code block is the "styled div" failure DESIGN.md §3.1 warns
 * about — if the difference between `default` and `outline` matters, the reader
 * has to be able to see it.
 */
function Preview({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 flex min-h-32 flex-wrap items-center justify-center gap-4 rounded-xl border bg-card p-8">
      {children}
    </div>
  );
}

/**
 * A vertical specimen stack, for variants that read as rows rather than a
 * wrapped inline row (meters, cards, list items).
 */
function PreviewStack({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 flex min-h-32 flex-col justify-center gap-4 rounded-xl border bg-card p-8">
      {children}
    </div>
  );
}

export const mdxComponents: MDXComponents = {
  // Every registry component is addressable by name inside MDX, so a doc can
  // render the real thing rather than describe it.
  ...PixelDosaUI,
  Preview,
  PreviewStack,
  ActionToolbarSpecimen,
  h2: ({ children, ...props }) => (
    <h2
      {...props}
      id={headingId(children)}
      className="mt-10 scroll-mt-20 text-xl font-medium tracking-tight"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      {...props}
      id={headingId(children)}
      className="mt-8 scroll-mt-20 text-lg font-medium tracking-tight"
    >
      {children}
    </h3>
  ),
  p: (props) => (
    <p {...props} className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty" />
  ),
  ul: (props) => (
    <ul
      {...props}
      className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground"
    />
  ),
  a: (props) => <a {...props} className="text-primary underline underline-offset-4" />,
  code: (props) => (
    <code
      {...props}
      className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
    />
  ),
  pre: (props) => (
    <pre
      {...props}
      className="mt-3 overflow-x-auto rounded-lg border bg-card p-4 text-sm [&_code]:bg-transparent [&_code]:p-0"
    />
  ),
  table: (props) => (
    <div className="mt-4 overflow-x-auto rounded-lg border">
      <table {...props} className="w-full border-collapse text-left text-sm" />
    </div>
  ),
  th: (props) => (
    <th
      {...props}
      className="border-b bg-muted/50 px-4 py-2 font-medium whitespace-nowrap"
    />
  ),
  td: (props) => (
    <td {...props} className="border-b px-4 py-2 align-top text-muted-foreground" />
  ),
};
