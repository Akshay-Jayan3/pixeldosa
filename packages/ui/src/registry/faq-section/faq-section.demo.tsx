import { FAQSection } from "@/registry/faq-section/faq-section";

export default function FAQSectionDemo() {
  return (
    <FAQSection
      title="Questions, answered"
      description="A few details that help teams get started."
      items={[
        { id: "trial", question: "Can I try it before choosing a plan?", answer: "Yes. Start with the free plan and move to a paid plan when your team is ready." },
        { id: "change", question: "Can I change plans later?", answer: "You can change plans as your team's needs evolve. Your workspace stays in place." },
        { id: "support", question: "Where can I get help?", answer: "Every plan includes access to product guidance. Paid plans include priority support." },
      ]}
    />
  );
}
