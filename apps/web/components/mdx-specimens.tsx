"use client";

import * as React from "react";

import { AIActionToolbar, AIFormFill, type AIAction, type SmartFieldProposal } from "@pixeldosa/ui";

/**
 * Docs-only wrappers for components whose real API requires a function prop.
 * MDX is compiled in a server component, so it cannot pass a function across the
 * client boundary — but it can pass serializable props to a client component that
 * supplies the handler itself. This keeps the registry components' contracts strict
 * (`onAction` stays required) instead of loosening them to suit the docs site.
 */
const FILL_BATCH: Record<string, SmartFieldProposal> = {
  company: { value: "Acme Robotics, Inc.", confidence: "high", provenance: "acme-robotics.com" },
  industry: { value: "Industrial automation", confidence: "medium", provenance: "12 similar records" },
  size: { value: "250–500 employees", confidence: "low", provenance: "a single unverified mention" },
};

export function AIFormFillSpecimen() {
  const [values, setValues] = React.useState<Record<string, string>>({
    company: "acme robotics",
    industry: "",
    size: "",
  });

  return (
    <AIFormFill
      className="w-full max-w-md"
      values={values}
      onValueChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value }))}
      onFill={() => new Promise((resolve) => window.setTimeout(resolve, 900))}
      triggerIcon={
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      }
      fields={[
        {
          name: "company",
          label: "Company",
          description: "Legal entity name as it should appear on the invoice.",
          fetchProposal: async () => FILL_BATCH.company!,
        },
        { name: "industry", label: "Industry", fetchProposal: async () => FILL_BATCH.industry! },
        { name: "size", label: "Company size", fetchProposal: async () => FILL_BATCH.size! },
      ]}
    />
  );
}

export function ActionToolbarSpecimen({
  actions,
  ...props
}: {
  actions: AIAction[];
  message?: React.ReactNode;
  label?: string;
  size?: "sm" | "default";
}) {
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      <AIActionToolbar {...props} actions={actions} onAction={setLastAction} />
      <span className="text-xs text-muted-foreground" role="status" aria-live="polite">
        {lastAction ? `Last action: ${lastAction}` : "Try the arrow keys — the strip is one tab stop."}
      </span>
    </div>
  );
}
