import { AIContextSurface } from "@/registry/ai-context-surface/ai-context-surface";

export default function AIContextSurfaceDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-2 rounded-md border bg-background p-4">
      <p className="text-sm font-medium text-foreground">Acme Robotics, Inc.</p>
      <AIContextSurface
        explanation="Matched based on the company's domain and two similar records already in your workspace."
        sources={[
          { label: "acme-robotics.com", url: "https://acme-robotics.com" },
          { label: "Similar record: Acme Manufacturing", snippet: "Same domain root, added 3 weeks ago." },
        ]}
        model="claude-opus"
        generatedAt={new Date(Date.now() - 12 * 60 * 1000)}
      />
    </div>
  );
}
