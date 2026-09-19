"use client";

import * as React from "react";

import { demos } from "@/components/registry-demos";
import { cn } from "@/lib/utils";

/** The width demos are laid out at before being scaled to fit the gallery viewport. */
const DESIGN_WIDTH = 560;

/**
 * A browse-grid thumbnail of a component's real demo.
 *
 * A thumbnail, deliberately, not a live embed. The demo is laid out at a fixed design
 * width and scaled to the card, so a whole component fits instead of being cropped
 * mid-row. It is `inert`, because interactive controls inside a card link fight the link.
 * It only mounts once the card is near the viewport, so a page of thirty cards doesn't run
 * thirty timers.
 *
 * The preview is measured in its natural layout size, then scaled against both stage
 * dimensions. This keeps tall components readable instead of letting the fixed card
 * viewport crop their lower content.
 */
export function ComponentThumbnail({
  name,
  title,
  tall = false,
  staticPreview = false,
  eager = false,
  className,
}: {
  name: string;
  title?: string;
  tall?: boolean;
  staticPreview?: boolean;
  eager?: boolean;
  className?: string;
}) {
  const Demo = demos[name];
  const stageRef = React.useRef<HTMLDivElement>(null);
  const demoRef = React.useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = React.useState({ width: 0, height: 0 });
  const [demoHeight, setDemoHeight] = React.useState(0);
  const [near, setNear] = React.useState(eager);

  const zoom =
    stageSize.width > 0 && stageSize.height > 0
      ? Math.min(
          1,
          (stageSize.width - 48) / DESIGN_WIDTH,
          demoHeight > 0 ? (stageSize.height - 32) / demoHeight : 1
        )
      : null;

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const resize = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width ?? 0;
      const height = entry?.contentRect.height ?? 0;
      if (width > 0 && height > 0) setStageSize({ width, height });
    });
    resize.observe(stage);

    if (eager) return;

    const visibility = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          visibility.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    visibility.observe(stage);

    return () => {
      resize.disconnect();
      visibility.disconnect();
    };
  }, [eager]);

  React.useEffect(() => {
    const demo = demoRef.current;
    if (!demo) return;

    const resize = new ResizeObserver(([entry]) => {
      const height = entry?.contentRect.height ?? 0;
      if (height > 0) setDemoHeight(height);
    });
    resize.observe(demo);
    return () => resize.disconnect();
  }, [near, zoom]);

  return (
    <div
      ref={stageRef}
      aria-hidden="true"
      className={cn(
        // Plain paper. The demo is centred and scaled to fit; no dot grid or fade, which
        // read as generic SaaS surface.
        "relative flex w-full items-center justify-center overflow-hidden bg-muted/50",
        tall ? "aspect-[16/9]" : "aspect-[4/3]",
        className
      )}
    >
      {staticPreview ? (
        <div
          role="img"
          aria-label={`${title ?? name} preview`}
          className="absolute inset-4 overflow-hidden rounded-lg border border-foreground/10 bg-background shadow-sm"
        >
          <div className="flex h-8 items-center gap-2 border-b px-3">
            <span className="size-2 rounded-full bg-destructive/70" />
            <span className="size-2 rounded-full bg-muted-foreground/40" />
            <span className="size-2 rounded-full bg-muted-foreground/25" />
            <span className="ml-auto h-2 w-16 rounded-full bg-muted" />
          </div>
          <div className="grid h-[calc(100%-2rem)] grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] gap-3 p-3">
            <div className="flex flex-col gap-2 rounded-md border bg-muted/50 p-2">
              <span className="h-2 w-1/2 rounded-full bg-foreground/70" />
              <span className="h-1.5 w-4/5 rounded-full bg-muted-foreground/40" />
              <span className="h-1.5 w-3/5 rounded-full bg-muted-foreground/25" />
              <div className="mt-auto grid grid-cols-2 gap-1.5">
                <span className="h-8 rounded border bg-card" />
                <span className="h-8 rounded border bg-card" />
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-md border p-3">
              <span className="h-2 w-2/5 rounded-full bg-foreground/70" />
              <span className="h-1.5 w-3/4 rounded-full bg-muted-foreground/35" />
              <div className="mt-1 flex flex-1 items-end gap-1.5">
                <span className="h-1/3 w-full rounded-sm bg-muted" />
                <span className="h-2/3 w-full rounded-sm bg-muted-foreground/30" />
                <span className="h-full w-full rounded-sm bg-foreground/60" />
                <span className="h-1/2 w-full rounded-sm bg-muted-foreground/20" />
              </div>
              <span className="h-7 rounded border bg-card" />
            </div>
          </div>
          <span className="absolute bottom-3 left-3 max-w-[65%] truncate text-[0.65rem] font-medium text-muted-foreground">
            {title ?? name}
          </span>
        </div>
      ) : null}
      {!staticPreview && Demo && near && zoom !== null ? (
        <div
          style={{ width: DESIGN_WIDTH, transform: `translate(-50%, -50%) scale(${zoom})` }}
          className="pointer-events-none absolute left-1/2 top-1/2 shrink-0 select-none"
        >
          <div ref={demoRef} inert className="transition-transform duration-[var(--pd-duration-base)] ease-[var(--pd-ease-decelerate)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
            <Demo />
          </div>
        </div>
      ) : null}
      {!Demo ? <span className="text-xs text-muted-foreground">No demo registered</span> : null}
    </div>
  );
}
