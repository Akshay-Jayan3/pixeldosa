"use client";

import * as React from "react";

import { ParameterPanel, type ParameterGroup } from "@/registry/parameter-panel/parameter-panel";

/** Stand-in previews, so the demo needs no image assets. */
function Shape({ ratio, tone }: { ratio: string; tone?: string }) {
  return <span style={{ aspectRatio: ratio }} className={`h-8 rounded-sm ${tone ?? "bg-foreground/20"}`} />;
}

const GROUPS: ParameterGroup[] = [
  {
    id: "style",
    label: "Look",
    options: [
      {
        id: "photo",
        label: "Photographic",
        preview: <Shape ratio="1 / 1" tone="bg-agent-working-soft" />,
        detail: "Real lighting and depth of field. Best for product shots.",
      },
      {
        id: "flat",
        label: "Flat illustration",
        preview: <Shape ratio="1 / 1" tone="bg-agent-done-soft" />,
        detail: "Solid colour, no shading. Good for icons and spot art.",
      },
      {
        id: "ink",
        label: "Ink drawing",
        preview: <Shape ratio="1 / 1" tone="bg-muted" />,
        detail: "Line work on paper, no fills.",
      },
    ],
  },
  {
    id: "shape",
    label: "Shape",
    options: [
      { id: "square", label: "Square", preview: <Shape ratio="1 / 1" /> },
      { id: "wide", label: "Wide, 16:9", preview: <Shape ratio="16 / 9" /> },
      { id: "tall", label: "Tall, 4:5", preview: <Shape ratio="4 / 5" /> },
    ],
  },
  {
    id: "count",
    label: "How many",
    options: [
      { id: "1", label: "1 image", costNote: "10 credits" },
      { id: "4", label: "4 images", costNote: "40 credits" },
      { id: "8", label: "8 images", costNote: "80 credits" },
    ],
  },
];

const DEFAULTS = { style: "photo", shape: "square", count: "4" };
const COST: Record<string, number> = { "1": 10, "4": 40, "8": 80 };

export default function ParameterPanelDemo() {
  const [values, setValues] = React.useState<Record<string, string>>(DEFAULTS);
  const shape = GROUPS[1]!.options.find((option) => option.id === values.shape)?.label ?? "";
  const style = GROUPS[0]!.options.find((option) => option.id === values.style)?.label ?? "";

  return (
    <div className="w-full max-w-md">
      <ParameterPanel
        headingLevel={2}
        groups={GROUPS}
        values={values}
        onChange={(groupId, optionId) => setValues((previous) => ({ ...previous, [groupId]: optionId }))}
        summary={`${values.count} ${style.toLowerCase()} ${shape.toLowerCase()} · ${COST[values.count!] ?? 0} credits`}
        onReset={() => setValues(DEFAULTS)}
      />
    </div>
  );
}
