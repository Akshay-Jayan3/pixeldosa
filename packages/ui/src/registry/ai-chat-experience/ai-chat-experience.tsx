"use client";

import * as React from "react";

import { AgentPresence, type AgentState } from "@/registry/agent-presence/agent-presence";
import { AIActionToolbar } from "@/registry/ai-action-toolbar/ai-action-toolbar";
import { CodeBlock, splitCodeFences } from "@/registry/code-block/code-block";
import { CitedText, type CitationSource } from "@/registry/inline-citations/inline-citations";
import { Message, MessageContent, type MessageStatus } from "@/registry/message/message";
import { MessageScroller } from "@/registry/message-scroller/message-scroller";
import {
  PromptComposer,
  type ComposerAttachment,
  type ComposerControl,
  type ComposerSubmission,
} from "@/registry/prompt-composer/prompt-composer";
import { ReasoningStream } from "@/registry/reasoning-stream/reasoning-stream";
import { Suggestions, type Suggestion } from "@/registry/suggestions/suggestions";
import { ToolCallGroup, type ToolCall } from "@/registry/tool-call-card/tool-call-card";
import { cn } from "@/lib/utils";

export type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  /** Markdown-ish text. Fenced code becomes Code Blocks; the rest goes through `renderText`. */
  text?: string;
  /** Custom content instead of `text` — e.g. an answer marked up with `<Cite>`. */
  content?: React.ReactNode;
  /** Assistant turns. Defaults to "done". */
  status?: MessageStatus;
  error?: string;
  reasoning?: { steps: string[]; streaming?: boolean; durationMs?: number };
  toolCalls?: ToolCall[];
  /** Sources behind the answer. Rendered as a reference list; use `content` + `<Cite>` for inline markers. */
  sources?: CitationSource[];
  /** Follow-ups. Only shown on the latest assistant turn, once it's done. */
  suggestions?: Suggestion[];
};

export interface AIChatExperienceProps extends Omit<React.ComponentPropsWithoutRef<"section">, "onSubmit"> {
  turns: ChatTurn[];
  onSend: (submission: ComposerSubmission) => void;
  onStop?: () => void;
  onRetry?: (turnId: string) => void;
  onContinue?: (turnId: string) => void;
  onRegenerate?: (turnId: string) => void;
  /** Called on Apply in a code block. */
  onApplyCode?: (code: string, language?: string) => void | Promise<void>;
  /** How follow-up suggestions behave. `fill` (default) puts them in the composer. */
  suggestionMode?: "fill" | "send";
  /** Your markdown renderer. Defaults to paragraphs split on blank lines. */
  renderText?: (text: string) => React.ReactNode;
  assistantName?: string;
  /** Shown when there are no turns yet. */
  empty?: { title: string; description?: string; suggestions?: Suggestion[] };
  controls?: ComposerControl[];
  attachments?: ComposerAttachment[];
  onAttachFiles?: (files: File[]) => void;
  onRemoveAttachment?: (id: string) => void;
  placeholder?: string;
  /** Called near the top of the history. */
  onLoadOlder?: () => void;
  /** Level of the empty-state title and of the Sources headings in answers (the title is gone once a conversation exists, so they share the level). Defaults to 2. */
  headingLevel?: 2 | 3 | 4 | 5;
}

function defaultRenderText(text: string) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => <p key={index}>{paragraph}</p>);
}

/**
 * What the agent is doing before any answer text exists. Reasoning is thinking, a
 * running tool is working (and says which), otherwise it's still thinking. Once text
 * arrives, the message's own streaming cursor takes over and this disappears — two
 * "busy" signals at once would be noise.
 */
function presenceFor(turn: ChatTurn): { state: AgentState; label: string } | null {
  if (turn.status !== "streaming" || turn.text || turn.content) return null;
  // A streaming reasoning trace or a running tool call already says what's happening, in
  // more detail. Presence only covers the gap before either exists.
  if (turn.reasoning?.steps.length && (turn.reasoning.streaming ?? true)) return null;
  if (turn.toolCalls?.some((call) => call.status === "running")) return null;
  return { state: "thinking", label: turn.toolCalls?.length ? "Putting the answer together" : "Thinking" };
}

/**
 * A complete assistant conversation, orchestrated.
 *
 * Every visible part is a shipped component. The block's value is the decisions a team
 * would otherwise re-derive, usually inconsistently:
 *
 * - **One busy signal at a time.** Agent Presence shows while the agent reasons or runs
 *   tools, and the message's streaming cursor takes over when text arrives. Reasoning stops
 *   streaming when the answer starts.
 * - **Send becomes Stop** for exactly as long as the latest turn is streaming, and the
 *   composer stays editable, so the next question can be drafted while the answer lands.
 * - **Follow-ups belong to the latest finished answer.** Suggestions from older turns
 *   disappear, and nothing is suggested mid-stream. In `fill` mode a follow-up lands in
 *   the composer to edit.
 * - **Code is safe mid-stream.** Fenced code renders as Code Blocks, and an unclosed fence
 *   streams rather than breaking layout.
 * - **Screen readers hear finished answers once**, not a token stream.
 * - **Failed and stopped turns keep their content** and offer Retry or Continue in place.
 */
function AIChatExperience({
  turns,
  onSend,
  onStop,
  onRetry,
  onContinue,
  onRegenerate,
  onApplyCode,
  suggestionMode = "fill",
  renderText = defaultRenderText,
  assistantName = "Assistant",
  empty,
  controls,
  attachments,
  onAttachFiles,
  onRemoveAttachment,
  placeholder = "Ask anything…",
  onLoadOlder,
  headingLevel = 2,
  className,
  ...props
}: AIChatExperienceProps) {
  const Heading = `h${headingLevel}` as "h2";
  const [draft, setDraft] = React.useState("");
  const [announcement, setAnnouncement] = React.useState("");
  const [copied, setCopied] = React.useState<string | null>(null);
  const previousStatus = React.useRef<Record<string, MessageStatus | undefined>>({});
  const sectionRef = React.useRef<HTMLElement>(null);

  const lastAssistant = [...turns].reverse().find((turn) => turn.role === "assistant");
  const busy = lastAssistant?.status === "streaming";

  // Announce an answer once, when it finishes — not while it streams.
  React.useEffect(() => {
    for (const turn of turns) {
      if (turn.role !== "assistant") continue;
      const before = previousStatus.current[turn.id];
      if (before === "streaming" && turn.status !== "streaming") {
        const summary = (turn.text ?? "").replace(/```[\s\S]*?(```|$)/g, " code ").replace(/\s+/g, " ").trim();
        setAnnouncement(
          turn.status === "failed"
            ? `${assistantName}'s answer failed`
            : turn.status === "stopped"
              ? `${assistantName} stopped`
              : `${assistantName} replied: ${summary.slice(0, 140)}`
        );
      }
      previousStatus.current[turn.id] = turn.status;
    }
  }, [turns, assistantName]);

  const copyTurn = async (turn: ChatTurn) => {
    try {
      await navigator.clipboard.writeText(turn.text ?? "");
      setCopied(turn.id);
      window.setTimeout(() => setCopied((id) => (id === turn.id ? null : id)), 2000);
    } catch {
      setCopied(null);
    }
  };

  const chooseSuggestion = (prompt: string) => {
    if (suggestionMode === "send") {
      onSend({ text: prompt, values: {}, attachments: [] });
      return;
    }
    setDraft(prompt);
    // Filled to be edited, so put the caret at the end of it.
    window.requestAnimationFrame(() => {
      const textarea = sectionRef.current?.querySelector<HTMLTextAreaElement>("textarea");
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(prompt.length, prompt.length);
    });
  };

  const renderBody = (turn: ChatTurn) => {
    if (turn.content) return turn.content;
    if (!turn.text) return null;
    const segments = splitCodeFences(turn.text);
    const streaming = turn.status === "streaming";
    return segments.map((segment, index) =>
      segment.type === "code" ? (
        <CodeBlock
          key={index}
          code={segment.content}
          language={segment.language}
          streaming={streaming && !segment.complete}
          onApply={onApplyCode ? () => onApplyCode(segment.content, segment.language) : undefined}
        />
      ) : segment.content.trim() ? (
        <MessageContent key={index}>{renderText(segment.content)}</MessageContent>
      ) : null
    );
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Chat"
      className={cn("flex min-h-0 flex-col overflow-hidden rounded-lg border bg-background", className)}
      {...props}
    >
      {turns.length === 0 && empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
          <div className="flex flex-col gap-1.5">
            <Heading className="text-lg font-semibold tracking-tight text-foreground text-balance">{empty.title}</Heading>
            {empty.description ? (
              <p className="max-w-sm text-sm text-muted-foreground text-pretty">{empty.description}</p>
            ) : null}
          </div>
          {empty.suggestions?.length ? (
            <Suggestions
              items={empty.suggestions}
              mode={suggestionMode}
              onSelect={chooseSuggestion}
              className="justify-center"
            />
          ) : null}
        </div>
      ) : (
        <MessageScroller className="flex-1" announcement={announcement} onReachTop={onLoadOlder}>
          {turns.map((turn) => {
            if (turn.role === "user") {
              return (
                <Message key={turn.id} role="user">
                  {turn.content ?? <span className="whitespace-pre-wrap">{turn.text}</span>}
                </Message>
              );
            }

            const status = turn.status ?? "done";
            const presence = presenceFor(turn);
            const isLatest = turn.id === lastAssistant?.id;
            const hasAnswer = Boolean(turn.text || turn.content);
            const lastSegment = turn.text && !turn.content ? splitCodeFences(turn.text).at(-1) : undefined;
            const insideOpenFence = lastSegment?.type === "code" && !lastSegment.complete;
            const body = renderBody(turn);

            return (
              <Message
                key={turn.id}
                role="assistant"
                author={assistantName}
                status={status}
                error={turn.error}
                onRetry={onRetry ? () => onRetry(turn.id) : undefined}
                onContinue={onContinue ? () => onContinue(turn.id) : undefined}
                // The cursor means "text is arriving". Before text, presence, reasoning or
                // a tool call already says what's happening; inside an open code fence, the
                // Code Block's own "Writing" does.
                showCursor={hasAnswer && !insideOpenFence}
                actions={
                  <AIActionToolbar
                    label="Answer actions"
                    message={copied === turn.id ? "Copied." : undefined}
                    actions={[
                      { id: "copy", label: "Copy", intent: "quiet" },
                      ...(onRegenerate ? [{ id: "regenerate", label: "Regenerate", intent: "quiet" as const }] : []),
                    ]}
                    onAction={(id) => (id === "copy" ? copyTurn(turn) : onRegenerate?.(turn.id))}
                  />
                }
              >
                {turn.reasoning?.steps.length ? (
                  <ReasoningStream
                    steps={turn.reasoning.steps}
                    // Reasoning is over once the answer starts, whatever the stream says.
                    isStreaming={status === "streaming" && !hasAnswer && (turn.reasoning.streaming ?? true)}
                    durationMs={turn.reasoning.durationMs}
                  />
                ) : null}
                {turn.toolCalls?.length ? <ToolCallGroup calls={turn.toolCalls} /> : null}
                {presence ? <AgentPresence state={presence.state} label={presence.label} form="line" size="sm" /> : null}
                {turn.sources?.length && body ? (
                  <CitedText sources={turn.sources} headingLevel={headingLevel}>{body}</CitedText>
                ) : (
                  body
                )}
                {isLatest && status === "done" && turn.suggestions?.length ? (
                  <Suggestions items={turn.suggestions} mode={suggestionMode} onSelect={chooseSuggestion} />
                ) : null}
              </Message>
            );
          })}
        </MessageScroller>
      )}

      <div className="border-t bg-card/50 p-3">
        <PromptComposer
          value={draft}
          onValueChange={setDraft}
          placeholder={placeholder}
          submitLabel="Send"
          label="Message"
          controls={controls}
          attachments={attachments}
          onAttachFiles={onAttachFiles}
          onRemoveAttachment={onRemoveAttachment}
          busy={busy}
          onStop={onStop}
          onSubmit={(submission) => {
            onSend(submission);
            setDraft("");
          }}
          className="bg-background"
        />
      </div>
    </section>
  );
}

export { AIChatExperience };
