"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type ParameterOption = {
  id: string;
  /** Plain words, never a branded name: "Wide, 16:9", not "Cinemascope Pro". */
  label: string;
  /** A small preview: a thumbnail, a shape, a swatch. Recognition beats recall. */
  preview?: React.ReactNode;
  /** What choosing this does to the price or the wait: "+20 credits". */
  costNote?: string;
  /** One line of help, shown under the group when this option is chosen. */
  detail?: string;
};

export type ParameterGroup = {
  id: string;
  /** "Style", "Shape", "How many". */
  label: string;
  options: ParameterOption[];
};

export interface ParameterPanelProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title" | "onChange"> {
  /** Level of the title heading, so it fits the outline of the page it's placed in. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  title?: string;
  groups: ParameterGroup[];
  /** Chosen option id per group id. */
  values: Record<string, string>;
  onChange: (groupId: string, optionId: string) => void;
  /** What the current choices add up to: "4 images · 1024 × 1024 · 40 credits". */
  summary?: string;
  onReset?: () => void;
}

/**
 * The controls beside the prompt: pick, don't describe.
 *
 * Research on generative tools calls the core problem the articulation barrier — people
 * can picture what they want but can't name it, and style vocabulary ("synth-wave",
 * "tilt-shift") is exactly the knowledge they lack. The fix is recognition instead of
 * recall: small previews they can point at, with plain labels beside them. Two further
 * findings shape the API: novel icons are universally misread, so every option carries a
 * text label, and options that change the price say so where they're chosen rather than
 * in a bill afterwards.
 *
 * Holds completely still: it's the user's turn.
 */
function ParameterPanel({
  headingLevel = 3,
  title = "Settings",
  groups,
  values,
  onChange,
  summary,
  onReset,
  className,
  ...props
}: ParameterPanelProps) {
  const Heading = `h${headingLevel}` as "h3";
  const headingId = React.useId();

  return (
    <section
      aria-labelledby={headingId}
      className={cn("flex flex-col gap-4 rounded-lg border bg-card p-4", className)}
      {...props}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Heading id={headingId} className="text-sm font-medium text-foreground">
          {title}
        </Heading>
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="rounded-md text-xs font-medium text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            Reset
          </button>
        ) : null}
      </div>

      {groups.map((group) => {
        const chosenId = values[group.id];
        const chosen = group.options.find((option) => option.id === chosenId);
        return (
          <fieldset key={group.id} className="flex flex-col gap-2">
            <legend className="text-xs text-muted-foreground">{group.label}</legend>
            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => {
                const active = option.id === chosenId;
                return (
                  <label
                    key={option.id}
                    className={cn(
                      "flex cursor-pointer flex-col items-start gap-1 rounded-lg border p-1.5 transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none",
                      active ? "border-[1.5px] border-foreground" : "border-input hover:bg-accent",
                      "has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/40"
                    )}
                  >
                    <input
                      type="radio"
                      name={group.id}
                      value={option.id}
                      checked={active}
                      onChange={() => onChange(group.id, option.id)}
                      className="sr-only"
                    />
                    {option.preview ? (
                      <span
                        aria-hidden="true"
                        className="flex h-12 w-16 items-center justify-center overflow-hidden rounded-md bg-muted"
                      >
                        {option.preview}
                      </span>
                    ) : null}
                    {/* The label always ships: an icon or a thumbnail alone is read wrong. */}
                    <span className="flex flex-col px-0.5">
                      <span className={cn("text-xs", active ? "font-medium text-foreground" : "text-muted-foreground")}>
                        {option.label}
                      </span>
                      {option.costNote ? (
                        <span className="text-[0.6875rem] text-muted-foreground tabular-nums">{option.costNote}</span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
            {chosen?.detail ? (
              <p className="text-xs text-muted-foreground text-pretty">{chosen.detail}</p>
            ) : null}
          </fieldset>
        );
      })}

      {summary ? (
        <p className="border-t pt-3 text-xs text-foreground text-pretty">{summary}</p>
      ) : null}
    </section>
  );
}

export { ParameterPanel };
