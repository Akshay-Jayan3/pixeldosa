"use client";

import * as React from "react";

import { SmartField, type SmartFieldProposal } from "@/registry/smart-field/smart-field";

/**
 * Stands in for a real enrichment call (e.g. looking a company up by domain), so the
 * docs preview has no network dependency. Real usage passes a `fetchProposal` that
 * calls an actual model or data source.
 */
async function fakeFetchProposal(
  _value: string,
  signal: AbortSignal
): Promise<SmartFieldProposal | null> {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(resolve, 900);
    signal.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  return {
    value: "Acme Robotics, Inc.",
    confidence: "medium",
    provenance: "acme-robotics.com",
  };
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.6 4.7L18 9l-4.4 1.3L12 15l-1.6-4.7L6 9l4.4-1.3L12 3z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function SmartFieldDemo() {
  const [value, setValue] = React.useState("");

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <label htmlFor="smart-field-demo" className="text-sm font-medium">
        Company
      </label>
      <SmartField
        id="smart-field-demo"
        value={value}
        onValueChange={setValue}
        fetchProposal={fakeFetchProposal}
        triggerIcon={<SparkleIcon />}
        triggerLabel="Suggest company name"
        placeholder="Leave empty and click the sparkle…"
      />
      <p className="text-xs text-muted-foreground">
        Click the sparkle icon to request a suggestion, review its confidence and
        source, then accept or reject. Undo is available briefly after accepting.
      </p>
    </div>
  );
}
