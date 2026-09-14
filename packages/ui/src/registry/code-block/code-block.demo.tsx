"use client";

import * as React from "react";

import { CodeBlock, splitCodeFences } from "@/registry/code-block/code-block";
import { MessageContent } from "@/registry/message/message";

const ANSWER = `The timeout is hard-coded in the client. Read it from config instead:

\`\`\`ts
import { config } from "../config";

export async function request(url: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.requestTimeout);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
\`\`\`

This keeps every request on the same 30s budget as the rest of the app.`;

/**
 * Streams a markdown answer in irregular chunks and renders it through `splitCodeFences`,
 * so the unclosed fence mid-stream becomes a streaming CodeBlock rather than broken text.
 */
export default function CodeBlockDemo() {
  const [length, setLength] = React.useState(0);
  const done = length >= ANSWER.length;

  React.useEffect(() => {
    if (done) return;
    const timer = window.setTimeout(
      () => setLength((n) => Math.min(ANSWER.length, n + 6 + (n % 11))),
      length === 0 ? 700 : 45
    );
    return () => window.clearTimeout(timer);
  }, [length, done]);

  const segments = splitCodeFences(ANSWER.slice(0, length));

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <MessageContent className="flex flex-col gap-3 [&>*+*]:mt-0">
        {segments.map((segment, index) =>
          segment.type === "text" ? (
            segment.content.trim() ? <p key={index}>{segment.content.trim()}</p> : null
          ) : (
            <CodeBlock
              key={index}
              code={segment.content}
              language={segment.language}
              filename="src/http/client.ts"
              streaming={!segment.complete}
              showLineNumbers
              onApply={() => new Promise((resolve) => window.setTimeout(resolve, 900))}
            />
          )
        )}
      </MessageContent>
      {done ? (
        <button
          type="button"
          onClick={() => setLength(0)}
          className="self-start text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Replay
        </button>
      ) : null}
    </div>
  );
}
