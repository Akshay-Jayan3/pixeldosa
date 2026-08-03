import { demos } from "@/components/registry-demos";

/**
 * Renders the component's real `.demo.tsx`. If a registry item has no entry in
 * the demo map, the page says so loudly rather than rendering an empty frame —
 * a missing preview is a pipeline failure, not a cosmetic gap.
 */
export function ComponentPreview({ name }: { name: string }) {
  const Demo = demos[name];

  if (!Demo) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        No demo registered for <code className="mx-1 font-mono">{name}</code> — add it to
        components/registry-demos.ts
      </div>
    );
  }

  return (
    <div className="flex min-h-56 items-center justify-center rounded-xl border bg-card p-8">
      <Demo />
    </div>
  );
}
