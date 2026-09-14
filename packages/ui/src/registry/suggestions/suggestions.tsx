"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type Suggestion = string | { id: string; label: string; prompt?: string };

export interface SuggestionsProps extends Omit<React.ComponentPropsWithoutRef<"div">, "onSelect"> {
  items: Suggestion[];
  /** Receives the suggestion's prompt (or label) and the item. */
  onSelect: (prompt: string, item: Suggestion) => void;
  /**
   * `fill` puts the text in the composer to edit; `send` sends it immediately. Each looks
   * different, so a tap never does something the user didn't expect.
   */
  mode?: "fill" | "send";
  /** Hides the suggestions: follow-ups for an answer that hasn't finished are premature. */
  streaming?: boolean;
  layout?: "chips" | "list";
  label?: string;
}

const toItem = (suggestion: Suggestion) =>
  typeof suggestion === "string"
    ? { id: suggestion, label: suggestion, prompt: suggestion }
    : { ...suggestion, prompt: suggestion.prompt ?? suggestion.label };

/**
 * Follow-up suggestions after an answer — the next question, one tap away.
 *
 * The one decision that matters is what a tap does. Filling the composer is safe but
 * slower; sending is fast but commits the user to words they didn't write. The component
 * supports both, and each looks different: `fill` chips carry a pencil-to-input glyph and
 * `send` chips an arrow, with the accessible name saying which ("Ask: …" versus "Edit
 * before asking: …").
 *
 * Suggestions hide while an answer streams, because a follow-up to half an answer is
 * premature. Arrow keys move between them as one group. They arrive with a single, short,
 * staggered fade, then hold still, since it's the user's turn.
 */
function Suggestions({
  items,
  onSelect,
  mode = "fill",
  streaming = false,
  layout = "chips",
  label = "Suggested follow-ups",
  className,
  ...props
}: SuggestionsProps) {
  const [active, setActive] = React.useState(0);
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const normalized = items.map(toItem);

  React.useEffect(() => {
    if (active >= normalized.length) setActive(0);
  }, [active, normalized.length]);

  if (streaming || normalized.length === 0) return null;

  const move = (to: number) => {
    const next = (to + normalized.length) % normalized.length;
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(layout === "chips" ? "flex flex-wrap gap-2" : "flex flex-col divide-y rounded-lg border", className)}
      {...props}
    >
      {normalized.map((item, index) => (
        <button
          key={item.id}
          ref={(element) => {
            refs.current[index] = element;
          }}
          type="button"
          tabIndex={index === active ? 0 : -1}
          aria-label={mode === "send" ? `Ask: ${item.label}` : `Edit before asking: ${item.label}`}
          onFocus={() => setActive(index)}
          onClick={() => onSelect(item.prompt, items[index]!)}
          onKeyDown={(event) => {
            const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
            const back = event.key === "ArrowLeft" || event.key === "ArrowUp";
            if (forward || back || event.key === "Home" || event.key === "End") {
              event.preventDefault();
              if (forward) move(index + 1);
              else if (back) move(index - 1);
              else if (event.key === "Home") move(0);
              else move(normalized.length - 1);
            }
          }}
          style={{ animationDelay: `${index * 40}ms` }}
          className={cn(
            "group relative flex animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] items-center gap-2 text-left text-sm text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:animate-none motion-reduce:transition-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
            layout === "chips"
              ? "min-h-8 rounded-full border border-input px-3 py-1 after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-[''] hover:bg-accent hover:text-accent-foreground"
              : "min-h-11 justify-between px-3 py-2 first:rounded-t-lg last:rounded-b-lg hover:bg-accent/60"
          )}
        >
          <span className="text-pretty">{item.label}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5 shrink-0 text-muted-foreground transition-colors duration-[var(--pd-duration-instant)] group-hover:text-foreground"
          >
            {mode === "send" ? <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" /> : <path d="M9.5 3.5l3 3-6 6H3.5v-3zM3 14h10" />}
          </svg>
        </button>
      ))}
    </div>
  );
}

export { Suggestions };
