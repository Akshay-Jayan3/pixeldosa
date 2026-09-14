"use client";

import * as React from "react";

import { demos } from "@/components/registry-demos";
import { cn } from "@/lib/utils";

/** The width demos are laid out at before being zoomed to fit — roughly a docs preview. */
const DESIGN_WIDTH = 560;
const MIN_ZOOM = 0.55;

/**
 * A browse-grid thumbnail of a component's real demo.
 *
 * A thumbnail, deliberately, not a live embed. The demo is laid out at a fixed design
 * width and zoomed to the card, so a whole component fits instead of being cropped
 * mid-row. It is `inert`, because interactive controls inside a card link fight the link.
 * It only mounts once the card is near the viewport, so a page of thirty cards doesn't run
 * thirty timers.
 *
 * `zoom` rather than `transform: scale` is load-bearing: zoom affects layout, so the
 * flex centering and the edge fade work on the size the demo actually occupies, and
 * nothing needs measuring besides the stage width.
 */
export function ComponentThumbnail({ name, tall = false }: { name: string; tall?: boolean }) {
  const Demo = demos[name];
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = React.useState<number | null>(null);
  const [near, setNear] = React.useState(false);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const resize = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width ?? 0;
      if (width > 0) setZoom(Math.max(MIN_ZOOM, Math.min(1, (width - 48) / DESIGN_WIDTH)));
    });
    resize.observe(stage);

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
  }, []);

  return (
    <div
      ref={stageRef}
      aria-hidden="true"
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden bg-muted/40",
        // A faint dot grid gives the stage depth without another border.
        "bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] [background-size:16px_16px]",
        // Soft edges: anything taller than the stage fades out instead of being cut.
        "[mask-image:linear-gradient(to_bottom,transparent,black_10%,black_88%,transparent)]",
        tall ? "aspect-[16/7]" : "aspect-[16/10]"
      )}
    >
      {Demo && near && zoom !== null ? (
        <div
          inert
          style={{ zoom, width: DESIGN_WIDTH }}
          className="pointer-events-none flex shrink-0 select-none justify-center transition-transform duration-[var(--pd-duration-base)] ease-[var(--pd-ease-decelerate)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        >
          <Demo />
        </div>
      ) : null}
      {!Demo ? <span className="text-xs text-muted-foreground">No demo registered</span> : null}
    </div>
  );
}
