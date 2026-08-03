import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { CodeBlock } from "@/components/code-block";
import { ComponentPreview } from "@/components/component-preview";
import { getComponentDoc } from "@/lib/docs";
import {
  getComponentSource,
  getComponents,
  getRegistryItem,
  installCommand,
} from "@/lib/registry";
import { mdxComponents } from "@/components/mdx-components";

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

  return (
    <article className="max-w-3xl">
      <div className="flex items-center gap-2">
        <span className="rounded-full border px-2.5 py-0.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {item.meta?.pillar ?? "core"}
        </span>
      </div>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{item.title}</h1>
      <p className="mt-3 text-muted-foreground text-pretty">
        {doc?.frontmatter.description || item.description}
      </p>

      {/* 1. Live preview — rendered from the component's real .demo.tsx */}
      <section className="mt-8">
        <ComponentPreview name={item.name} />
      </section>

      {/* 2. Install */}
      <section className="mt-10">
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
  );
}
