import { FeatureComparison } from "@/registry/feature-comparison/feature-comparison";

export default function FeatureComparisonDemo() {
  return (
    <FeatureComparison
      title="Choose the right way to work"
      description="A quick comparison of the capabilities teams ask about most."
      plans={[{ id: "starter", name: "Starter" }, { id: "team", name: "Team" }, { id: "scale", name: "Scale" }]}
      features={[
        { id: "projects", label: "Projects", values: { starter: "Up to 3", team: "Unlimited", scale: "Unlimited" } },
        { id: "history", label: "Version history", values: { starter: "7 days", team: "90 days", scale: "Custom" } },
        { id: "support", label: "Support", values: { starter: "Community", team: "Priority", scale: "Dedicated" } },
      ]}
    />
  );
}
