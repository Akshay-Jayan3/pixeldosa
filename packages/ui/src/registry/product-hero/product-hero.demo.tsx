import { ProductHero } from "@/registry/product-hero/product-hero";
import { ProductPreview } from "@/registry/product-hero/examples/product-preview";

export default function ProductHeroDemo() {
  return (
    <ProductHero
      eyebrow="A clearer way to plan"
      title="Bring every project into focus."
      description="Give your team one shared place to make plans, track progress, and move good ideas forward."
      variant="centered"
      actions={
        <>
          <a
            href="#get-started"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            Get started
          </a>
          <a
            href="#product-preview"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            Explore the product
          </a>
        </>
      }
      visual={<ProductPreview />}
    />
  );
}
