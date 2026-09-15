"use client";

import * as React from "react";

import { AgentAsk, type AskField } from "@/registry/agent-ask/agent-ask";
import type { AgentState } from "@/registry/agent-presence/agent-presence";
import { AIActionToolbar, type AIAction } from "@/registry/ai-action-toolbar/ai-action-toolbar";
import {
  AIApprovalGate,
  type ApprovalImpact,
  type ApprovalRisk,
} from "@/registry/ai-approval-gate/ai-approval-gate";
import type { ProvenanceSource } from "@/registry/ai-context-surface/ai-context-surface";
import type { ConfidenceTier } from "@/registry/confidence-meter/confidence-meter";
import { LiveStatusLine } from "@/registry/live-status-line/live-status-line";
import { ReasoningStream } from "@/registry/reasoning-stream/reasoning-stream";
import { cn } from "@/lib/utils";

/** A pending elicitation — the agent cannot continue without an answer. */
export type AskRequest = {
  source: string;
  question: string;
  explanation?: string;
  fields: AskField[];
  onRespond: (values: Record<string, string | boolean>) => void;
  onDecline?: () => void;
  onCancel?: () => void;
};

/** A pending authorisation — the agent wants to do something consequential. */
export type ApprovalRequest = {
  action: string;
  reversible: boolean;
  risk?: ApprovalRisk;
  impact?: ApprovalImpact[];
  confidence?: ConfidenceTier;
  provenance?: string;
  explanation?: string;
  sources?: ProvenanceSource[];
  onApprove: () => void;
  onReject: () => void;
  onEdit?: () => void;
  busy?: "approve" | "reject" | null;
};

export interface ThinkingExperienceProps extends React.ComponentPropsWithoutRef<"section"> {
  state: AgentState;
  status: string;
  detail?: string;
  startedAt?: number | Date;
  reasoning?: string[];
  reasoningMs?: number;
  /** Rendered when `state` is `asking`. */
  ask?: AskRequest;
  /** Rendered when `state` is `awaitingApproval`. */
  approval?: ApprovalRequest;
  /** The finished output. Rendered once the run reaches a terminal state. */
  result?: React.ReactNode;
  resultActions?: AIAction[];
  onResultAction?: (actionId: string) => void;
  onCancel?: () => void;
  /** Heading level for the question or approval shown during the run. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

const USER_TURN: AgentState[] = ["asking", "awaitingApproval", "suggesting"];
const TERMINAL: AgentState[] = ["done", "failed", "cancelled"];

/**
 * A complete agent run, orchestrated — the composed surface the individual AI-tier
 * components exist to be assembled into.
 *
 * The value it adds over rendering those components yourself is the orchestration:
 * knowing which surface belongs on screen at which moment, and applying the
 * turn-taking grammar at the level of the whole panel rather than a single indicator.
 * When the agent hands control back, the machine's own surfaces visibly step down and
 * the thing needing an answer takes the emphasis — which is the same rule as
 * DESIGN.md §3a, scaled from one dot to an entire layout.
 */
function ThinkingExperience({
  state,
  status,
  detail,
  startedAt,
  reasoning,
  reasoningMs,
  ask,
  approval,
  result,
  resultActions,
  onResultAction,
  onCancel,
  headingLevel = 3,
  className,
  ...props
}: ThinkingExperienceProps) {
  const userTurn = USER_TURN.includes(state);
  const terminal = TERMINAL.includes(state);
  const interrupt = (state === "asking" && ask) || (state === "awaitingApproval" && approval);

  return (
    <section
      aria-label="Agent run"
      className={cn("flex flex-col gap-3 rounded-lg border bg-card p-3", className)}
      {...props}
    >
      {/* The machine's own account of itself. It steps down — but is never disabled —
          when control passes back: you must always be able to stop a run, including
          one that is waiting on you.
          The step-down used to be `opacity-55` on the whole region, which took its text
          below readable contrast (2.1:1 in light mode). Emphasis now drops by role
          instead: decorative graphics fade, and primary text falls to the muted
          colour, which still clears 4.5:1. */}
      <div
        className={cn(
          "flex flex-col gap-2 [&_*]:transition-[color,opacity] [&_*]:duration-[var(--pd-duration-base)] [&_*]:ease-[var(--pd-ease-standard)] motion-reduce:[&_*]:transition-none",
          interrupt && "[&_[data-pd-decorative]]:opacity-40 [&_svg[aria-hidden=true]]:opacity-40 [&_.text-foreground]:text-muted-foreground"
        )}
      >
        <LiveStatusLine
          state={state}
          status={status}
          detail={detail}
          startedAt={terminal ? undefined : startedAt}
          onCancel={onCancel}
        />

        {reasoning && reasoning.length > 0 ? (
          <div className="pl-[22px]">
            <ReasoningStream
              steps={reasoning}
              isStreaming={!terminal && !userTurn}
              durationMs={reasoningMs}
            />
          </div>
        ) : null}
      </div>

      {/* Whatever needs an answer. Emphasised by a ring rather than by motion, because
          this is the user's turn and stillness is the signal. */}
      {interrupt ? (
        <div className="rounded-lg ring-2 ring-ring/30">
          {state === "asking" && ask ? (
            <AgentAsk

              headingLevel={headingLevel}
              source={ask.source}
              question={ask.question}
              explanation={ask.explanation}
              fields={ask.fields}
              onRespond={ask.onRespond}
              onDecline={ask.onDecline}
              onCancel={ask.onCancel}
              className="border-0"
            />
          ) : null}

          {state === "awaitingApproval" && approval ? (
            <AIApprovalGate

              headingLevel={headingLevel}
              action={approval.action}
              risk={approval.risk}
              reversible={approval.reversible}
              impact={approval.impact}
              confidence={approval.confidence}
              provenance={approval.provenance}
              explanation={approval.explanation}
              sources={approval.sources}
              busy={approval.busy}
              onApprove={approval.onApprove}
              onReject={approval.onReject}
              onEdit={approval.onEdit}
              className="border-0"
            />
          ) : null}
        </div>
      ) : null}

      {terminal && result ? (
        <div className="flex flex-col gap-3 border-t pt-3">
          <div className="animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] motion-reduce:animate-none">
            {result}
          </div>
          {resultActions && resultActions.length > 0 ? (
            <AIActionToolbar
              label="Result actions"
              actions={resultActions}
              onAction={(id) => onResultAction?.(id)}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export { ThinkingExperience };
