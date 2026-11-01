"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const splitButtonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium",
    "outline-none focus-visible:z-10 focus-visible:ring-[3px] focus-visible:ring-ring/40",
    "disabled:pointer-events-none disabled:opacity-50",
    "transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)]",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-11 px-5 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface SplitButtonItem {
  /** Visible action name and accessible name for this menu item. */
  label: string;
  /** Action to run when the menu item is selected. */
  onClick: () => void;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Prevents this action while leaving it in the menu. */
  disabled?: boolean;
  /** Add a separator immediately before this item. */
  separator?: boolean;
}

export interface SplitButtonProps
  extends Omit<
      React.ComponentPropsWithoutRef<"button">,
      "children" | "className" | "onClick" | "type"
    >,
    VariantProps<typeof splitButtonVariants> {
  /** Label for the always-visible primary action. */
  label: string;
  /** Action to run when the primary segment is activated. */
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  /** Additional actions shown in the menu segment. */
  items: SplitButtonItem[];
  /** Disable both segments. */
  disabled?: boolean;
  /** Keep the primary action mounted and announce that it is busy. */
  loading?: boolean;
  /** Side of the trigger on which the menu opens. */
  menuPlacement?: "bottom" | "top";
  /** Classes applied to the two-button group. */
  className?: string;
  /** Native button type for the primary action. */
  type?: "button" | "submit" | "reset";
}

/**
 * A primary action paired with a menu of related alternatives. Use it when one
 * action should stay immediately available and less common choices belong in a
 * menu; use an Action Menu when there is no primary action.
 */
export function SplitButton({
  label,
  onClick,
  items,
  variant,
  size,
  disabled = false,
  loading = false,
  menuPlacement = "bottom",
  className,
  type = "button",
  ...buttonProps
}: SplitButtonProps) {
  const isDisabled = disabled || loading;
  const classes = splitButtonVariants({ variant, size });

  return (
    <div
      role="group"
      aria-label={`${label} actions`}
      className={cn("relative inline-flex", className)}
    >
      <button
        {...buttonProps}
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(classes, "rounded-l-md rounded-r-none", {
          "gap-2": loading,
        })}
      >
        {loading ? <LoadingIndicator /> : null}
        {label}
      </button>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            disabled={isDisabled}
            aria-label="More actions"
            className={cn(
              classes,
              "rounded-l-none rounded-r-md border-l border-border/50 px-2 focus-visible:border-ring"
            )}
          >
            <ChevronDownIcon />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            side={menuPlacement}
            sideOffset={4}
            className="z-50 min-w-48 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
          >
            {items.map((item, index) => (
              <React.Fragment key={`${item.label}-${index}`}>
                {item.separator ? (
                  <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-border" />
                ) : null}
                <DropdownMenu.Item
                  disabled={isDisabled || item.disabled}
                  onSelect={item.onClick}
                  className={cn(
                    "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                    "focus:bg-accent focus:text-accent-foreground",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  )}
                >
                  {item.icon ? (
                    <span className="flex size-4 shrink-0 items-center justify-center">
                      {item.icon}
                    </span>
                  ) : null}
                  {item.label}
                </DropdownMenu.Item>
              </React.Fragment>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="size-4"
      aria-hidden="true"
    >
      <path
        d="m5 7.5 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LoadingIndicator() {
  return (
    <>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-4 animate-spin motion-reduce:animate-none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="3"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">Loading</span>
    </>
  );
}

export { splitButtonVariants };
