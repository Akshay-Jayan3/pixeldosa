"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const productSpotlightVariants = cva("mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8", {
  variants: {
    density: {
      comfortable: "space-y-8 sm:space-y-10",
      compact: "space-y-5",
    },
  },
  defaultVariants: { density: "comfortable" },
});

export interface ProductSpotlightItem {
  id: string;
  label: string;
  title: string;
  description: string;
  visual?: React.ReactNode;
}

export interface ProductSpotlightProps extends VariantProps<typeof productSpotlightVariants> {
  eyebrow?: string;
  title: string;
  items: ProductSpotlightItem[];
  className?: string;
}

/** Lets visitors explore product capabilities alongside their live explanation. */
export function ProductSpotlight({
  eyebrow,
  title,
  items,
  density,
  className,
}: ProductSpotlightProps) {
  const [activeId, setActiveId] = React.useState(items[0]?.id);
  const active = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <section className={cn(productSpotlightVariants({ density }), className)}>
      <header className="mx-auto max-w-2xl text-center">
        {eyebrow ? <p className="text-sm font-medium text-primary">{eyebrow}</p> : null}
        <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      </header>
      {items.length ? (
        <div className="grid gap-6 md:grid-cols-[minmax(12rem,0.7fr)_minmax(0,1.3fr)]">
          <div className="flex flex-col gap-2" role="group" aria-label="Product features">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={active?.id === item.id}
                onClick={() => setActiveId(item.id)}
                className="rounded-lg border border-border p-4 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-pressed:border-primary aria-pressed:bg-primary/5"
              >
                <span className="font-medium">{item.label}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{item.description}</span>
              </button>
            ))}
          </div>
          {active ? (
            <article className="rounded-xl border border-border bg-card p-5 sm:p-8">
              <h3 className="text-xl font-semibold">{active.title}</h3>
              <p className="mt-2 max-w-xl text-muted-foreground">{active.description}</p>
              {active.visual ? <div className="mt-6">{active.visual}</div> : null}
            </article>
          ) : null}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">No features to show yet.</p>
      )}
    </section>
  );
}

export { productSpotlightVariants };
