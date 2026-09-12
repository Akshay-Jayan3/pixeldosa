"use client";

import * as React from "react";

import { CodeBlock } from "@/components/code-block";
import { cn } from "@/lib/utils";

const TABS = ["preview", "code"] as const;
type Tab = (typeof TABS)[number];

type ExamplePreviewProps = {
  /**
   * Only set when a component has more than one example, where the label is
   * what tells them apart. A single example needs no title — "Overview" above
   * the one and only preview is noise.
   */
  title: string | null;
  /**
   * Already-rendered JSX, not a component reference — the page that calls
   * this renders the demo itself (it can, since demos are server-renderable)
   * and hands down the element. A component reference can't cross the
   * server/client boundary as a prop, but a rendered element can.
   */
  preview: React.ReactNode;
  source: string | null;
};

/**
 * Inline Preview/Code tabs for a single example — the shared pattern most
 * component-library docs use (shadcn/ui, AI Elements) instead of forcing a
 * click-through to a second page just to read the code. Most PixelDosa
 * components only have one example, which made the old "click the card to
 * see its own code" route pure friction.
 */
export function ExamplePreview({ title, preview, source }: ExamplePreviewProps) {
  const [tab, setTab] = React.useState<Tab>("preview");
  const id = React.useId();
  const tabRefs = React.useRef<Record<Tab, HTMLButtonElement | null>>({
    preview: null,
    code: null,
  });

  const tabId = (value: Tab) => `${id}-tab-${value}`;
  const panelId = `${id}-panel`;

  // Arrow keys move between tabs, which is what `role="tablist"` promises a
  // screen reader user. Without this the roles would be a lie.
  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (step === 0) return;

    event.preventDefault();
    const next = TABS[(TABS.indexOf(tab) + step + TABS.length) % TABS.length]!;
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-3 border-b px-4">
        {source ? (
          <div
            role="tablist"
            aria-label={title ? `${title} view` : "Example view"}
            onKeyDown={onKeyDown}
            className="flex items-center gap-4 text-sm"
          >
            {TABS.map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                id={tabId(value)}
                aria-selected={tab === value}
                aria-controls={panelId}
                tabIndex={tab === value ? 0 : -1}
                ref={(node) => {
                  tabRefs.current[value] = node;
                }}
                onClick={() => setTab(value)}
                className={cn(
                  "-mb-px border-b-2 py-2.5 font-medium capitalize transition-colors duration-[var(--pd-duration-instant)]",
                  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                  tab === value
                    ? "border-b-foreground text-foreground"
                    : "border-b-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {value}
              </button>
            ))}
          </div>
        ) : (
          <span aria-hidden="true" />
        )}

        {title ? (
          <span className="truncate py-2.5 text-xs text-muted-foreground">{title}</span>
        ) : null}
      </div>

      <div id={panelId} role="tabpanel" aria-labelledby={tabId(tab)} tabIndex={-1}>
        {tab === "preview" ? (
          <div className="flex min-h-56 items-center justify-center overflow-hidden p-8">
            {preview}
          </div>
        ) : (
          <CodeBlock code={source ?? ""} className="rounded-none border-0" />
        )}
      </div>
    </div>
  );
}
