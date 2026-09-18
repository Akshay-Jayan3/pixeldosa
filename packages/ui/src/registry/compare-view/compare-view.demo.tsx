"use client";

import * as React from "react";

import { CompareView } from "@/registry/compare-view/compare-view";

/** Stand-ins for real media: two drawn scenes, so the demo needs no assets. */
function Scene({ sky, ground, sun }: { sky: string; ground: string; sun: string }) {
  return (
    <span className={`flex size-full flex-col justify-end ${sky}`}>
      <span className={`m-3 size-6 rounded-full ${sun}`} />
      <span className={`h-1/3 w-full ${ground}`} />
    </span>
  );
}

export default function CompareViewDemo() {
  const [choice, setChoice] = React.useState<"before" | "after" | null>(null);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <CompareView
        headingLevel={2}
        title="Sky replaced"
        aspectRatio="16 / 9"
        before={{
          label: "Original photo, overcast sky",
          content: <Scene sky="bg-muted" ground="bg-foreground/15" sun="bg-foreground/10" />,
        }}
        after={{
          label: "AI edit, clear sky at golden hour",
          content: <Scene sky="bg-agent-working-soft" ground="bg-agent-done-soft" sun="bg-agent-waiting-soft" />,
        }}
        onChoose={setChoice}
      />
      {choice ? (
        <p className="animate-[pd-fade-in_var(--pd-duration-base)_var(--pd-ease-decelerate)_both] text-sm text-muted-foreground motion-reduce:animate-none">
          Kept the {choice === "after" ? "edit" : "original"}.{" "}
          <button
            type="button"
            onClick={() => setChoice(null)}
            className="font-medium underline underline-offset-2 hover:no-underline"
          >
            Compare again
          </button>
        </p>
      ) : null}
    </div>
  );
}
