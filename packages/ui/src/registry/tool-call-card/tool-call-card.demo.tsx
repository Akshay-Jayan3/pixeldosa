"use client";

import * as React from "react";

import { ToolCallGroup, type ToolCall } from "@/registry/tool-call-card/tool-call-card";

const SCRIPT: ToolCall[] = [
  {
    id: "1",
    kind: "search",
    name: "grep",
    target: "requestTimeout",
    status: "done",
    input: { pattern: "requestTimeout", path: "src/" },
    output: "src/config.ts:14\nsrc/http/client.ts:32",
    durationMs: 180,
  },
  {
    id: "2",
    kind: "read",
    name: "fs.read_file",
    target: "src/config.ts",
    status: "done",
    input: { path: "src/config.ts", lines: "10-18" },
    output: "export const config = {\n  requestTimeout: 30_000,\n  retries: 2,\n};",
    durationMs: 42,
  },
  {
    id: "3",
    kind: "fetch",
    name: "web.fetch",
    target: "https://internal.docs/http-client",
    status: "failed",
    error: "403 Forbidden — the docs site needs a signed-in session.",
    durationMs: 1260,
  },
  {
    id: "4",
    kind: "read",
    name: "fs.read_file",
    target: "src/http/client.ts",
    status: "done",
    input: { path: "src/http/client.ts", lines: "28-40" },
    output: "const controller = new AbortController();\nsetTimeout(() => controller.abort(), 5_000);",
    durationMs: 38,
  },
  {
    id: "5",
    kind: "write",
    name: "fs.edit_file",
    target: "src/http/client.ts",
    status: "done",
    input: { path: "src/http/client.ts", replace: "5_000", with: "config.requestTimeout" },
    output: "1 line changed",
    durationMs: 64,
  },
];

const STEP_MS = 1400;

export default function ToolCallCardDemo() {
  // How many calls have started. The newest started call is running until the next tick.
  const [started, setStarted] = React.useState(1);
  const finished = started > SCRIPT.length;

  React.useEffect(() => {
    if (finished) return;
    const timer = window.setTimeout(() => setStarted((n) => n + 1), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [started, finished]);

  const calls = SCRIPT.slice(0, started).map((call, index) =>
    index === started - 1 && !finished ? { ...call, status: "running" as const, output: undefined, error: undefined, durationMs: undefined } : call
  );

  return (
    // A stable height, so the docs page doesn't shift as calls arrive.
    <div className="flex min-h-[26rem] w-full max-w-lg flex-col gap-4">
      <ToolCallGroup calls={calls} defaultOpen />
      {finished ? (
        <div className="flex flex-col gap-3 animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] motion-reduce:animate-none">
          <p className="text-sm text-foreground text-pretty">
            The config sets a 30s timeout, but the HTTP client ignored it and aborted every request after 5s. I changed
            the client to read <code className="font-mono text-[0.8125rem]">config.requestTimeout</code>. I couldn&apos;t
            open the internal client docs, so I didn&apos;t check them.
          </p>
          <button
            type="button"
            onClick={() => setStarted(1)}
            className="self-start text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Run again
          </button>
        </div>
      ) : null}
    </div>
  );
}
