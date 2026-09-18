"use client";

import * as React from "react";

import { ResponseVersions, type ResponseVersion } from "@/registry/response-versions/response-versions";

const FIRST: ResponseVersion[] = [
  {
    id: "v1",
    label: "First answer",
    time: "2 minutes ago",
    content:
      "The export times out because the client aborts every request after a hard-coded 5 seconds, while the config sets 30. Raise the client timeout to match the config.",
  },
];

const NEXT: ResponseVersion[] = [
  {
    id: "v2",
    label: "Shorter",
    time: "just now",
    content: "The client ignores your 30-second config and aborts at 5 seconds. Make it read config.requestTimeout.",
  },
  {
    id: "v3",
    label: "With the fix",
    time: "just now",
    content:
      "The client aborts at a hard-coded 5 seconds and ignores config.requestTimeout (30s). Pass the config value into setTimeout in src/http/client.ts, and slow exports will get the full 30 seconds.",
  },
];

export default function ResponseVersionsDemo() {
  const [versions, setVersions] = React.useState(FIRST);
  const [activeId, setActiveId] = React.useState("v1");
  const [busy, setBusy] = React.useState(false);
  const [kept, setKept] = React.useState<string | null>(null);

  const regenerate = () => {
    const next = NEXT[versions.length - 1];
    if (!next || busy) return;
    setBusy(true);
    window.setTimeout(() => {
      setVersions((previous) => [...previous, next]);
      setActiveId(next.id);
      setBusy(false);
    }, 1200);
  };

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <ResponseVersions
        versions={versions}
        activeId={activeId}
        onActiveChange={setActiveId}
        onRegenerate={versions.length < 3 ? regenerate : undefined}
        onKeep={(id) => setKept(id)}
        busy={busy}
      />
      {kept ? (
        <p className="animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] text-sm text-muted-foreground motion-reduce:animate-none">
          Kept {versions.find((version) => version.id === kept)?.label?.toLowerCase()}. The others are still here.
        </p>
      ) : null}
    </div>
  );
}
