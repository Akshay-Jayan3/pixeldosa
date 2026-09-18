"use client";

import * as React from "react";

import { RunInbox, type AgentRun } from "@/registry/run-inbox/run-inbox";

const RUNS: AgentRun[] = [
  {
    id: "1",
    title: "Research the top 5 competitors",
    state: "needsYou",
    agent: "Research agent",
    note: "Per seat or flat pricing first?",
    time: "3 hours ago",
    unread: true,
  },
  {
    id: "2",
    title: "Reconcile the August invoices",
    state: "needsYou",
    agent: "Finance agent",
    note: "Wants to email 3 people. Waiting for approval.",
    time: "40 minutes ago",
    unread: true,
  },
  {
    id: "3",
    title: "Summarise yesterday's support tickets",
    state: "running",
    agent: "Support agent",
    note: "Reading 42 of 120 tickets",
    time: "started 4 minutes ago",
  },
  {
    id: "4",
    title: "Refresh the pricing page copy",
    state: "failed",
    agent: "Content agent",
    note: "The CMS refused the update. Nothing was changed.",
    time: "1 hour ago",
  },
  {
    id: "5",
    title: "Weekly competitor digest",
    state: "done",
    agent: "Research agent",
    note: "12 sources · 5 competitors",
    time: "yesterday",
  },
  {
    id: "6",
    title: "Morning inbox triage",
    state: "scheduled",
    agent: "Inbox agent",
    time: "tomorrow at 9:00",
  },
];

export default function RunInboxDemo() {
  const [runs, setRuns] = React.useState(RUNS);
  const [opened, setOpened] = React.useState<string | null>(null);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <RunInbox
        headingLevel={2}
        runs={runs}
        onOpen={(id) => {
          setOpened(id);
          setRuns((previous) => previous.map((run) => (run.id === id ? { ...run, unread: false } : run)));
        }}
        onStop={(id) =>
          setRuns((previous) =>
            previous.map((run) =>
              run.id === id ? { ...run, state: "failed", note: "You stopped it. Nothing was changed." } : run
            )
          )
        }
      />
      {opened ? (
        <p className="text-sm text-muted-foreground">
          Opened “{runs.find((run) => run.id === opened)?.title}”.
        </p>
      ) : null}
    </div>
  );
}
