import { WorkflowSection } from "@/registry/workflow-section/workflow-section";

export default function WorkflowSectionDemo() {
  return (
    <WorkflowSection
      title="A clear path from idea to launch"
      description="Show the important steps without making visitors guess what comes next."
      steps={[
        { id: "discover", title: "Discover", description: "Bring the right context and people together.", detail: "Start with a shared brief and an agreed outcome." },
        { id: "create", title: "Create", description: "Turn decisions into visible work.", detail: "Assign owners, review progress, and make changes in one place." },
        { id: "improve", title: "Improve", description: "Use results to shape what comes next.", detail: "Close the loop with a short review and a new priority." },
      ]}
    />
  );
}
