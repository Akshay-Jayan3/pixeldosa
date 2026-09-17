"use client";

import * as React from "react";

import { AIChatExperience, type ChatTurn } from "@/registry/ai-chat-experience/ai-chat-experience";

const ANSWER = `The client ignores the configured timeout: it aborts every request after a hard-coded 5 seconds, while config sets 30.

\`\`\`ts
const timer = setTimeout(() => controller.abort(), config.requestTimeout);
\`\`\`

With that change, slow exports will get the full 30 seconds like every other request.`;

const REASONING = ["Find where the request timeout is defined", "Check whether the HTTP client actually reads it"];

type Run = { turnId: string; timers: number[]; interval?: number };

/**
 * A pretend agent. Timings and chunk sizes are irregular on purpose, like a real stream.
 * The block only renders the turns it's given.
 */
export default function AIChatExperienceDemo() {
  const [turns, setTurns] = React.useState<ChatTurn[]>([]);
  const run = React.useRef<Run | null>(null);

  const update = React.useCallback((id: string, patch: Partial<ChatTurn> | ((turn: ChatTurn) => Partial<ChatTurn>)) => {
    setTurns((all) => all.map((turn) => (turn.id === id ? { ...turn, ...(typeof patch === "function" ? patch(turn) : patch) } : turn)));
  }, []);

  const clearRun = () => {
    if (!run.current) return;
    run.current.timers.forEach((timer) => window.clearTimeout(timer));
    window.clearInterval(run.current.interval);
    run.current = null;
  };

  React.useEffect(() => clearRun, []);

  const streamAnswer = (id: string, from: number) => {
    let length = from;
    const interval = window.setInterval(() => {
      length = Math.min(ANSWER.length, length + 5 + (length % 9));
      const done = length >= ANSWER.length;
      update(id, {
        text: ANSWER.slice(0, length),
        status: done ? "done" : "streaming",
        ...(done
          ? {
              sources: [
                { id: "cfg", title: "src/config.ts", publisher: "Repository" },
                { id: "client", title: "src/http/client.ts", publisher: "Repository" },
              ],
              suggestions: ["Write a test for the timeout", "Are other clients hard-coded too?"],
            }
          : {}),
      });
      if (done) clearRun();
    }, 55);
    if (run.current) run.current.interval = interval;
  };

  const start = (id: string) => {
    clearRun();
    run.current = { turnId: id, timers: [] };
    const at = (ms: number, fn: () => void) => run.current?.timers.push(window.setTimeout(fn, ms));

    at(900, () => update(id, { reasoning: { steps: REASONING.slice(0, 2), streaming: true } }));
    at(1800, () =>
      update(id, {
        reasoning: { steps: REASONING, streaming: false, durationMs: 1800 },
        toolCalls: [{ id: "t1", kind: "search", target: "requestTimeout", status: "running" }],
      })
    );
    at(2600, () =>
      update(id, {
        toolCalls: [
          { id: "t1", kind: "search", target: "requestTimeout", status: "done", durationMs: 180, output: "src/config.ts:14\nsrc/http/client.ts:32" },
          { id: "t2", kind: "read", target: "src/http/client.ts", status: "running" },
        ],
      })
    );
    at(3300, () => {
      update(id, (turn) => ({
        toolCalls: turn.toolCalls?.map((call) => (call.id === "t2" ? { ...call, status: "done", durationMs: 40 } : call)),
      }));
      streamAnswer(id, 0);
    });
  };

  const send = (text: string) => {
    const id = `a-${Date.now()}`;
    setTurns((all) => [
      ...all.map((turn) => (turn.role === "assistant" ? { ...turn, suggestions: undefined } : turn)),
      { id: `u-${Date.now()}`, role: "user", text },
      { id, role: "assistant", status: "streaming" },
    ]);
    start(id);
  };

  return (
    <div className="w-full max-w-2xl">
      <AIChatExperience
        className="h-[560px]"
        expression="full"
        turns={turns}
        empty={{
          title: "What are we fixing today?",
          description: "Ask about your codebase. Answers show what was read and link to the source.",
          suggestions: ["Why do exports time out after 5 seconds?", "Where is auth configured?"],
        }}
        suggestionMode="fill"
        onSend={({ text }) => send(text)}
        onStop={() => {
          const id = run.current?.turnId;
          clearRun();
          if (id) update(id, { status: "stopped" });
        }}
        onContinue={(id) => {
          const turn = turns.find((item) => item.id === id);
          run.current = { turnId: id, timers: [] };
          update(id, { status: "streaming" });
          streamAnswer(id, turn?.text?.length ?? 0);
        }}
        onRetry={(id) => {
          update(id, { status: "streaming", text: undefined, reasoning: undefined, toolCalls: undefined, error: undefined });
          start(id);
        }}
        onRegenerate={(id) => {
          update(id, { status: "streaming", text: undefined, reasoning: undefined, toolCalls: undefined, sources: undefined, suggestions: undefined });
          start(id);
        }}
        onApplyCode={() => new Promise((resolve) => window.setTimeout(resolve, 800))}
      />
    </div>
  );
}
