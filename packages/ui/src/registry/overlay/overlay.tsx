"use client";

import * as React from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";

import { duration, easing, reducedMotion } from "@pixeldosa/tokens";
import { cn } from "@/lib/utils";

/**
 * The one enter/exit signature every overlay in the system uses. Dialog, Sheet, Popover
 * and Drawer are all "content appears above a scrim, anchored to a side or centered" —
 * variant strings differ only in the axis and distance they translate from.
 */
type OverlayPlacement = "center" | "top" | "bottom" | "left" | "right";

const distance = 12;

function placementVariants(placement: OverlayPlacement): Variants {
  const offset: Record<OverlayPlacement, { x?: number; y?: number }> = {
    center: {},
    top: { y: -distance },
    bottom: { y: distance },
    left: { x: -distance },
    right: { x: distance },
  };

  return {
    hidden: { opacity: 0, scale: placement === "center" ? 0.98 : 1, ...offset[placement] },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: { duration: duration.fast, ease: easing.decelerate },
    },
    exit: {
      opacity: 0,
      scale: placement === "center" ? 0.98 : 1,
      ...offset[placement],
      transition: { duration: duration.instant, ease: easing.accelerate },
    },
  };
}

const scrimVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.fast, ease: easing.standard } },
  exit: { opacity: 0, transition: { duration: duration.instant, ease: easing.standard } },
};

/**
 * Reads prefers-reduced-motion and returns the fallback transition from motion tokens
 * when it is set — a near-zero duration rather than skipping the animation outright, so
 * Motion's exit-completion callbacks (and therefore unmount timing in AnimatePresence)
 * still fire correctly.
 */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return reduced;
}

export interface OverlayScrimProps extends React.ComponentPropsWithoutRef<typeof motion.div> {}

/**
 * The backdrop layer. Render inside an `AnimatePresence` alongside `OverlayContent` —
 * neither component owns mount/unmount timing itself, so it composes under any
 * primitive (Radix Dialog.Overlay, Sheet, Popover) that controls when it's in the tree.
 */
const OverlayScrim = React.forwardRef<HTMLDivElement, OverlayScrimProps>(function OverlayScrim(
  { className, ...props },
  ref
) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      ref={ref}
      variants={scrimVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={reduced ? reducedMotion : undefined}
      className={cn("fixed inset-0 z-50 bg-background/70 backdrop-blur-sm", className)}
      {...props}
    />
  );
});

export interface OverlayContentProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
  /** Which edge the content enters from. `center` is Dialog/Popover; the rest are Sheet/Drawer. */
  placement?: OverlayPlacement;
}

const OverlayContent = React.forwardRef<HTMLDivElement, OverlayContentProps>(function OverlayContent(
  { placement = "center", className, ...props },
  ref
) {
  const reduced = usePrefersReducedMotion();
  const variants = React.useMemo(() => placementVariants(placement), [placement]);

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={reduced ? reducedMotion : undefined}
      className={cn(
        "z-50 rounded-lg border bg-popover text-popover-foreground shadow-lg",
        className
      )}
      {...props}
    />
  );
});

export { AnimatePresence, OverlayScrim, OverlayContent, type OverlayPlacement };
