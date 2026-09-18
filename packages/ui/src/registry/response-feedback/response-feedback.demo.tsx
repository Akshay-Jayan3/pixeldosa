"use client";

import * as React from "react";

import { ResponseFeedback, type FeedbackSubmission } from "@/registry/response-feedback/response-feedback";

export default function ResponseFeedbackDemo() {
  const [last, setLast] = React.useState<FeedbackSubmission | null>(null);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <p className="rounded-lg border bg-card p-3 text-sm text-foreground text-pretty">
        The client ignores your 30-second config and aborts every request after 5 seconds. Pass
        <code className="mx-1 font-mono text-xs">config.requestTimeout</code>
        into the abort timer.
      </p>
      <ResponseFeedback
        destination="the team that trains this assistant"
        onSubmit={setLast}
        key={last ? "sent" : "ready"}
      />
      {last ? (
        <p className="text-xs text-muted-foreground text-pretty">
          Your product receives: {last.verdict === "up" ? "useful" : "not useful"}
          {last.reasonIds.length > 0 ? ` · ${last.reasonIds.join(", ")}` : ""}
          {last.comment ? ` · “${last.comment}”` : ""}.{" "}
          <button
            type="button"
            onClick={() => setLast(null)}
            className="font-medium underline underline-offset-2 hover:no-underline"
          >
            Try again
          </button>
        </p>
      ) : null}
    </div>
  );
}
