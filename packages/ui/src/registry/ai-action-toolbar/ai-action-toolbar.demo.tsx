"use client";

import * as React from "react";

import { AIActionToolbar, type AIAction } from "@/registry/ai-action-toolbar/ai-action-toolbar";

const SUMMARY =
  "Three of the five flagged invoices share the same billing contact, which is the most likely cause of the duplicate-payment warning.";

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={path} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Status = "reviewing" | "regenerating" | "applied" | "explained";

export default function AIActionToolbarDemo() {
  const [status, setStatus] = React.useState<Status>("reviewing");

  const handleAction = (id: string) => {
    if (id === "regenerate") {
      setStatus("regenerating");
      window.setTimeout(() => setStatus("reviewing"), 1200);
      return;
    }
    if (id === "apply") setStatus("applied");
    if (id === "explain") setStatus("explained");
    if (id === "undo") setStatus("reviewing");
    if (id === "dismiss") setStatus("reviewing");
  };

  const reviewActions: AIAction[] = [
    {
      id: "apply",
      label: "Apply",
      intent: "primary",
      icon: <Icon path="M20 6 9 17l-5-5" />,
    },
    {
      id: "regenerate",
      label: "Regenerate",
      busy: status === "regenerating",
      icon: <Icon path="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6" />,
    },
    {
      id: "explain",
      label: "Explain",
      intent: "quiet",
      icon: <Icon path="M12 17h.01M12 6a3 3 0 0 0-3 3M12 14v-2c1.5 0 2-1 2-2" />,
    },
    {
      id: "report",
      label: "Report",
      intent: "quiet",
      icon: <Icon path="M4 21V4h10l-1 3h7v9h-7l1-3H4" />,
    },
  ];

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="rounded-md border bg-muted p-3">
        <p className="text-sm text-foreground">{SUMMARY}</p>
      </div>

      {status === "explained" ? (
        <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
          Grouped by billing contact across the last 90 days of invoices, then ranked by
          how often duplicates followed that grouping.
        </p>
      ) : null}

      {status === "applied" ? (
        <AIActionToolbar
          message="Summary applied."
          label="Applied result actions"
          actions={[{ id: "undo", label: "Undo", intent: "quiet" }]}
          onAction={handleAction}
        />
      ) : (
        <AIActionToolbar
          label="Summary actions"
          actions={reviewActions}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
