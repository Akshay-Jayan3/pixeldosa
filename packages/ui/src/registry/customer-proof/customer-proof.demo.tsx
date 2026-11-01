import { CustomerProof } from "@/registry/customer-proof/customer-proof";

export default function CustomerProofDemo() {
  return (
    <CustomerProof
      title="Trusted by teams doing meaningful work"
      stories={[
        { id: "northstar", quote: "We finally have one place to see what matters, who owns it, and what needs attention.", author: "Jordan Lee", role: "Head of Product", company: "Northstar", metric: "2×", metricLabel: "faster planning cycles" },
        { id: "fieldnote", quote: "The handoffs are clearer, and our team spends less time asking where things stand.", author: "Sam Rivera", role: "Operations Lead", company: "Fieldnote", metric: "6 hrs", metricLabel: "saved per team each week" },
      ]}
    />
  );
}
