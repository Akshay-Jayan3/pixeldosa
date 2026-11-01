import { ProductHero } from "@/registry/product-hero/product-hero";

export default function EditorialProductHeroDemo() {
  return (
    <ProductHero
      eyebrow="Built for considered work"
      title="Less noise around the work that matters."
      description="A thoughtful home for the plans and decisions that move your team forward."
      variant="editorial"
      actions={
        <>
          <a
            href="#get-started"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            Get started
          </a>
          <a
            href="#learn-more"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
          >
            Learn more
          </a>
        </>
      }
      visual={
        <div
          role="img"
          aria-label="Product proof card showing a project metric and team quote"
          className="rounded-xl border border-border bg-card p-6 shadow-md sm:p-8"
        >
          <p className="text-sm text-muted-foreground">Time returned to the team</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground">12 hrs</p>
          <div className="mt-6 h-px bg-border" />
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            “The whole team knows what matters next, without another status meeting.”
          </p>
          <p className="mt-4 text-sm font-medium text-foreground">A product team</p>
        </div>
      }
    />
  );
}
