"use client";

import * as React from "react";

import { ReasoningStream } from "@/registry/reasoning-stream/reasoning-stream";

const TRACE = [
  "Checking the invoice table for duplicate payment warnings.",
  "Found five flagged invoices across the last quarter.",
  "Three share the same billing contact — that's the strongest signal so far.",
  "Checking whether those three came from the same import batch.",
  "They did: all three were added in the 14 August upload.",
  "The other two are unrelated, so the duplicate warning is one root cause, not five.",
];

/**
 * Streams a trace, then completes — so the fold-away on completion is visible without
 * interaction, which is the behaviour the component actually exists for.
 */
export default function ReasoningStreamDemo() {
  const [count, setCount] = React.useState(0);
  const [elapsed, setElapsed] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];

    const run = () => {
      if (cancelled) return;
      setCount(0);
      setElapsed(undefined);

      TRACE.forEach((_, index) => {
        timers.push(
          window.setTimeout(() => !cancelled && setCount(index + 1), 900 * (index + 1))
        );
      });

      timers.push(
        window.setTimeout(() => !cancelled && setElapsed(900 * TRACE.length), 900 * TRACE.length + 400)
      );
      timers.push(window.setTimeout(run, 900 * TRACE.length + 5200));
    };

    run();
    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const streaming = elapsed === undefined;

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <ReasoningStream
        steps={TRACE.slice(0, count)}
        isStreaming={streaming}
        durationMs={elapsed}
      />

      {!streaming ? (
        <p className="animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] rounded-md border bg-card p-3 text-sm text-foreground motion-reduce:animate-none">
          The duplicate-payment warning has one root cause: three invoices from the 14
          August import share a billing contact.
        </p>
      ) : null}
    </div>
  );
}
