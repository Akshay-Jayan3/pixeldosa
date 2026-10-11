import {
  WorkflowStepper,
  type WorkflowStep,
} from "@/registry/workflow-stepper/workflow-stepper";

const steps: WorkflowStep[] = [
  {
    id: "review",
    title: "Review intent",
    description: "We mapped the goal and checked the project context.",
    status: "complete",
  },
  {
    id: "draft",
    title: "Draft changes",
    description: "The agent prepared a safe first pass for approval.",
    status: "current",
    badge: "Live",
  },
  {
    id: "approve",
    title: "Approve and ship",
    description: "A human review confirms the update before it lands.",
    status: "upcoming",
  },
] as const;

export default function WorkflowStepperDemo() {
  return (
    <div className="w-full max-w-xl">
      <WorkflowStepper title="Run progress" steps={steps} />
    </div>
  );
}
