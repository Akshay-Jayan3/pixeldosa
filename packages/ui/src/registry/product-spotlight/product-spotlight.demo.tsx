import { ProductSpotlight } from "@/registry/product-spotlight/product-spotlight";

const items = [
  { id: "plan", label: "Plan", title: "Make the next step clear.", description: "Collect priorities and turn them into a plan everyone can follow." },
  { id: "build", label: "Build", title: "Keep work moving.", description: "Give teammates a shared view of owners, status, and decisions." },
  { id: "learn", label: "Learn", title: "See what changed.", description: "Review outcomes and use what you learn to plan the next release." },
];

export default function ProductSpotlightDemo() {
  return <ProductSpotlight eyebrow="One connected workflow" title="From first thought to finished work." items={items} />;
}
