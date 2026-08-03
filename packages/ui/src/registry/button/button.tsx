"use client";

import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap",
    "rounded-md text-sm font-medium",
    "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:border-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
    // Duration and easing come from the generated motion-token custom properties
    // rather than Tailwind's numeric scale, so the press feedback stays in step
    // with every other transition in the system.
    "transition-[color,background-color,border-color,box-shadow,transform]",
    "duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)]",
    "active:scale-[0.98]",
    // Reduced-motion fallback: the scale cue is dropped, but the colour and ring
    // state changes remain, so pressed state is still communicated.
    "motion-reduce:transition-none motion-reduce:active:scale-100",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline active:scale-100",
      },
      size: {
        sm: "h-8 px-3 has-[>svg]:px-2.5",
        default: "h-9 px-4 has-[>svg]:px-3",
        lg: "h-11 px-6 text-base has-[>svg]:px-5",
        icon: "size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
  /**
   * Render the child element instead of a `<button>`, forwarding all styling and
   * behaviour onto it. Use for links that should look like buttons.
   */
  asChild?: boolean;
  /**
   * Show a busy indicator and block interaction. The button stays in the tab
   * order and is announced as busy rather than being removed from it.
   */
  loading?: boolean;
  /** Accessible label announced while `loading` is true. */
  loadingLabel?: string;
}

/**
 * The primary action trigger. Renders a native `<button>` by default, or any
 * element via `asChild`, with variant/size styling driven by CVA and colours
 * sourced entirely from PixelDosa theme tokens.
 *
 * Use for actions; use an anchor (optionally `asChild`) for navigation.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    loadingLabel = "Loading",
    disabled,
    children,
    ...props
  },
  ref
) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      data-slot="button"
      data-loading={loading || undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={asChild ? undefined : disabled || loading}
      aria-disabled={asChild && (disabled || loading) ? true : undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner label={loadingLabel} /> : null}
      {/* Slottable keeps `asChild` working while the spinner sits beside the
          children: without it, Slot sees two children and throws. */}
      <Slottable>{children}</Slottable>
    </Comp>
  );
});

function Spinner({ label }: { label: string }) {
  return (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="size-4 animate-spin"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </>
  );
}

export { Button, buttonVariants };
