"use client";

import * as React from "react";

import { CreditsMeter, type CreditsMeterProps } from "@/registry/credits-meter/credits-meter";
import { GenerationJob, type GenerationJobStatus } from "@/registry/generation-job/generation-job";
import { ParameterPanel, type ParameterGroup } from "@/registry/parameter-panel/parameter-panel";
import {
  PromptComposer,
  type ComposerControl,
  type ComposerSubmission,
} from "@/registry/prompt-composer/prompt-composer";
import { VariationGrid, type Variation } from "@/registry/variation-grid/variation-grid";
import { cn } from "@/lib/utils";

export type StudioRun = {
  id: string;
  /** The ask, in the user's words. Shown as the job's title. */
  prompt: string;
  status: GenerationJobStatus;
  /** Results. Show them as they land — a finished one doesn't wait for its siblings. */
  items: Variation[];
  /** Which results the user is keeping. Caller-owned, like the grid's own prop. */
  keptIds?: string[];
  queue?: { position?: number; typicalWait?: string };
  /** What's happening right now: "Rendering frame 12 of 48". */
  stage?: string;
  /** Measured only, 0–1. Leave it out while the extent is unknown. */
  progress?: number;
  startedAt?: number | Date;
  /** What this run costs, formatted by you: "12 credits". */
  cost?: string;
  error?: { message: string; refunded?: string };
};

export type StudioHistoryEntry = {
  id: string;
  /** What was asked for. */
  prompt: string;
  /** Formatted by you: "2 hours ago". */
  time?: string;
  /** Thumbnails. The overview a scrolling feed never gives. */
  thumbnails: React.ReactNode[];
  /** The settings this run used, in words: "Photographic · Square · Standard". */
  settings?: string;
  /** How many results it produced, when more exist than thumbnails shown. */
  total?: number;
};

export interface ImageStudioProps extends Omit<React.ComponentPropsWithoutRef<"section">, "onSubmit"> {
  /** Level of the section headings. Defaults to 2, to sit under a page `h1`. */
  headingLevel?: 2 | 3 | 4 | 5;

  /** The ask. */
  onGenerate: (submission: ComposerSubmission) => void;
  placeholder?: string;
  /** Structured parts of the request that belong beside the prompt rather than in it. */
  controls?: ComposerControl[];
  /** Pre-filled prompt text — set this when Recall puts a past run back. */
  promptValue?: string;
  onPromptValueChange?: (value: string) => void;

  /** Settings that persist across runs, as previews rather than words. */
  groups: ParameterGroup[];
  values: Record<string, string>;
  onValueChange: (groupId: string, optionId: string) => void;
  /** The current settings as a sentence, so the choice is legible without reading the panel. */
  settingsSummary?: string;
  onResetSettings?: () => void;

  /** The budget, always in view. Everything `CreditsMeter` takes. */
  credits?: CreditsMeterProps;

  /** The run in progress, or the one that just finished. */
  run?: StudioRun | null;
  onCancel?: () => void;
  onRetry?: () => void;
  /**
   * Required: the grid always offers Keep, so without this the checkbox is a dead
   * control. Results are caller-owned, like everywhere else in the system.
   */
  onKeptChange: (ids: string[]) => void;
  /** Replaces only the results the user didn't keep. */
  onRegenerateRest?: (idsToReplace: string[]) => void;
  regenerateCost?: string;
  onUse?: (id: string) => void;
  useLabel?: string;
  onMore?: (id: string) => void;
  onRetryItem?: (id: string) => void;
  /** What one more run of the current settings costs. Named before the click. */
  refundNote?: string;
  notify?: boolean;
  onNotifyChange?: (notify: boolean) => void;

  /** Past runs, newest first. */
  history?: StudioHistoryEntry[];
  /** Puts a past run's prompt and settings back. The reason this history is worth keeping. */
  onRecall?: (entryId: string) => void;
  recallLabel?: string;
  onOpenHistoryEntry?: (entryId: string) => void;

  /** Shown before the first run. */
  empty?: { title: string; description?: string };
  aspectRatio?: string;
}

/**
 * A workspace for making images, not a prompt box with a feed under it.
 *
 * The complaints about generation tools are consistent and they are all about the
 * workspace rather than the model. Midjourney is described as tossing prompts into a
 * black hole: a long scrolling list with no overview, where finding last Tuesday's good
 * result means scrolling past everything since. Reviews measuring the same task put a
 * thumbnail grid at roughly five times the density of that feed. On Freepik, switching
 * model reopens every consistency problem, because the settings don't travel and the
 * user becomes the glue — restating palette, framing and geometry in each new prompt.
 *
 * So three decisions carry this block:
 *
 * - **Settings live beside the work and persist across runs**, as previews you pick from
 *   rather than words you have to know. Changing the prompt doesn't lose them.
 * - **History is a grid you can recall from**, not a feed you scroll. Each past run hands
 *   back its prompt *and* its settings, which is the thing a feed of images cannot do and
 *   the reason people end up keeping a spreadsheet of prompts beside the tool.
 * - **The price is in view before the click**, and the queue, the stage and the refund
 *   rule are stated while the run is going.
 *
 * Presentational throughout: you own the runs, the settings and the history, and every
 * figure is formatted by you.
 *
 * Motion means the machine is busy. Only the running job moves; the settings rail and the
 * history hold completely still, because they are the user's to work with.
 */
function ImageStudio({
  headingLevel = 2,
  onGenerate,
  placeholder = "Describe the image you want",
  controls,
  promptValue,
  onPromptValueChange,
  groups,
  values,
  onValueChange,
  settingsSummary,
  onResetSettings,
  credits,
  run,
  onCancel,
  onRetry,
  onKeptChange,
  onRegenerateRest,
  regenerateCost,
  onUse,
  useLabel = "Use this",
  onMore,
  onRetryItem,
  refundNote,
  notify,
  onNotifyChange,
  history,
  onRecall,
  recallLabel = "Use these settings",
  onOpenHistoryEntry,
  empty,
  aspectRatio = "1 / 1",
  className,
  ...props
}: ImageStudioProps) {
  const Heading = `h${headingLevel}` as "h2";
  const SubHeading = `h${Math.min(6, headingLevel + 1)}` as "h3";
  const labelId = React.useId();

  const kept = run?.keptIds ?? [];
  const hasResults = (run?.items.length ?? 0) > 0;
  const running = run ? ["queued", "running", "partial"].includes(run.status) : false;

  return (
    <section
      aria-labelledby={labelId}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <Heading id={labelId} className="sr-only">
        Image studio
      </Heading>

      {/* The ask leads, on every width. The settings rail moves beside it only when
          there is room; below that it sits under the prompt rather than above it, so the
          first thing in reach is still the thing you came to do. */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <PromptComposer
            onSubmit={onGenerate}
            controls={controls}
            placeholder={placeholder}
            value={promptValue}
            onValueChange={onPromptValueChange}
            submitLabel="Generate"
            // Stop belongs to the job, which is where the run actually is; the composer
            // only needs to stop offering to start a second one on top of it.
            busy={running}
          />

          {run ? (
            <GenerationJob
              headingLevel={Math.min(6, headingLevel + 1) as 3}
              status={run.status}
              title={run.prompt}
              queue={run.queue}
              stage={run.stage}
              progress={run.progress}
              startedAt={run.startedAt}
              cost={run.cost}
              refundNote={refundNote}
              error={run.error}
              notify={notify}
              onNotifyChange={onNotifyChange}
              onCancel={onCancel}
              onRetry={onRetry}
            >
              {hasResults ? (
                <VariationGrid
                  headingLevel={Math.min(6, headingLevel + 2) as 4}
                  title="Results"
                  items={run.items}
                  keptIds={kept}
                  onKeptChange={onKeptChange}
                  onRegenerateRest={onRegenerateRest}
                  regenerateCost={regenerateCost}
                  onUse={onUse}
                  useLabel={useLabel}
                  onMore={onMore}
                  onRetry={onRetryItem}
                  aspectRatio={aspectRatio}
                />
              ) : null}
            </GenerationJob>
          ) : empty ? (
            <div className="rounded-lg border border-dashed p-6">
              <SubHeading className="text-sm font-medium text-foreground text-pretty">
                {empty.title}
              </SubHeading>
              {empty.description ? (
                <p className="mt-1 text-sm text-muted-foreground text-pretty">{empty.description}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* A plain container, not an <aside>: a complementary landmark belongs at the
            top level of a page, and the settings panel inside already labels itself. */}
        <div className="flex flex-col gap-4">
          <ParameterPanel
            headingLevel={Math.min(6, headingLevel + 1) as 3}
            title="Settings"
            groups={groups}
            values={values}
            onChange={onValueChange}
            summary={settingsSummary}
            onReset={onResetSettings}
          />
          {credits ? <CreditsMeter {...credits} /> : null}
        </div>
      </div>

      {history && history.length > 0 ? (
        <div className="flex flex-col gap-3">
          <SubHeading className="text-sm font-medium text-foreground">Earlier</SubHeading>
          <ul className="flex flex-col gap-3">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-start sm:gap-4"
              >
                {/* Thumbnails, not a scroll: the whole run is visible at a glance. */}
                <ul className="flex shrink-0 gap-1.5">
                  {entry.thumbnails.map((thumbnail, index) => (
                    <li
                      key={index}
                      style={{ aspectRatio }}
                      className="w-12 overflow-hidden rounded-md border bg-muted"
                    >
                      {thumbnail}
                    </li>
                  ))}
                </ul>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  {onOpenHistoryEntry ? (
                    <button
                      type="button"
                      onClick={() => onOpenHistoryEntry(entry.id)}
                      className="rounded-sm text-left text-sm text-foreground outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/40"
                    >
                      {entry.prompt}
                    </button>
                  ) : (
                    <p className="text-sm text-foreground text-pretty">{entry.prompt}</p>
                  )}
                  <p className="text-xs text-muted-foreground text-pretty">
                    {[entry.settings, entry.time, entry.total ? `${entry.total} results` : undefined]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>

                {/* The whole reason to keep a history: the settings come back too, so the
                    user stops being the glue between one run and the next. */}
                {onRecall ? (
                  <button
                    type="button"
                    onClick={() => onRecall(entry.id)}
                    className="shrink-0 self-start rounded-md border border-input px-2.5 py-1 text-xs font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
                  >
                    {recallLabel}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export { ImageStudio };
