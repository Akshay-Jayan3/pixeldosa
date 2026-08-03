"use client";

import * as React from "react";

import { Button } from "@/registry/button/button";
import { AnimatePresence, OverlayContent, OverlayScrim, type OverlayPlacement } from "@/registry/overlay/overlay";

/**
 * Demonstrates the shared enter/exit signature across the placements Dialog, Sheet and
 * Drawer each use. Wired here with plain useState — real components layer Radix's
 * Dialog/Sheet/Popover primitives underneath for focus trapping and dismiss behaviour;
 * this demo shows the motion layer in isolation.
 */
export default function OverlayDemo() {
  const [open, setOpen] = React.useState<OverlayPlacement | null>(null);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={() => setOpen("center")}>
          Center (Dialog)
        </Button>
        <Button variant="outline" onClick={() => setOpen("right")}>
          Right (Sheet)
        </Button>
        <Button variant="outline" onClick={() => setOpen("bottom")}>
          Bottom (Drawer)
        </Button>
      </div>

      <AnimatePresence>
        {open ? (
          <React.Fragment key={open}>
            <OverlayScrim onClick={() => setOpen(null)} />
            <OverlayContent
              placement={open}
              className={
                open === "center"
                  ? "fixed left-1/2 top-1/2 w-80 -translate-x-1/2 -translate-y-1/2 p-6"
                  : open === "right"
                    ? "fixed right-0 top-0 h-full w-72 rounded-none border-l p-6"
                    : "fixed inset-x-0 bottom-0 rounded-b-none p-6"
              }
            >
              <p className="text-sm font-medium">Placement: {open}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Same duration and easing tokens, different translate axis.
              </p>
              <Button size="sm" className="mt-4" onClick={() => setOpen(null)}>
                Close
              </Button>
            </OverlayContent>
          </React.Fragment>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
