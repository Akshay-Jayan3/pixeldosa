"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const integrationsShowcaseVariants = cva("mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8", {
  variants: { layout: { grid: "space-y-6", compact: "space-y-4" } },
  defaultVariants: { layout: "grid" },
});

export interface Integration {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface IntegrationsShowcaseProps extends VariantProps<typeof integrationsShowcaseVariants> {
  title: string;
  integrations: Integration[];
  className?: string;
}

/** Helps visitors search a product's integrations by name or category. */
export function IntegrationsShowcase({ title, integrations, layout, className }: IntegrationsShowcaseProps) {
  const [query, setQuery] = React.useState("");
  const filtered = integrations.filter((item) => `${item.name} ${item.category} ${item.description ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <section className={cn(integrationsShowcaseVariants({ layout }), className)}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2><p className="mt-2 text-muted-foreground">Find the tools that fit your workflow.</p></div>
        <label className="w-full sm:max-w-xs"><span className="sr-only">Search integrations</span><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search integrations" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40" /></label>
      </header>
      <p className="sr-only" aria-live="polite">{filtered.length} integrations found</p>
      {filtered.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => <li key={item.id} className="rounded-lg border border-border p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-medium">{item.name}</h3><span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{item.category}</span></div>{item.description ? <p className="mt-2 text-sm text-muted-foreground">{item.description}</p> : null}</li>)}
        </ul>
      ) : <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No integrations match “{query}”. Try another name or category.</p>}
    </section>
  );
}

export { integrationsShowcaseVariants };
