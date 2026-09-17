import Link from "next/link";

import { AgentFigure, Button, type AgentPose } from "@pixeldosa/ui";

import { CodeBlock } from "@/components/code-block";
import { ComponentThumbnail } from "@/components/component-thumbnail";
import { HeroAgent } from "@/components/hero-agent";
import { SiteGuide, type GuideStop } from "@/components/site-guide";
import { demos } from "@/components/registry-demos";
import { isFoundation } from "@/lib/component-groups";
import { EARLY_ACCESS_URL } from "@/lib/links";
import { getComponents, getRegistryItem, isBlock } from "@/lib/registry";

const STAGES = [
  {
    id: "before",
    eyebrow: "Before it runs",
    title: "Agree on what happens",
    body: "The agent restates what it understood and the plan it will follow. Correcting a guess costs one click, not a rewritten prompt.",
    hero: "intent-preview",
    components: ["intent-preview", "agent-plan", "autonomy-control", "prompt-composer"],
  },
  {
    id: "during",
    eyebrow: "While it works",
    title: "See it, steer it, stop it",
    body: "Presence that shows whose turn it is, reasoning you can open, redirects that don't throw work away, and approvals that say what can't be undone.",
    hero: "agent-steer",
    components: ["agent-presence", "reasoning-stream", "agent-steer", "ai-approval-gate", "agent-ask"],
  },
  {
    id: "after",
    eyebrow: "When you review",
    title: "Check it in one step",
    body: "Sources that show the passage, tool calls that separate what it read from what it claimed, and review that starts with what's most likely wrong.",
    hero: "inline-citations",
    components: ["inline-citations", "tool-call-card", "ai-triage-table", "diff-accept", "agent-memory"],
  },
] as const;

const PRINCIPLES = [
  {
    title: "Motion means the machine is busy",
    body: "Stillness means it's your turn. Every indicator follows the same rule, so you can tell at a glance who's waiting on whom.",
  },
  {
    title: "Nothing commits silently",
    body: "No accept-all shortcuts, no suggestion that sends itself, no approval that hides whether it can be undone.",
  },
  {
    title: "Confidence in tiers, never fake precision",
    body: "“87% confident” invites trust nobody measured. Tiers say what's known, and percentages are only for real progress.",
  },
  {
    title: "Shimmer the verb, never the content",
    body: "“Searching” moves while it searches. Answers, numbers and code hold still, so they can be read and trusted.",
  },
] as const;

/** The cast: the same character, nine things a run can be doing. */
const CAST: { pose: AgentPose; label: string; note: string }[] = [
  { pose: "idle", label: "Idle", note: "Ready when you are." },
  { pose: "listening", label: "Listening", note: "I'm listening…" },
  { pose: "thinking", label: "Thinking", note: "Let me think…" },
  { pose: "planning", label: "Planning", note: "Here's my plan…" },
  { pose: "searching", label: "Searching", note: "Checking sources…" },
  { pose: "working", label: "Working", note: "Putting it together…" },
  { pose: "asking", label: "Asking", note: "I need your input." },
  { pose: "blocked", label: "Blocked", note: "Something's in the way." },
  { pose: "done", label: "Done", note: "All done!" },
];

const MARKERS = [
  { name: "Blue", role: "working", body: "Progress, the step it's on, what it's reading right now.", color: "agent-working" },
  { name: "Orange", role: "needs you", body: "A question or an approval. The only colour that asks for action.", color: "agent-waiting" },
  { name: "Red", role: "blocked", body: "Something failed or is in the way, always with a way forward.", color: "agent-blocked" },
  { name: "Yellow", role: "done", body: "A finished result being handed to you. Used sparingly.", color: "agent-done" },
] as const;

// Written out in full so Tailwind sees every class.
const MARKER_SWATCH: Record<(typeof MARKERS)[number]["color"], string> = {
  "agent-working": "border-agent-working bg-agent-working-soft",
  "agent-waiting": "border-agent-waiting bg-agent-waiting-soft",
  "agent-blocked": "border-agent-blocked bg-agent-blocked-soft",
  "agent-done": "border-agent-done bg-agent-done-soft",
};

const GUIDE: GuideStop[] = [
  { id: "hero", pose: "idle", text: "Hi, I'm Dosa. I'll walk you through Pixel Dosa. Scroll whenever you like." },
  { id: "cast", pose: "listening", text: "This is me. Each pose matches something a real run is doing." },
  { id: "chat", pose: "working", text: "Here I'm inside a full assistant screen. Pick a question and watch." },
  { id: "stages", pose: "planning", text: "Trust gets decided before, during and after a run. Each moment has its own pieces." },
  { id: "rules", pose: "thinking", text: "Four colours, four rules. Orange is the only one that asks you for something." },
  { id: "agents", pose: "reading", text: "Your coding agent can install all of this by name." },
  { id: "next", pose: "asking", text: "Templates are next, and early access is free. Want one?" },
  { id: "beta", pose: "done", text: "That's the tour. New pieces land every week." },
];

const AGENT_SETUP = `npx shadcn@latest add @pixeldosa/ai-chat-experience
npx shadcn@latest add @pixeldosa/pixeldosa-agent-guide`;

function titleFor(name: string) {
  return getRegistryItem(name)?.title ?? name;
}

export default function HomePage() {
  const documented = getComponents().filter((item) => !isFoundation(item));
  const blockCount = documented.filter(isBlock).length;
  const componentCount = documented.length - blockCount;
  const HeroDemo = demos["ai-chat-experience"];

  return (
    <main>
      {/* Hero */}
      <section data-guide="hero" className="border-b">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col items-start gap-5">
            <Link
              href="/changelog"
              className="group inline-flex items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-3 text-xs text-muted-foreground transition-colors duration-[var(--pd-duration-instant)] hover:text-foreground"
            >
              <span className="rounded-full bg-foreground px-2 py-0.5 font-medium text-background">Beta</span>
              <span className="tabular-nums">
                {componentCount} components · {blockCount} blocks · new every week
              </span>
            </Link>

            <h1 className="max-w-3xl font-hand text-5xl font-bold leading-[1.05] text-balance sm:text-7xl">
              Give your agents{" "}
              <span className="relative whitespace-nowrap">
                life
                <svg
                  aria-hidden="true"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                  className="absolute -left-[2%] bottom-[0.02em] h-[0.2em] w-[104%] overflow-visible"
                >
                  <path
                    d="M2 6 C 20 2, 40 9, 58 5 S 88 3, 98 6"
                    fill="none"
                    stroke="var(--agent-working)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </span>
              .
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
              Components, blocks and agent skills for AI products that do real work: plans people can edit, runs
              they can steer, approvals that say what can't be undone, and an agent they can read. Pure React, no
              SDK lock-in, installable by you or your coding agent.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/docs/components">Browse components</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/docs/ai">Build with AI</Link>
              </Button>
            </div>

            <p className="font-hand text-lg text-muted-foreground">
              Human-friendly, never human-deceptive. No <s>glowing orbs</s>, no <s>glass</s>, no{" "}
              <s>gradient blobs</s>.
            </p>
          </div>

          <HeroAgent />
        </div>
      </section>

      {/* The cast */}
      <section data-guide="cast" aria-labelledby="cast" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 id="cast" className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            An agent with a body.
          </h2>
          <Link
            href="/docs/components/agent-figure"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Agent Figure →
          </Link>
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          Its pose shows what a run is doing, how sure it is, and when it needs you. It moves while it works and
          holds still when it's your turn.
        </p>
        <ul className="mt-8 grid grid-cols-3 border-y sm:grid-cols-5 lg:grid-cols-9">
          {CAST.map((item) => (
            <li key={item.pose} className="flex flex-col items-center gap-1 px-2 py-4 text-center">
              <AgentFigure pose={item.pose} hideLabel aria-hidden="true" />
              <span className="text-sm font-medium">{item.label}</span>
              <span className="font-hand text-base leading-tight text-muted-foreground">{item.note}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* The live block */}
      <section data-guide="chat" aria-labelledby="chat" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="chat" className="text-sm">
              <span className="font-medium text-foreground">AI Chat Experience.</span>{" "}
              <span className="text-muted-foreground">
                Live. Pick a question and watch it think, search, read and answer.
              </span>
            </h2>
            <Link
              href="/docs/components/ai-chat-experience"
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              View block →
            </Link>
          </div>
          {HeroDemo ? <HeroDemo /> : null}
        </div>
      </section>

      {/* Before / while / after */}
      <section data-guide="stages" aria-labelledby="stages" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <h2 id="stages" className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Trust is decided in three moments.
          </h2>
          <p className="mt-3 text-muted-foreground text-pretty">
            A chat box covers none of them. Each moment has its own components, designed from research on where
            people over-trust, under-trust or give up on agents.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {STAGES.map((stage) => (
            <article key={stage.id} className="group flex flex-col overflow-hidden rounded-xl border bg-card">
              <Link
                href={`/docs/components/${stage.hero}`}
                aria-label={`${titleFor(stage.hero)}: open`}
                className="block outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/40"
              >
                <ComponentThumbnail name={stage.hero} />
              </Link>
              <div className="flex flex-1 flex-col gap-3 border-t p-5">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {stage.eyebrow}
                </p>
                <h3 className="text-lg font-medium tracking-tight">{stage.title}</h3>
                <p className="text-sm text-muted-foreground text-pretty">{stage.body}</p>
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  {stage.components.map((name) => (
                    <li key={name}>
                      <Link
                        href={`/docs/components/${name}`}
                        className="inline-flex rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors duration-[var(--pd-duration-instant)] hover:border-foreground/30 hover:text-foreground"
                      >
                        {titleFor(name)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* The grammar */}
      <section data-guide="rules" aria-labelledby="grammar" className="border-y bg-card">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2 id="grammar" className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              One set of rules, in every component.
            </h2>
            <p className="mt-3 text-muted-foreground text-pretty">
              Components agree with each other because they share rules. That's what makes a screen built from
              thirty of them feel like one product.
            </p>
          </div>
          <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {PRINCIPLES.map((principle, index) => (
              <li key={principle.title} className="flex gap-4">
                <span aria-hidden="true" className="font-mono text-xs text-muted-foreground tabular-nums">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="font-medium text-foreground">{principle.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground text-pretty">{principle.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <h3 className="mt-14 font-hand text-2xl font-bold">Four markers, four meanings. Everything else is ink.</h3>
          <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {MARKERS.map((marker) => (
              <li key={marker.color} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 size-8 shrink-0 rounded-md border-2 ${MARKER_SWATCH[marker.color]}`}
                />
                <div>
                  <p className="text-sm font-medium">
                    {marker.name} · {marker.role}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground text-pretty">{marker.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Build with a coding agent */}
      <section data-guide="agents" aria-labelledby="agents" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 id="agents" className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Your coding agent knows how to use it.
            </h2>
            <p className="mt-3 text-muted-foreground text-pretty">
              Install through the shadcn CLI, and add the agent guide so Claude Code, Cursor or Copilot pick the
              right component and follow the rules: no silent commits, approvals that state consequences, Stop always
              visible.
            </p>
            <ul className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <span className="text-foreground">shadcn registry and MCP.</span> Agents search and install by name.
              </li>
              <li>
                <span className="text-foreground">Agent guide.</span> Installs as a Claude Code skill.
              </li>
              <li>
                <span className="text-foreground">
                  <a href="/llms.txt" className="font-mono underline-offset-4 hover:underline">
                    /llms.txt
                  </a>
                </span>{" "}
                and one markdown page per component.
              </li>
            </ul>
            <div className="mt-6">
              <Button asChild variant="outline">
                <Link href="/docs/ai">Set up your agent</Link>
              </Button>
            </div>
          </div>
          <CodeBlock code={AGENT_SETUP} language="bash" />
        </div>
      </section>

      {/* What's next: free early access, and working with me */}
      <section data-guide="next" aria-labelledby="next" className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 id="next" className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Coming next: whole products, not just parts.
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
            Templates are full starter apps built from Pixel Dosa, for AI that makes and does: an image studio, a
            video studio, a research agent, an inbox for background agents.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="flex flex-col items-start gap-3 rounded-xl border bg-card p-6">
              <AgentFigure pose="asking" size="sm" hideLabel aria-hidden="true" />
              <h3 className="text-lg font-medium">Get early access, free</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Tell us what you're building and which templates you'd use. The first ones will be shaped by the
                answers.
              </p>
              <Button asChild className="mt-auto">
                <a href={EARLY_ACCESS_URL}>Request early access</a>
              </Button>
            </div>
            <div className="flex flex-col items-start gap-3 rounded-xl border bg-card p-6">
              <AgentFigure pose="working" size="sm" hideLabel aria-hidden="true" />
              <h3 className="text-lg font-medium">Building an AI product now?</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                I build interfaces for agents and generation features, custom components on Pixel Dosa, and the
                design systems underneath.
              </p>
              <Button asChild variant="outline" className="mt-auto">
                <Link href="/work-with-me">Work with me</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Beta */}
      <section data-guide="beta" className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-14 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-lg font-medium tracking-tight">In beta, shipping weekly.</h2>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              APIs may change between drops, and every change is noted. Tell us what you'd use next.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/changelog">See the changelog</Link>
          </Button>
        </div>
      </section>
      <SiteGuide stops={GUIDE} />
    </main>
  );
}
