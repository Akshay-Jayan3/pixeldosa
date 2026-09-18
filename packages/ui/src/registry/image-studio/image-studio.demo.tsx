"use client";

import * as React from "react";

import {
  ImageStudio,
  type StudioHistoryEntry,
  type StudioRun,
} from "@/registry/image-studio/image-studio";
import type { ParameterGroup } from "@/registry/parameter-panel/parameter-panel";
import type { ComposerSubmission } from "@/registry/prompt-composer/prompt-composer";

/** A stand-in for generated artwork: a deterministic gradient, so the demo needs no files. */
function Swatch({ seed, label }: { seed: number; label?: string }) {
  const hue = (seed * 47) % 360;
  return (
    <span
      aria-hidden="true"
      className="block size-full"
      style={{
        background: `linear-gradient(${140 + seed * 13}deg, oklch(0.78 0.11 ${hue}), oklch(0.58 0.14 ${(hue + 48) % 360}))`,
      }}
      title={label}
    />
  );
}

const GROUPS: ParameterGroup[] = [
  {
    id: "look",
    label: "Look",
    options: [
      { id: "photographic", label: "Photographic", preview: <Swatch seed={2} />, detail: "Lens-like depth and grain." },
      { id: "illustrated", label: "Illustrated", preview: <Swatch seed={6} />, detail: "Flat colour, drawn edges." },
      { id: "product", label: "Product", preview: <Swatch seed={11} />, detail: "Even light, plain ground." },
    ],
  },
  {
    id: "shape",
    label: "Shape",
    options: [
      { id: "square", label: "Square", preview: <Swatch seed={3} /> },
      { id: "portrait", label: "Portrait", preview: <Swatch seed={8} /> },
      { id: "wide", label: "Wide", preview: <Swatch seed={14} /> },
    ],
  },
  {
    id: "quality",
    label: "Quality",
    options: [
      { id: "standard", label: "Standard", costNote: "12 credits" },
      { id: "high", label: "High", costNote: "40 credits", detail: "Slower, and worth it for print." },
    ],
  },
];

const HISTORY: StudioHistoryEntry[] = [
  {
    id: "h1",
    prompt: "Ceramic mug on a linen cloth, morning light from the left",
    time: "2 hours ago",
    settings: "Product · Square · Standard",
    total: 4,
    thumbnails: [<Swatch key="a" seed={21} />, <Swatch key="b" seed={22} />, <Swatch key="c" seed={23} />],
  },
  {
    id: "h2",
    prompt: "The same mug, but on a dark slate surface",
    time: "Yesterday",
    settings: "Product · Wide · High",
    total: 4,
    thumbnails: [<Swatch key="a" seed={31} />, <Swatch key="b" seed={32} />, <Swatch key="c" seed={33} />],
  },
];

const PROMPTS: Record<string, string> = {
  h1: "Ceramic mug on a linen cloth, morning light from the left",
  h2: "The same mug, but on a dark slate surface",
};

const SETTINGS: Record<string, Record<string, string>> = {
  h1: { look: "product", shape: "square", quality: "standard" },
  h2: { look: "product", shape: "wide", quality: "high" },
};

const DEFAULTS = { look: "photographic", shape: "square", quality: "standard" };

export default function ImageStudioDemo() {
  const [values, setValues] = React.useState<Record<string, string>>(DEFAULTS);
  const [prompt, setPrompt] = React.useState("");
  const [run, setRun] = React.useState<StudioRun | null>(null);
  const [kept, setKept] = React.useState<string[]>([]);
  const [notify, setNotify] = React.useState(false);
  const timers = React.useRef<number[]>([]);

  React.useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    []
  );

  const start = (text: string) => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setKept([]);

    const seedBase = Math.floor(Math.random() * 40) + 1;
    setRun({
      id: `run-${Date.now()}`,
      prompt: text,
      status: "queued",
      items: [],
      queue: { position: 2, typicalWait: "about a minute" },
      cost: values.quality === "high" ? "40 credits" : "12 credits",
      startedAt: Date.now(),
    });

    // Results land one at a time, which is the point: a finished image never waits for
    // its siblings.
    const steps: (() => void)[] = [
      () =>
        setRun((previous) =>
          previous ? { ...previous, status: "running", stage: "Composing", queue: undefined } : previous
        ),
      () =>
        setRun((previous) =>
          previous
            ? {
                ...previous,
                status: "partial",
                stage: "Rendering 2 of 4",
                items: [
                  { id: "v1", preview: <Swatch seed={seedBase} />, label: "Result 1" },
                  { id: "v2", preview: <Swatch seed={seedBase + 5} />, label: "Result 2" },
                  { id: "v3", status: "running", label: "Result 3" },
                  { id: "v4", status: "running", label: "Result 4" },
                ],
              }
            : previous
        ),
      () =>
        setRun((previous) =>
          previous
            ? {
                ...previous,
                status: "done",
                stage: undefined,
                items: [
                  { id: "v1", preview: <Swatch seed={seedBase} />, label: "Result 1" },
                  { id: "v2", preview: <Swatch seed={seedBase + 5} />, label: "Result 2" },
                  { id: "v3", preview: <Swatch seed={seedBase + 9} />, label: "Result 3" },
                  {
                    id: "v4",
                    status: "failed",
                    label: "Result 4",
                    note: "The model returned nothing. This one was refunded.",
                  },
                ],
              }
            : previous
        ),
    ];

    steps.forEach((step, index) => {
      timers.current.push(window.setTimeout(step, 1400 * (index + 1)));
    });
  };

  const recall = (id: string) => {
    setValues(SETTINGS[id] ?? DEFAULTS);
    setPrompt(PROMPTS[id] ?? "");
  };

  const quality = GROUPS[2]?.options.find((option) => option.id === values.quality);
  const summary = GROUPS.map(
    (group) => group.options.find((option) => option.id === values[group.id])?.label
  )
    .filter(Boolean)
    .join(" · ");

  return (
    <ImageStudio
      headingLevel={2}
      onGenerate={(submission: ComposerSubmission) => start(submission.text)}
      promptValue={prompt}
      onPromptValueChange={setPrompt}
      groups={GROUPS}
      values={values}
      onValueChange={(groupId, optionId) =>
        setValues((previous) => ({ ...previous, [groupId]: optionId }))
      }
      settingsSummary={summary}
      onResetSettings={() => setValues(DEFAULTS)}
      credits={{
        remaining: "1,250 credits",
        allowance: "2,000 this month",
        used: 1 - 1250 / 2000,
        nextAction: {
          label: "4 images · this prompt",
          cost: quality?.costNote ?? "12 credits",
          affordable: true,
        },
        resets: "Resets on 1 October",
      }}
      run={run ? { ...run, keptIds: kept } : null}
      refundNote="Anything that fails comes back as credits"
      notify={notify}
      onNotifyChange={setNotify}
      onCancel={() => {
        timers.current.forEach((id) => window.clearTimeout(id));
        setRun((previous) => (previous ? { ...previous, status: "cancelled", stage: undefined } : previous));
      }}
      onRetry={() => start(run?.prompt ?? prompt)}
      onKeptChange={setKept}
      onRegenerateRest={() => start(run?.prompt ?? prompt)}
      regenerateCost="9 credits"
      onUse={() => {}}
      onRetryItem={() => {}}
      history={HISTORY}
      onRecall={recall}
      empty={{
        title: "Nothing made yet",
        description:
          "Describe what you want and pick a look on the right. The price of the next run is named before you commit to it.",
      }}
    />
  );
}
