"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const pricingSectionVariants = cva("mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8", {
  variants: { columns: { two: "space-y-7", three: "space-y-7" } },
  defaultVariants: { columns: "three" },
});

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  features: string[];
  action: React.ReactNode;
}

export interface PricingSectionProps extends VariantProps<typeof pricingSectionVariants> {
  title: string;
  description?: string;
  plans: PricingPlan[];
  className?: string;
}

/** Compares plans and lets visitors switch between monthly and annual prices. */
export function PricingSection({ title, description, plans, columns, className }: PricingSectionProps) {
  const [annual, setAnnual] = React.useState(false);

  return (
    <section className={cn(pricingSectionVariants({ columns }), className)}>
      <header className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        {description ? <p className="mt-3 text-muted-foreground">{description}</p> : null}
        <div className="mt-5 inline-flex rounded-full border border-border p-1" role="group" aria-label="Billing period">
          <button type="button" aria-pressed={!annual} onClick={() => setAnnual(false)} className="rounded-full px-3 py-1.5 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-pressed:bg-primary aria-pressed:text-primary-foreground">Monthly</button>
          <button type="button" aria-pressed={annual} onClick={() => setAnnual(true)} className="rounded-full px-3 py-1.5 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-pressed:bg-primary aria-pressed:text-primary-foreground">Annual</button>
        </div>
      </header>
      <div className={cn("grid gap-4", columns === "two" ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3")}>
        {plans.map((plan) => (
          <article key={plan.id} className="flex flex-col rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="mt-2 min-h-10 text-sm text-muted-foreground">{plan.description}</p>
            <p className="mt-5 text-3xl font-semibold">{annual ? plan.annualPrice : plan.monthlyPrice}<span className="ml-1 text-sm font-normal text-muted-foreground">/ month</span></p>
            <p className="mt-1 text-xs text-muted-foreground">{annual ? "Billed annually" : "Billed monthly"}</p>
            <ul className="my-6 flex-1 space-y-2 text-sm">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><span aria-hidden="true" className="text-primary">✓</span>{feature}</li>)}</ul>
            <div>{plan.action}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

export { pricingSectionVariants };
