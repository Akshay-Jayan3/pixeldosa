import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent } from "@pixeldosa/ui";

import { ComponentPreview } from "@/components/component-preview";
import { PILLARS, getComponentsByPillar } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Components",
  description: "Every PixelDosa component, browsable with a live preview.",
};

export default function ComponentsIndexPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-semibold tracking-tight">Components</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
        Every shipped component, with its real preview. Click through for the full page —
        install command, usage, props and engineering notes.
      </p>

      {PILLARS.map((pillar) => {
        const items = getComponentsByPillar(pillar.id);
        if (items.length === 0) return null;

        return (
          <section key={pillar.id} className="mt-12">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {pillar.label}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {items.map((item) => (
                <Link
                  key={item.name}
                  href={`/docs/components/${item.name}`}
                  className="group rounded-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
                >
                  <Card className="h-full transition-colors duration-[var(--pd-duration-instant)] group-hover:bg-accent/30">
                    <CardContent className="flex flex-col gap-4">
                      <div className="max-h-56 overflow-hidden rounded-lg">
                        <ComponentPreview name={item.name} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
