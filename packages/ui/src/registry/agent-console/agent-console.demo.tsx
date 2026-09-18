"use client";

import * as React from "react";

import {
  AgentConsole,
  type ConsoleRunDetail,
} from "@/registry/agent-console/agent-console";
import type { AgentRun } from "@/registry/run-inbox/run-inbox";
import type { ScheduleTrigger } from "@/registry/agent-schedule/agent-schedule";
import type { TrailEntry } from "@/registry/activity-trail/activity-trail";

const RUNS: AgentRun[] = [
  {
    id: "refund",
    title: "Decide the refund for order #48120",
    state: "needsYou",
    agent: "Support agent",
    note: "Outside the policy window. I can't decide this one.",
    time: "Waiting 3 hours",
    unread: true,
  },
  {
    id: "invoices",
    title: "Reconcile August invoices against the import batch",
    state: "needsYou",
    agent: "Finance agent",
    note: "Two contacts look like duplicates. Merge them?",
    time: "Waiting 40 minutes",
  },
  {
    id: "digest",
    title: "Draft the weekly competitor digest",
    state: "running",
    agent: "Research agent",
    note: "Reading 12 of 30 sources",
    time: "Started 6 minutes ago",
  },
  {
    id: "sync",
    title: "Sync the pricing page with the new plan names",
    state: "failed",
    agent: "Content agent",
    note: "The CMS rejected two updates. Nothing was published.",
    time: "Stopped an hour ago",
  },
  {
    id: "triage",
    title: "Triage the support inbox",
    state: "done",
    agent: "Support agent",
    note: "24 drafted, 0 sent. All waiting on your review.",
    time: "Finished at 09:14",
  },
  {
    id: "monday",
    title: "Weekly competitor digest",
    state: "scheduled",
    agent: "Research agent",
    time: "Monday at 07:00",
  },
];

const TRAIL: TrailEntry[] = [
  {
    id: "t1",
    time: "09:02",
    actor: "system",
    action: "Started the run",
    authority: "Schedule set by Dana",
  },
  {
    id: "t2",
    time: "09:04",
    actor: "agent",
    action: "Read 30 support conversations",
    authority: "Autonomy: acts on low-risk changes",
    result: "24 needed a reply",
  },
  {
    id: "t3",
    time: "09:11",
    actor: "agent",
    action: "Drafted 24 replies",
    authority: "Autonomy: acts on low-risk changes",
    result: "Held for review, none sent",
    undoable: true,
  },
  {
    id: "t4",
    time: "09:14",
    actor: "agent",
    action: "Stopped before sending",
    authority: "Sending needs your approval",
  },
];

const DETAIL: Record<string, ConsoleRunDetail> = {
  refund: {
    id: "refund",
    title: "Refund decision · order #48120",
    handoff: {
      stage: "waitingForPerson",
      reason: "The customer asked for a refund outside the policy window. I can't decide this one.",
      waitingFor: "Waiting 3 hours",
      context: [
        { id: "order", label: "Order", value: "#48120 · £240 · delivered 31 days ago" },
        { id: "customer", label: "Customer", value: "Priya Menon · 3 years, no refunds before" },
        {
          id: "tried",
          label: "I already tried",
          value: "Offered a replacement and a 30% credit. Both declined.",
        },
      ],
    },
  },
  triage: {
    id: "triage",
    title: "Triage the support inbox",
    steps: [
      { id: "s1", title: "Read the overnight conversations", status: "done", note: "30 read" },
      { id: "s2", title: "Group them by what they need", status: "done", note: "24 need a reply" },
      { id: "s3", title: "Draft a reply for each", status: "done", note: "24 drafted" },
      {
        id: "s4",
        title: "Send the replies",
        status: "waiting",
        needsApproval: true,
        note: "Waiting for your review — nothing has been sent.",
      },
    ],
    runStatus: "Waiting on you",
    trail: TRAIL,
  },
  sync: {
    id: "sync",
    title: "Sync the pricing page",
    steps: [
      { id: "s1", title: "Read the new plan names", status: "done" },
      { id: "s2", title: "Update the pricing page", status: "failed", note: "The CMS rejected the update: a required field was empty." },
      { id: "s3", title: "Publish", status: "pending" },
    ],
    runStatus: "Stopped",
    trail: [
      { id: "a", time: "10:40", actor: "system", action: "Started the run", authority: "You asked for this" },
      {
        id: "b",
        time: "10:41",
        actor: "agent",
        action: "Tried to update two pricing rows",
        authority: "You approved it",
        result: "Rejected by the CMS. Nothing was published.",
      },
    ],
  },
};

const TRIGGERS: ScheduleTrigger[] = [
  {
    id: "g1",
    when: "Every weekday at 9:00",
    does: "Triages the support inbox and drafts replies",
    enabled: true,
    nextRun: "Tomorrow at 9:00",
    lastRun: "Ran today · 24 drafted, 0 sent",
    asksFirst: true,
  },
  {
    id: "g2",
    when: "When an invoice arrives from a new supplier",
    does: "Checks it against the purchase order and flags mismatches",
    enabled: true,
    nextRun: "Whenever one arrives",
  },
  {
    id: "g3",
    when: "Every Monday at 7:00",
    does: "Sends the weekly competitor digest to the team",
    enabled: false,
    lastRun: "Failed last Monday · the source feed timed out",
    lastFailed: true,
  },
];

export default function AgentConsoleDemo() {
  const [selected, setSelected] = React.useState<string | null>("triage");
  const [runs, setRuns] = React.useState(RUNS);
  const [trail, setTrail] = React.useState(TRAIL);
  const [triggers, setTriggers] = React.useState(TRIGGERS);
  const [handedOver, setHandedOver] = React.useState(false);

  const base = selected ? DETAIL[selected] : undefined;
  const detail: ConsoleRunDetail | null = base
    ? {
        ...base,
        trail: base.id === "triage" ? trail : base.trail,
        handoff:
          base.handoff && handedOver
            ? { ...base.handoff, stage: "personHandling", person: "You", waitingFor: undefined }
            : base.handoff,
      }
    : null;

  const needsYou = runs.filter((run) => run.state === "needsYou").length;

  return (
    <AgentConsole
      headingLevel={2}
      briefing={{
        since: "yesterday at 18:00",
        needsYou,
        finished: runs.filter((run) => run.state === "done").length,
        failed: runs.filter((run) => run.state === "failed").length,
        nextUp:
          needsYou > 0
            ? "Start with the refund — it has been waiting three hours."
            : "Nothing needs a decision right now.",
      }}
      runs={runs}
      selectedId={selected ?? undefined}
      onSelect={(id) => {
        setSelected(id);
        setRuns((previous) =>
          previous.map((run) => (run.id === id ? { ...run, unread: false } : run))
        );
      }}
      onStopRun={(id) =>
        setRuns((previous) =>
          previous.map((run) =>
            run.id === id
              ? { ...run, state: "failed", note: "You stopped this run.", time: "Just now" }
              : run
          )
        )
      }
      detail={detail}
      onUndo={(entryId) =>
        setTrail((previous) =>
          previous.map((entry) =>
            entry.id === entryId
              ? { ...entry, undoable: false, result: "Undone — the drafts were discarded." }
              : entry
          )
        )
      }
      onExportTrail={() => {}}
      onTakeOver={() => setHandedOver(true)}
      onReturnToAgent={() => setHandedOver(false)}
      triggers={triggers}
      onTriggerEnabledChange={(id, enabled) =>
        setTriggers((previous) =>
          previous.map((trigger) => (trigger.id === id ? { ...trigger, enabled } : trigger))
        )
      }
      onRunTriggerNow={() => {}}
    />
  );
}
