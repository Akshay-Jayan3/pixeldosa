import type { Metadata } from "next";
import Link from "next/link";

import { AgentFigure, Button, type AgentPose } from "@pixeldosa/ui";

import { PORTFOLIO_URL, WORK_CONTACT_URL, WORK_EMAIL_URL } from "@/lib/links";
import { Scribble } from "@/components/sketch";

export const metadata: Metadata = {
  title: "Work with me",
  description:
    "Design and frontend engineering for product interfaces, internal tools, websites, reusable components, and design systems—from idea to production.",
};

const OFFERS = [
  {
    title: "Product UI design & frontend build",
    body: "Shape a workflow and turn it into a polished, responsive React feature—from interface and interaction design to production-ready implementation. Integrate APIs or AI capabilities where they fit.",
  },
  {
    title: "Internal tools & dashboards",
    body: "Make team workflows easier to see and run with focused admin panels, operational dashboards, and internal apps built around the work people actually need to do.",
  },
  {
    title: "Figma-to-code components & design systems",
    body: "Turn approved designs and scattered interface patterns into accessible React components, tokens, and Storybook documentation your team can reuse.",
  },
  {
    title: "Websites & MVP frontends",
    body: "Design and build a polished marketing site or focused product frontend—from page structure and visual direction to a responsive, launch-ready experience.",
  },
];

const STEPS: { pose: AgentPose; title: string; body: string }[] = [
  {
    pose: "listening",
    title: "Understand the workflow",
    body: "We clarify who the interface is for, what they need to do, and where the current experience falls short.",
  },
  {
    pose: "planning",
    title: "Shape the experience",
    body: "We map the key screens, interactions, and states, then agree on scope and what a successful handoff looks like.",
  },
  {
    pose: "working",
    title: "Design and build",
    body: "I turn the agreed experience into polished, responsive React UI in your codebase, working with your existing stack and design system.",
  },
  {
    pose: "done",
    title: "Ship with confidence",
    body: "We review the finished work together, cover the important states, and leave your team with a clear handoff.",
  },
];

export default function WorkWithMePage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-16 px-4 py-16 sm:px-6 sm:py-24">
      <section className="grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col items-start gap-5">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground">
            Work with me
          </p>
          <h1 className="font-hand text-5xl font-bold leading-[1.05] text-balance sm:text-6xl">
            I design and build{" "}
            <Scribble variant="loop">web interfaces</Scribble> that make complex work feel simple.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground text-pretty">
            I'm{" "}
            <a href={PORTFOLIO_URL} className="text-foreground underline underline-offset-4 hover:no-underline">
              Akshay Jayan
            </a>
            , a design engineer combining product thinking, interface design, and frontend engineering
            to turn ideas into useful, production-ready web experiences—from product features and
            internal tools to reusable UI systems.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <a href={WORK_CONTACT_URL}>Start a conversation</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={WORK_EMAIL_URL}>Email me</a>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <a href={PORTFOLIO_URL}>See my portfolio</a>
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          <AgentFigure pose="idle" size="lg" hideLabel aria-hidden="true" className="[&_svg]:size-44" />
        </div>
      </section>

      <section aria-labelledby="offers" className="flex flex-col gap-6">
        <h2 id="offers" className="text-2xl font-semibold tracking-tight">
          What I can help with
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {OFFERS.map((offer) => (
            <li key={offer.title} className="flex flex-col gap-2 rounded-xl border bg-card p-5">
              <h3 className="font-medium">{offer.title}</h3>
              <p className="text-sm text-muted-foreground text-pretty">{offer.body}</p>
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
          The goal: an interface that's clear to use, solid in production, and easy for your team to extend.
        </p>
      </section>

      <section className="flex flex-col items-start gap-4 rounded-xl border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-medium">Tell me what you're building or trying to improve.</h2>
          <p className="mt-1 text-sm text-muted-foreground">A few lines is enough to start.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href={WORK_CONTACT_URL}>Start a conversation</a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/docs/components">See the components</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
