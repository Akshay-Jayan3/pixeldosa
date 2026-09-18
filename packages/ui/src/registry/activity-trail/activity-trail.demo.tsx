"use client";

import * as React from "react";

import { ActivityTrail, type TrailEntry } from "@/registry/activity-trail/activity-trail";

const ENTRIES: TrailEntry[] = [
  {
    id: "1",
    time: "09:00",
    actor: "system",
    actorName: "Scheduler",
    action: "Started the morning invoice check",
    authority: "Schedule set by Dana",
  },
  {
    id: "2",
    time: "09:00",
    actor: "agent",
    actorName: "Finance agent",
    action: "Read the August import",
    target: "ledger/august-import.json",
    authority: "Autonomy: acts on read-only work",
    result: "412 rows",
  },
  {
    id: "3",
    time: "09:02",
    actor: "agent",
    actorName: "Finance agent",
    action: "Flagged 5 invoices as duplicates",
    authority: "Autonomy: acts on low-risk changes",
    result: "5 flagged, none deleted",
    undoable: true,
  },
  {
    id: "4",
    time: "09:03",
    actor: "person",
    actorName: "Dana",
    action: "Approved emailing the summary",
    target: "finance@acme.com · 3 recipients",
    authority: "Approval gate",
  },
  {
    id: "5",
    time: "09:03",
    actor: "agent",
    actorName: "Finance agent",
    action: "Emailed the summary to 3 people",
    authority: "You approved it",
    result: "Sent",
  },
];

export default function ActivityTrailDemo() {
  const [entries, setEntries] = React.useState(ENTRIES);
  const [note, setNote] = React.useState<string | null>(null);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <ActivityTrail
        headingLevel={2}
        entries={entries}
        onUndo={(id) => {
          setEntries((previous) =>
            previous.map((entry) =>
              entry.id === id ? { ...entry, undoable: false, result: "Undone by you" } : entry
            )
          );
          setNote("The 5 flags were removed. The trail keeps the record.");
        }}
        onExport={() => setNote("Exported 5 records for your compliance system.")}
      />
      {note ? (
        <p className="animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] text-sm text-muted-foreground motion-reduce:animate-none">
          {note}
        </p>
      ) : null}
    </div>
  );
}
