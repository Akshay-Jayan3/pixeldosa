import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = {
  title: "Getting started",
};

const registryConfig = `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "registries": {
    "@pixeldosa": "https://pixeldosa.akshayjayan.com/r/{name}.json"
  }
}`;

export default function DocsIndexPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">Getting started</h1>
      <p className="mt-3 text-muted-foreground text-pretty">
        PixelDosa is distributed with the shadcn registry protocol. Components are copied
        into your project as source you own — there is no runtime package to depend on.
      </p>

      <h2 className="mt-10 text-xl font-medium tracking-tight">1. Initialise shadcn</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This creates <code className="font-mono">components.json</code> and the{" "}
        <code className="font-mono">cn</code> helper at{" "}
        <code className="font-mono">@/lib/utils</code>, which every PixelDosa component
        imports.
      </p>
      <div className="mt-3">
        <CodeBlock code="npx shadcn@latest init" language="bash" />
      </div>

      <h2 className="mt-10 text-xl font-medium tracking-tight">2. Add the registry</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Register the <code className="font-mono">@pixeldosa</code> namespace in your{" "}
        <code className="font-mono">components.json</code>.
      </p>
      <div className="mt-3">
        <CodeBlock code={registryConfig} language="components.json" />
      </div>

      <h2 className="mt-10 text-xl font-medium tracking-tight">3. Install the theme</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        The theme item carries the full design and motion token set as CSS custom
        properties. Install it once, before your first component.
      </p>
      <div className="mt-3">
        <CodeBlock code="npx shadcn@latest add @pixeldosa/pixeldosa-theme" language="bash" />
      </div>

      <h2 className="mt-10 text-xl font-medium tracking-tight">4. Add a component</h2>
      <div className="mt-3">
        <CodeBlock code="npx shadcn@latest add @pixeldosa/button" language="bash" />
      </div>

      <h2 className="mt-10 text-xl font-medium tracking-tight">Building with an AI agent?</h2>
      <p className="mt-2 text-sm text-muted-foreground text-pretty">
        Install the agent guide so your coding agent uses PixelDosa the way it&apos;s meant to
        be used, then connect the shadcn MCP server.{" "}
        <Link href="/docs/ai" className="text-foreground underline underline-offset-4">
          Set up Claude Code, Cursor or any agent
        </Link>
        .
      </p>
      <div className="mt-3">
        <CodeBlock code="npx shadcn@latest add @pixeldosa/pixeldosa-agent-guide" language="bash" />
      </div>
    </article>
  );
}
