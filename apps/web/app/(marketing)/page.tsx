import Link from "next/link";

import { Button } from "@pixeldosa/ui";

import { CastStrip } from "@/components/cast-strip";
import { CodeBlock } from "@/components/code-block";
import { ComponentBento } from "@/components/component-bento";
import { ComponentThumbnail } from "@/components/component-thumbnail";
import { HeroWorkbench } from "@/components/hero-workbench";
import { SiteFooter } from "@/components/site-footer";
import { SiteGuide, type GuideStop } from "@/components/site-guide";
import { MarginNote, MarkerSwatch, Scribble, SketchRule, SketchStudy } from "@/components/sketch";
import { demos } from "@/components/registry-demos";
import { getRegistryItem } from "@/lib/registry";

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

const MARKERS = [
  { name: "Blue", role: "working", body: "Progress, the step it's on, what it's reading right now.", color: "working" },
  { name: "Orange", role: "needs you", body: "A question or an approval. The only colour that asks for action.", color: "waiting" },
  { name: "Red", role: "blocked", body: "Something failed or is in the way, always with a way forward.", color: "blocked" },
  { name: "Green", role: "done", body: "A finished result being handed to you. Used sparingly.", color: "done" },
] as const;

/** In page order — the cast now sits after the rules, not before the chat block. */
const GUIDE: GuideStop[] = [
  { id: "hero", pose: "idle", text: "Hi, I'm Dosa. I'll walk you through PixelDosa UI. Scroll whenever you like." },
  { id: "showcase", pose: "working", text: "Every moment has a component. Browse the moving set, then open any piece." },
  { id: "chat", pose: "working", text: "Here I'm inside a full assistant screen. Pick a question and watch." },
  { id: "stages", pose: "planning", text: "Trust gets decided before, during and after a run. Each moment has its own pieces." },
  { id: "rules", pose: "thinking", text: "Four colours, four rules. Orange is the only one that asks you for something." },
  { id: "cast", pose: "listening", text: "This is me. Each pose matches something a real run is doing." },
  { id: "agents", pose: "reading", text: "Your coding agent can install all of this by name." },
];

const AGENT_SETUP = `npx shadcn@latest add @pixeldosa/ai-chat-experience
npx shadcn@latest add @pixeldosa/pixeldosa-agent-guide`;

const LIBRARY_LAYERS = [
  {
    number: "01",
    title: "Components",
    description: "The focused building pieces: controls, feedback, and interactions you can make your own.",
    href: "/docs/components",
    link: "Browse components",
    mark: "component",
  },
  {
    number: "02",
    title: "Blocks",
    description: "Composed experiences with the structure and important interaction states already in place.",
    href: "/docs/components#group-blocks",
    link: "Explore blocks",
    mark: "block",
  },
] as const;

function LayerSketch({ kind }: { kind: "component" | "block" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 32" className="size-12 shrink-0">
      {kind === "component" ? (
        <>
          <rect x="3" y="5" width="27" height="22" rx="3" fill="var(--illustration-lilac)" />
          <rect x="18" y="2" width="27" height="22" rx="3" fill="var(--card)" stroke="var(--foreground)" strokeWidth="1.2" />
          <path d="M24 10h14M24 15h9" stroke="var(--foreground)" strokeWidth="1.2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <rect x="3" y="8" width="28" height="21" rx="3" fill="var(--illustration-peach)" />
          <rect x="9" y="4" width="28" height="21" rx="3" fill="var(--illustration-butter)" />
          <rect x="15" y="1" width="28" height="21" rx="3" fill="var(--card)" stroke="var(--foreground)" strokeWidth="1.2" />
          <path d="M20 8h17M20 13h11" stroke="var(--foreground)" strokeWidth="1.2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function titleFor(name: string) {
  return getRegistryItem(name)?.title ?? name;
}

export default function HomePage() {
  const HeroDemo = demos["ai-chat-experience"];

  return (
    <>
      <main>
      {/* Hero */}
      <section data-guide="hero" className="pd-draft-grid relative isolate border-b">
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
          <div className="flex max-w-3xl flex-col items-center gap-8">
            <Link
              href="/changelog"
              className="group inline-flex items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-3 text-xs text-muted-foreground transition-colors duration-[var(--pd-duration-instant)] hover:text-foreground"
            >
              <span className="rounded-full bg-foreground px-2 py-0.5 font-medium text-background">Beta</span>
              <span className="tabular-nums">Version 0.1.0</span>
            </Link>

            {/* A geometric display face gives the library a sharper voice while body copy
                and controls keep the familiar sans-serif. */}
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Components · Blocks · Thoughtful interactions
            </p>
            <SketchRule color="ink" className="w-20" />
            <h1 className="max-w-3xl font-display text-5xl font-normal leading-[1.05] tracking-tight text-balance sm:text-6xl">
              Build interfaces that feel{" "}
              <Scribble color="ink" className="font-semibold">
                considered.
              </Scribble>
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
              PixelDosa is a growing library of interactive React components and ready-to-use blocks,
              crafted for the details people notice—from everyday product flows to thoughtful AI experiences.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Button asChild size="default">
                <Link href="/docs/components">Explore the library</Link>
              </Button>
              <Button asChild size="default" variant="outline">
                <Link href="/docs/components#group-blocks">Explore blocks</Link>
              </Button>
            </div>
          </div>

          <div className="relative w-full max-w-xl">
            <HeroWorkbench />
            <MarginNote
              arrow="down-left"
              className="absolute -right-28 top-8 hidden rotate-3 lg:inline-flex"
            >
              Try each state
            </MarginNote>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto hidden h-full max-w-7xl xl:block">
          <div className="absolute left-5 top-52 -rotate-2">
            <p className="font-hand text-sm text-muted-foreground">Ideas, made usable</p>
            <SketchStudy className="mt-1 size-36" />
            <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
              sketch → system
            </p>
          </div>
          <MarginNote
            arrow="down-left"
            className="absolute right-5 top-40 max-w-36 rotate-3"
          >
            Good interfaces help people think
          </MarginNote>
        </div>
      </section>

      <section aria-labelledby="library-layers" className="border-b border-dashed">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end">
            <div className="max-w-xl">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                A library that grows with the work
              </p>
              <h2 id="library-layers" className="mt-3 font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Start with a detail. Build toward the whole experience.
              </h2>
              <p className="mt-3 text-muted-foreground text-pretty">
                Use a single interaction or start with a composed flow. Over time, PixelDosa will grow into
                complete page templates, too.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {LIBRARY_LAYERS.map((layer) => (
                <Link
                  key={layer.title}
                  href={layer.href}
                  className="pd-lift group flex min-h-44 flex-col rounded-xl border bg-card p-5 outline-none transition-colors hover:border-foreground/30 focus-visible:ring-[3px] focus-visible:ring-ring/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">{layer.number}</span>
                    <LayerSketch kind={layer.mark} />
                  </div>
                  <h3 className="mt-5 font-medium tracking-tight">{layer.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground text-pretty">{layer.description}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm text-foreground">
                    {layer.link}
                    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-3.5 transition-transform group-hover:translate-x-0.5">
                      <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div id="showcase">
        <ComponentBento />
      </div>

      {/* The live block */}
      <section data-guide="chat" aria-labelledby="chat" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="chat" className="font-display text-sm">
              <span className="font-medium text-foreground">AI Chat Experience.</span>{" "}
              <span className="text-muted-foreground">
                Live. Pick a question and watch it think, search, read and answer.
              </span>
            </h2>
            <Link
              href="/docs/components/ai-chat-experience"
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              <span className="inline-flex items-center gap-1.5">
                View block
                <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-3.5">
                  <path d="M5 11 11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </div>
          <div className="relative">
            {HeroDemo ? <HeroDemo /> : null}
          </div>
        </div>
      </section>

      {/* Before / while / after */}
      <section data-guide="stages" aria-labelledby="stages" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="pd-reveal max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">AI workflows</p>
          <h2 id="stages" className="font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Trust is decided in three moments.
          </h2>
          <p className="mt-3 text-muted-foreground text-pretty">
            A chat box covers none of them. Each moment has its own components, designed from research on where
            people over-trust, under-trust or give up on agents.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {STAGES.map((stage) => (
            <article key={stage.id} className="pd-lift pd-reveal group flex flex-col overflow-hidden rounded-xl border bg-card">
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
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">The AI design language</p>
            <h2 id="grammar" className="font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Clear signals. Consistent behavior.
            </h2>
            <p className="mt-3 text-muted-foreground text-pretty">
              Components agree with each other because they share rules. That's what makes a screen built from
              thirty of them feel like one product.
            </p>
          </div>
          <ul className="pd-reveal mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
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

          <h3 className="mt-14 text-xl font-medium tracking-tight">Four markers, four meanings. Everything else is ink.</h3>
          <ul className="pd-reveal mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {MARKERS.map((marker) => (
              <li key={marker.color} className="flex gap-3">
                <MarkerSwatch color={marker.color} />
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

      {/* The cast */}
      <section data-guide="cast" aria-labelledby="cast" className="pd-reveal mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 id="cast" className="font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            You can tell whose turn it is.
          </h2>
          <Link
            href="/docs/components/agent-figure"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <span className="inline-flex items-center gap-1.5">
              Agent Figure
              <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-3.5">
                <path d="M5 11 11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
          The agent's pose is driven by the real run state, so it moves while it works and holds still when the
          next move is yours. Optional — every other component states the same thing in words.
        </p>
        <CastStrip />
      </section>

      {/* Build with a coding agent */}
      <section data-guide="agents" aria-labelledby="agents" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="pd-reveal grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 id="agents" className="font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
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

      <SiteGuide stops={GUIDE} />
      </main>
      <SiteFooter />
    </>
  );
}
