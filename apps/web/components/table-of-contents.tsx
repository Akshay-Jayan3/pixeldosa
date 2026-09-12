"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { TocHeading } from "@/lib/toc";

/**
 * The right-hand "On this page" rail, tracked to scroll position via
 * IntersectionObserver rather than a scroll-position calculation — cheaper,
 * and it stays correct if section heights change (e.g. a collapsible source
 * block expanding).
 */
export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = React.useState<string | null>(headings[0]?.id ?? null);

  React.useEffect(() => {
    if (headings.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }

        if (visible.size === 0) return;
        const firstVisible = headings.find((heading) => visible.has(heading.id));
        if (firstVisible) setActiveId(firstVisible.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="font-medium text-foreground">On this page</p>
      <ul className="mt-3 space-y-2 border-l border-border">
        {headings.map((heading) => {
          const active = heading.id === activeId;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l py-0.5 transition-colors duration-[var(--pd-duration-instant)]",
                  heading.level === 3 ? "pl-6" : "pl-3",
                  active
                    ? "border-l-foreground font-medium text-foreground"
                    : "border-l-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
