"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type ComposerOption = string | { value: string; label: string };

export type ComposerControl = {
  id: string;
  /** Short label shown on the pill: "Tone", "Length", "For". */
  label: string;
  options: ComposerOption[];
  defaultValue: string;
};

export type ComposerAttachment = {
  id: string;
  name: string;
  /** e.g. "PDF · 2.4 MB". */
  detail?: string;
  status?: "uploading" | "ready" | "failed";
};

export type ComposerSubmission = {
  text: string;
  values: Record<string, string>;
  attachments: ComposerAttachment[];
};

export interface PromptComposerProps extends Omit<React.ComponentPropsWithoutRef<"form">, "onSubmit"> {
  onSubmit: (submission: ComposerSubmission) => void;
  /** Structured parts of the request. The interface carries the specification, not the prompt. */
  controls?: ComposerControl[];
  attachments?: ComposerAttachment[];
  /** Enables the attach button, drop and paste. You upload; pass the results back as `attachments`. */
  onAttachFiles?: (files: File[]) => void;
  onRemoveAttachment?: (id: string) => void;
  accept?: string;
  /** Starting points that fill the text for editing. Never sent without the user. */
  suggestions?: string[];
  /** The result is being generated. Send becomes Stop. */
  busy?: boolean;
  onStop?: () => void;
  placeholder?: string;
  maxLength?: number;
  submitLabel?: string;
  /** Visible label for the text area. Visually hidden by default. */
  label?: string;
  /** Clear the text after sending. Controls keep their values either way. */
  clearOnSubmit?: boolean;
  /** Controlled text, for filling the composer from outside (e.g. a follow-up suggestion). */
  value?: string;
  onValueChange?: (value: string) => void;
}

const optionValue = (option: ComposerOption) => (typeof option === "string" ? option : option.value);
const optionLabel = (option: ComposerOption) => (typeof option === "string" ? option : option.label);
const MAX_HEIGHT_PX = 240;

/**
 * A request composer that isn't a blank chat box. Free text for what only words can say,
 * structured controls for what shouldn't need prompt engineering (tone, length, audience,
 * format), and attachments for context.
 *
 * The controls are the point. "Make it shorter and friendlier, for customers" is a
 * specification users shouldn't have to phrase correctly every time. As pills, it's two
 * selects, the choices are visible before sending, and a pill changed from its default is
 * outlined, so the specification can be read at a glance. The pills are native selects,
 * which gives keyboard, screen reader and phone picker support for free.
 *
 * The small things are the rest: Enter sends and Shift+Enter breaks a line, but never
 * mid-IME-composition; sending is blocked while an attachment uploads and says why; the
 * character count only appears near the limit; and while generating, Send becomes Stop.
 */
function PromptComposer({
  onSubmit,
  controls = [],
  attachments = [],
  onAttachFiles,
  onRemoveAttachment,
  accept,
  suggestions = [],
  busy = false,
  onStop,
  placeholder = "Describe what you need…",
  maxLength,
  submitLabel = "Generate",
  label = "Request",
  clearOnSubmit = true,
  value,
  onValueChange,
  className,
  ...props
}: PromptComposerProps) {
  const [ownText, setOwnText] = React.useState("");
  const text = value ?? ownText;
  const setText = (next: string) => {
    if (value === undefined) setOwnText(next);
    onValueChange?.(next);
  };
  const [values, setValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(controls.map((control) => [control.id, control.defaultValue]))
  );
  const [dragging, setDragging] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const textId = React.useId();
  const hintId = React.useId();

  // Grow with the text up to a cap, then scroll. Measured from scrollHeight because
  // `field-sizing: content` isn't available in every browser yet.
  React.useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT_PX)}px`;
    textarea.style.overflowY = textarea.scrollHeight > MAX_HEIGHT_PX ? "auto" : "hidden";
  }, [text]);

  const uploading = attachments.some((attachment) => attachment.status === "uploading");
  const failed = attachments.some((attachment) => attachment.status === "failed");
  const empty = text.trim().length === 0;
  const blockedReason = uploading
    ? "Waiting for attachments to finish uploading"
    : failed
      ? "Remove the attachment that failed to upload"
      : null;
  const canSubmit = !busy && !empty && !blockedReason;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({ text: text.trim(), values, attachments });
    if (clearOnSubmit) setText("");
  };

  const takeFiles = (files: FileList | File[] | null | undefined) => {
    if (!onAttachFiles || !files || files.length === 0) return;
    onAttachFiles(Array.from(files));
  };

  // The count is noise until it matters: shown in the last 10% before the limit.
  const showCount = maxLength !== undefined && text.length >= maxLength * 0.9;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      onDragOver={(event) => {
        if (!onAttachFiles || !event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={(event) => {
        if (!onAttachFiles) return;
        event.preventDefault();
        setDragging(false);
        takeFiles(event.dataTransfer.files);
      }}
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card p-2 transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none has-[textarea:focus-visible]:border-foreground/40",
        dragging && "border-dashed border-foreground/60 bg-accent/40",
        className
      )}
      {...props}
    >
      {attachments.length > 0 ? (
        <ul aria-label="Attachments" className="flex flex-wrap gap-1.5 px-1 pt-1">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className={cn(
                "flex max-w-full items-center gap-1.5 rounded-md border py-1 pl-2 pr-1 text-xs",
                attachment.status === "failed" && "border-destructive/50"
              )}
            >
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-foreground" title={attachment.name}>
                  {attachment.name}
                </span>
                <span
                  className={cn(
                    "text-[0.6875rem]",
                    attachment.status === "failed" ? "text-destructive" : "text-muted-foreground",
                    attachment.status === "uploading" && "pd-shimmer"
                  )}
                >
                  {attachment.status === "uploading"
                    ? "Uploading"
                    : attachment.status === "failed"
                      ? "Upload failed"
                      : attachment.detail ?? "Ready"}
                </span>
              </span>
              {onRemoveAttachment ? (
                <button
                  type="button"
                  aria-label={`Remove ${attachment.name}`}
                  onClick={() => onRemoveAttachment(attachment.id)}
                  className="relative flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] after:absolute after:-inset-2.5 after:content-[''] motion-reduce:transition-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
                >
                  <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="size-3.5">
                    <path d="m4.5 4.5 7 7m0-7-7 7" />
                  </svg>
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <label htmlFor={textId} className="sr-only">
        {label}
      </label>
      <textarea
        ref={textareaRef}
        id={textId}
        value={text}
        rows={2}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-describedby={hintId}
        onChange={(event) => setText(event.target.value)}
        onPaste={(event) => {
          if (event.clipboardData.files.length > 0 && onAttachFiles) {
            event.preventDefault();
            takeFiles(event.clipboardData.files);
          }
        }}
        onKeyDown={(event) => {
          // Enter confirms an IME candidate before it means "send".
          if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
          event.preventDefault();
          submit();
        }}
        className="w-full resize-none bg-transparent px-2 py-1.5 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground sm:text-sm"
      />

      {suggestions.length > 0 && empty ? (
        <div role="group" aria-label="Suggestions" className="flex flex-wrap gap-1.5 px-1">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setText(suggestion);
                textareaRef.current?.focus();
              }}
              className="relative rounded-full border border-input px-2.5 py-1 text-xs text-muted-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] after:absolute after:inset-x-0 after:-inset-y-2 after:content-[''] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}

      {/* Controls wrap in their own column; send keeps its corner instead of dropping to a row of its own. */}
      <div className="flex items-end justify-between gap-2 border-t px-1 pt-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {onAttachFiles ? (
            <>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept={accept}
                tabIndex={-1}
                aria-hidden="true"
                className="sr-only"
                onChange={(event) => {
                  takeFiles(event.target.files);
                  event.target.value = "";
                }}
              />
              <button
                type="button"
                aria-label="Attach files"
                onClick={() => fileRef.current?.click()}
                className="relative flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-[''] motion-reduce:transition-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
              >
                <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                  <path d="M13 7.5 8.2 12.3a3 3 0 0 1-4.3-4.2l5-5a2 2 0 0 1 2.8 2.8l-5 5a1 1 0 0 1-1.4-1.4L10 4.8" />
                </svg>
              </button>
            </>
          ) : null}

          {controls.map((control) => {
            const current = values[control.id] ?? control.defaultValue;
            const changed = current !== control.defaultValue;
            return (
              <label
                key={control.id}
                className={cn(
                  "relative flex h-8 items-center rounded-full border text-xs transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none has-[select:focus-visible]:ring-[3px] has-[select:focus-visible]:ring-ring/40",
                  changed ? "border-foreground/50 text-foreground" : "border-input text-muted-foreground hover:text-foreground"
                )}
              >
                <span aria-hidden="true" className="pointer-events-none pl-2.5">
                  {control.label}:
                </span>
                {/* The visible value sizes the pill to the current choice. A native select is
                    as wide as its longest option, which bloats the row. The real select sits
                    over the pill, transparent, so picking still opens the platform picker. */}
                <span aria-hidden="true" className={cn("pointer-events-none pl-1 pr-6 text-foreground", changed && "font-medium")}>
                  {optionLabel(control.options.find((option) => optionValue(option) === current) ?? current)}
                </span>
                <select
                  aria-label={control.label}
                  value={current}
                  onChange={(event) => setValues((all) => ({ ...all, [control.id]: event.target.value }))}
                  className="absolute inset-0 size-full cursor-pointer appearance-none rounded-full opacity-0 outline-none"
                >
                  {control.options.map((option) => (
                    <option key={optionValue(option)} value={optionValue(option)}>
                      {optionLabel(option)}
                    </option>
                  ))}
                </select>
                <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute right-2 size-3 text-muted-foreground">
                  <path d="m4.5 6.5 3.5 3.5 3.5-3.5" />
                </svg>
              </label>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {showCount ? (
            <span className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
              {maxLength! - text.length} left
            </span>
          ) : null}
          {busy && onStop ? (
            <button
              type="button"
              onClick={onStop}
              className="flex h-8 items-center gap-1.5 rounded-md border border-input px-3 text-sm font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              <span aria-hidden="true" className="size-2.5 rounded-[2px] bg-current" />
              Stop
            </button>
          ) : (
            <button
              type="submit"
              aria-disabled={!canSubmit}
              title={blockedReason ?? undefined}
              className={cn(
                "h-8 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground outline-none transition-[background-color,opacity] duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                canSubmit ? "hover:bg-primary/90" : "cursor-not-allowed opacity-50"
              )}
            >
              {submitLabel}
            </button>
          )}
        </div>
      </div>

      <p id={hintId} className={cn("px-2 text-xs", blockedReason ? "text-foreground" : "sr-only")} aria-live="polite">
        {blockedReason ?? "Enter to send, Shift+Enter for a new line."}
      </p>
    </form>
  );
}

export { PromptComposer };
