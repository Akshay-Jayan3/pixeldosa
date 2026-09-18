"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type FeedbackVerdict = "up" | "down";

export type FeedbackReason = {
  id: string;
  /** What was wrong, in the user's words: "Made something up", "Wrong source". */
  label: string;
};

export type FeedbackSubmission = {
  verdict: FeedbackVerdict;
  reasonIds: string[];
  comment?: string;
};

export interface ResponseFeedbackProps extends Omit<React.ComponentPropsWithoutRef<"div">, "onSubmit"> {
  /** Reasons offered after a thumbs down. Yours, not generic ones. */
  reasons?: FeedbackReason[];
  /** Also ask why after a thumbs up. Off by default: praise shouldn't cost a form. */
  askOnUp?: boolean;
  onSubmit: (submission: FeedbackSubmission) => void;
  /** Where it goes and what happens to it — the thing most products never say. */
  destination?: string;
  label?: string;
  /** Set when the caller has already recorded feedback for this answer. */
  submitted?: boolean;
}

const DEFAULT_REASONS: FeedbackReason[] = [
  { id: "wrong", label: "Something is wrong" },
  { id: "made-up", label: "Made something up" },
  { id: "source", label: "Wrong or missing source" },
  { id: "instructions", label: "Didn't follow my instructions" },
  { id: "length", label: "Too long or too short" },
  { id: "tone", label: "Wrong tone" },
];

/**
 * Thumbs with a reason that goes somewhere.
 *
 * A bare thumbs-down tells a team that something was wrong and nothing about what. This
 * asks for the reason in the user's words, keeps the comment optional, and says where the
 * feedback goes — because a product that collects feedback without saying what happens to
 * it is asking for a favour it never repays.
 *
 * Holds completely still: it's the user's turn.
 */
function ResponseFeedback({
  reasons = DEFAULT_REASONS,
  askOnUp = false,
  onSubmit,
  destination,
  label = "Was this answer useful?",
  submitted = false,
  className,
  ...props
}: ResponseFeedbackProps) {
  const [verdict, setVerdict] = React.useState<FeedbackVerdict | null>(null);
  const [chosen, setChosen] = React.useState<string[]>([]);
  const [comment, setComment] = React.useState("");
  const [sent, setSent] = React.useState(submitted);
  const groupId = React.useId();
  const commentId = React.useId();

  const choose = (next: FeedbackVerdict) => {
    setVerdict(next);
    setChosen([]);
    setComment("");
    // A thumbs up is complete on its own unless the caller wants to ask.
    if (next === "up" && !askOnUp) {
      onSubmit({ verdict: "up", reasonIds: [] });
      setSent(true);
    }
  };

  const send = () => {
    if (!verdict) return;
    onSubmit({ verdict, reasonIds: chosen, comment: comment.trim() || undefined });
    setSent(true);
  };

  if (sent) {
    return (
      <p
        className={cn(
          "animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] text-xs text-muted-foreground text-pretty motion-reduce:animate-none",
          className
        )}
        {...props}
      >
        Thanks{destination ? `, that goes to ${destination}` : ""}.
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <div role="group" aria-labelledby={groupId} className="flex flex-wrap items-center gap-2">
        <p id={groupId} className="text-xs text-muted-foreground">
          {label}
        </p>
        {(
          [
            { value: "up" as const, text: "Yes", path: "M7 20V9l5-6 1 1-1 5h6l-2 11H7Z" },
            { value: "down" as const, text: "No", path: "M17 4v11l-5 6-1-1 1-5H6l2-11h9Z" },
          ]
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={verdict === option.value}
            onClick={() => choose(option.value)}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
              verdict === option.value
                ? "border-foreground text-foreground"
                : "border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-3.5">
              <path d={option.path} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            {option.text}
          </button>
        ))}
      </div>

      {verdict && (verdict === "down" || askOnUp) ? (
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3">
          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs text-muted-foreground">
              {verdict === "down" ? "What went wrong? Pick any that apply." : "What worked? Pick any that apply."}
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {reasons.map((reason) => {
                const active = chosen.includes(reason.id);
                return (
                  <label
                    key={reason.id}
                    className={cn(
                      "cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      "has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/40"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() =>
                        setChosen((previous) =>
                          previous.includes(reason.id)
                            ? previous.filter((id) => id !== reason.id)
                            : [...previous, reason.id]
                        )
                      }
                      className="sr-only"
                    />
                    {reason.label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={commentId} className="text-xs text-muted-foreground">
              Anything else? (optional)
            </label>
            <textarea
              id={commentId}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={2}
              className="w-full resize-y rounded-md border border-input bg-transparent p-2 text-base text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={send}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              Send feedback
            </button>
            <button
              type="button"
              onClick={() => setVerdict(null)}
              className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              Cancel
            </button>
            {destination ? (
              <p className="text-xs text-muted-foreground text-pretty">Goes to {destination}.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { ResponseFeedback };
