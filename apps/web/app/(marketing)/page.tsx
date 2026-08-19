import Link from "next/link";

import { Button } from "@pixeldosa/ui";

import { ComponentPreview } from "@/components/component-preview";
import { PILLARS, getComponentsByPillar } from "@/lib/registry";

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b">
        <div aria-hidden="true" className="pd-grid absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Core · AI · Motion
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Production-ready components, crafted by a Design Engineer.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground text-pretty">
            For developers who want beautiful, accessible interfaces — and for AI agents that
            need to build them correctly. Every component ships with its engineering
            reasoning attached, not just its markup.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/docs">Read the docs</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/docs/components">Browse components</Link>
            </Button>
          </div>
          <p className="mt-6 font-mono text-sm text-muted-foreground">
            npx shadcn@latest add @pixeldosa/button
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Three pillars, one system
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {PILLARS.map((pillar) => {
            const count = getComponentsByPillar(pillar.id).length;
            return (
              <div key={pillar.id} className="rounded-xl border bg-card p-6">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-medium">{pillar.label}</h3>
                  <span className="font-mono text-xs text-muted-foreground">
                    {count} shipped
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground text-pretty">{pillar.blurb}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Reference implementation
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Button is the component the whole pipeline was built against — source, registry
          item, docs page and live preview all resolve to the same file.
        </p>
        <div className="mt-6">
          <ComponentPreview name="button" />
        </div>
      </section>
    </main>
  );
}
