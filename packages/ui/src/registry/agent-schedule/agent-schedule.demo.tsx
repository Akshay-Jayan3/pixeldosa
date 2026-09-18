"use client";

import * as React from "react";

import { AgentSchedule, type ScheduleTrigger } from "@/registry/agent-schedule/agent-schedule";

const TRIGGERS: ScheduleTrigger[] = [
  {
    id: "1",
    when: "Every weekday at 9:00",
    does: "Triages the support inbox and drafts replies",
    enabled: true,
    nextRun: "Tomorrow at 9:00",
    lastRun: "Ran today · 24 drafted, 0 sent",
    asksFirst: true,
  },
  {
    id: "2",
    when: "When an invoice arrives from a new supplier",
    does: "Checks it against the purchase order and flags mismatches",
    enabled: true,
    nextRun: "Whenever one arrives",
    lastRun: "Failed yesterday · the ledger refused the connection",
    lastFailed: true,
  },
  {
    id: "3",
    when: "Every Monday at 7:00",
    does: "Sends the weekly competitor digest to the team",
    enabled: false,
    lastRun: "Last ran 3 weeks ago",
  },
];

export default function AgentScheduleDemo() {
  const [triggers, setTriggers] = React.useState(TRIGGERS);
  const [ran, setRan] = React.useState<string | null>(null);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <AgentSchedule
        headingLevel={2}
        triggers={triggers}
        onEnabledChange={(id, enabled) =>
          setTriggers((previous) =>
            previous.map((trigger) => (trigger.id === id ? { ...trigger, enabled } : trigger))
          )
        }
        onRunNow={(id) => setRan(triggers.find((trigger) => trigger.id === id)?.does ?? null)}
        onEdit={() => undefined}
      />
      {ran ? (
        <p className="animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] text-sm text-muted-foreground text-pretty motion-reduce:animate-none">
          Started now: {ran.toLowerCase()}.
        </p>
      ) : null}
    </div>
  );
}
