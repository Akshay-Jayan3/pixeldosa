"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type MemoryOrigin = "stated" | "inferred";

export type MemoryItem = {
  id: string;
  /** One remembered thing, in plain words: "Prefers metric units". */
  text: string;
  /** `stated` — the user said it. `inferred` — the agent picked it up from how they work. */
  origin: MemoryOrigin;
  /** Where it came from: "From your chat on 3 Sep", "Noticed across 4 conversations". */
  source?: string;
};

export interface AgentMemoryProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Level of the title heading, so it fits the outline of the page it's placed in. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  memories: MemoryItem[];
  onEdit: (id: string, text: string) => void;
  /** Called immediately. Forget for real — the component keeps its own copy for Undo. */
  onForget: (id: string) => void;
  /** Enables Undo on a forgotten row. Receives the memory as it was. */
  onRestore?: (memory: MemoryItem) => void;
  onForgetAll?: () => void;
  /** Whether new things are being remembered. Pausing never forgets what's already here. */
  paused?: boolean;
  onPausedChange?: (paused: boolean) => void;
}

const buttonBase =
  "relative rounded-md text-xs font-medium outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50";
const quiet = cn(buttonBase, "px-1.5 py-1 text-muted-foreground hover:text-foreground after:absolute after:inset-x-0 after:-inset-y-2 after:content-['']");
const secondary = cn(buttonBase, "border border-input px-2.5 py-1 text-foreground hover:bg-accent hover:text-accent-foreground");
const primary = cn(buttonBase, "bg-primary px-2.5 py-1 text-primary-foreground hover:bg-primary/90");
const destructive = cn(buttonBase, "bg-destructive px-2.5 py-1 text-destructive-foreground hover:bg-destructive/90");

/**
 * What the agent remembers about you, where you can read it, correct it, or make it
 * forget — "here's what I remember, edit or forget it".
 *
 * The distinction that matters is between what you told it and what it inferred. "Prefers
 * metric units" means something different when you said so than when it was guessed from
 * three recipes, and an inferred memory that is wrong quietly skews every later answer.
 * So the two are listed separately, inferred ones are presented as guesses to check, and
 * each carries where it came from.
 *
 * Forgetting is immediate, since a forget that only happens later is not one, but the row
 * stays in place with Undo so a mis-tap isn't permanent. Pausing is described exactly: it
 * stops new memories and does not erase old ones. Forget all needs a second, explicit step.
 */
function AgentMemory({
  memories,
  onEdit,
  onForget,
  onRestore,
  onForgetAll,
  paused = false,
  onPausedChange,
  headingLevel = 3,
  className,
  ...props
}: AgentMemoryProps) {
  const Heading = `h${headingLevel}` as "h3";
  const Subheading = `h${Math.min(headingLevel + 1, 6)}` as "h4";
  const [editing, setEditing] = React.useState<{ id: string; draft: string } | null>(null);
  // Forgotten this session, kept locally so the row can offer Undo after the caller has
  // really removed it. Stored with its position so it reappears where it was.
  const [forgotten, setForgotten] = React.useState<{ memory: MemoryItem; index: number }[]>([]);
  const [confirmingAll, setConfirmingAll] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState("");
  const focusRef = React.useRef<string | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    const target = focusRef.current;
    if (!target) return;
    focusRef.current = null;
    rootRef.current?.querySelector<HTMLElement>(`[data-focus="${target}"]`)?.focus();
  });

  const rows = React.useMemo(() => {
    const live = memories.map((memory) => ({ memory, gone: false }));
    for (const entry of [...forgotten].sort((a, b) => a.index - b.index)) {
      if (memories.some((memory) => memory.id === entry.memory.id)) continue;
      live.splice(Math.min(entry.index, live.length), 0, { memory: entry.memory, gone: true });
    }
    return live;
  }, [memories, forgotten]);

  const forget = (memory: MemoryItem) => {
    const index = memories.findIndex((item) => item.id === memory.id);
    setForgotten((all) => [...all.filter((entry) => entry.memory.id !== memory.id), { memory, index }]);
    onForget(memory.id);
    setAnnouncement(`Forgot: ${memory.text}`);
    focusRef.current = `undo-${memory.id}`;
  };

  const restore = (memory: MemoryItem) => {
    if (!onRestore) return;
    setForgotten((all) => all.filter((entry) => entry.memory.id !== memory.id));
    onRestore(memory);
    setAnnouncement(`Restored: ${memory.text}`);
    focusRef.current = `forget-${memory.id}`;
  };

  const save = () => {
    if (!editing) return;
    const text = editing.draft.trim();
    if (text) onEdit(editing.id, text);
    focusRef.current = `edit-${editing.id}`;
    setEditing(null);
  };

  const renderRow = ({ memory, gone }: { memory: MemoryItem; gone: boolean }) => {
    if (gone) {
      return (
        <li key={memory.id} className="flex items-center justify-between gap-3 px-3 py-2">
          <span className="min-w-0 text-sm text-muted-foreground line-through decoration-muted-foreground/60">
            {memory.text}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="text-xs text-muted-foreground">Forgotten</span>
            {onRestore ? (
              <button type="button" data-focus={`undo-${memory.id}`} onClick={() => restore(memory)} className={quiet}>
                Undo
              </button>
            ) : null}
          </span>
        </li>
      );
    }

    if (editing?.id === memory.id) {
      return (
        <li key={memory.id} className="flex flex-col gap-2 px-3 py-2">
          <textarea
            autoFocus
            aria-label="Edit memory"
            value={editing.draft}
            rows={2}
            onChange={(event) => setEditing({ id: memory.id, draft: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                focusRef.current = `edit-${memory.id}`;
                setEditing(null);
              } else if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                save();
              }
            }}
            className="w-full resize-none rounded-md border border-input bg-transparent px-2.5 py-1.5 text-base text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:text-sm"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                focusRef.current = `edit-${memory.id}`;
                setEditing(null);
              }}
              className={secondary}
            >
              Cancel
            </button>
            <button type="button" onClick={save} disabled={!editing.draft.trim()} className={primary}>
              Save
            </button>
          </div>
        </li>
      );
    }

    return (
      <li key={memory.id} className="flex items-start justify-between gap-3 px-3 py-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-sm text-foreground text-pretty">{memory.text}</p>
          {memory.source ? <p className="text-xs text-muted-foreground">{memory.source}</p> : null}
        </div>
        <span className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            data-focus={`edit-${memory.id}`}
            aria-label={`Edit: ${memory.text}`}
            onClick={() => setEditing({ id: memory.id, draft: memory.text })}
            className={quiet}
          >
            Edit
          </button>
          <button
            type="button"
            data-focus={`forget-${memory.id}`}
            aria-label={`Forget: ${memory.text}`}
            onClick={() => forget(memory)}
            className={quiet}
          >
            Forget
          </button>
        </span>
      </li>
    );
  };

  const stated = rows.filter((row) => row.memory.origin === "stated");
  const inferred = rows.filter((row) => row.memory.origin === "inferred");

  return (
    <div ref={rootRef} className={cn("flex flex-col gap-4", className)} aria-labelledby={titleId} role="region" {...props}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Heading id={titleId} className="text-sm font-medium text-foreground">
            What it remembers
          </Heading>
          <p className="text-xs text-muted-foreground tabular-nums">
            {memories.length === 0 ? "Nothing yet" : `${memories.length} ${memories.length === 1 ? "thing" : "things"}`}
          </p>
        </div>
        {onPausedChange ? (
          <button
            type="button"
            role="switch"
            aria-checked={!paused}
            onClick={() => onPausedChange(!paused)}
            className="group relative flex items-center gap-2 rounded-md text-xs text-foreground outline-none after:absolute after:inset-x-0 after:-inset-y-3 after:content-[''] focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            Remember new things
            <span
              aria-hidden="true"
              className={cn(
                "flex h-4 w-7 items-center rounded-full p-0.5 transition-colors duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
                paused ? "bg-muted-foreground/30" : "bg-foreground"
              )}
            >
              <span
                className={cn(
                  "size-3 rounded-full bg-background transition-transform duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none",
                  !paused && "translate-x-3"
                )}
              />
            </span>
          </button>
        ) : null}
      </div>

      {paused ? (
        <p className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground text-pretty">
          Paused. Nothing new is being remembered. What&apos;s below is still used until you forget it.
        </p>
      ) : null}

      {stated.length > 0 ? (
        <section className="flex flex-col gap-1.5">
          <Subheading className="text-xs font-medium text-muted-foreground">What you told it</Subheading>
          <ul className="flex flex-col divide-y rounded-md border">{stated.map(renderRow)}</ul>
        </section>
      ) : null}

      {inferred.length > 0 ? (
        <section className="flex flex-col gap-1.5">
          <div className="flex flex-col">
            <Subheading className="text-xs font-medium text-muted-foreground">What it picked up</Subheading>
            <p className="text-xs text-muted-foreground">Guesses from how you work. Worth checking.</p>
          </div>
          <ul className="flex flex-col divide-y rounded-md border border-dashed">{inferred.map(renderRow)}</ul>
        </section>
      ) : null}

      {onForgetAll && memories.length > 0 ? (
        confirmingAll ? (
          <div role="group" aria-label="Confirm forget all" className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/40 px-3 py-2">
            <p className="text-sm text-foreground">
              Forget all {memories.length}? This can&apos;t be undone.
            </p>
            <span className="flex items-center gap-2">
              <button
                type="button"
                autoFocus
                onClick={() => {
                  setConfirmingAll(false);
                  focusRef.current = "forget-all";
                }}
                className={secondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onForgetAll();
                  setForgotten([]);
                  setConfirmingAll(false);
                  setAnnouncement("Forgot everything");
                }}
                className={destructive}
              >
                Forget all
              </button>
            </span>
          </div>
        ) : (
          <button
            type="button"
            data-focus="forget-all"
            onClick={() => setConfirmingAll(true)}
            className={cn(quiet, "self-start px-0 text-destructive hover:text-destructive hover:underline underline-offset-2")}
          >
            Forget everything…
          </button>
        )
      ) : null}

      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}

export { AgentMemory };
