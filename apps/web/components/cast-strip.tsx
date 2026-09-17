"use client";

import * as React from "react";

import { AgentFigure, type AgentPose } from "@pixeldosa/ui";

import { cn } from "@/lib/utils";

const CAST: { pose: AgentPose; label: string; note: string }[] = [
  { pose: "idle", label: "Idle", note: "Ready when you are." },
  { pose: "listening", label: "Listening", note: "I'm listening…" },
  { pose: "thinking", label: "Thinking", note: "Let me think…" },
  { pose: "planning", label: "Planning", note: "Here's my plan…" },
  { pose: "searching", label: "Searching", note: "Checking sources…" },
  { pose: "working", label: "Working", note: "Putting it together…" },
  { pose: "asking", label: "Asking", note: "I need your input." },
  { pose: "blocked", label: "Blocked", note: "Something's in the way." },
  { pose: "done", label: "Done", note: "All done!" },
];

const BUSY = new Set<AgentPose>(["listening", "thinking", "planning", "searching", "working"]);

/**
 * The cast of poses, with a switch that hands the turn to the reader. On "Your turn"
 * every working pose freezes and fades back, and the three poses that belong to you
 * come forward: the turn-taking rule, felt rather than explained.
 */
export function CastStrip() {
  const [yourTurn, setYourTurn] = React.useState(false);

  return (
    <div className="mt-8 flex flex-col gap-4">
      <div role="group" aria-label="Whose turn" className="flex items-center gap-3 self-start">
        <span className="font-hand text-base text-muted-foreground">Try it:</span>
        <div className="inline-flex rounded-md border p-0.5">
          {[
            { value: false, label: "Agent's turn" },
            { value: true, label: "Your turn" },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={yourTurn === option.value}
              onClick={() => setYourTurn(option.value)}
              className={cn(
                "rounded-[5px] px-3 py-1 text-sm outline-none transition-colors duration-[var(--pd-duration-fast)] focus-visible:ring-[3px] focus-visible:ring-ring/40 motion-reduce:transition-none",
                yourTurn === option.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="font-hand text-base text-muted-foreground" aria-live="polite">
          {yourTurn ? "Everything the agent was doing holds still." : "Working poses move."}
        </span>
      </div>

      <ul className="grid grid-cols-3 border-y sm:grid-cols-5 lg:grid-cols-9">
        {CAST.map((item) => {
          const dimmed = yourTurn && BUSY.has(item.pose);
          const lifted = yourTurn && !BUSY.has(item.pose);
          return (
            <li
              key={item.pose}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-4 text-center transition-transform duration-[var(--pd-duration-base)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
                lifted && "-translate-y-1"
              )}
            >
              {/* Only the drawing fades; the labels keep full contrast. */}
              <AgentFigure
                pose={item.pose}
                still={yourTurn}
                hideLabel
                aria-hidden="true"
                className={cn(
                  "transition-opacity duration-[var(--pd-duration-base)] motion-reduce:transition-none",
                  dimmed && "opacity-35"
                )}
              />
              <span className="text-sm font-medium">{item.label}</span>
              <span className="font-hand text-base leading-tight text-muted-foreground">{item.note}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
