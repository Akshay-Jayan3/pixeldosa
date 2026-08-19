import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "group flex overflow-hidden rounded-xl border border-border bg-card text-card-foreground",
  {
    variants: {
      /**
       * `horizontal` gives Card exactly two flex-row children: a `CardImage` and
       * one content column. Header/content/footer parts still stack vertically in
       * that case, but Card does not auto-wrap them — group them in your own
       * `<div className="flex flex-col">` alongside the image, the same way you'd
       * arrange any two-column layout. Card intentionally does not inspect or
       * rearrange its children to do this for you.
       */
      orientation: {
        vertical: "flex-col gap-6 py-6",
        horizontal: "flex-row items-stretch gap-0",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
);

export interface CardProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof cardVariants> {}

/**
 * Bordered content container with optional header/content/footer/image regions.
 * Depth comes from the 1px border token, not a shadow — matches the system's
 * dark-mode-first "borders over shadows" decision so cards read the same weight
 * in both themes.
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, orientation, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      data-slot="card"
      data-orientation={orientation ?? "vertical"}
      className={cn(cardVariants({ orientation }), className)}
      {...props}
    />
  );
});

const CardHeader = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="card-header"
        className={cn(
          "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6",
          "has-[[data-slot=card-action]]:grid-cols-[1fr_auto]",
          className
        )}
        {...props}
      />
    );
  }
);

/**
 * Renders a `div`, not a heading element — matches the wider shadcn/ui convention so
 * this drops into an existing project looking identical to the Card a developer
 * already knows. If the card participates in the page's document outline, render a
 * real heading element as its child instead of relying on this element for semantics.
 */
const CardTitle = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  function CardTitle({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="card-title"
        className={cn("font-semibold leading-none", className)}
        {...props}
      />
    );
  }
);

const CardDescription = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  function CardDescription({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="card-description"
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    );
  }
);

/** Self-aligns to the header's top-right — a menu trigger, a badge, a timestamp. */
const CardAction = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  function CardAction({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="card-action"
        className={cn(
          "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
          className
        )}
        {...props}
      />
    );
  }
);

const CardContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  function CardContent({ className, ...props }, ref) {
    return (
      <div ref={ref} data-slot="card-content" className={cn("px-6", className)} {...props} />
    );
  }
);

const CardFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="card-footer"
        className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
        {...props}
      />
    );
  }
);

/**
 * Full-bleed media region. Reads the parent Card's `data-orientation` through the
 * `group` class Card carries, so the same element is a top-rounded banner in the
 * default vertical layout and a fixed-width, left-rounded side panel in horizontal
 * layout — one image component covers both, no separate variant to import.
 */
const CardImage = React.forwardRef<HTMLImageElement, React.ComponentPropsWithoutRef<"img">>(
  function CardImage({ className, ...props }, ref) {
    return (
      <img
        ref={ref}
        data-slot="card-image"
        className={cn(
          "-mt-6 aspect-[4/3] w-full shrink-0 rounded-t-xl object-cover",
          "group-data-[orientation=horizontal]:mt-0 group-data-[orientation=horizontal]:h-auto",
          "group-data-[orientation=horizontal]:w-40 group-data-[orientation=horizontal]:rounded-t-none",
          "group-data-[orientation=horizontal]:rounded-l-xl",
          className
        )}
        {...props}
      />
    );
  }
);

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
  CardImage,
  cardVariants,
};
