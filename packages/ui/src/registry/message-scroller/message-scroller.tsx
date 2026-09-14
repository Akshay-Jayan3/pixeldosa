"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface MessageScrollerProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  /**
   * Text for screen readers when something worth hearing happens, e.g. "Assistant replied:
   * Churn rose in August…". Set it once a message *finishes*, never per token.
   */
  announcement?: string;
  /** Called when the reader scrolls near the top. Load older messages here. */
  onReachTop?: () => void;
  /** Accessible name for the scroll region. */
  label?: string;
}

const AT_BOTTOM_PX = 48;
const NEAR_TOP_PX = 80;

/**
 * The scrolling list of a conversation. It follows new content only while the reader is
 * following along.
 *
 * Auto-scroll is where chat UIs most often break trust: streaming text drags the page
 * down while someone is scrolled up reading an earlier answer, and they lose their place
 * every few hundred milliseconds. So "pinned" is a fact about the reader — at the bottom
 * or not — measured from their own scrolling. While pinned, growth keeps the latest text
 * in view. Scroll up and it stops following, a "Jump to latest" button appears with a
 * count of messages that arrived meanwhile, and nothing moves under you.
 *
 * Loading older messages above keeps the current view fixed, compensating for the
 * height that was added above it, so the page doesn't jump when history arrives.
 * Screen readers hear finished messages through `announcement`, not a token stream.
 */
function MessageScroller({
  children,
  announcement,
  onReachTop,
  label = "Conversation",
  className,
  ...props
}: MessageScrollerProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const pinnedRef = React.useRef(true);
  const jumpingRef = React.useRef(false);
  const [pinned, setPinned] = React.useState(true);
  const [unread, setUnread] = React.useState(0);

  const count = React.Children.count(children);
  const firstKey = React.Children.toArray(children)[0];
  const firstId = React.isValidElement(firstKey) ? firstKey.key : null;

  const previous = React.useRef({ count, firstId, scrollHeight: 0 });
  const reachTopRef = React.useRef(onReachTop);
  reachTopRef.current = onReachTop;

  const setPinnedState = (value: boolean) => {
    pinnedRef.current = value;
    setPinned(value);
    if (value) setUnread(0);
  };

  const toBottom = React.useCallback((smooth: boolean) => {
    const el = scrollRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth && !reduce ? "smooth" : "auto" });
  }, []);

  // Start at the latest message.
  React.useLayoutEffect(() => {
    toBottom(false);
  }, [toBottom]);

  // Children changed: either history loaded above (keep the view still), or new messages
  // arrived below (follow if pinned, otherwise count them).
  React.useLayoutEffect(() => {
    const el = scrollRef.current;
    const before = previous.current;
    if (!el) return;

    if (before.firstId !== null && firstId !== before.firstId && count > before.count) {
      el.scrollTop += el.scrollHeight - before.scrollHeight;
    } else if (count > before.count) {
      if (pinnedRef.current) toBottom(false);
      else setUnread((n) => n + (count - before.count));
    }

    previous.current = { count, firstId, scrollHeight: el.scrollHeight };
  }, [count, firstId, toBottom]);

  // Streaming grows the last message without adding children. Follow that growth too, but
  // only while pinned.
  React.useEffect(() => {
    const content = contentRef.current;
    const el = scrollRef.current;
    if (!content || !el) return;
    const observer = new ResizeObserver(() => {
      // During a smooth jump, let the animation finish rather than snapping mid-way.
      if (pinnedRef.current && !jumpingRef.current) el.scrollTop = el.scrollHeight;
      previous.current.scrollHeight = el.scrollHeight;
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= AT_BOTTOM_PX;
    // A smooth jump passes through "not at bottom" on its way down. Those frames aren't
    // the reader scrolling away, so don't let them unpin and flash the button back.
    if (jumpingRef.current) {
      if (atBottom) jumpingRef.current = false;
      return;
    }
    if (atBottom !== pinnedRef.current) setPinnedState(atBottom);
    if (el.scrollTop <= NEAR_TOP_PX) reachTopRef.current?.();
  };

  return (
    <div className={cn("relative flex min-h-0 flex-col", className)} {...props}>
      <div
        ref={scrollRef}
        role="region"
        aria-label={label}
        tabIndex={0}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none [overflow-anchor:none] focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/40"
      >
        <div ref={contentRef} className="flex flex-col gap-6 px-4 py-6">
          {children}
        </div>
      </div>

      {!pinned ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <button
            type="button"
            onClick={() => {
              jumpingRef.current = true;
              toBottom(true);
              setPinnedState(true);
              // If streaming kept moving the target during the animation, land on it anyway.
              window.setTimeout(() => {
                if (!jumpingRef.current) return;
                jumpingRef.current = false;
                const el = scrollRef.current;
                if (el) el.scrollTop = el.scrollHeight;
              }, 700);
            }}
            className="pointer-events-auto relative flex h-8 animate-[pd-fade-in_var(--pd-duration-fast)_var(--pd-ease-decelerate)_both] items-center gap-1.5 rounded-full border bg-popover px-3 text-xs font-medium text-popover-foreground shadow-md outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-[''] motion-reduce:animate-none motion-reduce:transition-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
              <path d="M8 3v10M4 9l4 4 4-4" />
            </svg>
            {unread > 0 ? (
              <span className="tabular-nums">
                {unread} new {unread === 1 ? "message" : "messages"}
              </span>
            ) : (
              "Jump to latest"
            )}
          </button>
        </div>
      ) : null}

      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}

export { MessageScroller };
