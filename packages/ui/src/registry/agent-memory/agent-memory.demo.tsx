"use client";

import * as React from "react";

import { AgentMemory, type MemoryItem } from "@/registry/agent-memory/agent-memory";

const INITIAL: MemoryItem[] = [
  { id: "1", text: "Works in Europe/Berlin time", origin: "stated", source: "From your settings" },
  { id: "2", text: "Wants summaries under five bullet points", origin: "stated", source: "You said so on 2 Sep" },
  { id: "3", text: "Prefers TypeScript over JavaScript examples", origin: "inferred", source: "Noticed across 6 conversations" },
  { id: "4", text: "Manages a team of about eight people", origin: "inferred", source: "Picked up from a chat on 28 Aug" },
  { id: "5", text: "Doesn't take meetings on Fridays", origin: "inferred", source: "Noticed from your calendar replies" },
];

export default function AgentMemoryDemo() {
  const [memories, setMemories] = React.useState(INITIAL);
  const [paused, setPaused] = React.useState(false);

  return (
    <div className="w-full max-w-md">
      <AgentMemory
        memories={memories}
        paused={paused}
        onPausedChange={setPaused}
        // An edit is the user speaking, so the memory becomes one they stated.
        onEdit={(id, text) =>
          setMemories((all) =>
            all.map((memory) => (memory.id === id ? { ...memory, text, origin: "stated", source: "You edited this" } : memory))
          )
        }
        onForget={(id) => setMemories((all) => all.filter((memory) => memory.id !== id))}
        onRestore={(memory) =>
          setMemories((all) => {
            const at = INITIAL.findIndex((item) => item.id === memory.id);
            const next = [...all];
            const index = next.findIndex((item) => INITIAL.findIndex((i) => i.id === item.id) > at);
            next.splice(index === -1 ? next.length : index, 0, memory);
            return next;
          })
        }
        onForgetAll={() => setMemories([])}
      />
      {memories.length === 0 ? (
        <button
          type="button"
          onClick={() => setMemories(INITIAL)}
          className="mt-3 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Reset demo
        </button>
      ) : null}
    </div>
  );
}
