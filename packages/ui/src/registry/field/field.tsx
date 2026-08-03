"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Generates a stable id set (field/description/error) shared by every part below,
 * so consumers never have to invent or wire up ids themselves.
 */
function useFieldIds(providedId?: string) {
  const generatedId = React.useId();
  const id = providedId ?? generatedId;
  return {
    fieldId: id,
    descriptionId: `${id}-description`,
    errorId: `${id}-error`,
  };
}

type FieldContextValue = ReturnType<typeof useFieldIds> & {
  invalid: boolean;
  hasDescription: boolean;
  setHasDescription: (value: boolean) => void;
  hasError: boolean;
  setHasError: (value: boolean) => void;
};

const FieldContext = React.createContext<FieldContextValue | null>(null);

function useFieldContext() {
  const ctx = React.useContext(FieldContext);
  if (!ctx) {
    throw new Error("Field.* parts must be rendered inside <Field>.");
  }
  return ctx;
}

export interface FieldProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Base id for the control. A stable id is generated if omitted. */
  id?: string;
  /** Marks the field as invalid — the control gets aria-invalid and the error styles apply. */
  invalid?: boolean;
}

/**
 * Composable form-field wrapper: label, control, description and error all share one
 * generated id set and wire their own `aria-describedby` / `aria-invalid` automatically.
 *
 * Deliberately has no opinion on form-state management — it works with plain
 * `useState`, react-hook-form, or anything else, because the pieces most AI-in-product
 * components (SmartField, GhostInput) compose on top of are these primitives, not a
 * specific form library's API.
 */
const Field = React.forwardRef<HTMLDivElement, FieldProps>(function Field(
  { id, invalid = false, className, children, ...props },
  ref
) {
  const ids = useFieldIds(id);
  const [hasDescription, setHasDescription] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const value = React.useMemo<FieldContextValue>(
    () => ({ ...ids, invalid, hasDescription, setHasDescription, hasError, setHasError }),
    [ids, invalid, hasDescription, hasError]
  );

  return (
    <FieldContext.Provider value={value}>
      <div ref={ref} className={cn("flex flex-col gap-1.5", className)} data-invalid={invalid || undefined} {...props}>
        {children}
      </div>
    </FieldContext.Provider>
  );
});

const FieldLabel = React.forwardRef<HTMLLabelElement, React.ComponentPropsWithoutRef<"label">>(
  function FieldLabel({ className, ...props }, ref) {
    const { fieldId } = useFieldContext();
    return (
      <label
        ref={ref}
        htmlFor={fieldId}
        className={cn(
          "text-sm font-medium text-foreground",
          "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

/**
 * The interactive control. Clones the child element rather than rendering its own DOM
 * node so any control — a plain `<input>`, a `<textarea>`, a third-party combobox — can
 * be dropped in and still pick up the field's id and ARIA wiring without a wrapper div
 * changing its layout context (relevant for things like input+icon compositions).
 */
const FieldControl = React.forwardRef<HTMLElement, { children: React.ReactElement<Record<string, unknown>> }>(
  function FieldControl({ children }, forwardedRef) {
    const { fieldId, descriptionId, errorId, invalid, hasDescription, hasError } = useFieldContext();

    const describedBy = [hasError && errorId, hasDescription && descriptionId]
      .filter(Boolean)
      .join(" ");

    return React.cloneElement(children, {
      id: fieldId,
      "aria-invalid": invalid || undefined,
      "aria-describedby": describedBy || undefined,
      ref: forwardedRef,
    });
  }
);

const FieldDescription = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<"p">>(
  function FieldDescription({ className, ...props }, ref) {
    const { descriptionId, setHasDescription } = useFieldContext();

    React.useEffect(() => {
      setHasDescription(true);
      return () => setHasDescription(false);
    }, [setHasDescription]);

    return (
      <p
        ref={ref}
        id={descriptionId}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    );
  }
);

/**
 * Renders nothing when there is no message — announced via `role="alert"` so assistive
 * tech picks up validation errors that appear after the field already had focus, which
 * `aria-describedby` alone does not guarantee.
 */
const FieldError = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<"p">>(
  function FieldError({ className, children, ...props }, ref) {
    const { errorId, setHasError } = useFieldContext();

    React.useEffect(() => {
      setHasError(Boolean(children));
      return () => setHasError(false);
    }, [children, setHasError]);

    if (!children) return null;

    return (
      <p
        ref={ref}
        id={errorId}
        role="alert"
        className={cn("flex items-center gap-1.5 text-sm font-medium text-destructive", className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

export { Field, FieldLabel, FieldControl, FieldDescription, FieldError };
