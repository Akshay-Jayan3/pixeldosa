"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const customerProofVariants = cva("mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8", {
  variants: { emphasis: { quote: "text-left", metric: "text-center" } },
  defaultVariants: { emphasis: "quote" },
});

export interface CustomerStory {
  id: string;
  quote: string;
  author: string;
  role?: string;
  company?: string;
  metric?: string;
  metricLabel?: string;
}

export interface CustomerProofProps extends VariantProps<typeof customerProofVariants> {
  title?: string;
  stories: CustomerStory[];
  className?: string;
}

/** Presents attributed customer evidence with optional results and simple navigation. */
export function CustomerProof({ title, stories, emphasis, className }: CustomerProofProps) {
  const [index, setIndex] = React.useState(0);
  const story = stories[index];
  const move = (offset: number) => setIndex((current) => (current + offset + stories.length) % stories.length);

  return (
    <section className={cn(customerProofVariants({ emphasis }), className)}>
      {title ? <h2 className="mb-6 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2> : null}
      {story ? (
        <figure className="rounded-xl border border-border bg-card p-6 sm:p-10">
          {story.metric ? <p className="text-4xl font-semibold tracking-tight text-primary">{story.metric}<span className="sr-only"> {story.metricLabel}</span></p> : null}
          <blockquote className="mt-4 text-pretty text-xl leading-8 sm:text-2xl">“{story.quote}”</blockquote>
          <figcaption className="mt-6 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{story.author}</span>
            {story.role ? ` · ${story.role}` : ""}
            {story.company ? ` · ${story.company}` : ""}
            {story.metricLabel ? <span className="block mt-1">{story.metricLabel}</span> : null}
          </figcaption>
          {stories.length > 1 ? (
            <div className="mt-6 flex items-center gap-2">
              <button type="button" onClick={() => move(-1)} aria-label="Previous customer story" className="rounded-md border px-3 py-2 text-sm outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40">Previous</button>
              <button type="button" onClick={() => move(1)} aria-label="Next customer story" className="rounded-md border px-3 py-2 text-sm outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/40">Next</button>
              <span className="ml-auto text-sm text-muted-foreground" aria-live="polite">{index + 1} of {stories.length}</span>
            </div>
          ) : null}
        </figure>
      ) : <p className="text-sm text-muted-foreground">Customer stories will appear here.</p>}
    </section>
  );
}

export { customerProofVariants };
