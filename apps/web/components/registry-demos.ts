import type { ComponentType } from "react";

import AgentFigureDemo from "@pixeldosa/ui/registry/agent-figure/agent-figure.demo";
import ActivityTrailDemo from "@pixeldosa/ui/registry/activity-trail/activity-trail.demo";
import AgentScheduleDemo from "@pixeldosa/ui/registry/agent-schedule/agent-schedule.demo";
import AIDisclosureDemo from "@pixeldosa/ui/registry/ai-disclosure/ai-disclosure.demo";
import HumanHandoffDemo from "@pixeldosa/ui/registry/human-handoff/human-handoff.demo";
import RunInboxDemo from "@pixeldosa/ui/registry/run-inbox/run-inbox.demo";
import CompareViewDemo from "@pixeldosa/ui/registry/compare-view/compare-view.demo";
import CreditsMeterDemo from "@pixeldosa/ui/registry/credits-meter/credits-meter.demo";
import MediaResultDemo from "@pixeldosa/ui/registry/media-result/media-result.demo";
import ParameterPanelDemo from "@pixeldosa/ui/registry/parameter-panel/parameter-panel.demo";
import GenerationJobDemo from "@pixeldosa/ui/registry/generation-job/generation-job.demo";
import VariationGridDemo from "@pixeldosa/ui/registry/variation-grid/variation-grid.demo";
import CostEstimateDemo from "@pixeldosa/ui/registry/cost-estimate/cost-estimate.demo";
import ResponseFeedbackDemo from "@pixeldosa/ui/registry/response-feedback/response-feedback.demo";
import ResponseVersionsDemo from "@pixeldosa/ui/registry/response-versions/response-versions.demo";
import DraftModeDemo from "@pixeldosa/ui/registry/draft-mode/draft-mode.demo";
import AIActionToolbarDemo from "@pixeldosa/ui/registry/ai-action-toolbar/ai-action-toolbar.demo";
import IntentPreviewDemo from "@pixeldosa/ui/registry/intent-preview/intent-preview.demo";
import AgentPlanDemo from "@pixeldosa/ui/registry/agent-plan/agent-plan.demo";
import AgentSteerDemo from "@pixeldosa/ui/registry/agent-steer/agent-steer.demo";
import ToolCallCardDemo from "@pixeldosa/ui/registry/tool-call-card/tool-call-card.demo";
import AIChatExperienceDemo from "@pixeldosa/ui/registry/ai-chat-experience/ai-chat-experience.demo";
import SuggestionsDemo from "@pixeldosa/ui/registry/suggestions/suggestions.demo";
import CodeBlockDemo from "@pixeldosa/ui/registry/code-block/code-block.demo";
import MessageScrollerDemo from "@pixeldosa/ui/registry/message-scroller/message-scroller.demo";
import MessageDemo from "@pixeldosa/ui/registry/message/message.demo";
import PromptComposerDemo from "@pixeldosa/ui/registry/prompt-composer/prompt-composer.demo";
import InlineCitationsDemo from "@pixeldosa/ui/registry/inline-citations/inline-citations.demo";
import AutonomyControlDemo from "@pixeldosa/ui/registry/autonomy-control/autonomy-control.demo";
import AgentMemoryDemo from "@pixeldosa/ui/registry/agent-memory/agent-memory.demo";
import AITriageTableDemo from "@pixeldosa/ui/registry/ai-triage-table/ai-triage-table.demo";
import AIFormFillDemo from "@pixeldosa/ui/registry/ai-form-fill/ai-form-fill.demo";
import AIApprovalGateDemo from "@pixeldosa/ui/registry/ai-approval-gate/ai-approval-gate.demo";
import AgentAskDemo from "@pixeldosa/ui/registry/agent-ask/agent-ask.demo";
import AgentPresenceDemo from "@pixeldosa/ui/registry/agent-presence/agent-presence.demo";
import AIContextSurfaceDemo from "@pixeldosa/ui/registry/ai-context-surface/ai-context-surface.demo";
import ButtonDemo from "@pixeldosa/ui/registry/button/button.demo";
import CommandMenuDemo from "@pixeldosa/ui/registry/command-menu/command-menu.demo";
import ConfidenceMeterDemo from "@pixeldosa/ui/registry/confidence-meter/confidence-meter.demo";
import ContentCardExample from "@pixeldosa/ui/registry/card/examples/content-card";
import DiffAcceptDemo from "@pixeldosa/ui/registry/diff-accept/diff-accept.demo";
import ListingCardExample from "@pixeldosa/ui/registry/card/examples/listing-card";
import LiveStatusLineDemo from "@pixeldosa/ui/registry/live-status-line/live-status-line.demo";
import PricingPairExample from "@pixeldosa/ui/registry/card/examples/pricing-pair";
import FieldDemo from "@pixeldosa/ui/registry/field/field.demo";
import GenerationPlaceholderDemo from "@pixeldosa/ui/registry/generation-placeholder/generation-placeholder.demo";
import GhostInputDemo from "@pixeldosa/ui/registry/ghost-input/ghost-input.demo";
import OverlayDemo from "@pixeldosa/ui/registry/overlay/overlay.demo";
import ProgressiveRevealDemo from "@pixeldosa/ui/registry/progressive-reveal/progressive-reveal.demo";
import ReasoningStreamDemo from "@pixeldosa/ui/registry/reasoning-stream/reasoning-stream.demo";
import SelectionActionsDemo from "@pixeldosa/ui/registry/selection-actions/selection-actions.demo";
import SmartFieldDemo from "@pixeldosa/ui/registry/smart-field/smart-field.demo";
import ThinkingExperienceDemo from "@pixeldosa/ui/registry/thinking-experience/thinking-experience.demo";

export type DemoExample = {
  slug: string;
  title: string;
  description: string;
  render: ComponentType;
};

/**
 * Every individually-addressable example, per component. Each one gets its own
 * grid tile on the component's docs page and its own detail route
 * (/docs/components/[name]/[slug]) with a real preview and its own source —
 * "clicking a card type should go to a detailed preview, code and doc" is the
 * whole reason this is a list of examples rather than one opaque demo per
 * component. Single-example components still get a one-item array so every page
 * in the docs site can treat "a component's examples" uniformly.
 */
export const demoExamples: Record<string, DemoExample[]> = {
  button: [
    {
      slug: "overview",
      title: "Overview",
      description: "All six variants, four sizes, loading and disabled states.",
      render: ButtonDemo,
    },
  ],
  "command-menu": [
    {
      slug: "overview",
      title: "Overview",
      description: "Grouped results, keybind hints, empty state, and a live ⌘K trigger.",
      render: CommandMenuDemo,
    },
  ],
  card: [
    {
      slug: "content-card",
      title: "Content card",
      description: "Header, content and footer parts with a trailing overflow action.",
      render: ContentCardExample,
    },
    {
      slug: "listing-card",
      title: "Listing card",
      description: "Composed with CardImage for a top-banner, vertical-orientation layout.",
      render: ListingCardExample,
    },
    {
      slug: "pricing-pair",
      title: "Pricing pair",
      description: "Two tiers, no new Card capability beyond the existing parts.",
      render: PricingPairExample,
    },
  ],
  field: [
    {
      slug: "overview",
      title: "Overview",
      description: "Label, control, description and error wired to one generated id set.",
      render: FieldDemo,
    },
  ],
  overlay: [
    {
      slug: "overview",
      title: "Overview",
      description: "Scrim and content primitives for dialogs, sheets and popovers.",
      render: OverlayDemo,
    },
  ],
  "ghost-input": [
    {
      slug: "overview",
      title: "Overview",
      description: "Inline-editable text that reads as a label until focused.",
      render: GhostInputDemo,
    },
  ],
  "smart-field": [
    {
      slug: "overview",
      title: "Overview",
      description: "Propose, review confidence and source, then accept or undo.",
      render: SmartFieldDemo,
    },
  ],
  "diff-accept": [
    {
      slug: "overview",
      title: "Overview",
      description: "Per-hunk accept/reject on an AI rewrite, plus a conflict guard.",
      render: DiffAcceptDemo,
    },
  ],
  "selection-actions": [
    {
      slug: "overview",
      title: "Overview",
      description: "Select text to reveal AI actions, Rewrite routed through Diff Accept.",
      render: SelectionActionsDemo,
    },
  ],
  "confidence-meter": [
    {
      slug: "overview",
      title: "Overview",
      description: "Three tiers, an optional source caption, never a raw percentage.",
      render: ConfidenceMeterDemo,
    },
  ],
  "progressive-reveal": [
    {
      slug: "overview",
      title: "Overview",
      description: "Streaming search results, one fade-in per item, never replayed.",
      render: ProgressiveRevealDemo,
    },
  ],
  "ai-context-surface": [
    {
      slug: "overview",
      title: "Overview",
      description: "A collapsed 'Why this?' disclosure — explanation, sources, model.",
      render: AIContextSurfaceDemo,
    },
  ],
  "ai-action-toolbar": [
    {
      slug: "overview",
      title: "Overview",
      description: "Apply, regenerate, explain and report over one AI result, arrow-key navigable.",
      render: AIActionToolbarDemo,
    },
  ],
  "agent-presence": [
    {
      slug: "overview",
      title: "Overview",
      description: "A full agent run — the machine states move, then it stops and waits for you.",
      render: AgentPresenceDemo,
    },
  ],
  "intent-preview": [
    {
      slug: "overview",
      title: "Overview",
      description: "Three guesses restated before a run — one corrected in place.",
      render: IntentPreviewDemo,
    },
  ],
  "agent-plan": [
    {
      slug: "overview",
      title: "Overview",
      description: "A five-step plan you can reorder, trim or extend before it runs.",
      render: AgentPlanDemo,
    },
  ],
  "ai-chat-experience": [
    {
      slug: "overview",
      title: "Overview",
      description: "Ask a starter question: the agent reasons, searches and reads, then streams a cited answer with code.",
      render: AIChatExperienceDemo,
    },
  ],
  suggestions: [
    {
      slug: "overview",
      title: "Overview",
      description: "Follow-ups under an answer: chips that fill the input, and a list that sends straight away.",
      render: SuggestionsDemo,
    },
  ],
  "code-block": [
    {
      slug: "overview",
      title: "Overview",
      description: "An answer streaming a code fix. Copy and Apply wait until the block is complete.",
      render: CodeBlockDemo,
    },
  ],
  "message-scroller": [
    {
      slug: "overview",
      title: "Overview",
      description: "A conversation that streams a long reply. Scroll up mid-stream and it stops following.",
      render: MessageScrollerDemo,
    },
  ],
  message: [
    {
      slug: "overview",
      title: "Overview",
      description: "A streamed answer: reasoning, two queries, then a cited reply. Stop or fail it mid-stream.",
      render: MessageDemo,
    },
  ],
  "prompt-composer": [
    {
      slug: "overview",
      title: "Overview",
      description: "A release announcement request: text, four spec controls, and an attached notes file.",
      render: PromptComposerDemo,
    },
  ],
  "inline-citations": [
    {
      slug: "overview",
      title: "Overview",
      description: "One quoted claim, one summarised from two sources, and one with nothing behind it.",
      render: InlineCitationsDemo,
    },
  ],
  "autonomy-control": [
    {
      slug: "overview",
      title: "Overview",
      description: "An email agent's five actions, re-explained for each level. Sending always asks.",
      render: AutonomyControlDemo,
    },
  ],
  "agent-memory": [
    {
      slug: "overview",
      title: "Overview",
      description: "Two things you told it, three it guessed. Edit, forget with Undo, or pause.",
      render: AgentMemoryDemo,
    },
  ],
  "tool-call-card": [
    {
      slug: "overview",
      title: "Overview",
      description: "A bug fix's five tool calls — one failed fetch, one change — beside the answer they support.",
      render: ToolCallCardDemo,
    },
  ],
  "agent-steer": [
    {
      slug: "overview",
      title: "Overview",
      description: "A running fix redirected to another file — queued, then applied at the next step.",
      render: AgentSteerDemo,
    },
  ],
  "ai-triage-table": [
    {
      slug: "overview",
      title: "Overview",
      description: "48 accounts enriched — low confidence first, 40 unchanged collapsed to one line.",
      render: AITriageTableDemo,
    },
  ],
  "ai-form-fill": [
    {
      slug: "overview",
      title: "Overview",
      description: "One fill request, three fields, each reviewed on its own confidence.",
      render: AIFormFillDemo,
    },
  ],
  "thinking-experience": [
    {
      slug: "overview",
      title: "Overview",
      description: "A full agent run — work, a question, an approval, a result — driven by one state.",
      render: ThinkingExperienceDemo,
    },
  ],
  "ai-approval-gate": [
    {
      slug: "overview",
      title: "Overview",
      description: "A high-risk, irreversible send held for approval — scope, confidence and reasoning.",
      render: AIApprovalGateDemo,
    },
  ],
  "run-inbox": [
    {
      slug: "overview",
      title: "Overview",
      description: "Six runs across five states, with the two waiting on a person at the top.",
      render: RunInboxDemo,
    },
  ],
  "activity-trail": [
    {
      slug: "overview",
      title: "Overview",
      description: "A morning's work, each line with what allowed it, the result, and Undo where it still applies.",
      render: ActivityTrailDemo,
    },
  ],
  "human-handoff": [
    {
      slug: "overview",
      title: "Overview",
      description: "A refund the agent can't decide, handed over with everything it already tried.",
      render: HumanHandoffDemo,
    },
  ],
  "agent-schedule": [
    {
      slug: "overview",
      title: "Overview",
      description: "Three triggers in plain words, including one whose last run failed.",
      render: AgentScheduleDemo,
    },
  ],
  "parameter-panel": [
    {
      slug: "overview",
      title: "Overview",
      description: "Look, shape and quantity chosen from previews, with the price of each option beside it.",
      render: ParameterPanelDemo,
    },
  ],
  "compare-view": [
    {
      slug: "overview",
      title: "Overview",
      description: "A sky replacement, compared with a keyboard-operable slider or side by side.",
      render: CompareViewDemo,
    },
  ],
  "media-result": [
    {
      slug: "overview",
      title: "Overview",
      description: "A finished image with what made it, its content credentials, and what happens when they're missing.",
      render: MediaResultDemo,
    },
  ],
  "generation-job": [
    {
      slug: "overview",
      title: "Overview",
      description: "A batch of images from the queue to done, with two ready before the rest.",
      render: GenerationJobDemo,
    },
  ],
  "variation-grid": [
    {
      slug: "overview",
      title: "Overview",
      description: "Four results: keep the ones you like and regenerate only the others.",
      render: VariationGridDemo,
    },
  ],
  "credits-meter": [
    {
      slug: "overview",
      title: "Overview",
      description: "A low balance, with the price of three different actions shown before the click.",
      render: CreditsMeterDemo,
    },
  ],
  "response-versions": [
    {
      slug: "overview",
      title: "Overview",
      description: "An answer regenerated twice, with every version kept and two of them side by side.",
      render: ResponseVersionsDemo,
    },
  ],
  "response-feedback": [
    {
      slug: "overview",
      title: "Overview",
      description: "Thumbs under an answer, with reasons and an optional comment after a thumbs down.",
      render: ResponseFeedbackDemo,
    },
  ],
  "ai-disclosure": [
    {
      slug: "overview",
      title: "Overview",
      description: "A notice on an AI-written draft, and a consent question before recording a call.",
      render: AIDisclosureDemo,
    },
  ],
  "cost-estimate": [
    {
      slug: "overview",
      title: "Overview",
      description: "What a research run will cost and how long it takes, with a narrower scope to compare.",
      render: CostEstimateDemo,
    },
  ],
  "draft-mode": [
    {
      slug: "overview",
      title: "Overview",
      description: "Three things the agent prepared, held for review, one of them irreversible.",
      render: DraftModeDemo,
    },
  ],
  "agent-figure": [
    {
      slug: "overview",
      title: "Overview",
      description: "A research run where the drawn agent listens, plans, searches, asks, and hands over the result.",
      render: AgentFigureDemo,
    },
  ],
  "live-status-line": [
    {
      slug: "overview",
      title: "Overview",
      description: "An agent run narrated one replaced line at a time, with a live elapsed counter.",
      render: LiveStatusLineDemo,
    },
  ],
  "agent-ask": [
    {
      slug: "overview",
      title: "Overview",
      description: "An agent stuck between two plausible files, asking rather than guessing.",
      render: AgentAskDemo,
    },
  ],
  "reasoning-stream": [
    {
      slug: "overview",
      title: "Overview",
      description: "A reasoning trace streaming in, then folding away once the answer lands.",
      render: ReasoningStreamDemo,
    },
  ],
  "generation-placeholder": [
    {
      slug: "overview",
      title: "Overview",
      description: "A full generate cycle — queued, measured progress, encode, then the artifact.",
      render: GenerationPlaceholderDemo,
    },
  ],
};

export function getDemoExample(name: string, slug: string): DemoExample | undefined {
  return demoExamples[name]?.find((example) => example.slug === slug);
}

/**
 * A single representative render per component — the first example — for
 * contexts that show exactly one preview (the homepage's reference section, the
 * browse grid's mini preview tile). The per-example grid on a component's own
 * docs page reads demoExamples directly instead of this.
 */
export const demos: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(demoExamples).map(([name, examples]) => [name, examples[0]!.render])
);
