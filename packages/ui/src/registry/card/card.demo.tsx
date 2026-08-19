"use client";

import ContentCardExample from "@/registry/card/examples/content-card";
import ListingCardExample from "@/registry/card/examples/listing-card";
import PricingPairExample from "@/registry/card/examples/pricing-pair";

/**
 * Docs preview for Card. Composes the three individually-addressable examples
 * under examples/ rather than duplicating their JSX — this file is the "show me
 * everything" overview used where a single representative render is needed (e.g.
 * a homepage-style full preview); the docs site's per-example grid and detail
 * pages render examples/*.tsx directly instead.
 */
export default function CardDemo() {
  return (
    <div className="flex flex-col gap-10">
      <ContentCardExample />
      <ListingCardExample />
      <PricingPairExample />
    </div>
  );
}
