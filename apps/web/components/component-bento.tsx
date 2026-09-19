import Link from "next/link";

import { ComponentThumbnail } from "@/components/component-thumbnail";
import { getRegistryItem } from "@/lib/registry";

const FEATURED = [
  { name: "intent-preview", className: "md:col-span-2" },
  { name: "agent-plan", className: "" },
  { name: "agent-presence", className: "" },
  { name: "reasoning-stream", className: "md:col-span-2" },
] as const;

function BentoCard({ name, className }: { name: string; className: string }) {
  const title = getRegistryItem(name)?.title ?? name;
  return (
    <Link
      href={`/docs/components/${name}`}
      className={`group flex h-72 flex-col overflow-hidden rounded-xl border bg-card outline-none transition-colors hover:border-foreground/30 focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:h-80 ${className}`}
    >
      <ComponentThumbnail name={name} eager className="min-h-0 flex-1 aspect-auto" />
      <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <span
          aria-hidden="true"
          className="text-sm text-muted-foreground transition-transform duration-[var(--pd-duration-fast)] group-hover:translate-x-0.5 group-hover:text-foreground"
        >
          ↗
        </span>
      </div>
    </Link>
  );
}

export function ComponentBento() {
  return (
    <section aria-labelledby="showcase-title" className="border-b py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">The component system</p>
            <h2 id="showcase-title" className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Every moment has a component.
            </h2>
          </div>
          <Link href="/docs/components" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Browse all components →
          </Link>
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          Before it runs, while it works, and when you review. A focused set of pieces for interfaces people can read and steer.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3" aria-label="Featured components">
          {FEATURED.map((item) => (
            <BentoCard key={item.name} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}