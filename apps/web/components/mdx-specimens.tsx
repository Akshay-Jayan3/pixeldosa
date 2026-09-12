"use client";

import * as React from "react";

import { AIActionToolbar, type AIAction } from "@pixeldosa/ui";

/**
 * Docs-only wrappers for components whose real API requires a function prop.
 * MDX is compiled in a server component, so it cannot pass a function across the
 * client boundary — but it can pass serializable props to a client component that
 * supplies the handler itself. This keeps the registry components' contracts strict
 * (`onAction` stays required) instead of loosening them to suit the docs site.
 */
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
