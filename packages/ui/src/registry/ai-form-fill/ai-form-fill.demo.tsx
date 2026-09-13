"use client";

import * as React from "react";

import { AIFormFill, type FormFillField } from "@/registry/ai-form-fill/ai-form-fill";
import type { SmartFieldProposal } from "@/registry/smart-field/smart-field";

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** What one bulk enrichment call would return, keyed by field. */
const BATCH: Record<string, SmartFieldProposal> = {
  company: { value: "Acme Robotics, Inc.", confidence: "high", provenance: "acme-robotics.com" },
  industry: { value: "Industrial automation", confidence: "medium", provenance: "12 similar records" },
  size: { value: "250–500 employees", confidence: "low", provenance: "a single unverified mention" },
};

export default function AIFormFillDemo() {
  const [values, setValues] = React.useState<Record<string, string>>({
    company: "acme robotics",
    industry: "",
    size: "",
  });

  const fields: FormFillField[] = [
    {
      name: "company",
      label: "Company",
      description: "Legal entity name as it should appear on the invoice.",
      fetchProposal: async () => BATCH.company!,
    },
    { name: "industry", label: "Industry", fetchProposal: async () => BATCH.industry! },
    { name: "size", label: "Company size", fetchProposal: async () => BATCH.size! },
  ];

  return (
    <div className="w-full max-w-md">
      <AIFormFill
        fields={fields}
        values={values}
        onValueChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value }))}
        // Stands in for the single round trip a real consumer would make here.
        onFill={() => new Promise((resolve) => window.setTimeout(resolve, 1100))}
        triggerIcon={<SparkleIcon />}
      />
    </div>
  );
}
