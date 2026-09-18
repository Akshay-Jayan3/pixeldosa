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
    id: "2026-09-18-catalog",
    date: "2026-09-18",
    title: "Every component, described in a format a model can be held to",
    summary:
      "A new catalogue at /r/catalog.json gives each component's props as JSON Schema, its callbacks with their arguments, and the design reasoning behind it — generated from the TypeScript, so it can't drift. For products where the model produces the interface rather than the code. Plain JSON Schema, tied to no protocol.",
    changes: [
      {
        kind: "new",
        note: "/r/catalog.json — 51 components with validated prop schemas, and the same contract under meta.schema in every registry item.",
      },
      {
        kind: "improved",
        note: "The agent guide and llms.txt now point at the catalogue, so a runtime can constrain a model to real prop values instead of letting it invent them.",
      },
    ],
  },
  {
    id: "2026-09-18-agent-ops",
    date: "2026-09-18",
    title: "Agents that work while you're away",
    summary:
      "Four components for agents that run in the background: an inbox that puts what needs you first, a readable record of what the agent did and who allowed it, a handover that carries the context, and schedules written as sentences.",
    changes: [
      { kind: "new", component: "run-inbox" },
      { kind: "new", component: "activity-trail" },
      { kind: "new", component: "human-handoff" },
      { kind: "new", component: "agent-schedule" },
    ],
  },
  {
    id: "2026-09-18-generation-two",
    date: "2026-09-18",
    title: "Pick it, compare it, ship it",
    summary:
      "Three more generation pieces: controls you choose from previews instead of naming, a before-and-after that works with a keyboard, and a result frame that states what made it and whether content credentials are attached.",
    changes: [
      { kind: "new", component: "parameter-panel" },
      { kind: "new", component: "compare-view" },
      { kind: "new", component: "media-result" },
    ],
  },
  {
    id: "2026-09-18-generation",
    date: "2026-09-18",
    title: "Generation, without the waiting and the guesswork",
    summary:
      "The first three pieces for products that make images, video or audio: a job that tells you where you are in the queue and refunds honestly, a grid where you keep the good results and regenerate the rest, and a credits meter that names the price before the click.",
    changes: [
      { kind: "new", component: "generation-job" },
      { kind: "new", component: "variation-grid" },
      { kind: "new", component: "credits-meter" },
    ],
  },
  {
    id: "2026-09-18-after-the-answer",
    date: "2026-09-18",
    title: "Regenerate without regret",
    summary:
      "Three components for what happens around an answer: keep every version you generate, say why a bad one was bad, and tell people when AI wrote something — or ask them first.",
    changes: [
      { kind: "new", component: "response-versions" },
      { kind: "new", component: "response-feedback" },
      { kind: "new", component: "ai-disclosure" },
    ],
  },
  {
    id: "2026-09-18-before-it-runs",
    date: "2026-09-18",
    title: "Before it runs, and before it sends",
    summary:
      "Two new components for the moments either side of a run: what it will cost before you start it, and a place where everything the agent prepares waits until you send it.",
    changes: [
      { kind: "new", component: "cost-estimate" },
      { kind: "new", component: "draft-mode" },
    ],
  },
  {
    id: "2026-09-18-live-plan",
    date: "2026-09-18",
    title: "Watch the plan happen",
    summary:
      "Agent Plan now follows the run. The plan people agreed to becomes the progress view: the current step moves, a step waiting on you holds still, finished steps get a check, and a failed one offers Retry.",
    changes: [
      { kind: "improved", component: "agent-plan", note: "New per-step `status` (`pending`, `running`, `waiting`, `done`, `failed`, `skipped`) and `note`. Any status past pending switches the plan from editing to running." },
      { kind: "improved", component: "agent-plan", note: "`runStatus` names what's happening now, `onStop` stays visible for the whole run, and `onRetryStep` is offered on a failed step." },
      { kind: "improved", component: "agent-plan", note: "Progress counts finished steps instead of inventing a percentage, and each step is announced once as it finishes, fails, is skipped or starts waiting." },
    ],
  },
  {
    id: "2026-09-17-next",
    date: "2026-09-17",
    title: "What's next, and how to help shape it",
    summary:
      "Templates are coming: full starter apps for AI that makes and does. Early access is free, and what you tell us decides which ones come first.",
    changes: [
      { kind: "new", note: "Free early access to templates (Image Studio, Video Studio, Research Agent, Run Inbox and more), requested through a short GitHub form." },
      { kind: "new", note: "Work with me: design engineering for AI products, from agent and generation interfaces to custom components and design systems." },
      { kind: "improved", note: "GitHub issue forms for component and template requests, and for bugs." },
      { kind: "improved", note: "Theme: `agent-done` is now green instead of yellow, so finished reads as finished. It still reads as text in both themes." },
      { kind: "improved", note: "The site feels drawn: pen underlines that draw themselves, paper cards that lift with an ink shadow, sections that ease in as you scroll, and a switch on the homepage that shows the turn-taking rule by freezing the agent. All of it stops under reduced motion." },
    ],
  },
  {
    id: "2026-09-16-ink",
    date: "2026-09-16",
    title: "Ink on paper, and an agent you can see",
    summary:
      "PixelDosa now looks like a sketchbook instead of a glowing screen: a light paper theme by default, near-black ink, and four marker colours that each mean one thing. And the agent gets a body: a hand-drawn character whose pose shows what it's doing, how sure it is, and when it needs you.",
    changes: [
      { kind: "new", component: "agent-figure" },
      { kind: "improved", note: "Theme: a new ink-and-paper palette in light and dark. The site now opens in light mode." },
      { kind: "new", note: "Theme: four agent marker colours, each with a soft fill: `agent-working` (blue), `agent-waiting` (orange, the only one that asks for action), `agent-blocked` (red) and `agent-done` (green). All four read as text in both themes." },
      { kind: "improved", note: "No more blur, glow or gradient fades: Command Menu and Overlay use a plain paper scrim, Generation Placeholder's sweep is a drawn edge on a flat wash, and Code Block's \"Show all\" sits on a solid strip." },
      { kind: "improved", component: "reasoning-stream", note: "The collapsed ticker shows the last two lines, cropped rather than faded." },
      { kind: "improved", component: "agent-presence", note: "`form=\"orb\"` is deprecated and will be removed in a later drop. It still renders. Use `field`, or Agent Figure for a visible agent." },
      { kind: "improved", component: "agent-presence", note: "New `figure` and `mark` forms draw the agent with Agent Figure. Each state takes a pose, and the poses for your turn hold still." },
      { kind: "improved", component: "live-status-line", note: "Shows the agent's drawn head by default, with a face that follows the state. `indicator=\"line\"` keeps the dots." },
      { kind: "improved", component: "thinking-experience", note: "New `expression` prop: `full` draws the whole agent beside the run, `subtle` (default) keeps its head in the status line, `off` uses dots." },
      { kind: "improved", component: "ai-chat-experience", note: "New `expression` prop: `full` adds the agent's head as the assistant's avatar, `subtle` (default) shows it beside \"Thinking\", `off` uses dots." },
      { kind: "improved", note: "New homepage with the agent front and centre, and Dosa, a guide that walks you through it and can be hidden." },
    ],
  },
  {
    id: "2026-09-15-install",
    date: "2026-09-15",
    title: "Installs cleanly in a new project",
    summary:
      "The launch components installed by name into a fresh Next.js and shadcn project: they typecheck, build and run. The test turned up a few things that only show outside this repo, all fixed.",
    changes: [
      { kind: "fixed", note: "Example code on docs pages used this repo's internal import paths, so copied examples didn't compile. Code tabs and Source views now show the paths `shadcn add` installs." },
      { kind: "fixed", note: "Examples that use more than their own component, such as Agent Steer with Live Status Line, now list what else they need, with one install command for everything." },
      { kind: "fixed", component: "prompt-composer", note: "Re-measures its height when its width changes. A composer rendered while hidden, or a resized window, could keep an empty text area at full height." },
      { kind: "fixed", note: "Theme: the corner radius now applies in projects that already define one." },
      { kind: "improved", note: "Getting started explains that installing the theme directly applies PixelDosa's palette, while pulling it in as a dependency keeps a project's existing colours." },
    ],
  },
  {
    id: "2026-09-15-keyboard",
    date: "2026-09-15",
    title: "Keyboard and screen readers",
    summary:
      "An accessibility pass on the launch components: axe-core on every component page, a real-key keyboard walk through the hero components, and a check of what screen readers announce.",
    changes: [
      { kind: "improved", note: "Components with a title take `headingLevel`, so they fit the heading outline of the page they're placed in: Intent Preview, Agent Plan, Agent Ask, AI Approval Gate, AI Triage Table, Autonomy Control, Agent Memory, Inline Citations, Thinking Experience and AI Chat Experience." },
      { kind: "improved", component: "prompt-composer", note: "Shows the standard focus ring when its text area has keyboard focus, instead of only a faint border change." },
      { kind: "fixed", component: "inline-citations", note: "Escape closes the source and returns focus to its marker. Before, returning focus reopened the popover straight away." },
      { kind: "fixed", component: "ai-context-surface", note: "The \"Why this?\" trigger has a 28px target, up from 16px, meeting WCAG 2.5.8." },
    ],
  },
  {
    id: "2026-09-15-contrast",
    date: "2026-09-15",
    title: "Readable in both themes",
    summary:
      "A contrast audit of every page in light and dark mode. Text now meets WCAG AA contrast everywhere it was measured, and two pages that fell back to light mode after loading are fixed.",
    changes: [
      { kind: "improved", note: "Light theme: `muted-foreground` is slightly darker, so muted text stays readable on muted surfaces such as badges and keyboard hints." },
      { kind: "improved", note: "Light theme: `destructive` is a deeper red that reads as text on white and under white text." },
      { kind: "improved", note: "Dark theme: text on destructive fills is now dark, because white text on the bright red failed contrast." },
      { kind: "improved", component: "thinking-experience", note: "While waiting on you, the agent's region steps down with muted text and faded indicators instead of dimming everything to 55% opacity." },
      { kind: "fixed", component: "ai-context-surface", note: "The \"generated 12 minutes ago\" time is formatted in the browser, which fixes a hydration error that reset the page's theme." },
      { kind: "fixed", note: "A nested paragraph in the Card docs broke hydration and reset the page's theme." },
    ],
  },
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

/** How many of the latest component-adding entries count as "new" for badges. */
const NEW_WINDOW = 2;

/**
 * Components added in the most recent entries that added any. Fix-only entries don't use
 * up the window, or a polish release would quietly strip the badges from last week's drop.
 */
export function getNewComponents(): Set<string> {
  const adding = CHANGELOG.filter((entry) => entry.changes.some((change) => change.kind === "new" && change.component));
  return new Set(
    adding.slice(0, NEW_WINDOW).flatMap((entry) =>
      entry.changes.filter((change) => change.kind === "new" && change.component).map((change) => change.component!)
    )
  );
}
