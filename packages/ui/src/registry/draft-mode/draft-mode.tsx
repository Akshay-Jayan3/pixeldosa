"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/** Something the agent prepared that hasn't left yet. */
export type DraftItem = {
  id: string;
  /** What it is, as the consequence of sending it: "Email Dana about the renewal". */
  title: string;
  /** Who or what it touches: "dana@acme.com", "3 recipients", "the live pricing page". */
  target?: string;
  detail?: string;
  /** Marks an item that can't be taken back once it goes. */
  irreversible?: boolean;
};

export interface DraftModeProps extends Omit<React.ComponentPropsWithoutRef<"section">, "onChange"> {
  /** Level of the title heading, so it fits the outline of the page it's placed in. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** On: the agent prepares everything and nothing leaves until the user sends it. */
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  /** What's waiting. Empty is a normal, quiet state. */
  items: DraftItem[];
  /** Sends the chosen items. Phrase your confirmation as the consequence. */
  onSend: (ids: string[]) => void;
  onDiscard?: (ids: string[]) => void;
  onEdit?: (id: string) => void;
  title?: string;
  /** What happens with draft mode off, in your product's words. */
  offWarning?: string;
  emptyLabel?: string;
}

/**
 * Draft mode: the agent prepares everything, and nothing leaves until a person sends it.
 *
 * It is the opposite failure mode to an approval dialog. An approval interrupts once per
 * action, which trains people to click through; draft mode lets the agent work freely and
 * collects what it produced in one place, so the person reviews a batch when they choose
 * to. Nothing here sends by itself: items are chosen explicitly, "Send all" names the
 * count, and anything irreversible is marked before it goes.
 *
 * Holds completely still: everything here is the user's turn.
 */
function DraftMode({
  headingLevel = 3,
  enabled,
  onEnabledChange,
  items,
  onSend,
  onDiscard,
  onEdit,
  title = "Draft mode",
  offWarning = "The agent sends as soon as it finishes. Nothing is held for review.",
  emptyLabel = "Nothing waiting. Anything the agent prepares will be held here.",
  className,
  ...props
}: DraftModeProps) {
  const Heading = `h${headingLevel}` as "h3";
  const headingId = React.useId();
  const [chosen, setChosen] = React.useState<string[]>([]);
  const [announcement, setAnnouncement] = React.useState("");

  // An item that leaves the list must not stay selected: a stale id in `chosen` would
  // silently send the wrong thing on the next click.
  React.useEffect(() => {
    setChosen((previous) => previous.filter((id) => items.some((item) => item.id === id)));
  }, [items]);

  const selected = items.filter((item) => chosen.includes(item.id));
  const irreversible = selected.filter((item) => item.irreversible).length;
  const toggle = (id: string) =>
    setChosen((previous) => (previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id]));

  const act = (action: "send" | "discard") => {
    const ids = selected.map((item) => item.id);
    if (ids.length === 0) return;
    if (action === "send") onSend(ids);
    else onDiscard?.(ids);
    setAnnouncement(`${action === "send" ? "Sent" : "Discarded"} ${ids.length} of ${items.length}.`);
    setChosen([]);
  };

  return (
    <section
      aria-labelledby={headingId}
      className={cn("flex flex-col rounded-lg border bg-card", className)}
      {...props}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b p-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Heading id={headingId} className="text-sm font-medium text-foreground">
            {title}
          </Heading>
          <p className="text-xs text-muted-foreground text-pretty">
            {enabled
              ? "The agent prepares everything. Nothing leaves until you send it."
              : offWarning}
          </p>
        </div>

        {/* A switch, not a menu: there are two states and the sentence above says what
            each one does. */}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onEnabledChange(!enabled)}
          className="relative inline-flex shrink-0 items-center gap-2 rounded-md text-xs font-medium text-muted-foreground outline-none after:absolute after:inset-x-0 after:-inset-y-2 after:content-[''] focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          {enabled ? "On" : "Off"}
          <span
            aria-hidden="true"
            className={cn(
              "flex h-5 w-9 items-center rounded-full border p-0.5 transition-colors duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
              enabled ? "border-foreground bg-foreground" : "border-input bg-muted"
            )}
          >
            <span
              className={cn(
                "block size-3.5 rounded-full transition-transform duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
                enabled ? "translate-x-4 bg-card" : "translate-x-0 bg-muted-foreground"
              )}
            />
          </span>
        </button>
      </header>

      {!enabled ? (
        <p className="border-b border-agent-waiting bg-agent-waiting-soft px-4 py-3 text-sm text-foreground text-pretty">
          Draft mode is off.{" "}
          <button
            type="button"
            onClick={() => onEnabledChange(true)}
            className="rounded-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            Turn it back on
          </button>{" "}
          to hold the agent's work for review.
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground text-pretty">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col">
          {items.map((item) => {
            const checked = chosen.includes(item.id);
            return (
              <li key={item.id} className="flex items-start gap-3 border-b px-4 py-3 last:border-b-0">
                <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(item.id)}
                    className="mt-0.5 size-4 shrink-0 accent-[var(--foreground)] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
                  />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm text-foreground text-pretty">{item.title}</span>
                    {item.target ? (
                      <span className="font-mono text-xs text-muted-foreground">{item.target}</span>
                    ) : null}
                    {item.detail ? (
                      <span className="text-xs text-muted-foreground text-pretty">{item.detail}</span>
                    ) : null}
                    {item.irreversible ? (
                      <span className="pt-0.5">
                        <span className="rounded-full border border-agent-blocked px-2 py-0.5 text-xs text-agent-blocked">
                          Can't be undone
                        </span>
                      </span>
                    ) : null}
                  </span>
                </label>

                {onEdit ? (
                  <button
                    type="button"
                    onClick={() => onEdit(item.id)}
                    className="relative shrink-0 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground underline-offset-2 outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] after:absolute after:inset-x-0 after:-inset-y-2 after:content-[''] motion-reduce:transition-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
                  >
                    Edit
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {items.length > 0 ? (
        <footer className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t p-4">
          <button
            type="button"
            onClick={() => setChosen(chosen.length === items.length ? [] : items.map((item) => item.id))}
            className="rounded-md text-xs font-medium text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            {chosen.length === items.length ? "Clear selection" : `Select all ${items.length}`}
          </button>

          <span className="flex-1" />

          {onDiscard ? (
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => act("discard")}
              className="rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50"
            >
              Discard
            </button>
          ) : null}
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={() => act("send")}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50"
          >
            {selected.length === 0 ? "Send" : `Send ${selected.length}`}
          </button>
          {/* The consequence sits beside the button, not behind a second dialog. */}
          <p className="w-full text-xs text-muted-foreground text-pretty">
            {selected.length === 0
              ? "Choose what to send. Nothing goes out on its own."
              : irreversible > 0
                ? `${irreversible} of these can't be undone once sent.`
                : "These go out as soon as you send them."}
          </p>
        </footer>
      ) : null}

      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </section>
  );
}

export { DraftMode };
