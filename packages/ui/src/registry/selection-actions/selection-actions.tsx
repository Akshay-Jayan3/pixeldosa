"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { ConfidenceMeter, type ConfidenceTier } from "@/registry/confidence-meter/confidence-meter";
import { DiffAccept } from "@/registry/diff-accept/diff-accept";
import { cn } from "@/lib/utils";

export type SelectionAction = { id: string; label: string; icon: React.ReactNode };

export type SelectionActionResult =
  | { kind: "replacement"; value: string }
  | { kind: "text"; value: string }
  | { kind: "classification"; label: string; confidence?: ConfidenceTier }
  | { kind: "list"; items: string[] };

export type OnSelectionAction = (
  actionId: string,
  selectedText: string,
  signal: AbortSignal
) => Promise<SelectionActionResult>;

export interface SelectionActionsProps {
  /** The region to watch for selections. A toolbar outside this element is ignored. */
  containerRef: React.RefObject<HTMLElement | null>;
  actions: SelectionAction[];
  onAction: OnSelectionAction;
  /**
   * Called only when an accepted `replacement` result is applied via Diff Accept.
   * Receives the original selected text alongside the merged result so a plain-string
   * content model can splice it back in (e.g. `content.replace(originalText,
   * mergedValue)`); a rich-text/contentEditable consumer would instead use its own
   * document model's replace-range primitive, ignoring the second argument.
   */
  onReplace?: (mergedValue: string, originalSelectedText: string) => void;
  /** Debounce after the selection stops changing before the toolbar appears, in ms. */
  settleMs?: number;
}

type Rect = { top: number; left: number; width: number; height: number };

/**
 * A floating, selection-triggered toolbar for AI actions on a piece of text —
 * explain, rewrite (reviewed via Diff Accept), translate, classify, extract. Only the
 * Rewrite-shaped result (a full replacement candidate) reuses Diff Accept for its
 * accept/reject review; every other result renders inline, shaped to what it actually
 * is (prose, a label, a list) rather than forcing everything through one generic box.
 */
function SelectionActions({
  containerRef,
  actions,
  onAction,
  onReplace,
  settleMs = 200,
}: SelectionActionsProps) {
  const [selection, setSelection] = React.useState<{ text: string; rect: Rect } | null>(null);
  const [activeActionId, setActiveActionId] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<SelectionActionResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loadingActionId, setLoadingActionId] = React.useState<string | null>(null);
  // Mounts with the selection immediately, then flips to visible on the next frame —
  // setting both in the same commit would give the browser no "from" state to
  // transition away from, so the fade+scale would never actually animate.
  const [visible, setVisible] = React.useState(false);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const debounceRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    if (!selection) {
      setVisible(false);
      return;
    }
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [selection]);

  const reset = React.useCallback(() => {
    abortRef.current?.abort();
    setSelection(null);
    setActiveActionId(null);
    setResult(null);
    setError(null);
    setLoadingActionId(null);
  }, []);

  // Detect selection changes, scoped to the container, debounced so the toolbar
  // appears once the selection has settled rather than jittering mid-drag or
  // mid-keyboard-extend — one mechanism covers both input methods.
  React.useEffect(() => {
    function handleSelectionChange() {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        const container = containerRef.current;
        const domSelection = window.getSelection();
        if (!container || !domSelection || domSelection.isCollapsed || domSelection.rangeCount === 0) {
          reset();
          return;
        }
        const anchorNode = domSelection.anchorNode;
        if (!anchorNode || !container.contains(anchorNode)) {
          reset();
          return;
        }
        const text = domSelection.toString().trim();
        if (!text) {
          reset();
          return;
        }
        const rect = domSelection.getRangeAt(0).getBoundingClientRect();
        setSelection({
          text,
          rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        });
        setActiveActionId(null);
        setResult(null);
        setError(null);
      }, settleMs);
    }

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      window.clearTimeout(debounceRef.current);
    };
  }, [containerRef, settleMs, reset]);

  // Dismiss on Escape or a click outside the toolbar/popover.
  React.useEffect(() => {
    if (!selection) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") reset();
    }
    function handleClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) reset();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [selection, reset]);

  const runAction = (action: SelectionAction) => {
    if (!selection || loadingActionId) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setActiveActionId(action.id);
    setLoadingActionId(action.id);
    setError(null);

    onAction(action.id, selection.text, controller.signal)
      .then((value) => {
        if (controller.signal.aborted) return;
        setResult(value);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "That action failed.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingActionId(null);
      });
  };

  if (!selection || typeof document === "undefined") return null;

  const flipAbove = selection.rect.top > 96;
  const top = flipAbove ? selection.rect.top - 8 : selection.rect.top + selection.rect.height + 8;

  return createPortal(
    <div
      ref={rootRef}
      // mousedown (not click) with preventDefault keeps the browser selection intact
      // while the user interacts with the toolbar — the standard rich-text-editor
      // toolbar trick; without it, focusing a button collapses the selection first.
      onMouseDown={(event) => event.preventDefault()}
      data-state={visible ? "open" : "closed"}
      style={{
        position: "fixed",
        top,
        left: Math.max(8, selection.rect.left),
        transform: flipAbove ? "translateY(-100%)" : undefined,
        zIndex: 60,
      }}
      className={cn(
        "opacity-0 scale-95 transition-[opacity,scale] duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)]",
        "data-[state=open]:opacity-100 data-[state=open]:scale-100",
        "motion-reduce:transition-none motion-reduce:scale-100"
      )}
    >
      {!result && !error ? (
        <div
          role="toolbar"
          aria-label="Selection actions"
          className="flex items-center gap-0.5 rounded-md border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => runAction(action)}
              disabled={loadingActionId !== null}
              aria-label={action.label}
              title={action.label}
              className={cn(
                "inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded px-2 text-xs font-medium",
                "text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)]",
                "motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground",
                "disabled:pointer-events-none disabled:opacity-50",
                "focus-visible:ring-[3px] focus-visible:ring-ring/40"
              )}
            >
              {loadingActionId === action.id ? (
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-4 animate-spin">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              ) : (
                <span className="[&_svg]:size-4">{action.icon}</span>
              )}
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="flex max-w-xs flex-col gap-2 rounded-md border bg-muted p-3 text-sm">
          <p className="text-destructive">{error}</p>
          <button
            type="button"
            onClick={() => {
              const action = actions.find((a) => a.id === activeActionId);
              if (action) runAction(action);
            }}
            className="self-start rounded-md border border-input px-2.5 py-1 text-xs font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            Retry
          </button>
        </div>
      ) : null}

      {result ? <SelectionResult result={result} selectedText={selection.text} onReplace={onReplace} onDismiss={reset} /> : null}
    </div>,
    document.body
  );
}

function SelectionResult({
  result,
  selectedText,
  onReplace,
  onDismiss,
}: {
  result: SelectionActionResult;
  selectedText: string;
  onReplace?: (mergedValue: string, originalSelectedText: string) => void;
  onDismiss: () => void;
}) {
  if (result.kind === "replacement") {
    return (
      <div className="w-80 max-w-[calc(100vw-2rem)]">
        <DiffAccept
          baseValue={selectedText}
          value={selectedText}
          proposedValue={result.value}
          onApply={(merged) => {
            onReplace?.(merged, selectedText);
            onDismiss();
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-md border bg-muted p-3 text-sm">
      {result.kind === "text" ? <p className="text-foreground">{result.value}</p> : null}
      {result.kind === "classification" ? (
        <div className="flex items-center gap-2">
          <span className="rounded-full border bg-background px-2 py-0.5 text-xs font-medium text-foreground">
            {result.label}
          </span>
          {result.confidence ? <ConfidenceMeter confidence={result.confidence} /> : null}
        </div>
      ) : null}
      {result.kind === "list" ? (
        <ul className="list-disc space-y-1 pl-4 text-foreground">
          {result.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : null}
      <button
        type="button"
        onClick={onDismiss}
        className="self-start text-xs font-medium text-muted-foreground underline-offset-2 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        Dismiss
      </button>
    </div>
  );
}

export { SelectionActions };
