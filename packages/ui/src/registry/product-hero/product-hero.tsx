import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const productHeroVariants = cva(
  "mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:gap-16 lg:px-8 lg:py-24",
  {
    variants: {
      variant: {
        centered: "grid-cols-1 text-center",
        split: "grid-cols-1 md:grid-cols-2",
        showcase: "grid-cols-1 text-center",
        editorial: "grid-cols-1 md:grid-cols-[minmax(0,1.25fr)_minmax(16rem,0.75fr)]",
      },
    },
    defaultVariants: {
      variant: "split",
    },
  }
);

const copyVariants = cva("min-w-0", {
  variants: {
    variant: {
      centered: "mx-auto max-w-3xl",
      split: "max-w-2xl",
      showcase: "mx-auto max-w-4xl",
      editorial: "max-w-3xl",
    },
  },
  defaultVariants: {
    variant: "split",
  },
});

const visualVariants = cva("min-w-0", {
  variants: {
    variant: {
      centered: "mx-auto w-full max-w-5xl",
      split: "w-full",
      showcase: "mx-auto w-full max-w-6xl",
      editorial: "w-full md:pt-8",
    },
  },
  defaultVariants: {
    variant: "split",
  },
});

export interface ProductHeroProps
  extends VariantProps<typeof productHeroVariants> {
  /** Short context line above the headline. */
  eyebrow?: string;
  /** The main value proposition. */
  title: string;
  /** Supporting sentence or paragraph. */
  description?: string;
  /** Primary and secondary actions, supplied by the consuming page. */
  actions?: React.ReactNode;
  /** Product screenshot, illustration, or composed preview. */
  visual?: React.ReactNode;
  /** Heading level in the consuming page's document outline. */
  headingLevel?: 1 | 2 | 3;
  /** Classes applied to the section. */
  className?: string;
}

/**
 * A responsive opening section for a product or marketing page. Choose a
 * composition, then provide the page's message, actions, and product visual.
 */
export function ProductHero({
  eyebrow,
  title,
  description,
  actions,
  visual,
  headingLevel = 1,
  variant = "split",
  className,
}: ProductHeroProps) {
  const titleId = React.useId();
  const Heading = `h${headingLevel}` as const;

  return (
    <section
      data-slot="product-hero"
      data-variant={variant}
      aria-labelledby={titleId}
      className={cn(productHeroVariants({ variant }), className)}
    >
      <div className={copyVariants({ variant })}>
        {eyebrow ? (
          <p className="mb-4 text-sm font-medium text-primary">{eyebrow}</p>
        ) : null}
        <Heading
          id={titleId}
          className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
        >
          {title}
        </Heading>
        {description ? (
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {description}
          </p>
        ) : null}
        {actions ? (
          <div
            className={cn(
              "mt-7 flex flex-wrap items-center gap-3",
              variant === "centered" || variant === "showcase"
                ? "justify-center"
                : "justify-start"
            )}
          >
            {actions}
          </div>
        ) : null}
      </div>

      {visual ? (
        <div className={visualVariants({ variant })}>{visual}</div>
      ) : null}
    </section>
  );
}

export { productHeroVariants };
