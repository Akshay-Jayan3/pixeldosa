"use client";

import * as React from "react";

import {
  GenerationPlaceholder,
  type GenerationStatus,
} from "@/registry/generation-placeholder/generation-placeholder";

/**
 * Runs a realistic generation cycle: a short queue, measured generation, an
 * indeterminate encode phase, then the artifact. Loops so the whole temporal shape is
 * visible without interaction — the states only make sense in sequence.
 */
export default function GenerationPlaceholderDemo() {
  const [status, setStatus] = React.useState<GenerationStatus>("queued");
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];

    const run = () => {
      if (cancelled) return;
      setStatus("queued");
      setProgress(0);

      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setStatus("generating");

          const step = () => {
            if (cancelled) return;
            setProgress((value) => {
              const next = value + 0.04;
              if (next >= 1) {
                setStatus("processing");
                timers.push(
                  window.setTimeout(() => !cancelled && setStatus("done"), 1600)
                );
                timers.push(window.setTimeout(run, 5200));
                return 1;
              }
              timers.push(window.setTimeout(step, 110));
              return next;
            });
          };
          step();
        }, 900)
      );
    };

    run();
    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const label =
    status === "queued"
      ? "Queued"
      : status === "generating"
        ? "Generating image"
        : status === "processing"
          ? "Upscaling"
          : "Done";

  // Every surface runs off the same `status` and `progress`. Two placeholders telling
  // different stories side by side — one "queued" while another says "generating" —
  // reads as a bug, not a demo.
  const shared = {
    status,
    progress: status === "generating" ? progress : undefined,
    label,
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <GenerationPlaceholder {...shared} aspectRatio="1 / 1" form="mosaic" density="default">
          <div className="flex size-full items-center justify-center bg-muted">
            <span className="text-xs text-muted-foreground">Mosaic</span>
          </div>
        </GenerationPlaceholder>

        <GenerationPlaceholder {...shared} aspectRatio="1 / 1" form="sweep">
          <div className="flex size-full items-center justify-center bg-muted">
            <span className="text-xs text-muted-foreground">Sweep</span>
          </div>
        </GenerationPlaceholder>
      </div>

      <GenerationPlaceholder
        {...shared}
        aspectRatio="16 / 9"
        form="field"
        onCancel={() => undefined}
      >
        <div className="flex size-full items-center justify-center bg-muted">
          <span className="text-sm text-muted-foreground">Generated artwork</span>
        </div>
      </GenerationPlaceholder>

      <GenerationPlaceholder {...shared} aspectRatio="8 / 1" form="bars" label="Generating audio">
        <div className="flex size-full items-center justify-center bg-muted">
          <span className="text-xs text-muted-foreground">Track ready · 0:24</span>
        </div>
      </GenerationPlaceholder>
    </div>
  );
}
