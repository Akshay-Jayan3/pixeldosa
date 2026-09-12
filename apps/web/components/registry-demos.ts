import type { ComponentType } from "react";

import AIActionToolbarDemo from "@pixeldosa/ui/registry/ai-action-toolbar/ai-action-toolbar.demo";
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
