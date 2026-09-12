import { cn } from "@/lib/utils";

export type ConfidenceTier = "low" | "medium" | "high";

export interface ConfidenceMeterProps {
  confidence: ConfidenceTier;
  /** Optional source caption, rendered as "via {provenance}" alongside the tier. */
  provenance?: string;
  className?: string;
}

/** Exported so consumers can reuse the same wording for e.g. an aria-live announcement. */
export const confidenceLabel: Record<ConfidenceTier, string> = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
};

const confidenceBars: Record<ConfidenceTier, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

/**
 * A tiered (low/medium/high) confidence indicator with an optional provenance
 * caption, shared by every AI-tier component that needs to communicate uncertainty
 * honestly. Deliberately never a raw percentage — a fabricated number would claim
 * precision the underlying model doesn't actually have — and the bars are
 * supplementary to the text label, never the only signal, since the system's token
 * set has no "success"/"warning" hue to spend on a colour-coded scale anyway (only
 * `destructive` keeps real chroma).
 */
function ConfidenceMeter({ confidence, provenance, className }: ConfidenceMeterProps) {
  const filled = confidenceBars[confidence];

  return (
    <div className={cn("flex flex-wrap items-center gap-3 text-xs text-muted-foreground", className)}>
      <span className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-0.5" aria-hidden="true">
          {[1, 2, 3].map((bar) => (
            <span
              key={bar}
              className={cn("h-2.5 w-1 rounded-full", bar <= filled ? "bg-foreground" : "bg-border")}
            />
          ))}
        </span>
        {confidenceLabel[confidence]}
      </span>
      {provenance ? <span>via {provenance}</span> : null}
    </div>
  );
}

export { ConfidenceMeter };
