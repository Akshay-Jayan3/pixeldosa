"use client";

import * as React from "react";

import { AIActionToolbar } from "@/registry/ai-action-toolbar/ai-action-toolbar";
import { ConfidenceMeter, type ConfidenceTier } from "@/registry/confidence-meter/confidence-meter";
import { cn } from "@/lib/utils";

export type TriageItem = {
  id: string;
  /** What is being changed — a record, a field, a row. */
  label: string;
  /** The current value, shown struck through when present. */
  before?: string;
  /** The AI's proposed value. */
  after: string;
  confidence: ConfidenceTier;
  provenance?: string;
};

export type TriageDecision = "accepted" | "rejected";

export interface AITriageTableProps extends React.ComponentPropsWithoutRef<"section"> {
  items: TriageItem[];
  /** Items the AI examined and chose not to change. Shown collapsed, so nobody scans for them. */
  unchanged?: { id: string; label: string }[];
  /** Commits the accepted items. Nothing is written before this. */
  onApply: (acceptedIds: string[]) => void;
  title?: string;
}

/** Attention order: whatever most needs a human comes first. */
const TIER_ORDER: ConfidenceTier[] = ["low", "medium", "high"];

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn(
        "size-3.5 shrink-0 transition-transform duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
        open && "rotate-90"
      )}
    >
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Reviews many AI-proposed changes at once, organised around where attention is needed
 * rather than in the order the AI produced them.
 *
 * This is the answer to the audit burden: AI now produces changes faster than people can
 * check them, and a component that only enables review makes the human a full-time
 * auditor. Triage reduces how much review is needed — low-confidence changes open
 * first, high-confidence ones collapse to a count, and what the AI left unchanged is a
 * single line instead of forty rows to scan.
 *
 * It does not become "Accept all". Bulk acceptance exists only for the high-confidence
 * group, and only once that group has been opened; decisions are staged, and nothing is
 * written until Apply.
 */
function AITriageTable({
  items,
  unchanged = [],
  onApply,
  title = "Review proposed changes",
  className,
  ...props
}: AITriageTableProps) {
  const [decisions, setDecisions] = React.useState<Record<string, TriageDecision>>({});
  const [open, setOpen] = React.useState<Record<string, boolean>>({
    low: true,
    medium: true,
    high: false,
    unchanged: false,
  });
  // A group counts as inspected once it has been on screen. Low and medium start open,
  // so they start inspected; high must be opened deliberately before it can be bulk-accepted.
  const [inspected, setInspected] = React.useState<Set<string>>(() => new Set(["low", "medium"]));
  const headingId = React.useId();

  const toggleGroup = (key: string) => {
    setOpen((previous) => ({ ...previous, [key]: !previous[key] }));
    setInspected((previous) => new Set(previous).add(key));
  };

  const decide = (id: string, decision: TriageDecision | null) =>
    setDecisions((previous) => {
      const next = { ...previous };
      if (decision) next[id] = decision;
      else delete next[id];
      return next;
    });

  const groups = TIER_ORDER.map((tier) => ({
    tier,
    items: items.filter((item) => item.confidence === tier),
  })).filter((group) => group.items.length > 0);

  const accepted = items.filter((item) => decisions[item.id] === "accepted");
  const rejectedCount = items.filter((item) => decisions[item.id] === "rejected").length;
  const reviewedCount = accepted.length + rejectedCount;
  const pendingCount = items.length - reviewedCount;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("flex flex-col rounded-lg border bg-card", className)}
      {...props}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b p-4">
        <h3 id={headingId} className="text-sm font-medium text-foreground">
          {title}
        </h3>
        <p role="status" aria-live="polite" className="text-xs text-muted-foreground tabular-nums">
          {reviewedCount} of {items.length} reviewed
          {unchanged.length > 0 ? ` · ${unchanged.length} unchanged` : ""}
        </p>
      </header>

      {groups.map(({ tier, items: groupItems }) => {
        const isOpen = Boolean(open[tier]);
        const panelId = `${headingId}-${tier}`;
        const left = groupItems.filter((item) => !decisions[item.id]);
        const canBulkAccept = tier === "high" && inspected.has("high") && left.length > 0;

        return (
          <div key={tier} className="border-b last:border-b-0">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleGroup(tier)}
                className="relative inline-flex items-center gap-2 rounded-md text-xs text-muted-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] after:absolute after:inset-x-0 after:-inset-y-2.5 after:content-[''] motion-reduce:transition-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
              >
                <Chevron open={isOpen} />
                <ConfidenceMeter confidence={tier} />
                <span className="tabular-nums">
                  · {left.length} of {groupItems.length} left
                </span>
              </button>

              {tier === "high" && left.length > 0 ? (
                inspected.has("high") ? (
                  <AIActionToolbar
                    size="sm"
                    label="High-confidence group actions"
                    actions={[
                      {
                        id: "accept-group",
                        label: `Accept ${left.length}`,
                        intent: "secondary",
                        disabled: !canBulkAccept,
                      },
                    ]}
                    onAction={() => left.forEach((item) => decide(item.id, "accepted"))}
                  />
                ) : (
                  // Stated rather than silently disabled: a disabled button explains nothing,
                  // and the reason it's unavailable is the whole design.
                  <span className="text-xs text-muted-foreground">Open to review before accepting</span>
                )
              ) : null}
            </div>

            <div
              id={panelId}
              // inert keeps collapsed rows out of the tab order and the accessibility tree —
              // a 0fr grid row hides content visually but leaves its buttons focusable.
              inert={!isOpen}
              className={cn(
                "grid overflow-hidden transition-[grid-template-rows] duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <ul className="min-h-0">
                {groupItems.map((item) => {
                  const decision = decisions[item.id];
                  return (
                    <li
                      key={item.id}
                      className="flex flex-col gap-2 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div
                        className={cn(
                          "flex min-w-0 flex-col gap-0.5 transition-opacity duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
                          decision && "opacity-55"
                        )}
                      >
                        <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-pretty">
                          {item.before ? (
                            <>
                              <span className="text-muted-foreground line-through decoration-muted-foreground/60">
                                {item.before}
                              </span>
                              <span aria-hidden="true" className="px-1.5 text-muted-foreground">
                                →
                              </span>
                              <span className="sr-only"> changes to </span>
                            </>
                          ) : null}
                          <span className="text-foreground underline decoration-foreground/30 underline-offset-2">
                            {item.after}
                          </span>
                        </p>
                        {item.provenance ? (
                          <p className="text-xs text-muted-foreground">via {item.provenance}</p>
                        ) : null}
                      </div>

                      {decision ? (
                        <AIActionToolbar
                          size="sm"
                          label={`Decision for ${item.label}`}
                          message={decision === "accepted" ? "Accepted" : "Rejected"}
                          actions={[{ id: "undo", label: "Undo", intent: "quiet" }]}
                          onAction={() => decide(item.id, null)}
                          className="shrink-0"
                        />
                      ) : (
                        <AIActionToolbar
                          size="sm"
                          label={`Decision for ${item.label}`}
                          actions={[
                            { id: "accept", label: "Accept", intent: "secondary" },
                            { id: "reject", label: "Reject", intent: "quiet" },
                          ]}
                          onAction={(id) => decide(item.id, id === "accept" ? "accepted" : "rejected")}
                          className="shrink-0"
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })}

      {unchanged.length > 0 ? (
        <div className="border-t">
          <button
            type="button"
            aria-expanded={Boolean(open.unchanged)}
            aria-controls={`${headingId}-unchanged`}
            onClick={() => toggleGroup("unchanged")}
            className="relative flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs text-muted-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/40"
          >
            <Chevron open={Boolean(open.unchanged)} />
            <span className="tabular-nums">{unchanged.length} checked and left unchanged</span>
          </button>
          <div
            id={`${headingId}-unchanged`}
            inert={!open.unchanged}
            className={cn(
              "grid overflow-hidden transition-[grid-template-rows] duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
              open.unchanged ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <ul className="min-h-0">
              {unchanged.map((entry) => (
                <li key={entry.id} className="truncate border-t px-4 py-2 text-xs text-muted-foreground">
                  {entry.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <footer className="border-t p-4">
        <AIActionToolbar
          label="Apply reviewed changes"
          message={
            pendingCount > 0
              ? `${pendingCount} not reviewed will stay as they are.`
              : "Everything reviewed."
          }
          actions={[
            {
              id: "apply",
              label: `Apply ${accepted.length}`,
              intent: "primary",
              disabled: accepted.length === 0,
            },
          ]}
          onAction={() => onApply(accepted.map((item) => item.id))}
        />
      </footer>
    </section>
  );
}

export { AITriageTable };
