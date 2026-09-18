"use client";

import * as React from "react";

import { GenerationJob, type GenerationJobStatus } from "@/registry/generation-job/generation-job";

type Phase = {
  status: GenerationJobStatus;
  stage?: string;
  progress?: number;
  queue?: { position?: number; typicalWait?: string };
  ms: number;
  outputs?: number;
};

const RUN: Phase[] = [
  { status: "queued", queue: { position: 3, typicalWait: "2 to 4 minutes" }, ms: 2600 },
  { status: "queued", queue: { position: 1, typicalWait: "under a minute" }, ms: 2000 },
  { status: "running", stage: "Rendering 1 of 4", progress: 0.25, ms: 1800, outputs: 0 },
  { status: "partial", stage: "Rendering 3 of 4", progress: 0.6, ms: 2200, outputs: 2 },
  { status: "done", ms: 6000, outputs: 4 },
];

export default function GenerationJobDemo() {
  const [step, setStep] = React.useState(0);
  const [notify, setNotify] = React.useState(false);
  const [startedAt, setStartedAt] = React.useState(() => Date.now());
  const phase = RUN[step]!;

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = (step + 1) % RUN.length;
      if (next === 0) setStartedAt(Date.now());
      setStep(next);
    }, phase.ms);
    return () => window.clearTimeout(timer);
  }, [step, phase.ms]);

  return (
    <div className="w-full max-w-md">
      <GenerationJob
        headingLevel={2}
        status={phase.status}
        title="4 product images · 1024 × 1024"
        queue={phase.queue}
        stage={phase.stage}
        progress={phase.progress}
        startedAt={startedAt}
        cost="40 credits"
        refundNote="Anything that fails is refunded"
        notify={notify}
        onNotifyChange={setNotify}
        onCancel={() => setStep(RUN.length - 1)}
      >
        {phase.outputs ? (
          <ul className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <li
                key={index}
                className="aspect-square rounded-md border bg-muted"
                aria-label={index < phase.outputs! ? `Image ${index + 1}, ready` : `Image ${index + 1}, still generating`}
              >
                {index < phase.outputs! ? (
                  <span className="flex size-full items-center justify-center text-xs text-muted-foreground">
                    {index + 1}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </GenerationJob>
    </div>
  );
}
