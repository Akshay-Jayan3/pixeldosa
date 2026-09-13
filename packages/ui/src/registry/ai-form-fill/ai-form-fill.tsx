"use client";

import * as React from "react";

import { AIActionToolbar, type AIAction } from "@/registry/ai-action-toolbar/ai-action-toolbar";
import { Field, FieldDescription, FieldLabel, FieldControl } from "@/registry/field/field";
import { LiveStatusLine } from "@/registry/live-status-line/live-status-line";
import { SmartField, type FetchProposal } from "@/registry/smart-field/smart-field";
import { cn } from "@/lib/utils";

export type FormFillField = {
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  /** Resolves this field's proposal. Usually reads from one batch the parent fetched. */
  fetchProposal: FetchProposal;
};

export interface AIFormFillProps extends Omit<React.ComponentPropsWithoutRef<"div">, "onChange"> {
  fields: FormFillField[];
  values: Record<string, string>;
  onValueChange: (name: string, value: string) => void;
  /**
   * Called once per fill request, before the fields propose. Use it to fetch the whole
   * batch in a single round trip — each field's `fetchProposal` then resolves from it.
   */
  onFill?: () => void | Promise<void>;
  /** No bundled icon set — supply your own `size-4` icon for each field's trigger. */
  triggerIcon: React.ReactNode;
  fillLabel?: string;
  status?: string;
}

/**
 * An agent filling a form you are already looking at — the embedded-in-product case,
 * not a chat.
 *
 * One action proposes values for every field at once; every field is still reviewed on
 * its own terms, with its own confidence, source, accept, reject and undo. The bulk
 * request is the only thing that is bulk. There is deliberately no "accept all":
 * per-field review is the entire point of the primitive underneath, and a control that
 * lets someone take twelve AI values in one click would quietly undo it.
 */
function AIFormFill({
  fields,
  values,
  onValueChange,
  onFill,
  triggerIcon,
  fillLabel = "Fill with AI",
  status = "Proposing values",
  className,
  ...props
}: AIFormFillProps) {
  const [token, setToken] = React.useState(0);
  const [filling, setFilling] = React.useState(false);
  const [startedAt, setStartedAt] = React.useState<number | undefined>(undefined);

  const runFill = async () => {
    setFilling(true);
    setStartedAt(Date.now());
    try {
      await onFill?.();
      // Bumping one token is what makes every governed field propose together, while
      // each keeps ownership of its own proposal, confidence and undo window.
      setToken((value) => value + 1);
    } finally {
      setFilling(false);
    }
  };

  const actions: AIAction[] = [
    { id: "fill", label: fillLabel, intent: "primary", busy: filling },
  ];

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AIActionToolbar
          label="Form fill actions"
          actions={actions}
          onAction={(id) => id === "fill" && void runFill()}
        />
        {filling ? (
          <LiveStatusLine state="working" status={status} startedAt={startedAt} />
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        {fields.map((field) => (
          <Field key={field.name}>
            <FieldLabel>{field.label}</FieldLabel>
            <FieldControl>
              <SmartField
                value={values[field.name] ?? ""}
                onValueChange={(next) => onValueChange(field.name, next)}
                fetchProposal={field.fetchProposal}
                proposeToken={token}
                triggerIcon={triggerIcon}
                triggerLabel={`Suggest ${field.label.toLowerCase()}`}
                placeholder={field.placeholder}
              />
            </FieldControl>
            {field.description ? (
              <FieldDescription>{field.description}</FieldDescription>
            ) : null}
          </Field>
        ))}
      </div>
    </div>
  );
}

export { AIFormFill };
