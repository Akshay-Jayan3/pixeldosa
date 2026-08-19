import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@pixeldosa/ui";

import { CodeBlock } from "@/components/code-block";
import { demoExamples } from "@/components/registry-demos";
import { getComponents, getExampleSource, getRegistryItem, installCommand } from "@/lib/registry";

type Params = { params: Promise<{ name: string; example: string }> };

export function generateStaticParams() {
  return getComponents().flatMap((item) =>
    (demoExamples[item.name] ?? []).map((example) => ({ name: item.name, example: example.slug }))
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { name, example: slug } = await params;
  const item = getRegistryItem(name);
  const example = demoExamples[name]?.find((candidate) => candidate.slug === slug);
  if (!item || !example) return {};

  return { title: `${example.title} — ${item.title}`, description: example.description };
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M19 12H5m0 0 7-7m-7 7 7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function ExampleDocPage({ params }: Params) {
  const { name, example: slug } = await params;
  const item = getRegistryItem(name);
  const examples = demoExamples[name] ?? [];
  const index = examples.findIndex((candidate) => candidate.slug === slug);

  if (!item || item.type !== "registry:ui" || index === -1) notFound();

  const example = examples[index]!;
  const source = getExampleSource(name, slug);
  const Render = example.render;
  const prev = index > 0 ? examples[index - 1] : null;
  const next = index < examples.length - 1 ? examples[index + 1] : null;

  return (
    <div className="mx-auto max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={`/docs/components/${name}`}>
          <ArrowIcon />
          {item.title}
        </Link>
      </Button>

      <span className="mt-4 block w-fit rounded-full border px-2.5 py-0.5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {item.meta?.pillar ?? "core"}
      </span>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{example.title}</h1>
      <p className="mt-3 max-w-xl text-muted-foreground text-pretty">{example.description}</p>

      <section className="mt-8 flex min-h-72 items-center justify-center rounded-xl border bg-card p-8">
        <Render />
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-medium tracking-tight">Install</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This example composes <code className="font-mono">{item.title}</code> — install the
          primitive, then copy the example below.
        </p>
        <div className="mt-3">
          <CodeBlock code={installCommand(name)} language="bash" />
        </div>
      </section>

      {source ? (
        <section className="mt-10">
          <h2 className="text-xl font-medium tracking-tight">Code</h2>
          <div className="mt-3">
            <CodeBlock code={source} language="tsx" />
          </div>
        </section>
      ) : null}

      {prev || next ? (
        <div className="mt-12 flex items-center justify-between border-t pt-6">
          {prev ? (
            <Button asChild variant="ghost">
              <Link href={`/docs/components/${name}/${prev.slug}`}>← {prev.title}</Link>
            </Button>
          ) : (
            <span />
          )}
          {next ? (
            <Button asChild variant="ghost">
              <Link href={`/docs/components/${name}/${next.slug}`}>{next.title} →</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
