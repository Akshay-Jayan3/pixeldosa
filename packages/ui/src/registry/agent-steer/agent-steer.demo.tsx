"use client";

import * as React from "react";

import { AgentSteer, type SteerMessage, type SteerMode } from "@/registry/agent-steer/agent-steer";
import { LiveStatusLine } from "@/registry/live-status-line/live-status-line";

const ORIGINAL = [
  "Reading src/auth/session.ts",
  "Tracing token refresh calls",
  "Patching refreshSession()",
  "Running auth tests",
];

const REDIRECTED = ["Reading src/auth/middleware.ts", "Patching verifyToken()", "Running auth tests"];

const STEP_MS = 3200;

/** What the pretend agent does with a redirect — a real one would re-plan. */
function redirect(text: string, remaining: string[]) {
  if (/test/i.test(text)) return remaining.filter((step) => !/test/i.test(step));
  if (/middleware|file/i.test(text)) return REDIRECTED;
  return remaining;
}

export default function AgentSteerDemo() {
  const [runKey, setRunKey] = React.useState(0);
  const [steps, setSteps] = React.useState(ORIGINAL);
  const [index, setIndex] = React.useState(0);
  const [steers, setSteers] = React.useState<SteerMessage[]>([]);
  const [ended, setEnded] = React.useState<"done" | "cancelled" | null>(null);
  const [startedAt, setStartedAt] = React.useState(() => Date.now());
  const steersRef = React.useRef(steers);
  steersRef.current = steers;

  const running = ended === null;

  // The step boundary: where a queued redirect is actually taken on board.
  React.useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      const queued = steersRef.current.find((steer) => steer.status === "queued");
      const remaining = steps.slice(index + 1);
      if (queued) {
        const next = redirect(queued.text, remaining);
        setSteers((all) =>
          all.map((steer) => (steer.id === queued.id ? { ...steer, status: "applied", note: undefined } : steer))
        );
        if (next.length === 0) setEnded("done");
        else {
          setSteps(next);
          setIndex(0);
        }
        return;
      }
      if (remaining.length === 0) setEnded("done");
      else setIndex(index + 1);
    }, STEP_MS);
    return () => window.clearTimeout(timer);
  }, [running, index, steps, runKey]);

  const onSteer = (text: string, mode: SteerMode) => {
    const id = crypto.randomUUID();
    setSteers((all) => [...all, { id, text, mode, status: "pending" }]);
    // The agent acknowledges on its own schedule — the UI waits for it.
    window.setTimeout(() => {
      // Withdrawn while pending — the agent never acts on it.
      if (!steersRef.current.some((steer) => steer.id === id)) return;
      if (mode === "now") {
        setSteers((all) =>
          all.map((steer) => (steer.id === id ? { ...steer, status: "applied", note: "current step abandoned" } : steer))
        );
        setSteps((current) => {
          const next = redirect(text, current);
          return next.length ? next : current;
        });
        setIndex(0);
      } else {
        setSteers((all) => all.map((steer) => (steer.id === id ? { ...steer, status: "queued" } : steer)));
      }
    }, 1100);
  };

  const restart = () => {
    setSteps(ORIGINAL);
    setIndex(0);
    setSteers([]);
    setEnded(null);
    setStartedAt(Date.now());
    setRunKey((key) => key + 1);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <LiveStatusLine
        state={ended ?? "working"}
        status={ended === "done" ? "Fixed the token refresh bug" : ended === "cancelled" ? "Stopped" : steps[index]!}
        startedAt={startedAt}
        onCancel={running ? () => setEnded("cancelled") : undefined}
      />
      <AgentSteer
        running={running}
        currentStep={steps[index]}
        steers={steers}
        suggestions={["Not that file — use middleware.ts", "Skip the tests"]}
        onSteer={onSteer}
        onWithdraw={(id) => setSteers((all) => all.filter((steer) => steer.id !== id))}
      />
      {!running ? (
        <button
          type="button"
          onClick={restart}
          className="self-start text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Run again
        </button>
      ) : null}
    </div>
  );
}
