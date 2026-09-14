/**
 * The changelog, as data. The /changelog page, the sidebar's "New" badges and the browse
 * grid all read this one list, so a badge can never claim something the changelog
 * doesn't say, or outlive it.
 *
 * Add new entries at the top. Each drop gets one entry.
 */

export type ChangeKind = "new" | "improved" | "fixed" | "breaking";

export type ChangelogChange = {
  kind: ChangeKind;
  /** Registry item name when the change is about a component, so it can link and badge. */
  component?: string;
  /** Plain-words description. Required for anything that isn't a new component. */
  note?: string;
};

export type ChangelogEntry = {
  id: string;
  /** ISO date. */
  date: string;
  title: string;
  summary: string;
  changes: ChangelogChange[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    id: "2026-09-14-chat",
    date: "2026-09-14",
    title: "Chat, done with the same care",
    summary:
      "Everything an assistant screen needs, built with the same rules as the rest of the system, plus a block that composes it all. A team can now build an ordinary assistant and its trust moments without a second library.",
    changes: [
      { kind: "new", component: "ai-chat-experience" },
      { kind: "new", component: "message" },
      { kind: "new", component: "message-scroller" },
      { kind: "new", component: "code-block" },
      { kind: "new", component: "suggestions" },
      { kind: "improved", component: "prompt-composer", note: "Controlled `value` / `onValueChange`, so the composer can be filled from outside." },
      { kind: "improved", note: "New homepage, and browse cards that show each component as a thumbnail." },
    ],
  },
  {
    id: "2026-09-14-verify",
    date: "2026-09-14",
    title: "Check it in one step",
    summary:
      "Components for reviewing what an agent did and controlling what it may do: sources that show the passage, a record of real tool calls, autonomy you can read, and memory you can edit.",
    changes: [
      { kind: "new", component: "inline-citations" },
      { kind: "new", component: "tool-call-card" },
      { kind: "new", component: "prompt-composer" },
      { kind: "new", component: "autonomy-control" },
      { kind: "new", component: "agent-memory" },
    ],
  },
  {
    id: "2026-09-13-run",
    date: "2026-09-13",
    title: "Agree before it runs, steer while it works",
    summary:
      "Correcting an agent is cheapest before it starts and most useful while it's running. This release covers both, plus a way to review many AI changes starting with the riskiest.",
    changes: [
      { kind: "new", component: "intent-preview" },
      { kind: "new", component: "agent-plan" },
      { kind: "new", component: "agent-steer" },
      { kind: "new", component: "ai-triage-table" },
      { kind: "new", component: "ai-form-fill" },
      { kind: "new", note: "Agent guide, /llms.txt and per-component markdown, so coding agents can find and use PixelDosa correctly." },
      { kind: "fixed", note: "Collapsed panels in Reasoning Stream and AI Context Surface no longer take keyboard focus." },
    ],
  },
  {
    id: "2026-09-12-expression",
    date: "2026-09-12",
    title: "An agent you can read",
    summary:
      "The agent expression layer: presence that shows whose turn it is, live status, reasoning, questions, approvals, and the first block to orchestrate them. Built on one motion rule: moving means the machine is busy, still means it's your turn.",
    changes: [
      { kind: "new", component: "thinking-experience" },
      { kind: "new", component: "agent-presence" },
      { kind: "new", component: "live-status-line" },
      { kind: "new", component: "reasoning-stream" },
      { kind: "new", component: "agent-ask" },
      { kind: "new", component: "ai-approval-gate" },
      { kind: "new", component: "generation-placeholder" },
      { kind: "new", component: "ai-action-toolbar" },
      { kind: "new", component: "ai-context-surface" },
      { kind: "new", component: "confidence-meter" },
      { kind: "new", component: "diff-accept" },
      { kind: "new", component: "smart-field" },
      { kind: "new", component: "selection-actions" },
      { kind: "new", component: "progressive-reveal" },
      { kind: "new", component: "command-menu" },
      { kind: "fixed", note: "Components that compose other components now install with working imports." },
    ],
  },
  {
    id: "2026-08-foundations",
    date: "2026-08-19",
    title: "Foundations",
    summary: "The tokens, theme and first primitives the AI components are built on.",
    changes: [
      { kind: "new", component: "card" },
      { kind: "new", component: "button" },
      { kind: "new", component: "field" },
      { kind: "new", component: "overlay" },
      { kind: "new", component: "ghost-input" },
    ],
  },
];

/** How many of the latest entries count as "new" for badges. */
const NEW_WINDOW = 2;

/** Components added in the most recent entries. Drives the "New" badges. */
export function getNewComponents(): Set<string> {
  return new Set(
    CHANGELOG.slice(0, NEW_WINDOW).flatMap((entry) =>
      entry.changes.filter((change) => change.kind === "new" && change.component).map((change) => change.component!)
    )
  );
}
