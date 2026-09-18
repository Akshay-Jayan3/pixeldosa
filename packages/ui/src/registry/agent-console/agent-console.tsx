"use client";

import * as React from "react";

import { ActivityTrail, type TrailEntry } from "@/registry/activity-trail/activity-trail";
import { AgentPlan, type PlanStep } from "@/registry/agent-plan/agent-plan";
import { AgentSchedule, type ScheduleTrigger } from "@/registry/agent-schedule/agent-schedule";
import {
  HumanHandoff,
  type HandoffFact,
  type HandoffStage,
} from "@/registry/human-handoff/human-handoff";
import { RunInbox, type AgentRun } from "@/registry/run-inbox/run-inbox";
import { cn } from "@/lib/utils";

export type ConsoleBriefing = {
  /** When the user was last here, in words: "since yesterday at 6pm". */
  since?: string;
  /** Counts of what changed while they were away. Zero is fine and says so. */
  needsYou: number;
  finished: number;
  failed: number;
  /** The one thing worth doing first, in a sentence. */
  nextUp?: string;
};

export type ConsoleRunDetail = {
  id: string;
  /** What was asked for, in the user's words. */
  title: string;
  /** Where the run got to. Each step carries its own status. */
  steps?: PlanStep[];
  /** What's happening right now, beside the progress count. */
  runStatus?: string;
  /** What the agent did, who allowed it, and what came of it. */
  trail?: TrailEntry[];
  /** Present only when a person is involved, or is being asked to be. */
  handoff?: {
    stage: HandoffStage;
    reason?: string;
    context?: HandoffFact[];
    person?: string;
    waitingFor?: string;
  };
};

export interface AgentConsoleProps
  extends Omit<React.ComponentPropsWithoutRef<"section">, "onSelect"> {
  /** Level of the console's own headings. Defaults to 2, to sit under a page `h1`. */
  headingLevel?: 2 | 3 | 4;

  /** What changed since the user was last here. The return moment, in four numbers. */
  briefing?: ConsoleBriefing;

  /** Every run, grouped by what it needs. */
  runs: AgentRun[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onStopRun?: (id: string) => void;
  inboxEmptyLabel?: string;

  /** The selected run, opened out. */
  detail?: ConsoleRunDetail | null;
  onStopSelected?: () => void;
  onRetryStep?: (stepId: string) => void;
  onUndo?: (entryId: string) => void;
  onExportTrail?: () => void;
  onTakeOver?: () => void;
  onReturnToAgent?: () => void;
  /** Shown when nothing is selected. */
  detailEmptyLabel?: string;

  /** When the agent runs on its own. Omit the section entirely by leaving this out. */
  triggers?: ScheduleTrigger[];
  onTriggerEnabledChange?: (id: string, enabled: boolean) => void;
  onRunTriggerNow?: (id: string) => void;
  onEditTrigger?: (id: string) => void;
}

/** Plain-words counts. "0 need you" is worth saying; an empty space isn't. */
function briefingLine(briefing: ConsoleBriefing): string {
  const parts = [
    briefing.needsYou > 0 ? `${briefing.needsYou} waiting on you` : undefined,
    briefing.failed > 0 ? `${briefing.failed} stopped with a problem` : undefined,
    briefing.finished > 0 ? `${briefing.finished} finished` : undefined,
  ].filter(Boolean);
  if (parts.length === 0) return "Nothing changed while you were away.";
  return parts.join(" · ");
}

/**
 * The screen you come back to.
 *
 * The way people work with background agents now is to hand over a job, close the laptop
 * and return later, and two products shipped a surface for exactly that this year —
 * Cursor's Agents Window and Claude Code's Agent View — both replacing "the agent's work
 * lives in a chat thread you have to find" with a place designed to be returned to.
 *
 * The part still treated as an afterthought is the return itself. The research on agentic
 * interfaces is blunt about it: the moment a person comes back after four hours is where
 * trust is won or lost, and it should read as a briefing — what happened, what needs you,
 * what to do next — not as a list the user has to reconstruct that from. So this console
 * opens with that briefing in four numbers and one sentence, and only then shows the pile.
 *
 * Beneath it the split is deliberate: the inbox groups by what a run *needs* rather than
 * when it happened, because chronology buries the run that has been waiting three hours;
 * and the detail beside it answers the two questions people actually ask of an agent —
 * where did it get to (the plan) and who let it do that (the trail, with its authority
 * field).
 *
 * Presentational throughout: you own the runs, the selection and the history.
 *
 * Motion means the machine is busy. Only running rows and running steps move; everything
 * waiting on a person holds completely still, in the waiting colour.
 */
function AgentConsole({
  headingLevel = 2,
  briefing,
  runs,
  selectedId,
  onSelect,
  onStopRun,
  inboxEmptyLabel,
  detail,
  onStopSelected,
  onRetryStep,
  onUndo,
  onExportTrail,
  onTakeOver,
  onReturnToAgent,
  detailEmptyLabel = "Pick a run to see where it got to, and what it did.",
  triggers,
  onTriggerEnabledChange,
  onRunTriggerNow,
  onEditTrigger,
  className,
  ...props
}: AgentConsoleProps) {
  const Heading = `h${headingLevel}` as "h2";
  const partLevel = Math.min(6, headingLevel + 1) as 3;
  const labelId = React.useId();

  return (
    <section
      aria-labelledby={labelId}
      className={cn("flex flex-col gap-5", className)}
      {...props}
    >
      <Heading id={labelId} className="sr-only">
        Agents
      </Heading>

      {/* The return moment, first and in words. Everything below it is the detail behind
          these four numbers — but a person who reads only this line should already know
          whether they need to do anything. */}
      {briefing ? (
        <div
          className={cn(
            "flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 rounded-lg border p-4",
            briefing.needsYou > 0 ? "border-agent-waiting bg-agent-waiting-soft" : "bg-card"
          )}
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-sm font-medium text-foreground text-pretty">
              {briefingLine(briefing)}
            </p>
            {briefing.nextUp ? (
              <p className="text-sm text-muted-foreground text-pretty">{briefing.nextUp}</p>
            ) : null}
          </div>
          {briefing.since ? (
            <p className="text-xs text-muted-foreground">Since {briefing.since}</p>
          ) : null}
        </div>
      ) : null}

      <div className="grid items-start gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <RunInbox
          headingLevel={partLevel}
          runs={runs}
          selectedId={selectedId}
          onOpen={onSelect}
          onStop={onStopRun}
          emptyLabel={inboxEmptyLabel}
        />

        <div className="flex min-w-0 flex-col gap-4">
          {detail ? (
            <>
              {/* A person is involved, or being asked to be: that comes before the
                  machine's own account of itself. */}
              {detail.handoff ? (
                <HumanHandoff
                  headingLevel={partLevel}
                  title={detail.title}
                  stage={detail.handoff.stage}
                  reason={detail.handoff.reason}
                  context={detail.handoff.context}
                  person={detail.handoff.person}
                  waitingFor={detail.handoff.waitingFor}
                  onTakeOver={onTakeOver}
                  onReturnToAgent={onReturnToAgent}
                />
              ) : null}

              {detail.steps && detail.steps.length > 0 ? (
                <AgentPlan
                  headingLevel={partLevel}
                  title={detail.title}
                  steps={detail.steps}
                  allowAdd={false}
                  // Every step here carries a status, so the plan is always in its running
                  // view and never offers Run; this satisfies the prop without adding a
                  // control the console could not honour.
                  onRun={() => {}}
                  runStatus={detail.runStatus}
                  onStop={onStopSelected}
                  onRetryStep={onRetryStep}
                />
              ) : null}

              {detail.trail && detail.trail.length > 0 ? (
                <ActivityTrail
                  headingLevel={partLevel}
                  entries={detail.trail}
                  onUndo={onUndo}
                  onExport={onExportTrail}
                />
              ) : null}
            </>
          ) : (
            <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground text-pretty">
              {detailEmptyLabel}
            </p>
          )}
        </div>
      </div>

      {triggers && onTriggerEnabledChange ? (
        <AgentSchedule
          headingLevel={partLevel}
          triggers={triggers}
          onEnabledChange={onTriggerEnabledChange}
          onRunNow={onRunTriggerNow}
          onEdit={onEditTrigger}
        />
      ) : null}
    </section>
  );
}

export { AgentConsole };
