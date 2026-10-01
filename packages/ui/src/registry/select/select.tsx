"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";

import { cn } from "@/lib/utils";

export interface SelectOption {
  /** What `onValueChange` receives and `value` is matched against. Must not be empty. */
  value: string;
  /** What the list and the trigger show. Defaults to `value`. */
  label?: string;
  /** Listed, but can't be picked. */
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "value" | "defaultValue" | "onChange" | "children" | "prefix"> {
  /** The choices: plain strings, or `{ value, label }` when what's shown differs from what's stored. */
  options: (string | SelectOption)[];
  /** The selected value, when the caller owns the state. */
  value?: string;
  /** The starting value, when the component owns the state. */
  defaultValue?: string;
  /** Called with the value a person picks. */
  onValueChange?: (value: string) => void;
  /** Shown, muted, while nothing is selected. */
  placeholder?: string;
  /** `field` sits in a form beside inputs; `pill` is a compact chip for toolbars and composers. */
  variant?: "field" | "pill";
  /** Height of the `field` variant: `default` matches Field inputs, `sm` matches 32px controls. */
  size?: "sm" | "default";
  /**
   * Text before the value inside the trigger, such as `Tone:`. Visual only and hidden from
   * screen readers, so name the control with `aria-label` or a label.
   */
  prefix?: string;
  /** Submits the value with a form under this name. */
  name?: string;
  /** The form won't submit until something is picked. */
  required?: boolean;
}

const normalize = (option: string | SelectOption): SelectOption =>
  typeof option === "string" ? { value: option } : option;

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-3.5 shrink-0 select-none", className)}
    >
      <path d="m4.5 6.5 3.5 3.5 3.5-3.5" />
    </svg>
  );
}

/**
 * A choice from a short, known list, drawn by the system rather than the platform.
 *
 * Built on Radix Select, which keeps what a native `<select>` gave: keyboard opening and
 * arrow navigation, typeahead, focus returned to the trigger, the listbox semantics screen
 * readers expect, and a hidden native select when `name` is set so forms still submit.
 * What it adds is the part the platform never matched: the open list is the system's own
 * popover surface, in both themes, instead of an OS menu in the OS's colours and fonts.
 */
const Select = React.forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    options,
    value,
    defaultValue,
    onValueChange,
    placeholder,
    variant = "field",
    size = "default",
    prefix,
    name,
    required,
    disabled,
    className,
    ...props
  },
  ref
) {
  const items = options.map(normalize);
  const pill = variant === "pill";

  return (
    <SelectPrimitive.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
      required={required}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
          "relative inline-flex min-w-0 max-w-full items-center gap-1 whitespace-nowrap border border-input outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
          pill
            ? // A 32px chip whose hit area reaches 44px vertically. Pills sit in a row, so
              // stretching up and down can't overlap a neighbour; stacked fields could.
              "h-8 rounded-full pl-2.5 pr-2 text-xs text-muted-foreground after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-[''] hover:text-foreground"
            : cn(
                "justify-between gap-2 rounded-md bg-transparent text-sm text-foreground hover:bg-accent/40 aria-invalid:border-destructive data-placeholder:text-muted-foreground",
                size === "sm" ? "h-8 pl-2.5 pr-2" : "h-9 pl-3 pr-2.5"
              ),
          className
        )}
        {...props}
      >
        {prefix ? <span aria-hidden="true">{prefix}</span> : null}
        <span data-select-value="" className={cn("min-w-0 truncate", pill && "text-foreground")}>
          <SelectPrimitive.Value placeholder={placeholder} />
        </span>
        <SelectPrimitive.Icon className="flex shrink-0 text-muted-foreground">
          <Chevron className={cn(pill && "size-3")} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={8}
          // Grows out of its trigger: the origin comes from Radix, which knows which side
          // the list opened on. A quick fade-in is the only motion; it opens because the
          // person asked, and holds still from then on.
          className="relative z-50 flex max-h-[min(var(--radix-select-content-available-height),20rem)] min-w-[var(--radix-select-trigger-width)] origin-[var(--radix-select-content-transform-origin)] flex-col overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md transition-[opacity,scale] duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-decelerate)] starting:scale-98 starting:opacity-0 motion-reduce:transition-none"
        >
          <SelectPrimitive.ScrollUpButton className="flex h-6 shrink-0 cursor-default items-center justify-center text-muted-foreground">
            <Chevron className="rotate-180" />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="p-1">
            {items.map((item) => (
              <SelectPrimitive.Item
                key={item.value}
                value={item.value}
                disabled={item.disabled}
                // 32px rows for a mouse, 44px on touch screens.
                className="relative flex min-h-8 w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none pointer-coarse:min-h-11 data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground"
              >
                <SelectPrimitive.ItemText>{item.label ?? item.value}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2 flex items-center">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3.5 select-none"
                  >
                    <path d="m3.5 8.5 3 3 6-7" />
                  </svg>
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex h-6 shrink-0 cursor-default items-center justify-center text-muted-foreground">
            <Chevron />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
});

export { Select };
