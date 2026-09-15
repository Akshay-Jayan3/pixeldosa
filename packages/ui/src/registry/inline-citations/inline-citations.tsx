"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type CitationSource = {
  id: string;
  title: string;
  url?: string;
  /** Who published it: "Reuters", "Internal wiki", "Q3 board deck". */
  publisher?: string;
  date?: string;
};

/**
 * How closely the source backs the claim. Tiers, not a score: `quoted` means the passage
 * says this; `paraphrased` means the claim is the agent's summary of the passage.
 */
export type CitationSupport = "quoted" | "paraphrased";

type CitationsContextValue = { sources: CitationSource[] };

const CitationsContext = React.createContext<CitationsContextValue | null>(null);

function useCitations() {
  const context = React.useContext(CitationsContext);
  if (!context) throw new Error("<Cite> must be used inside <CitedText>.");
  return context;
}

export interface CitedTextProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Numbered in this order, so numbers are stable across server and client renders. */
  sources: CitationSource[];
  /** The numbered reference list under the text. On by default: it is the no-hover fallback. */
  showReferences?: boolean;
  /** Level of the "Sources" heading, so it fits the page's outline. Defaults to 4. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

/**
 * Text with claim-level citations. Wrap the answer, list its sources once, and mark each
 * claim with `<Cite>`. Renders a numbered reference list underneath, which is both the
 * audit view and the fallback where hover doesn't exist.
 */
function CitedText({ sources, showReferences = true, headingLevel = 4, className, children, ...props }: CitedTextProps) {
  const Heading = `h${headingLevel}` as "h4";
  const headingId = React.useId();
  return (
    <CitationsContext.Provider value={{ sources }}>
      <div className={cn("flex flex-col gap-4", className)} {...props}>
        <div className="text-sm leading-relaxed text-foreground">{children}</div>
        {showReferences && sources.length > 0 ? (
          <section aria-labelledby={headingId} className="flex flex-col gap-1.5 border-t pt-3">
            <Heading id={headingId} className="text-xs font-medium text-muted-foreground">
              Sources
            </Heading>
            <ol className="flex flex-col gap-1">
              {sources.map((source, index) => (
                <li key={source.id} id={`${headingId}-${source.id}`} className="flex gap-2 text-xs">
                  <span className="w-4 shrink-0 text-right text-muted-foreground tabular-nums">{index + 1}.</span>
                  <span className="min-w-0">
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground underline decoration-muted-foreground/40 underline-offset-2 outline-none hover:decoration-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
                      >
                        {source.title}
                      </a>
                    ) : (
                      <span className="text-foreground">{source.title}</span>
                    )}
                    {source.publisher || source.date ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {[source.publisher, source.date].filter(Boolean).join(", ")}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>
    </CitationsContext.Provider>
  );
}

/**
 * A link that opens the source scrolled to, and highlighted at, the quoted passage — using
 * URL text fragments. Long quotes use start and end words, because fragments must match
 * exactly and long passages are where whitespace and punctuation drift. Browsers without
 * support just open the page.
 */
function passageUrl(url: string, quote?: string) {
  if (!quote) return url;
  const words = quote.replace(/\s+/g, " ").trim().split(" ");
  const encode = (text: string) => encodeURIComponent(text).replace(/-/g, "%2D");
  const fragment =
    words.length <= 8 ? encode(words.join(" ")) : `${encode(words.slice(0, 4).join(" "))},${encode(words.slice(-4).join(" "))}`;
  return `${url}${url.includes("#") ? "" : "#"}:~:text=${fragment}`;
}

const HOVER_OPEN_MS = 180;
const HOVER_CLOSE_MS = 140;
const GUTTER = 12;

interface MarkerProps {
  source: CitationSource | undefined;
  number: number | null;
  quote?: string;
  support?: CitationSupport;
  onActiveChange: (active: boolean) => void;
}

function CitationMarker({ source, number, quote, support, onActiveChange }: MarkerProps) {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const popoverRef = React.useRef<HTMLSpanElement>(null);
  const wrapperRef = React.useRef<HTMLSpanElement>(null);
  const timer = React.useRef<number | undefined>(undefined);
  const popoverId = React.useId();

  const openRef = React.useRef(false);
  const setOpenState = React.useCallback(
    (value: boolean) => {
      window.clearTimeout(timer.current);
      // Report only real changes: focus and click can both ask to open, and a doubled
      // report would leave the claim highlighted after the popover closed.
      if (openRef.current === value) return;
      openRef.current = value;
      setOpen(value);
      onActiveChange(value);
    },
    [onActiveChange]
  );

  const schedule = (value: boolean) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpenState(value), value ? HOVER_OPEN_MS : HOVER_CLOSE_MS);
  };

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  // Place it in the viewport, below the marker unless there isn't room. Fixed positioning in
  // the top layer (popover API where supported) keeps it clear of overflow-hidden parents,
  // while the element stays next to the marker in the DOM so Tab reaches its link.
  const place = React.useCallback(() => {
    const button = buttonRef.current;
    const popover = popoverRef.current;
    if (!button || !popover) return;
    const anchor = button.getBoundingClientRect();
    const { width, height } = popover.getBoundingClientRect();
    const below = anchor.bottom + 6;
    const top = below + height + GUTTER > window.innerHeight ? Math.max(GUTTER, anchor.top - height - 6) : below;
    const left = Math.min(Math.max(GUTTER, anchor.left - 16), window.innerWidth - width - GUTTER);
    setPosition({ top: Math.round(top), left: Math.round(left) });
  }, []);

  React.useLayoutEffect(() => {
    const popover = popoverRef.current;
    if (!open || !popover) return;
    if (typeof popover.showPopover === "function") {
      try {
        popover.showPopover();
      } catch {
        // Already showing.
      }
    }
    place();
    // Clicking anywhere else dismisses a popover that was opened by click or tap.
    const dismiss = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpenState(false);
    };
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    document.addEventListener("pointerdown", dismiss);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      document.removeEventListener("pointerdown", dismiss);
    };
  }, [open, place, setOpenState]);

  // Set while Escape hands focus back to the marker, so the marker's open-on-focus doesn't
  // immediately reopen what the user just closed.
  const returningFocus = React.useRef(false);

  const close = (returnFocus: boolean) => {
    setOpenState(false);
    if (!returnFocus) return;
    returningFocus.current = true;
    buttonRef.current?.focus();
    returningFocus.current = false;
  };

  const label = source ? `Source ${number}: ${source.title}` : "No source for this claim";

  return (
    <span
      ref={wrapperRef}
      className="relative"
      onPointerEnter={(event) => event.pointerType === "mouse" && schedule(true)}
      onPointerLeave={(event) => event.pointerType === "mouse" && schedule(false)}
      onBlur={(event) => {
        if (!wrapperRef.current?.contains(event.relatedTarget as Node | null)) setOpenState(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          close(true);
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={() => setOpenState(!open)}
        onFocus={(event) => {
          if (!returningFocus.current && event.currentTarget.matches(":focus-visible")) setOpenState(true);
        }}
        className={cn(
          // Visible enough to invite a check: a marker nobody notices is a marker nobody opens.
          // Raised with vertical-align rather than a transform, so it hugs the claim and the
          // following punctuation instead of floating off it.
          "relative ml-0.5 inline-flex h-[1.5em] min-w-[1.5em] items-center justify-center rounded-[0.4em] border px-[0.35em] align-[0.35em] text-[0.62em] font-medium leading-none tabular-nums outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
          // Tall enough to hit without widening into the next marker.
          "after:absolute after:inset-x-0 after:-inset-y-3 after:content-['']",
          "focus-visible:ring-[3px] focus-visible:ring-ring/40",
          source
            ? open
              ? "border-foreground bg-foreground text-background"
              : "border-foreground/30 text-foreground hover:border-foreground/70"
            : cn("border-dashed border-muted-foreground/60 text-muted-foreground", open && "border-foreground text-foreground")
        )}
      >
        {source ? number : "?"}
      </button>

      {open ? (
        <span
          ref={popoverRef}
          id={popoverId}
          role="group"
          aria-label={label}
          popover="manual"
          onPointerEnter={() => window.clearTimeout(timer.current)}
          onPointerLeave={(event) => event.pointerType === "mouse" && schedule(false)}
          // `inset` first: the popover UA style sets inset 0, and a later shorthand would
          // override top/left.
          style={{ inset: "auto", position: "fixed", top: position?.top ?? -9999, left: position?.left ?? -9999, margin: 0 }}
          className="z-50 flex w-72 max-w-[calc(100vw-1.5rem)] animate-[pd-fade-in_var(--pd-duration-fast)_var(--pd-ease-decelerate)_both] flex-col gap-2 overflow-visible rounded-md border bg-popover p-3 text-left font-sans text-xs leading-normal text-popover-foreground shadow-md motion-reduce:animate-none"
        >
          {source ? (
            <>
              <span className="flex flex-col gap-0.5">
                <span className="text-muted-foreground tabular-nums">
                  {number}
                  {source.publisher || source.date ? ` · ${[source.publisher, source.date].filter(Boolean).join(", ")}` : ""}
                </span>
                <span className="text-sm font-medium text-foreground text-pretty">{source.title}</span>
              </span>
              {quote ? (
                <span className="block border-l-2 border-foreground/30 pl-2 text-foreground text-pretty">
                  &ldquo;{quote}&rdquo;
                </span>
              ) : null}
              <span className="text-muted-foreground">
                {!quote
                  ? "No passage attached. Check the source itself."
                  : support === "paraphrased"
                    ? "Summarised. The source doesn't say it in these words."
                    : "Quoted from the source."}
              </span>
              {source.url ? (
                <a
                  href={passageUrl(source.url, quote)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative self-start font-medium text-foreground underline underline-offset-2 outline-none after:absolute after:inset-x-0 after:-inset-y-3 after:content-[''] focus-visible:ring-[3px] focus-visible:ring-ring/40"
                >
                  {quote ? "Open at this passage" : "Open source"}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : null}
            </>
          ) : (
            <>
              <span className="text-sm font-medium text-foreground">No source for this claim</span>
              <span className="text-muted-foreground text-pretty">
                This is the model&apos;s own statement. Nothing it retrieved backs it up.
              </span>
            </>
          )}
        </span>
      ) : null}
    </span>
  );
}

export interface CiteProps extends Omit<React.ComponentPropsWithoutRef<"span">, "children"> {
  children: React.ReactNode;
  /** Source id, or ids. Omit to mark the claim as unsourced — honestly, rather than silently. */
  source?: string | string[];
  /**
   * The passage that supports the claim, shown in place and used to deep-link to it. With
   * several sources, pass `{ [sourceId]: passage }` — each source supports it in its own words.
   */
  quote?: string | Record<string, string>;
  support?: CitationSupport;
}

/**
 * One claim and its evidence. The claim text is highlighted while its source is open, so
 * it's always clear which words a source is being offered for.
 */
function Cite({ children, source, quote, support = "quoted", className, ...props }: CiteProps) {
  const { sources } = useCitations();
  const [active, setActive] = React.useState(0);
  const ids = source === undefined ? [] : Array.isArray(source) ? source : [source];
  const onActiveChange = React.useCallback((value: boolean) => setActive((count) => Math.max(0, count + (value ? 1 : -1))), []);

  return (
    <span className={className} {...props}>
      <span
        className={cn(
          "rounded-sm transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] [box-decoration-break:clone] motion-reduce:transition-none",
          active > 0 && "bg-foreground/10",
          ids.length === 0 && "underline decoration-muted-foreground/50 decoration-dashed underline-offset-4"
        )}
      >
        {children}
      </span>
      {ids.length === 0 ? (
        <CitationMarker source={undefined} number={null} onActiveChange={onActiveChange} />
      ) : (
        ids.map((id) => {
          const index = sources.findIndex((item) => item.id === id);
          return (
            <CitationMarker
              key={id}
              source={sources[index]}
              number={index + 1}
              quote={typeof quote === "string" ? quote : quote?.[id]}
              support={support}
              onActiveChange={onActiveChange}
            />
          );
        })
      )}
    </span>
  );
}

export { CitedText, Cite };
