"use client";

import * as React from "react";

import { MediaResult } from "@/registry/media-result/media-result";

export default function MediaResultDemo() {
  const [signed, setSigned] = React.useState(true);
  const [did, setDid] = React.useState<string | null>(null);

  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <MediaResult
        title="Bottle on stone, warm light"
        aspectRatio="4 / 5"
        madeBy="Made with Imagen 4 · today at 14:02"
        credentials={
          signed
            ? { attached: true, detail: "Content Credentials + invisible watermark", href: "#" }
            : { attached: false }
        }
        note="Cleared for marketing use."
        actions={[
          { id: "use", label: "Use in the post", primary: true },
          { id: "download", label: "Download" },
          { id: "variations", label: "More like this" },
        ]}
        onAction={setDid}
      >
        <span className="flex size-full items-end justify-center bg-agent-working-soft p-4">
          <span className="h-3/4 w-1/3 rounded-t-full bg-foreground/70" />
        </span>
      </MediaResult>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setSigned((value) => !value)}
          className="rounded-md border border-input px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent"
        >
          {signed ? "Show it unsigned" : "Show it signed"}
        </button>
        {did ? <p className="text-xs text-muted-foreground">You chose “{did}”.</p> : null}
      </div>
    </div>
  );
}
