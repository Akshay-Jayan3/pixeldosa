"use client";

import { Cite, CitedText } from "@/registry/inline-citations/inline-citations";

export default function InlineCitationsDemo() {
  return (
    <div className="w-full max-w-lg">
      <CitedText
        sources={[
          {
            id: "report",
            title: "Q3 2026 Retention Report",
            publisher: "Analytics team",
            date: "4 Oct 2026",
            url: "https://example.com/reports/q3-retention",
          },
          {
            id: "survey",
            title: "Onboarding survey results",
            publisher: "Research",
            date: "Sep 2026",
            url: "https://example.com/research/onboarding-survey",
          },
          {
            id: "changelog",
            title: "Release notes 4.2",
            publisher: "Product",
            url: "https://example.com/changelog/4-2",
          },
        ]}
      >
        <p>
          <Cite source="report" quote="30-day retention rose from 41% to 47% quarter over quarter.">
            Retention improved by six points in Q3
          </Cite>
          , and the gain is concentrated in teams that{" "}
          <Cite
            source={["survey", "changelog"]}
            support="paraphrased"
            quote={{
              survey: "Respondents who used the new setup checklist reported finishing onboarding in one session.",
              changelog: "4.2 introduces a guided setup checklist for new workspaces.",
            }}
          >
            used the guided setup checklist
          </Cite>
          .{" "}
          <Cite>The effect will likely hold through Q4</Cite>.
        </p>
      </CitedText>
    </div>
  );
}
