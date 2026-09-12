"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type AskFieldOption = { value: string; label: string; hint?: string };

export type AskField =
  | { name: string; type: "text"; label: string; placeholder?: string; required?: boolean }
  | { name: string; type: "number"; label: string; placeholder?: string; required?: boolean }
  | { name: string; type: "confirm"; label: string; required?: boolean }
  | { name: string; type: "select"; label: string; options: AskFieldOption[]; required?: boolean };

export interface AgentAskProps extends Omit<React.ComponentPropsWithoutRef<"form">, "onSubmit"> {
  /** The actual question. Targeted and answerable — never "can you provide more information?". */
  question: string;
  /**
   * Who is asking. Required, not optional: MCP's elicitation spec obliges a client to
   * show which server is requesting input, because "some software wants your data" is
   * not a question a user can safely answer without knowing the asker.
   */
  source: string;
  fields: AskField[];
  /** Why it's asking. Short context that makes the question answerable. */
  explanation?: string;
  onRespond: (values: Record<string, string | boolean>) => void;
  /** Answer refused, continue without it. Distinct from cancelling the run. */
  onDecline?: () => void;
  /** Abandon the whole operation. MCP requires this be offered alongside decline. */
  onCancel?: () => void;
  submitLabel?: string;
}

function fieldIsAnswered(field: AskField, value: string | boolean | undefined): boolean {
  if (!field.required) return true;
  if (field.type === "confirm") return typeof value === "boolean";
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * The agent needs structured input to continue — MCP elicitation, given a real surface.
 *
 * Three things make this different from a chat prompt asking the same question: it
 * names the asker, it offers a genuine refusal, and it prefers concrete options over
 * free text. A question with buttons is answerable in a second; the same question in a
 * text box is a small piece of homework.
 *
 * Holds perfectly still: this is the user's turn (DESIGN.md §3a).
 */
function AgentAsk({
  question,
  source,
  fields,
  explanation,
  onRespond,
  onDecline,
  onCancel,
  submitLabel = "Send",
  className,
  ...props
}: AgentAskProps) {
  const [values, setValues] = React.useState<Record<string, string | boolean>>({});
  const headingId = React.useId();

  const complete = fields.every((field) => fieldIsAnswered(field, values[field.name]));
  const setValue = (name: string, value: string | boolean) =>
    setValues((previous) => ({ ...previous, [name]: value }));

  return (
    <form
      aria-labelledby={headingId}
      onSubmit={(event) => {
        event.preventDefault();
        if (complete) onRespond(values);
      }}
      className={cn("flex flex-col gap-4 rounded-lg border bg-card p-4", className)}
      {...props}
    >
      <div className="flex flex-col gap-1.5">
        {/* Provenance first. The protocol requires it, and it is also the only way a
            user can judge whether the question is safe to answer. */}
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{source}</span> is asking
        </p>
        <h3 id={headingId} className="text-sm font-medium text-foreground text-pretty">
          {question}
        </h3>
        {explanation ? (
          <p className="text-xs leading-relaxed text-muted-foreground text-pretty">{explanation}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        {fields.map((field) => {
          const value = values[field.name];

          if (field.type === "select") {
            return (
              <fieldset key={field.name} className="flex flex-col gap-1.5">
                <legend className="mb-1.5 text-xs font-medium text-muted-foreground">
                  {field.label}
                </legend>
                {field.options.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer items-start gap-2.5 rounded-md border p-2.5 text-sm",
                      "transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
                      "hover:bg-accent/40 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/40",
                      value === option.value ? "border-primary bg-accent/30" : "border-input"
                    )}
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={option.value}
                      checked={value === option.value}
                      onChange={() => setValue(field.name, option.value)}
                      className="mt-0.5 size-3.5 accent-[var(--primary)] outline-none"
                    />
                    <span className="flex min-w-0 flex-col">
                      <span className="text-foreground">{option.label}</span>
                      {option.hint ? (
                        <span className="text-xs text-muted-foreground">{option.hint}</span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </fieldset>
            );
          }

          if (field.type === "confirm") {
            return (
              <div key={field.name} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">{field.label}</span>
                <div className="flex gap-2">
                  {[
                    { label: "Yes", answer: true },
                    { label: "No", answer: false },
                  ].map((choice) => (
                    <button
                      key={choice.label}
                      type="button"
                      aria-pressed={value === choice.answer}
                      onClick={() => setValue(field.name, choice.answer)}
                      className={cn(
                        "relative rounded-md border px-3 py-1.5 text-sm outline-none",
                        "transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
                        "after:absolute after:inset-x-0 after:-inset-y-2 after:content-['']",
                        "focus-visible:ring-[3px] focus-visible:ring-ring/40",
                        value === choice.answer
                          ? "border-primary bg-accent/40 text-foreground"
                          : "border-input text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                      )}
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <label key={field.name} className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">{field.label}</span>
              <input
                type={field.type === "number" ? "number" : "text"}
                inputMode={field.type === "number" ? "numeric" : undefined}
                placeholder={field.placeholder}
                value={typeof value === "string" ? value : ""}
                onChange={(event) => setValue(field.name, event.target.value)}
                // 16px minimum, or iOS Safari zooms the whole page on focus.
                className="h-9 rounded-md border border-input bg-transparent px-3 text-base outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:text-sm"
              />
            </label>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Refusal is first-class, not buried. Decline and cancel are different
              answers: one continues without the information, the other stops the run. */}
          {onDecline ? (
            <button
              type="button"
              onClick={onDecline}
              className="relative text-xs font-medium text-muted-foreground underline-offset-2 outline-none transition-colors duration-[var(--pd-duration-instant)] after:absolute after:inset-x-0 after:-inset-y-2.5 after:content-[''] motion-reduce:transition-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              Don&apos;t answer
            </button>
          ) : null}
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="relative text-xs font-medium text-muted-foreground underline-offset-2 outline-none transition-colors duration-[var(--pd-duration-instant)] after:absolute after:inset-x-0 after:-inset-y-2.5 after:content-[''] motion-reduce:transition-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              Cancel
            </button>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={!complete}
          className="relative rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] after:absolute after:inset-x-0 after:-inset-y-2 after:content-[''] motion-reduce:transition-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export { AgentAsk };
