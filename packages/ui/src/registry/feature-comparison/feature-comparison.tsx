import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const featureComparisonVariants = cva("mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8", {
  variants: { density: { comfortable: "space-y-6", compact: "space-y-4" } },
  defaultVariants: { density: "comfortable" },
});

export interface ComparisonPlan {
  id: string;
  name: string;
  description?: string;
}

export interface ComparisonFeature {
  id: string;
  label: string;
  values: Record<string, React.ReactNode>;
}

export interface FeatureComparisonProps extends VariantProps<typeof featureComparisonVariants> {
  title: string;
  description?: string;
  plans: ComparisonPlan[];
  features: ComparisonFeature[];
  className?: string;
}

/** Compares a small set of products or plans using named, scannable attributes. */
export function FeatureComparison({ title, description, plans, features, density, className }: FeatureComparisonProps) {
  return (
    <section className={cn(featureComparisonVariants({ density }), className)}>
      <header className="max-w-2xl">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        {description ? <p className="mt-3 text-muted-foreground">{description}</p> : null}
      </header>
      {plans.length ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <caption className="sr-only">{title}</caption>
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="w-1/4 p-4 font-medium">Capability</th>
                {plans.map((plan) => <th scope="col" key={plan.id} className="p-4 font-medium">{plan.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature.id} className="border-t border-border">
                  <th scope="row" className="p-4 font-medium">{feature.label}</th>
                  {plans.map((plan) => <td key={plan.id} className="p-4 text-muted-foreground">{feature.values[plan.id] ?? "—"}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="text-sm text-muted-foreground">Add plans and features to compare.</p>}
    </section>
  );
}

export { featureComparisonVariants };
