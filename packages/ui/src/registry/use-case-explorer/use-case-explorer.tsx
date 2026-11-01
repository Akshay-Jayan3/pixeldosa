"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const useCaseExplorerVariants = cva("mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8", {
  variants: { layout: { cards: "space-y-7", compact: "space-y-5" } },
  defaultVariants: { layout: "cards" },
});

export interface UseCase {
  id: string;
  label: string;
  title: string;
  description: string;
  outcomes: string[];
}

export interface UseCaseExplorerProps extends VariantProps<typeof useCaseExplorerVariants> {
  title: string;
  cases: UseCase[];
  className?: string;
}

/** Lets visitors choose a role or scenario and see the relevant product benefits. */
export function UseCaseExplorer({ title, cases, layout, className }: UseCaseExplorerProps) {
  const [selectedId, setSelectedId] = React.useState(cases[0]?.id);
  const selected = cases.find((useCase) => useCase.id === selectedId) ?? cases[0];

  return (
    <section className={cn(useCaseExplorerVariants({ layout }), className)}>
      <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {cases.length ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a use case">
            {cases.map((useCase) => (
              <button
                key={useCase.id}
                type="button"
                aria-pressed={selected?.id === useCase.id}
                onClick={() => setSelectedId(useCase.id)}
                className="rounded-full border border-input px-4 py-2 text-sm outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-pressed:border-primary aria-pressed:bg-primary/5"
              >
                {useCase.label}
              </button>
            ))}
          </div>
          {selected ? (
            <article className="grid gap-6 rounded-xl border border-border bg-card p-6 md:grid-cols-2 sm:p-8">
              <div><h3 className="text-xl font-semibold">{selected.title}</h3><p className="mt-2 text-muted-foreground">{selected.description}</p></div>
              <ul className="space-y-3">{selected.outcomes.map((outcome) => <li key={outcome} className="flex gap-3 text-sm"><span aria-hidden="true" className="text-primary">✓</span><span>{outcome}</span></li>)}</ul>
            </article>
          ) : null}
        </div>
      ) : <p className="text-sm text-muted-foreground">No use cases to show yet.</p>}
    </section>
  );
}

export { useCaseExplorerVariants };
