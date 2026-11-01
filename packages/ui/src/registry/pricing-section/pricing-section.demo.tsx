import { PricingSection } from "@/registry/pricing-section/pricing-section";

function PlanAction({ children }: { children: string }) {
  return <a href="#get-started" className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">{children}</a>;
}

export default function PricingSectionDemo() {
  return (
    <PricingSection
      title="Plans that grow with your team"
      description="Start with the essentials. Change plans when your needs change."
      plans={[
        { id: "starter", name: "Starter", description: "For trying a better workflow.", monthlyPrice: "$0", annualPrice: "$0", features: ["3 active projects", "Core workflows", "Community support"], action: <PlanAction>Start free</PlanAction> },
        { id: "team", name: "Team", description: "For teams building together.", monthlyPrice: "$18", annualPrice: "$14", features: ["Unlimited projects", "Shared team spaces", "Priority support"], action: <PlanAction>Choose Team</PlanAction> },
        { id: "scale", name: "Scale", description: "For organizations with more needs.", monthlyPrice: "$42", annualPrice: "$34", features: ["Advanced permissions", "Dedicated onboarding", "Custom workflows"], action: <PlanAction>Talk to sales</PlanAction> },
      ]}
    />
  );
}
