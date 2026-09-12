"use client";

import * as React from "react";

import { DiffAccept } from "@/registry/diff-accept/diff-accept";

const ORIGINAL =
  "Akshay is a frontend developer who likes building fast, clean interfaces. He is based in India and enjoys design systems.";

/** Stands in for a real rewrite call, so the docs preview has no network dependency. */
async function fakeRewrite(text: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return text
    .replace("frontend developer", "design engineer")
    .replace("likes building", "crafts")
    .replace("clean interfaces", "accessible interfaces")
    .replace("enjoys design systems", "is passionate about building design systems");
}

export default function DiffAcceptDemo() {
  const [value, setValue] = React.useState(ORIGINAL);
  const [proposal, setProposal] = React.useState<{ base: string; proposed: string } | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function requestSuggestion() {
    setLoading(true);
    const proposed = await fakeRewrite(value);
    setProposal({ base: value, proposed });
    setLoading(false);
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <label htmlFor="diff-accept-demo" className="text-sm font-medium">
        Bio
      </label>
      <textarea
        id="diff-accept-demo"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={3}
        className="w-full rounded-md border border-input bg-background p-3 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      />
      <button
        type="button"
        onClick={requestSuggestion}
        disabled={loading}
        className="self-start rounded-md border border-input px-3 py-1.5 text-xs font-medium text-foreground outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        {loading ? "Rewriting…" : "Rewrite with AI"}
      </button>

      {proposal ? (
        <DiffAccept
          baseValue={proposal.base}
          value={value}
          proposedValue={proposal.proposed}
          onApply={(merged) => setValue(merged)}
          onRegenerate={requestSuggestion}
        />
      ) : null}

      <p className="text-xs text-muted-foreground">
        Click "Rewrite with AI", accept or reject each change individually, then Apply.
        Edit the bio textarea after a suggestion appears (before applying) to see the
        conflict guard.
      </p>
    </div>
  );
}
