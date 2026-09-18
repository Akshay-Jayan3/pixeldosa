"use client";

import * as React from "react";

import {
  AIActionToolbar,
  AIFormFill,
  AIDisclosure,
  CostEstimate,
  DraftMode,
  MediaResult,
  ResponseFeedback,
  type AIAction,
  type AIDisclosureProps,
  type CostEstimateProps,
  type DraftItem,
  type MediaResultProps,
  type ResponseFeedbackProps,
  type SmartFieldProposal,
} from "@pixeldosa/ui";

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

/** Cost Estimate with its buttons wired to nothing, for the docs previews. */
export function CostEstimateSpecimen(props: Omit<CostEstimateProps, "onRun" | "onCancel" | "onAdjust"> & { withActions?: boolean; adjustLabel?: string }) {
  const { withActions = true, adjustLabel, ...rest } = props;
  return (
    <CostEstimate
      {...rest}
      adjustLabel={adjustLabel}
      onRun={withActions ? () => undefined : undefined}
      onAdjust={adjustLabel ? () => undefined : undefined}
      onCancel={withActions ? () => undefined : undefined}
      className="w-full max-w-md"
    />
  );
}

/** Draft Mode holding real items, with its own state, for the docs previews. */
export function DraftModeSpecimen({
  items: initial = [],
  enabled: initialEnabled = true,
  offWarning,
  headingLevel = 3,
}: {
  items?: DraftItem[];
  enabled?: boolean;
  offWarning?: string;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}) {
  const [enabled, setEnabled] = React.useState(initialEnabled);
  const [items, setItems] = React.useState(initial);
  return (
    <DraftMode
      className="w-full max-w-lg"
      headingLevel={headingLevel}
      enabled={enabled}
      onEnabledChange={setEnabled}
      items={items}
      offWarning={offWarning}
      onSend={(ids) => setItems((previous) => previous.filter((item) => !ids.includes(item.id)))}
      onDiscard={(ids) => setItems((previous) => previous.filter((item) => !ids.includes(item.id)))}
    />
  );
}

/** Response Feedback with a no-op submit, for the docs previews. */
export function ResponseFeedbackSpecimen(props: Omit<ResponseFeedbackProps, "onSubmit">) {
  return <ResponseFeedback {...props} onSubmit={() => undefined} className="w-full max-w-md" />;
}

/** AI Disclosure with its consent buttons wired to local state, for the docs previews. */
export function AIDisclosureSpecimen(props: Omit<AIDisclosureProps, "onAllow" | "onDecline" | "onDismiss">) {
  const [answered, setAnswered] = React.useState<string | null>(null);
  if (props.variant === "consent" && answered) {
    return (
      <p className="text-sm text-muted-foreground">
        You chose “{answered}”.{" "}
        <button
          type="button"
          onClick={() => setAnswered(null)}
          className="font-medium underline underline-offset-2 hover:no-underline"
        >
          Ask again
        </button>
      </p>
    );
  }
  return (
    <AIDisclosure
      {...props}
      className="w-full max-w-md"
      onAllow={props.variant === "consent" ? () => setAnswered(props.allowLabel ?? "Allow") : undefined}
      onDecline={props.variant === "consent" ? () => setAnswered(props.declineLabel ?? "Not now") : undefined}
    />
  );
}

/** Media Result with a stand-in image and no wired actions, for the docs previews. */
export function MediaResultSpecimen(props: Omit<MediaResultProps, "children" | "onAction" | "actions">) {
  return (
    <MediaResult
      {...props}
      aspectRatio="4 / 5"
      className="w-full max-w-[16rem]"
      actions={[{ id: "use", label: "Use in the post", primary: true }, { id: "download", label: "Download" }]}
      onAction={() => undefined}
    >
      <span aria-hidden="true" className="flex size-full items-end justify-center bg-agent-working-soft p-4">
        <span className="h-3/4 w-1/3 rounded-t-full bg-foreground/70" />
      </span>
    </MediaResult>
  );
}
