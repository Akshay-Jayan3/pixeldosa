"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const workflowSectionVariants = cva("mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8", {
  variants: {
    orientation: { horizontal: "space-y-8", vertical: "space-y-6" },
  },
  defaultVariants: { orientation: "horizontal" },
});

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  detail?: React.ReactNode;
}

export interface WorkflowSectionProps extends VariantProps<typeof workflowSectionVariants> {
  title: string;
  description?: string;
  steps: WorkflowStep[];
  className?: string;
}

/** Shows a process one step at a time so visitors can understand how it works. */
export function WorkflowSection({
  title,
  description,
  steps,
  orientation,
  className,
}: WorkflowSectionProps) {
  const [activeId, setActiveId] = React.useState(steps[0]?.id);
  const active = steps.find((step) => step.id === activeId) ?? steps[0];

  return (
    <section className={cn(workflowSectionVariants({ orientation }), className)}>
      <header className="max-w-2xl">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        {description ? <p className="mt-3 text-muted-foreground">{description}</p> : null}
      </header>
      {steps.length ? (
        <div className={cn("grid gap-6", orientation === "horizontal" ? "md:grid-cols-[0.8fr_1.2fr]" : "md:grid-cols-2")}>
          <ol className="space-y-2">
            {steps.map((step, index) => (
              <li key={step.id}>
                <button
                  type="button"
                  aria-pressed={active?.id === step.id}
                  onClick={() => setActiveId(step.id)}
                  className="flex w-full items-start gap-3 rounded-lg border border-border p-4 text-left outline-none hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-pressed:border-primary"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">{index + 1}</span>
                  <span><span className="block font-medium">{step.title}</span><span className="mt-1 block text-sm text-muted-foreground">{step.description}</span></span>
                </button>
              </li>
            ))}
          </ol>
          {active ? (
            <article className="min-h-48 rounded-xl border border-border bg-card p-6 sm:p-8">
              <p className="text-sm font-medium text-primary">Step {steps.findIndex((step) => step.id === active.id) + 1}</p>
              <h3 className="mt-2 text-xl font-semibold">{active.title}</h3>
              <p className="mt-2 text-muted-foreground">{active.description}</p>
              {active.detail ? <div className="mt-5">{active.detail}</div> : null}
            </article>
          ) : null}
        </div>
      ) : <p className="text-sm text-muted-foreground">No steps to show yet.</p>}
    </section>
  );
}

export { workflowSectionVariants };
