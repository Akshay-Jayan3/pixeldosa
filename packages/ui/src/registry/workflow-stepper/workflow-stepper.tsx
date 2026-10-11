"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export type WorkflowStepStatus = "complete" | "current" | "upcoming";

export type WorkflowStep = {
  id: string;
  title: string;
  description?: string;
  status?: WorkflowStepStatus;
  badge?: string;
};

const workflowStepperVariants = cva("flex w-full flex-col", {
  variants: {
    size: {
      default: "gap-3",
      compact: "gap-2.5",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface WorkflowStepperProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof workflowStepperVariants> {
  /** Ordered steps, from first to last. */
  steps: WorkflowStep[];
  /** The 0-based index of the current step. Defaults to the first step marked `current`. */
  currentStep?: number;
  /** Displayed above the step list. */
  title?: string;
  /** Show each step's computed state as a badge. */
  showStatus?: boolean;
}

const STEP_STATUS_LABEL: Record<WorkflowStepStatus, string> = {
  complete: "Done",
  current: "Current",
  upcoming: "Next",
};

function WorkflowStepper({
  steps,
  currentStep,
  title,
  className,
  size,
  showStatus = true,
  ...props
}: WorkflowStepperProps) {
  const resolvedCurrentStep = React.useMemo(() => {
    if (typeof currentStep === "number") {
      return currentStep;
    }

    const index = steps.findIndex((step) => step.status === "current");
    return index >= 0 ? index : 0;
  }, [currentStep, steps]);

  return (
    <div className={cn(workflowStepperVariants({ size }), className)} {...props}>
      {title ? (
        <p className="text-sm font-medium text-foreground">{title}</p>
      ) : null}

      <ol className="flex flex-col">
        {steps.map((step, index) => {
          const isComplete = step.status === "complete" || index < resolvedCurrentStep;
          const isCurrent = step.status === "current" || index === resolvedCurrentStep;
          const isUpcoming = step.status === "upcoming" || (!isComplete && !isCurrent && index > resolvedCurrentStep);
          const status: WorkflowStepStatus = isComplete ? "complete" : isCurrent ? "current" : "upcoming";

          return (
            <li key={step.id} className="relative flex gap-3 pb-3 last:pb-0">
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-[0.9rem] top-8 h-[calc(100%-0.5rem)] w-px bg-border",
                    isComplete ? "bg-primary/60" : "bg-border"
                  )}
                />
              ) : null}

              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border text-xs font-medium transition-colors duration-(--pd-duration-instant) ease-(--pd-ease-standard) motion-reduce:transition-none",
                    isComplete && "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary bg-primary/10 text-primary ring-[3px] ring-primary/15",
                    isUpcoming && "border-border bg-background text-muted-foreground"
                  )}
                  aria-hidden="true"
                >
                  {isComplete ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current">
                      <path d="M5.5 12.5 9.5 16.5 18.5 7.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn("text-sm font-medium", isCurrent ? "text-foreground" : "text-foreground/90")}>{step.title}</p>
                  {showStatus ? (
                    <span
                      className={cn(
                        "rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em]",
                        isComplete && "border-primary/20 bg-primary/10 text-primary",
                        isCurrent && "border-primary/20 bg-primary/10 text-primary",
                        isUpcoming && "border-border bg-muted text-muted-foreground"
                      )}
                    >
                      {STEP_STATUS_LABEL[status]}
                    </span>
                  ) : null}
                  {step.badge ? (
                    <span className="rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                      {step.badge}
                    </span>
                  ) : null}
                </div>

                {step.description ? (
                  <p className="mt-1 text-sm text-muted-foreground text-pretty">{step.description}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export { WorkflowStepper, workflowStepperVariants };
