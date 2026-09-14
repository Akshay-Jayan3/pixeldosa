"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type MessageRole = "user" | "assistant";
export type MessageStatus = "streaming" | "done" | "failed" | "stopped";

export interface MessageProps extends Omit<React.ComponentPropsWithoutRef<"article">, "role"> {
  role: MessageRole;
  /** Assistant messages only. Owned by the caller, from the real stream. */
  status?: MessageStatus;
  /** Shown above the message: "Assistant", a model name, a teammate. */
  author?: React.ReactNode;
  /** A small avatar or an `AgentPresence` in its dot form. */
  avatar?: React.ReactNode;
  /** Timestamp or other quiet metadata, shown next to the author. */
  meta?: React.ReactNode;
  /** Actions for a finished message, usually an `AIActionToolbar`. Hidden until it finishes. */
  actions?: React.ReactNode;
  /** Why it failed, in words a user can act on. */
  error?: string;
  onRetry?: () => void;
  /** Offered on a stopped message, to pick up where it left off. */
  onContinue?: () => void;
}

/**
 * One turn in a conversation — the user's request or the assistant's reply — and the
 * container that the rest of the system's trust pieces live inside.
 *
 * An assistant reply is more than text: reasoning, tool calls, citations and the answer
 * belong to the same turn, so they're children of one Message rather than separate
 * rows. Order them the way the work happened (reasoning, then tools, then the answer)
 * and the message reads as a record.
 *
 * Status comes from the stream, and each status looks like what it is. **Streaming** shows
 * the text as it really arrives, with a quantized cursor at the end — never simulated
 * typing — and holds back actions, because acting on half an answer is a mistake the UI
 * shouldn't invite. **Failed** keeps whatever arrived, says why, and offers Retry.
 * **Stopped** keeps the partial answer, labelled as partial, with Continue. Nothing is
 * silently discarded.
 */
function Message({
  role,
  status = "done",
  author,
  avatar,
  meta,
  actions,
  error,
  onRetry,
  onContinue,
  className,
  children,
  ...props
}: MessageProps) {
  const isUser = role === "user";
  const streaming = !isUser && status === "streaming";

  return (
    <article
      aria-label={isUser ? "You said" : typeof author === "string" ? `${author} said` : "Assistant said"}
      aria-busy={streaming || undefined}
      data-role={role}
      data-status={isUser ? undefined : status}
      className={cn("group/message flex w-full gap-3", isUser ? "justify-end" : "justify-start", className)}
      {...props}
    >
      {!isUser && avatar ? <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center">{avatar}</div> : null}

      <div className={cn("flex min-w-0 flex-col gap-2", isUser ? "max-w-[85%] items-end" : "flex-1")}>
        {author || meta ? (
          <div className={cn("flex items-baseline gap-2 text-xs", isUser && "flex-row-reverse")}>
            {author ? <span className="font-medium text-foreground">{author}</span> : null}
            {meta ? <span className="text-muted-foreground tabular-nums">{meta}</span> : null}
          </div>
        ) : null}

        <div
          className={cn(
            "flex min-w-0 flex-col gap-3",
            isUser && "rounded-2xl rounded-br-md bg-muted px-3.5 py-2.5 text-foreground",
            status === "failed" && !isUser && "opacity-80"
          )}
        >
          {children}
          {streaming ? <StreamingCursor /> : null}
        </div>

        {!isUser && status === "failed" ? (
          <div role="alert" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="text-destructive">{error ?? "The response didn't finish."}</span>
            {onRetry ? (
              <button type="button" onClick={onRetry} className={linkButton}>
                Retry
              </button>
            ) : null}
          </div>
        ) : null}

        {!isUser && status === "stopped" ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="text-muted-foreground">Stopped. This answer is incomplete.</span>
            {onContinue ? (
              <button type="button" onClick={onContinue} className={linkButton}>
                Continue
              </button>
            ) : null}
            {onRetry ? (
              <button type="button" onClick={onRetry} className={linkButton}>
                Start over
              </button>
            ) : null}
          </div>
        ) : null}

        {actions && (isUser || status === "done") ? (
          <div
            className={cn(
              isUser &&
                // A user's own message keeps its actions out of the way until it's pointed at.
                "opacity-0 transition-opacity duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)] group-focus-within/message:opacity-100 group-hover/message:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100"
            )}
          >
            {actions}
          </div>
        ) : null}
      </div>
    </article>
  );
}

const linkButton =
  "relative font-medium text-foreground underline underline-offset-2 outline-none after:absolute after:inset-x-0 after:-inset-y-3 after:content-[''] focus-visible:ring-[3px] focus-visible:ring-ring/40";

/**
 * The end-of-stream marker: one quantized cell that pulses, in the system's cell grammar.
 * It says "more is coming" without pretending to type. It is decorative, because the
 * article's `aria-busy` already carries the state.
 */
function StreamingCursor() {
  return (
    <span aria-hidden="true" data-pd-decorative className="-mt-2 flex h-4 items-center">
      <span className="size-2 rounded-[2px] bg-foreground/70 animate-[pd-cell-pulse_1.1s_ease-in-out_infinite] motion-reduce:animate-none" />
    </span>
  );
}

export interface MessageContentProps extends React.ComponentPropsWithoutRef<"div"> {}

/**
 * The answer's text. Bring your own markdown renderer and put its output inside; the
 * typography for paragraphs, lists, headings, inline code, links and quotes is handled
 * here, so any renderer's plain HTML reads consistently.
 */
function MessageContent({ className, ...props }: MessageContentProps) {
  return (
    <div
      className={cn(
        "min-w-0 text-sm leading-relaxed text-foreground text-pretty break-words",
        "[&>*+*]:mt-3 [&_p]:leading-relaxed",
        "[&_ul]:list-disc [&_ol]:list-decimal [&_ul,&_ol]:space-y-1 [&_ul,&_ol]:pl-5",
        "[&_h1,&_h2,&_h3,&_h4]:font-semibold [&_h1]:text-base [&_h2]:text-base [&_h3]:text-sm",
        "[&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-muted-foreground/50 hover:[&_a]:decoration-foreground",
        "[&_:not(pre)>code]:rounded-sm [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-px [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.8125rem]",
        "[&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
        "[&_strong]:font-semibold",
        className
      )}
      {...props}
    />
  );
}

export { Message, MessageContent };
