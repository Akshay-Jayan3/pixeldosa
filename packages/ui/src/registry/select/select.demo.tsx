"use client";

import * as React from "react";

import { Field, FieldControl, FieldDescription, FieldLabel } from "@/registry/field/field";
import { Select } from "@/registry/select/select";

const MODELS = [
  { value: "fast", label: "Fast: drafts in seconds" },
  { value: "balanced", label: "Balanced" },
  { value: "careful", label: "Careful: checks its sources" },
];

const DATASETS = [
  "Q3 Revenue Final.xlsx",
  "Q2 Revenue.xlsx",
  "Billing contacts.csv",
  { value: "archive-2025", label: "2025 archive (read-only)", disabled: true },
];

export default function SelectDemo() {
  const [model, setModel] = React.useState("balanced");
  const [tone, setTone] = React.useState("Friendly");

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Field>
        <FieldLabel>Model</FieldLabel>
        <FieldControl>
          <Select options={MODELS} value={model} onValueChange={setModel} className="w-full" />
        </FieldControl>
        <FieldDescription>Used for every run in this project.</FieldDescription>
      </Field>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          variant="pill"
          prefix="Tone:"
          aria-label="Tone"
          options={["Friendly", "Formal", "Direct"]}
          value={tone}
          onValueChange={setTone}
        />
        <Select variant="pill" prefix="Length:" aria-label="Length" options={["Short", "Medium", "Long"]} defaultValue="Medium" />
      </div>

      <Select size="sm" placeholder="Pick a dataset" aria-label="Dataset" options={DATASETS} />
    </div>
  );
}
