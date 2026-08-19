import type { Metadata } from "next";

import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = {
  title: "Getting started",
};

const registryConfig = `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "registries": {
    "@pixeldosa": "https://pixeldosa.dev/r/{name}.json"
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

      <h2 className="mt-10 text-xl font-medium tracking-tight">Using AI tools</h2>
      <p className="mt-2 text-sm text-muted-foreground text-pretty">
        Point the shadcn MCP server at this registry and an agent can discover, read and
        install PixelDosa components directly. Each registry item carries{" "}
        <code className="font-mono">meta.engineeringNotes</code> and{" "}
        <code className="font-mono">meta.motionNotes</code> explaining not just what the
        component does but why it is built the way it is.
      </p>
      <div className="mt-3">
        <CodeBlock code="npx shadcn@latest mcp init" language="bash" />
      </div>
    </article>
  );
}
