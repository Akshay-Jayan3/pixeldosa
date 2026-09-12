"use client";

import * as React from "react";

import { AIActionToolbar, type AIAction } from "@/registry/ai-action-toolbar/ai-action-toolbar";
import { AIContextSurface, type ProvenanceSource } from "@/registry/ai-context-surface/ai-context-surface";
import { ConfidenceMeter, type ConfidenceTier } from "@/registry/confidence-meter/confidence-meter";
import { cn } from "@/lib/utils";

export type ApprovalRisk = "low" | "medium" | "high";

/** One measurable fact about the action's blast radius. */
export type ApprovalImpact = { label: string; value: string };

export interface AIApprovalGateProps extends React.ComponentPropsWithoutRef<"section"> {
  /**
   * What will happen, in consequence terms the user can evaluate — "Send the Q3
   * summary to 243 contacts", never "Execute send_email".
   */
  action: string;
  risk?: ApprovalRisk;
  /**
   * Whether this can be taken back. Stated plainly because it is the single most
   * decision-relevant fact on the surface, and almost nothing surfaces it.
   */
  reversible: boolean;
  /** The blast radius as countable facts. This is what makes the action reviewable. */
  impact?: ApprovalImpact[];
  confidence?: ConfidenceTier;
  provenance?: string;
  /** Passed through to AI Context Surface — why the agent proposed this. */
  explanation?: string;
  sources?: ProvenanceSource[];
  onApprove: () => void;
  onReject: () => void;
  /** Offer only when the action's payload is genuinely editable before it runs. */
  onEdit?: () => void;
  /** Which action is in flight, owned by the caller as everywhere else in this system. */
  busy?: "approve" | "reject" | null;
}

const RISK_LABEL: Record<ApprovalRisk, string> = {
  low: "Low risk",
  medium: "Needs review",
  high: "High risk",
};

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-3.5 shrink-0">
      <path d="M12 8v5m0 3h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * A checkpoint before a consequential agent action — the `awaitingApproval` state made
 * real. Composes the trust primitives this system already ships rather than
 * re-deriving them: Confidence Meter for certainty, AI Context Surface for reasoning,
 * AI Action Toolbar for the decision strip.
 *
 * Holds perfectly still: it is the user's turn, and nothing proceeds without them
 * (DESIGN.md §3a, §3.7).
 */
function AIApprovalGate({
  action,
  risk = "medium",
  reversible,
  impact,
  confidence,
  provenance,
  explanation,
  sources,
  onApprove,
  onReject,
  onEdit,
  busy,
  className,
  ...props
}: AIApprovalGateProps) {
  const headingId = React.useId();

  const actions: AIAction[] = [
    {
      id: "approve",
      label: "Approve",
      // A dangerous action must never look identical to a harmless primary one, so a
      // high-risk approval carries the destructive treatment rather than the primary.
      intent: risk === "high" ? "destructive" : "primary",
      busy: busy === "approve",
    },
    ...(onEdit ? [{ id: "edit", label: "Edit first", intent: "secondary" as const }] : []),
    { id: "reject", label: "Reject", intent: "quiet", busy: busy === "reject" },
  ];

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "flex flex-col gap-4 rounded-lg border bg-card p-4",
        risk === "high" && "border-destructive/40",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-xs font-medium",
              risk === "high"
                ? "border-destructive/40 text-destructive"
                : "border-input text-muted-foreground"
            )}
          >
            {RISK_LABEL[risk]}
          </span>
          <span role="status" aria-live="polite" className="text-xs text-muted-foreground">
            Waiting for your approval
          </span>
        </div>

        <h3 id={headingId} className="text-sm font-medium text-foreground text-pretty">
          {action}
        </h3>
      </div>

      {/* The blast radius, as countable facts. An approval without a scope is a
          yes/no question with the information removed. */}
      {impact && impact.length > 0 ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
          {impact.map((item) => (
            <React.Fragment key={item.label}>
              <dt className="text-muted-foreground">{item.label}</dt>
              <dd className="font-medium text-foreground tabular-nums">{item.value}</dd>
            </React.Fragment>
          ))}
        </dl>
      ) : null}

      {/* Reversibility, stated plainly. Almost nothing surfaces this, and it is the
          fact that actually determines how carefully someone should read the rest. */}
      <p
        className={cn(
          "flex items-center gap-1.5 text-xs",
          reversible ? "text-muted-foreground" : "text-destructive"
        )}
      >
        {reversible ? null : <WarningIcon />}
        {reversible ? "This can be undone afterwards." : "This cannot be undone."}
      </p>

      {confidence || explanation || (sources && sources.length > 0) ? (
        <div className="flex flex-col gap-2 border-t pt-3">
          {confidence ? <ConfidenceMeter confidence={confidence} provenance={provenance} /> : null}
          {explanation || (sources && sources.length > 0) ? (
            <AIContextSurface explanation={explanation} sources={sources} />
          ) : null}
        </div>
      ) : null}

      <AIActionToolbar
        label={`Approval decision: ${action}`}
        actions={actions}
        onAction={(id) => {
          if (id === "approve") onApprove();
          if (id === "reject") onReject();
          if (id === "edit") onEdit?.();
        }}
      />
    </section>
  );
}

export { AIApprovalGate };
