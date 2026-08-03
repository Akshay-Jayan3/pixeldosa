"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface GhostInputProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "value" | "onChange" | "children"> {
  /** Current field value. GhostInput is controlled — there is no uncontrolled mode. */
  value: string;
  onValueChange: (value: string) => void;
  /**
   * Called after the user pauses typing, with an `AbortSignal` that fires the moment
   * another keystroke arrives. Must resolve to a full continuation of `value` — a
   * result that doesn't start with the current value is treated as stale and dropped.
   * Return `null`/`undefined`/`""` for "no suggestion".
   */
  fetchSuggestion: (value: string, signal: AbortSignal) => Promise<string | null | undefined>;
  /** Debounce before `fetchSuggestion` fires, in ms. */
  debounceMs?: number;
  /** Don't request a suggestion below this many characters. */
  minChars?: number;
  /** Fired with the full accepted value when the user accepts the suggestion. */
  onAcceptSuggestion?: (value: string) => void;
  wrapperClassName?: string;
}

/**
 * A single-line text input with inline ghost-text completion: type, pause, and a
 * muted continuation appears after the caret. Tab or → (only with the caret already at
 * the end of the text) accepts it; Esc dismisses it; any other keystroke cancels the
 * in-flight request and discards it. It is never inserted automatically — acceptance is
 * always an explicit keypress, per the ghost-text UX convention this component follows.
 *
 * Renders a real `<input>` — `ref`, `id`, `aria-invalid` and `aria-describedby` all
 * forward onto it, so this drops directly into `<FieldControl>`.
 */
const GhostInput = React.forwardRef<HTMLInputElement, GhostInputProps>(function GhostInput(
  {
    value,
    onValueChange,
    fetchSuggestion,
    debounceMs = 300,
    minChars = 1,
    onAcceptSuggestion,
    className,
    wrapperClassName,
    onKeyDown,
    onBlur,
    ...props
  },
  forwardedRef
) {
  const [suggestion, setSuggestion] = React.useState("");
  const [pending, setPending] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

  const abortRef = React.useRef<AbortController | null>(null);
  const timerRef = React.useRef<number | undefined>(undefined);

  const cancelPending = React.useCallback(() => {
    window.clearTimeout(timerRef.current);
    abortRef.current?.abort();
    setPending(false);
  }, []);

  React.useEffect(() => cancelPending, [cancelPending]);

  const requestSuggestion = React.useCallback(
    (nextValue: string) => {
      cancelPending();
      setSuggestion("");

      if (nextValue.trim().length < minChars) return;

      timerRef.current = window.setTimeout(() => {
        const controller = new AbortController();
        abortRef.current = controller;
        setPending(true);

        fetchSuggestion(nextValue, controller.signal)
          .then((result) => {
            if (controller.signal.aborted || !result) return;
            // A suggestion that doesn't continue the text the user is now looking at
            // is stale (the field may have changed while the request was in flight)
            // and would insert the wrong thing if accepted — discard it rather than
            // showing something misleading.
            if (result === nextValue || !result.startsWith(nextValue)) return;
            setSuggestion(result.slice(nextValue.length));
          })
          .catch((error: unknown) => {
            if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
          })
          .finally(() => {
            if (abortRef.current === controller) setPending(false);
          });
      }, debounceMs);
    },
    [cancelPending, debounceMs, fetchSuggestion, minChars]
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    onValueChange(nextValue);
    requestSuggestion(nextValue);
  };

  const acceptSuggestion = () => {
    if (!suggestion) return false;
    const accepted = value + suggestion;
    onValueChange(accepted);
    setSuggestion("");
    cancelPending();
    onAcceptSuggestion?.(accepted);
    return true;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const input = event.currentTarget;
    const caretAtEnd = input.selectionStart === value.length && input.selectionEnd === value.length;

    if (suggestion && event.key === "Tab" && !event.shiftKey) {
      event.preventDefault();
      acceptSuggestion();
      return;
    }

    if (suggestion && event.key === "ArrowRight" && caretAtEnd) {
      event.preventDefault();
      acceptSuggestion();
      return;
    }

    if (suggestion && event.key === "Escape") {
      event.preventDefault();
      setSuggestion("");
      cancelPending();
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(event);
    setSuggestion("");
    cancelPending();
  };

  return (
    <div className={cn("relative", wrapperClassName)}>
      {/* Mirrors the input's box exactly. The typed-text span is transparent so it
          takes up the right amount of space without being visible twice; only the
          suggestion tail — which sits past whatever the real input has painted — is
          actually seen. aria-hidden because the accessible description below carries
          the same information to assistive tech. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre",
          "px-3 text-sm",
          className
        )}
      >
        <span className="text-transparent">{value}</span>
        <span className="text-muted-foreground/70 transition-opacity duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)]">
          {suggestion}
        </span>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        role="combobox"
        aria-expanded={Boolean(suggestion)}
        aria-autocomplete="inline"
        aria-describedby={suggestion ? `${props.id ?? "ghost-input"}-suggestion-hint` : props["aria-describedby"]}
        className={cn(
          "relative h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none",
          "placeholder:text-muted-foreground",
          "focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:border-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          className
        )}
        {...props}
      />

      {suggestion ? (
        <>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            Tab
          </span>
          <span id={`${props.id ?? "ghost-input"}-suggestion-hint`} className="sr-only" aria-live="polite">
            Suggestion available: {suggestion}. Press Tab to accept, Escape to dismiss.
          </span>
        </>
      ) : null}

      {pending ? <span className="sr-only" aria-live="polite">Fetching suggestion</span> : null}
    </div>
  );
});

export { GhostInput };
