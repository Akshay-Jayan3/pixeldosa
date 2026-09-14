import Link from "next/link";

import { Button } from "@pixeldosa/ui";

import { CodeBlock } from "@/components/code-block";
import { ComponentThumbnail } from "@/components/component-thumbnail";
import { demos } from "@/components/registry-demos";
import { isFoundation } from "@/lib/component-groups";
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
      <section className="relative overflow-hidden border-b">
        <div aria-hidden="true" className="pd-grid absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-28">
          <div className="flex flex-col items-start gap-5">
            <Link
              href="/docs/components"
              className="group inline-flex items-center gap-2 rounded-full border bg-background/60 py-1 pl-1 pr-3 text-xs text-muted-foreground backdrop-blur transition-colors duration-[var(--pd-duration-instant)] hover:text-foreground"
            >
              <span className="rounded-full bg-foreground px-2 py-0.5 font-medium text-background">Beta</span>
              <span className="tabular-nums">
                {componentCount} components · {blockCount} blocks · new every week
              </span>
            </Link>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              The trust layer for AI products.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
              React components for the moments people decide whether to trust an agent: before it runs, while it
              works, and when they review what it did. Pure components, no SDK lock-in, installable by you or your
              coding agent.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/docs/components">Browse components</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/docs/ai">Build with AI</Link>
              </Button>
            </div>
          </div>

          {/* The live hero: a real block, not a screenshot. */}
          <div className="mx-auto mt-14 max-w-2xl">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 text-xs text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">AI Chat Experience</span>. Live. Pick a question and watch
                it think, search, read and answer.
              </span>
              <Link href="/docs/components/ai-chat-experience" className="underline-offset-4 hover:text-foreground hover:underline">
                View block →
              </Link>
            </div>
            {/* No frame of its own: the block already has a border, and a second one around it
                reads as a box inside a box. Depth comes from the shadow instead. */}
            <div className="rounded-lg shadow-[0_32px_100px_-40px_color-mix(in_oklab,var(--foreground)_35%,transparent)]">
              {HeroDemo ? <HeroDemo /> : null}
            </div>
          </div>
        </div>
      </section>

      {/* Before / while / after */}
      <section aria-labelledby="stages" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
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
      <section aria-labelledby="grammar" className="border-y bg-card/40">
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
          <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {PRINCIPLES.map((principle, index) => (
              <div key={principle.title} className="flex gap-4">
                <span aria-hidden="true" className="font-mono text-xs text-muted-foreground tabular-nums">
                  0{index + 1}
                </span>
                <div>
                  <dt className="font-medium text-foreground">{principle.title}</dt>
                  <dd className="mt-1.5 text-sm text-muted-foreground text-pretty">{principle.body}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Build with a coding agent */}
      <section aria-labelledby="agents" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
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

      {/* Beta */}
      <section className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-14 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-lg font-medium tracking-tight">In beta, shipping weekly.</h2>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              APIs may change between drops, and every change is noted. Tell us what you'd use next.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/docs/components">See what's shipped</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
