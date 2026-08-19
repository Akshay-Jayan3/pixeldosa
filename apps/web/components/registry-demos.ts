import type { ComponentType } from "react";

import ButtonDemo from "@pixeldosa/ui/registry/button/button.demo";
import ContentCardExample from "@pixeldosa/ui/registry/card/examples/content-card";
import ListingCardExample from "@pixeldosa/ui/registry/card/examples/listing-card";
import PricingPairExample from "@pixeldosa/ui/registry/card/examples/pricing-pair";
import FieldDemo from "@pixeldosa/ui/registry/field/field.demo";
import GhostInputDemo from "@pixeldosa/ui/registry/ghost-input/ghost-input.demo";
import OverlayDemo from "@pixeldosa/ui/registry/overlay/overlay.demo";

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
