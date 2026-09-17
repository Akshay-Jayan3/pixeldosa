import type { Metadata } from "next";
import Link from "next/link";

import { AgentFigure, Button, type AgentPose } from "@pixeldosa/ui";

import { PORTFOLIO_URL, WORK_CONTACT_URL, WORK_EMAIL_URL } from "@/lib/links";

export const metadata: Metadata = {
  title: "Work with me",
  description:
    "Design engineering for AI products: interfaces for agents and generation features, custom components on PixelDosa, and design systems from Figma to code.",
};

const OFFERS = [
  {
    title: "Build your AI interface",
    body: "The front end of your agent or generation features, from your designs or from PixelDosa's building blocks: plans, progress, approvals, results people can check.",
  },
  {
    title: "Custom components on PixelDosa",
    body: "Components and blocks your product needs that the library doesn't have yet, fitted to your brand and your stack.",
  },
  {
    title: "Design system setup",
    body: "Tokens, themes and components, kept in step between Figma and code, so your team and your coding agent build consistently.",
  },
  {
    title: "Beyond the chat box",
    body: "Turning a chat-only product into proper screens where the work happens, with the agent's state visible and nothing committed silently.",
  },
];

const STEPS: { pose: AgentPose; title: string; body: string }[] = [
  {
    pose: "listening",
    title: "Talk it through",
    body: "What you're building, what's there today, and what needs to change.",
  },
  {
    pose: "planning",
    title: "Agree the scope",
    body: "What gets built, how long it takes, and what done looks like, before anything starts.",
  },
  {
    pose: "working",
    title: "Build it",
    body: "In your codebase, with PixelDosa components where they fit and your design system around them.",
  },
  {
    pose: "done",
    title: "Hand over",
    body: "A walkthrough of what changed, and notes your team and your coding agent can follow for the next screens.",
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
            Design engineering for AI products.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground text-pretty">
            I'm{" "}
            <a href={PORTFOLIO_URL} className="text-foreground underline underline-offset-4 hover:no-underline">
              Akshay Jayan
            </a>
            , the design engineer behind PixelDosa. I build interfaces for agents and generation
            features, and the design systems underneath them.
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
          The interaction rules come from PixelDosa, which draws on published research about how people use AI.
        </p>
      </section>

      <section className="flex flex-col items-start gap-4 rounded-xl border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-medium">Tell me what you're building.</h2>
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
