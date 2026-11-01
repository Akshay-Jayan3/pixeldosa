import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const conversionCtaVariants = cva("mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8", {
  variants: { alignment: { left: "text-left", center: "text-center" } },
  defaultVariants: { alignment: "left" },
});

export interface ConversionCtaProps extends VariantProps<typeof conversionCtaVariants> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  note?: string;
  className?: string;
}

/** Closes a page with one clear next step and optional reassurance. */
export function ConversionCTA({ title, description, actions, note, alignment, className }: ConversionCtaProps) {
  return (
    <section className={cn(conversionCtaVariants({ alignment }), className)}>
      <div className="rounded-xl border border-border bg-muted/40 p-6 sm:p-10">
        <div className={cn(alignment === "center" ? "mx-auto max-w-2xl" : "max-w-2xl")}>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          {description ? <p className="mt-3 text-pretty text-muted-foreground">{description}</p> : null}
          {actions ? <div className={cn("mt-6 flex flex-wrap gap-3", alignment === "center" ? "justify-center" : "justify-start")}>{actions}</div> : null}
          {note ? <p className="mt-4 text-sm text-muted-foreground">{note}</p> : null}
        </div>
      </div>
    </section>
  );
}

export { conversionCtaVariants };
