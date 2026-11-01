import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const faqSectionVariants = cva("mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[minmax(12rem,0.7fr)_minmax(0,1.3fr)] lg:px-8", {
  variants: { density: { comfortable: "md:gap-16", compact: "md:gap-8" } },
  defaultVariants: { density: "comfortable" },
});

export interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

export interface FaqSectionProps extends VariantProps<typeof faqSectionVariants> {
  title: string;
  description?: string;
  items: FAQItem[];
  className?: string;
}

/** Answers common purchase questions with native, keyboard-operable disclosures. */
export function FAQSection({ title, description, items, density, className }: FaqSectionProps) {
  return (
    <section className={cn(faqSectionVariants({ density }), className)}>
      <header><h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>{description ? <p className="mt-3 text-muted-foreground">{description}</p> : null}</header>
      <div className="divide-y divide-border border-y border-border">
        {items.map((item) => (
          <details key={item.id} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 [&::-webkit-details-marker]:hidden">
              {item.question}
              <span aria-hidden="true" className="text-muted-foreground transition-transform group-open:rotate-45 motion-reduce:transition-none">+</span>
            </summary>
            <div className="pt-3 pr-7 text-sm leading-6 text-muted-foreground">{item.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

export { faqSectionVariants };
