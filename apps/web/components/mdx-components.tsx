import type { MDXComponents } from "mdx/types";

/**
 * MDX prose styling. Written as an explicit element map rather than a typography
 * plugin so that doc pages and the template-rendered sections (Installation,
 * Engineering Notes) share exactly one set of heading and text styles.
 */
export const mdxComponents: MDXComponents = {
  h2: (props) => <h2 {...props} className="mt-10 text-xl font-medium tracking-tight" />,
  h3: (props) => <h3 {...props} className="mt-8 text-lg font-medium tracking-tight" />,
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
