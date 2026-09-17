"use client";

import * as React from "react";

import { AgentFigure, type AgentPose } from "@pixeldosa/ui";

export type GuideStop = { id: string; pose: AgentPose; text: string };

const STORAGE_KEY = "pd-guide-hidden";

/**
 * A stored choice wins. Without one, phones start with the guide folded away: on a narrow
 * screen the bubble would sit on top of the content it's describing.
 */
function readHidden() {
  const narrow = window.matchMedia("(max-width: 639px)").matches;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? narrow : stored === "1";
  } catch {
    return narrow;
  }
}

function writeHidden(hidden: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, hidden ? "1" : "0");
  } catch {
    // Storage can be unavailable (private mode); the guide still works for this visit.
  }
}

/**
 * Dosa, the site guide: Agent Figure in the corner, saying one thing about the section
 * you're reading. It follows the page (each stop is an element with a matching
 * `data-guide` id), steps aside while you scroll, and stays hidden once you hide it.
 *
 * Mounted in two phases so the server render never guesses the stored preference.
 */
export function SiteGuide({ stops }: { stops: GuideStop[] }) {
  const [mounted, setMounted] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const [active, setActive] = React.useState(stops[0]?.id);
  const [scrolling, setScrolling] = React.useState(false);
  const summonRef = React.useRef<HTMLButtonElement>(null);
  const nextRef = React.useRef<HTMLButtonElement>(null);
  const focusAfterToggle = React.useRef(false);

  React.useEffect(() => {
    setHidden(readHidden());
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        const id = (hit?.target as HTMLElement | undefined)?.dataset.guide;
        if (id) setActive(id);
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    for (const stop of stops) {
      const node = document.querySelector(`[data-guide="${stop.id}"]`);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [stops]);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: number | undefined;
    const onScroll = () => {
      setScrolling(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setScrolling(false), 450);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  React.useEffect(() => {
    if (!focusAfterToggle.current) return;
    focusAfterToggle.current = false;
    (hidden ? summonRef : nextRef).current?.focus();
  }, [hidden]);

  if (!mounted) return null;

  const toggle = (next: boolean) => {
    focusAfterToggle.current = true;
    writeHidden(next);
    setHidden(next);
  };

  if (hidden) {
    return (
      <button
        ref={summonRef}
        type="button"
        onClick={() => toggle(false)}
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-4 z-40 inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-sm font-medium outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        <AgentFigure variant="mark" size="sm" pose="idle" hideLabel aria-hidden="true" />
        Show guide
      </button>
    );
  }

  const index = Math.max(0, stops.findIndex((stop) => stop.id === active));
  const stop = stops[index]!;
  const last = index === stops.length - 1;

  const goNext = () => {
    const target = last ? stops[0] : stops[index + 1];
    const node = target && document.querySelector(`[data-guide="${target.id}"]`);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <aside
      aria-label="Site guide"
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-40 flex items-end justify-end gap-2 sm:inset-x-auto sm:right-5 sm:max-w-sm"
    >
      <div
        className={
          "flex min-w-0 flex-1 flex-col gap-2 rounded-2xl rounded-br-sm border-[1.5px] border-foreground bg-card px-4 py-3 transition-[opacity,translate] duration-150 ease-[steps(3)] motion-reduce:transition-none " +
          (scrolling ? "pointer-events-none translate-x-2 opacity-0" : "")
        }
      >
        <p className="font-hand text-lg leading-snug" aria-live="polite">
          {stop.text}
        </p>
        <div className="flex items-center gap-3">
          <button
            ref={nextRef}
            type="button"
            onClick={goNext}
            className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            {last ? "Back to top" : "Show me"}
          </button>
          <button
            type="button"
            onClick={() => toggle(true)}
            className="rounded-sm text-sm text-muted-foreground underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            Hide guide
          </button>
        </div>
      </div>
      <AgentFigure pose={stop.pose} size="sm" hideLabel aria-hidden="true" className="shrink-0 [&_svg]:size-16" />
    </aside>
  );
}
