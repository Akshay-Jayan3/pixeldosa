"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Command as CommandPrimitive, useCommandState } from "cmdk";

import { cn } from "@/lib/utils";

export interface CommandMenuProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive>, "onSelect"> {
  /** Controlled open state. There is no uncontrolled fallback — see engineeringNotes. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible dialog name. Not visible; announced once when the menu opens. */
  label?: string;
}

/**
 * Keeps the panel mounted for `exitMs` after `open` goes false, so the CSS exit
 * transition has time to play before the element actually leaves the DOM.
 *
 * Deliberately does not use the shared `overlay` primitive's Motion-driven
 * enter/exit here: `AnimatePresence` has a confirmed upstream bug
 * (motiondivision/motion#3243) where, under certain timing, it never detects that
 * an exiting child's animation finished, so the element (and, worse, its
 * full-viewport scrim) never actually unmounts — silently blocking all further
 * page interaction after the first close. That reproduces in the existing Overlay
 * demo too, in both dev and production builds, so it is not specific to this
 * component. A plain CSS transition driven by a deterministic timer sidesteps the
 * bug entirely; see engineeringNotes for the follow-up to reconcile this with the
 * shared primitive once it is fixed at the source.
 */
function useDelayedUnmount(open: boolean, exitMs: number) {
  const [mounted, setMounted] = React.useState(open);
  const [visible, setVisible] = React.useState(open);

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      // Mount in the closed visual state first, then flip to open on the next
      // frame — changing both in the same commit would skip the CSS transition
      // entirely, since there'd be no "from" state for the browser to animate.
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const timeout = window.setTimeout(() => setMounted(false), exitMs);
    return () => window.clearTimeout(timeout);
  }, [open, exitMs]);

  return { mounted, visible };
}

/**
 * A global, keyboard-first overlay for finding resources and running actions across an
 * app. Composes cmdk for the ARIA combobox contract (input, listbox, roving
 * aria-activedescendant, filtering) under a Radix `Dialog` for focus trapping,
 * portalling and dismiss behaviour, with a fade+scale entrance/exit matching the rest
 * of the system's overlay language.
 *
 * Controlled only: mount `<CommandMenu open onOpenChange>` and toggle `open` from
 * whatever global `⌘K`/`Ctrl+K` listener your app already owns.
 */
const CommandMenu = React.forwardRef<HTMLDivElement, CommandMenuProps>(function CommandMenu(
  { open, onOpenChange, label = "Command Menu", className, children, filter, shouldFilter, loop = true, ...props },
  ref
) {
  const exitMs = 150;
  const { mounted, visible } = useDelayedUnmount(open, exitMs);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {mounted ? (
        <Dialog.Portal forceMount>
          <Dialog.Overlay asChild forceMount>
            <div
              data-state={visible ? "open" : "closed"}
              className={cn(
                "fixed inset-0 z-50 bg-background/70 backdrop-blur-sm",
                "opacity-0 transition-opacity duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)]",
                "data-[state=open]:opacity-100",
                "motion-reduce:transition-none"
              )}
            />
          </Dialog.Overlay>
          <Dialog.Content
            asChild
            forceMount
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <div
              data-state={visible ? "open" : "closed"}
              className={cn(
                "fixed inset-x-3 bottom-3 z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-lg border bg-popover p-0 text-popover-foreground shadow-lg",
                "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2",
                "opacity-0 scale-[0.98] transition-[opacity,scale] duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)]",
                "data-[state=open]:opacity-100 data-[state=open]:scale-100",
                "motion-reduce:transition-none motion-reduce:scale-100",
                className
              )}
            >
              <Dialog.Title className="sr-only">{label}</Dialog.Title>
              <Dialog.Description className="sr-only">
                Type to search, use the arrow keys to move, Enter to select, Escape to
                close.
              </Dialog.Description>
              <CommandPrimitive
                ref={ref}
                label={label}
                filter={filter}
                shouldFilter={shouldFilter}
                loop={loop}
                className="flex min-h-0 flex-1 flex-col"
                onKeyDown={(event) => {
                  // Belt-and-suspenders: cmdk's own keydown handling on this element
                  // stops Escape from reaching Radix's document-level dismissable-layer
                  // listener, so Escape-to-close silently no-ops when cmdk is composed
                  // manually inside Dialog.Content instead of via its own
                  // Command.Dialog wrapper. Handling it explicitly here is more
                  // reliable than fighting cmdk's internal event handling.
                  if (event.key === "Escape") {
                    onOpenChange(false);
                  }
                }}
                {...props}
              >
                {children}
              </CommandPrimitive>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
});

export interface CommandMenuInputProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> {}

const CommandMenuInput = React.forwardRef<HTMLInputElement, CommandMenuInputProps>(
  function CommandMenuInput({ className, ...props }, ref) {
    return (
      <div className="flex shrink-0 items-center border-b px-3">
        <CommandPrimitive.Input
          ref={ref}
          autoFocus
          className={cn(
            "flex h-11 w-full bg-transparent text-sm text-foreground outline-none",
            "placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

/**
 * `aria-live="polite"` region announcing the filtered result count on every query
 * change — required so screen-reader users notice a silent count change, per the
 * Vercel command-menu spec this component's plan was built against. Rendered
 * automatically by `CommandMenuList` rather than left for consumers to wire up.
 */
function CommandMenuResultAnnouncer() {
  const count = useCommandState((state) => state.filtered.count);
  return (
    <span role="status" aria-live="polite" className="sr-only">
      {count} {count === 1 ? "result" : "results"}
    </span>
  );
}

export interface CommandMenuListProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.List> {}

const CommandMenuList = React.forwardRef<HTMLDivElement, CommandMenuListProps>(
  function CommandMenuList({ className, children, ...props }, ref) {
    return (
      <>
        <CommandMenuResultAnnouncer />
        <CommandPrimitive.List
          ref={ref}
          className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5", className)}
          {...props}
        >
          {children}
        </CommandPrimitive.List>
      </>
    );
  }
);

export interface CommandMenuEmptyProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty> {}

const CommandMenuEmpty = React.forwardRef<HTMLDivElement, CommandMenuEmptyProps>(
  function CommandMenuEmpty({ className, ...props }, ref) {
    return (
      <CommandPrimitive.Empty
        ref={ref}
        className={cn("py-8 text-center text-sm text-muted-foreground", className)}
        {...props}
      />
    );
  }
);

export interface CommandMenuGroupProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group> {}

const CommandMenuGroup = React.forwardRef<HTMLDivElement, CommandMenuGroupProps>(
  function CommandMenuGroup({ className, ...props }, ref) {
    return (
      <CommandPrimitive.Group
        ref={ref}
        className={cn(
          "overflow-hidden py-1.5",
          "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1.5",
          "[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
          "[&_[cmdk-group-heading]]:text-muted-foreground",
          className
        )}
        {...props}
      />
    );
  }
);

const CommandMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(function CommandMenuSeparator({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Separator
      ref={ref}
      className={cn("-mx-1.5 my-1.5 h-px bg-border", className)}
      {...props}
    />
  );
});

export interface CommandMenuItemProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>, "onSelect"> {
  onSelect: (value: string) => void;
  /** Leading icon, muted by default so it recedes behind the label. size-4 recommended. */
  icon?: React.ReactNode;
  /**
   * Rendered visibly in the row and, because it stays in the item's text flow rather
   * than an aria-hidden decoration, announced as part of the option's accessible name —
   * satisfying "hotkeys are both visible and announced" without extra ARIA wiring.
   */
  keybind?: string;
}

const CommandMenuItem = React.forwardRef<HTMLDivElement, CommandMenuItemProps>(
  function CommandMenuItem({ className, icon, keybind, children, ...props }, ref) {
    return (
      <CommandPrimitive.Item
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm",
          "text-foreground outline-none",
          "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
          "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
          "transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)]",
          "motion-reduce:transition-none",
          className
        )}
        {...props}
      >
        {icon ? (
          <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4">
            {icon}
          </span>
        ) : null}
        <span className="flex-1 truncate">{children}</span>
        {keybind ? (
          <kbd className="ml-auto shrink-0 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {keybind}
          </kbd>
        ) : null}
      </CommandPrimitive.Item>
    );
  }
);

export {
  CommandMenu,
  CommandMenuInput,
  CommandMenuList,
  CommandMenuEmpty,
  CommandMenuGroup,
  CommandMenuSeparator,
  CommandMenuItem,
};
