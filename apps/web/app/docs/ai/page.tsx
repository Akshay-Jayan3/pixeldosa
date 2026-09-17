import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components/code-block";
import { SITE_URL } from "@/lib/docs";
import { SketchRule } from "@/components/sketch";

export const metadata: Metadata = {
  title: "Build with AI",
  description: "Set up Claude Code, Cursor, or any coding agent to find, install and build with PixelDosa correctly.",
};

const mcpConfig = `{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}`;

const registryConfig = `"registries": {
  "@pixeldosa": "${SITE_URL}/r/{name}.json"
}`;

const prompts = [
  "Add an agent panel to the sidebar that shows the run's status, reasoning and any approvals, using @pixeldosa.",
  "Let the AI fill in the customer form, but make the user review every field before it's saved.",
  "Before the agent sends the email, show an approval with the recipient count and whether it can be undone.",
  "Show a placeholder with real progress while the image generates, then fade in the result.",
];

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-medium tracking-tight">
        <span className="mr-2 text-muted-foreground tabular-nums">{n}.</span>
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground text-pretty">
        {children}
      </div>
    </section>
  );
}

export default function BuildWithAIPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">Build with AI</h1>
      <SketchRule color="done" className="mt-2" />
      <p className="mt-3 text-muted-foreground text-pretty">
        Most teams will meet PixelDosa through a coding agent. Finding and installing
        components is the easy part — agents can already do that. The part that matters is
        the agent knowing <em>how</em> to use them: that nothing an AI proposes gets saved
        without review, that an approval states whether it can be undone, that the thing
        waiting on the user never animates. This page sets that up.
      </p>

      <Step n={1} title="Add the registry">
        <p>
          In your project&apos;s <code className="font-mono text-foreground">components.json</code>:
        </p>
        <CodeBlock code={registryConfig} language="components.json" />
      </Step>

      <Step n={2} title="Install the agent guide">
        <p>
          This puts PixelDosa&apos;s component guide and UX rules into your repo, where your
          agent reads them on every task. It installs as a Claude Code skill at{" "}
          <code className="font-mono text-foreground">.claude/skills/pixeldosa/SKILL.md</code>.
          For Cursor, Copilot or other agents, reference that file from your rules or{" "}
          <code className="font-mono text-foreground">AGENTS.md</code>.
        </p>
        <CodeBlock code="npx shadcn@latest add @pixeldosa/pixeldosa-agent-guide" language="bash" />
      </Step>

      <Step n={3} title="Connect the shadcn MCP server">
        <p>
          Lets your agent search, read and install components directly. Add this to{" "}
          <code className="font-mono text-foreground">.mcp.json</code> (Claude Code),{" "}
          <code className="font-mono text-foreground">.cursor/mcp.json</code> (Cursor) or{" "}
          <code className="font-mono text-foreground">.vscode/mcp.json</code> (VS Code):
        </p>
        <CodeBlock code={mcpConfig} language="json" />
      </Step>

      <Step n={4} title="Or point any agent at the docs">
        <p>
          No MCP? Every agent that can read a URL can use these. They&apos;re generated from
          the registry, so they&apos;re always current.
        </p>
        <ul className="flex flex-col gap-2">
          <li>
            <a className="font-mono text-foreground underline underline-offset-4" href="/llms.txt">
              /llms.txt
            </a>{" "}
            — every component, how to install, and the rules for using them.
          </li>
          <li>
            <a className="font-mono text-foreground underline underline-offset-4" href="/llms-full.txt">
              /llms-full.txt
            </a>{" "}
            — the full documentation in one file.
          </li>
          <li>
            <code className="font-mono text-foreground">/llms/&lt;component&gt;.md</code> — one
            component, e.g.{" "}
            <a
              className="font-mono text-foreground underline underline-offset-4"
              href="/llms/ai-approval-gate.md"
            >
              /llms/ai-approval-gate.md
            </a>
            .
          </li>
        </ul>
      </Step>

      <section className="mt-12">
        <h2 className="text-xl font-medium tracking-tight">Prompts that work well</h2>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          Describe the job and the review you want, not the component. The guide maps the job
          to the right component.
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {prompts.map((prompt) => (
            <li key={prompt} className="rounded-md border bg-card p-3 text-sm text-foreground">
              {prompt}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-lg border-l-2 border-l-primary bg-card p-5">
        <h2 className="text-base font-medium tracking-tight">No AI stack required</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          PixelDosa components are plain React. They don&apos;t depend on the AI SDK, A2UI,
          LangGraph, MCP or any provider — your agent wires its own events to props. Each
          component page shows how common agent events map on.{" "}
          <Link href="/docs/components/agent-presence" className="text-foreground underline underline-offset-4">
            See the mapping table
          </Link>
          .
        </p>
      </section>
    </article>
  );
}
