import { UseCaseExplorer } from "@/registry/use-case-explorer/use-case-explorer";

export default function UseCaseExplorerDemo() {
  return (
    <UseCaseExplorer
      title="Built around the work you do"
      cases={[
        { id: "product", label: "Product teams", title: "Ship with shared context.", description: "Connect customer needs to the work your team plans and delivers.", outcomes: ["Prioritize requests together", "Keep decisions beside the work", "Review outcomes after launch"] },
        { id: "marketing", label: "Marketing teams", title: "Coordinate every campaign.", description: "Give collaborators one view of launch plans, content, and owners.", outcomes: ["Coordinate channels and dates", "Keep reviews moving", "See launch readiness at a glance"] },
        { id: "operations", label: "Operations", title: "Make recurring work repeatable.", description: "Turn important processes into clear, trackable routines.", outcomes: ["Document ownership", "Catch blocked work early", "Improve the process over time"] },
      ]}
    />
  );
}
