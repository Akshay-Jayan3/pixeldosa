import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { Button } from "@pixeldosa/ui";

import { CodeBlock } from "@/components/code-block";
import { CopyIconButton } from "@/components/copy-icon-button";
import { CopyMarkdownButton } from "@/components/copy-markdown-button";
import { demoExamples } from "@/components/registry-demos";
import { buildComponentMarkdown, getComponentDoc } from "@/lib/docs";
import {
  getAdjacentComponents,
  getComponentSource,
  getComponents,
  getExampleSource,
  getRegistryItem,
  installCommand,
  type RegistryItem,
} from "@/lib/registry";
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

  if (!item || item.type !== "registry:ui") notFound();

  const source = getComponentSource(name);
  const { prev, next } = getAdjacentComponents(name);
  const markdown = buildComponentMarkdown(item, doc);
  const examples = demoExamples[name] ?? [];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-full border px-2.5 py-0.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {item.meta?.pillar ?? "core"}
        </span>
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

      {/* 1. Example grid — each tile links to its own preview + code + doc page */}
      {examples.length > 0 ? (
        <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {examples.map((example) => {
            const exampleSource = getExampleSource(name, example.slug);
            const Render = example.render;

            return (
              <Link
                key={example.slug}
                href={`/docs/components/${name}/${example.slug}`}
                className="group block rounded-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
              >
                <div className="overflow-hidden rounded-xl border bg-card transition-colors duration-[var(--pd-duration-instant)] group-hover:border-border/80">
                  <div className="flex min-h-56 items-center justify-center overflow-hidden p-8">
                    <Render />
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
                    <span className="text-sm text-muted-foreground">{example.title}</span>
                    <div className="flex items-center gap-2">
                      {exampleSource ? <CopyIconButton text={exampleSource} /> : null}
                      <span className="inline-flex items-center rounded-md border border-input px-2.5 py-1 text-xs font-medium transition-colors duration-[var(--pd-duration-instant)] group-hover:bg-accent group-hover:text-accent-foreground">
                        View code
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      ) : null}

      <article className="mt-10 max-w-3xl">
        {/* 2. Install */}
        <section>
          <h2 className="text-xl font-medium tracking-tight">Installation</h2>
          <div className="mt-3">
            <CodeBlock code={installCommand(item.name)} language="bash" />
          </div>
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
            <h2 className="text-xl font-medium tracking-tight">Engineering Notes</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
              {item.meta.engineeringNotes}
            </p>
          </section>
        ) : null}

        {/* 6. Motion Notes */}
        {item.meta?.motionNotes ? (
          <section className="mt-4 rounded-xl border-l-2 border-l-accent-foreground/40 bg-card p-6">
            <h2 className="text-xl font-medium tracking-tight">Motion Notes</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
              {item.meta.motionNotes}
            </p>
          </section>
        ) : null}

        {source ? (
          <section className="mt-12">
            <h2 className="text-xl font-medium tracking-tight">Source</h2>
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
  );
}
