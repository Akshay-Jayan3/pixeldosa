import type { Metadata } from "next";
import Link from "next/link";

import { AgentFigure, Button, type AgentPose } from "@pixeldosa/ui";

import { SPRINT_CONTACT_URL, SPRINT_EMAIL_URL } from "@/lib/links";

export const metadata: Metadata = {
  title: "Agent UX sprint",
  description:
    "A focused sprint for AI startups: review your agent or generation product against the problems people hit, then build the fixes in your codebase with PixelDosa.",
};

const FOR = [
  "You're shipping an agent or a generation product, and there's no full-time designer on the team.",
  "People don't trust what the agent did, can't tell if it's stuck, or give up while it works.",
  "Your interface is mostly a chat box, and the product has outgrown it.",
];

const STEPS: { pose: AgentPose; title: string; body: string }[] = [
  {
    pose: "listening",
    title: "Walk me through it",
    body: "A call about your product, your users and the moments that go wrong. You share access to a build and any recordings or feedback you have.",
  },
  {
    pose: "searching",
    title: "Review",
    body: "I go through the product against the problems people keep hitting with AI: surprise actions, silent waits, results nobody can check, refining by rewriting, confident guesses.",
  },
  {
    pose: "planning",
    title: "Agree the fixes",
    body: "A short, ranked list of changes with what each one fixes. You decide what goes in.",
  },
  {
    pose: "working",
    title: "Build them",
    body: "I build the agreed changes in your codebase, using PixelDosa components where they fit and your own design system around them.",
  },
  {
    pose: "done",
    title: "Hand over",
    body: "A walkthrough of what changed and why, and notes your team and your coding agent can follow for the next screens.",
  },
];

export default function SprintPage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-16 px-4 py-16 sm:px-6 sm:py-24">
      <section className="grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col items-start gap-5">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground">
            For AI startups
          </p>
          <h1 className="font-hand text-5xl font-bold leading-[1.05] text-balance sm:text-6xl">
            An agent UX sprint.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground text-pretty">
            A focused sprint to make your agent or generation product feel trustworthy: I review it against the
            problems people keep hitting with AI, then build the fixes in your codebase.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <a href={SPRINT_CONTACT_URL}>Start a conversation</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={SPRINT_EMAIL_URL}>Email me</a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Run by Akshay Jayan, the design engineer behind PixelDosa.
          </p>
        </div>
        <div className="flex justify-center">
          <AgentFigure pose="asking" size="lg" hideLabel aria-hidden="true" className="[&_svg]:size-44" />
        </div>
      </section>

      <section aria-labelledby="for" className="flex flex-col gap-4">
        <h2 id="for" className="text-2xl font-semibold tracking-tight">
          It's for you if
        </h2>
        <ul className="flex flex-col gap-3">
          {FOR.map((item) => (
            <li key={item} className="flex gap-3 text-muted-foreground">
              <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-agent-waiting" />
              <span className="text-pretty">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how" className="flex flex-col gap-6">
        <h2 id="how" className="text-2xl font-semibold tracking-tight">
          How it works
        </h2>
        <ol className="flex flex-col border-y">
          {STEPS.map((step) => (
            <li key={step.title} className="flex items-start gap-4 border-dashed py-5 [&:not(:first-child)]:border-t">
              <AgentFigure pose={step.pose} size="sm" hideLabel aria-hidden="true" className="shrink-0" />
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="font-hand text-lg text-muted-foreground">
          Length and scope depend on your product. We'll agree both before anything starts.
        </p>
      </section>

      <section className="flex flex-col items-start gap-4 rounded-xl border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-medium">Tell me what you're building.</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A few lines is enough. I'll reply with whether a sprint is the right fit.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href={SPRINT_CONTACT_URL}>Start a conversation</a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/docs/components">See the components</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
