import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { Button } from "@pixeldosa/ui";

import { CodeBlock } from "@/components/code-block";
import { CopyMarkdownButton } from "@/components/copy-markdown-button";
import { ExamplePreview } from "@/components/example-preview";
import { TableOfContents } from "@/components/table-of-contents";
import { demoExamples } from "@/components/registry-demos";
import { buildComponentMarkdown, getComponentDoc } from "@/lib/docs";
import {
  DOCUMENTED_TYPES,
  getAdjacentComponents,
  getComponentSource,
  getComponents,
  getExampleExtras,
  getExampleSource,
  getRegistryItem,
  installCommand,
  type RegistryItem,
} from "@/lib/registry";
import { extractHeadings, type TocHeading } from "@/lib/toc";
import { mdxComponents } from "@/components/mdx-components";

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
      <path
        d={direction === "left" ? "M19 12H5m0 0 7-7m-7 7 7 7" : "M5 12h14m0 0-7-7m7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Steps to the neighbouring component in the sidebar's title-sorted order. */
function NavArrow({ item, direction }: { item: RegistryItem | null; direction: "left" | "right" }) {
  const label = direction === "left" ? "Previous component" : "Next component";

  if (!item) {
    return (
      <Button variant="ghost" size="icon" disabled aria-label={label}>
        <ArrowIcon direction={direction} />
      </Button>
    );
  }

  return (
    <Button asChild variant="ghost" size="icon" aria-label={`${label}: ${item.title}`}>
      <Link href={`/docs/components/${item.name}`}>
        <ArrowIcon direction={direction} />
      </Link>
    </Button>
  );
}

type Params = { params: Promise<{ name: string }> };

export function generateStaticParams() {
  return getComponents().map((item) => ({ name: item.name }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { name } = await params;
  const item = getRegistryItem(name);
  if (!item) return {};

  return { title: item.title, description: item.description };
}

export default async function ComponentDocPage({ params }: Params) {
  const { name } = await params;
  const item = getRegistryItem(name);
  const doc = getComponentDoc(name);

  if (!item || !DOCUMENTED_TYPES.includes(item.type)) notFound();

  const source = getComponentSource(name);
  const { prev, next } = getAdjacentComponents(name);
  const markdown = buildComponentMarkdown(item, doc);
  const examples = demoExamples[name] ?? [];
  const exampleExtras = [...new Set(examples.flatMap((example) => getExampleExtras(name, example.slug)))].sort();

  const headings: TocHeading[] = [
    { id: "installation", text: "Installation", level: 2 },
    ...(doc ? extractHeadings(doc.body) : []),
    ...(item.meta?.engineeringNotes
      ? [{ id: "engineering-notes", text: "Engineering Notes", level: 2 as const }]
      : []),
    ...(item.meta?.motionNotes ? [{ id: "motion-notes", text: "Motion Notes", level: 2 as const }] : []),
    ...(source ? [{ id: "source", text: "Source", level: 2 as const }] : []),
  ];

  return (
    <div className="mx-auto flex max-w-6xl gap-10">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/docs/components">Components</Link>
          </Button>
          <div className="flex items-center gap-1">
            <NavArrow item={prev} direction="left" />
            <NavArrow item={next} direction="right" />
          </div>
        </div>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{item.title}</h1>
        <p className="mt-3 max-w-xl text-muted-foreground text-pretty">
          {doc?.frontmatter.description || item.description}
        </p>

        <div className="mt-5">
          <CopyMarkdownButton markdown={markdown} />
        </div>

        {/* 1. Examples — inline Preview/Code tabs, no click-through to a second page */}
        {examples.length > 0 ? (
          <section className="mt-8 grid grid-cols-1 gap-6">
            {examples.map((example) => {
              const Render = example.render;
              return (
                <ExamplePreview
                  key={example.slug}
                  title={examples.length > 1 ? example.title : null}
                  preview={<Render />}
                  source={getExampleSource(name, example.slug)}
                />
              );
            })}
          </section>
        ) : null}

        <article className="mt-10 max-w-3xl">
          {/* 2. Install */}
          <section>
            <h2 id="installation" className="scroll-mt-20 text-xl font-medium tracking-tight">
              Installation
            </h2>
            <div className="mt-3">
              <CodeBlock code={installCommand(item.name)} language="bash" />
            </div>
            {exampleExtras.length > 0 ? (
              <div className="mt-4 flex flex-col gap-2">
                <p className="text-sm text-muted-foreground text-pretty">
                  The example above also uses{" "}
                  {exampleExtras.map((extra, index) => (
                    <span key={extra}>
                      {index > 0 ? (index === exampleExtras.length - 1 ? " and " : ", ") : null}
                      <Link href={`/docs/components/${extra}`} className="text-foreground underline underline-offset-4">
                        {getRegistryItem(extra)?.title ?? extra}
                      </Link>
                    </span>
                  ))}
                  . To copy it as-is, install everything it needs:
                </p>
                <CodeBlock code={installCommand([item.name, ...exampleExtras])} language="bash" />
              </div>
            ) : null}
            {item.docs ? (
              <p className="mt-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground text-pretty">
                {item.docs}
              </p>
            ) : null}
          </section>

          {/* 3 + 4. Usage and props, authored in MDX */}
          {doc ? (
            <section className="mt-10">
              <MDXRemote
                source={doc.body}
                components={mdxComponents}
                options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
              />
            </section>
          ) : null}

          {/* 5. Engineering Notes — sourced from meta.engineeringNotes, never retyped */}
          {item.meta?.engineeringNotes ? (
            <section className="mt-12 rounded-xl border-l-2 border-l-primary bg-card p-6">
              <h2 id="engineering-notes" className="scroll-mt-20 text-xl font-medium tracking-tight">
                Engineering Notes
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                {item.meta.engineeringNotes}
              </p>
            </section>
          ) : null}

          {/* 6. Motion Notes */}
          {item.meta?.motionNotes ? (
            <section className="mt-4 rounded-xl border-l-2 border-l-accent-foreground/40 bg-card p-6">
              <h2 id="motion-notes" className="scroll-mt-20 text-xl font-medium tracking-tight">
                Motion Notes
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                {item.meta.motionNotes}
              </p>
            </section>
          ) : null}

          {source ? (
            <section className="mt-12">
              <h2 id="source" className="scroll-mt-20 text-xl font-medium tracking-tight">
                Source
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                The exact file <code className="font-mono">shadcn add</code> writes into your
                project.
              </p>
              <div className="mt-3">
                <CodeBlock code={source} language={`${item.name}.tsx`} collapsible />
              </div>
            </section>
          ) : null}
        </article>
      </div>

      <aside className="hidden w-48 shrink-0 xl:block">
        <div className="sticky top-14 max-h-[calc(100svh-3.5rem)] overflow-y-auto py-10">
          <TableOfContents headings={headings} />
        </div>
      </aside>
    </div>
  );
}
