"use client";

import * as React from "react";

import { Button } from "@/registry/button/button";
import {
  CommandMenu,
  CommandMenuEmpty,
  CommandMenuGroup,
  CommandMenuInput,
  CommandMenuItem,
  CommandMenuList,
  CommandMenuSeparator,
} from "@/registry/command-menu/command-menu";

type Action = {
  id: string;
  label: string;
  keybind?: string;
  group: "Recent" | "Actions" | "Navigation";
};

const actions: Action[] = [
  { id: "search", label: "Search issues", keybind: "S", group: "Recent" },
  { id: "profile", label: "Go to profile", group: "Recent" },
  { id: "create", label: "Create new issue", keybind: "C", group: "Actions" },
  { id: "assign", label: "Assign to me", group: "Actions" },
  { id: "priority", label: "Set priority: Urgent", group: "Actions" },
  { id: "inbox", label: "Go to Inbox", keybind: "G I", group: "Navigation" },
  { id: "settings", label: "Go to Settings", group: "Navigation" },
];

/**
 * Self-contained: owns its own open state, global ⌘K/Ctrl+K listener (toggling
 * closed if already open, per the plan's togglable requirement) and a status line
 * showing the last selected action, since a docs preview has no real app to navigate.
 */
export default function CommandMenuDemo() {
  const [open, setOpen] = React.useState(false);
  const [lastSelected, setLastSelected] = React.useState<string | null>(null);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function runAction(action: Action) {
    setLastSelected(action.label);
    setOpen(false);
  }

  const groupOrder: Action["group"][] = ["Recent", "Actions", "Navigation"];
  const groups = groupOrder.filter((group) => actions.some((action) => action.group === group));

  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-3">
        Search or run a command
        <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </Button>

      <p className="min-h-5 text-sm text-muted-foreground" aria-live="polite">
        {lastSelected ? `Ran: ${lastSelected}` : "Press ⌘K (or Ctrl+K) to open the menu."}
      </p>

      <CommandMenu open={open} onOpenChange={setOpen} label="Command Menu">
        <CommandMenuInput placeholder="Type a command or search…" />
        <CommandMenuList>
          <CommandMenuEmpty>No results found.</CommandMenuEmpty>
          {groups.map((group, index) => {
            const items = actions.filter((action) => action.group === group);
            return (
              <React.Fragment key={group}>
                <CommandMenuGroup heading={group}>
                  {items.map((action) => (
                    <CommandMenuItem
                      key={action.id}
                      value={action.label}
                      keybind={action.keybind}
                      onSelect={() => runAction(action)}
                    >
                      {action.label}
                    </CommandMenuItem>
                  ))}
                </CommandMenuGroup>
                {index < groups.length - 1 ? <CommandMenuSeparator /> : null}
              </React.Fragment>
            );
          })}
        </CommandMenuList>
      </CommandMenu>
    </div>
  );
}
