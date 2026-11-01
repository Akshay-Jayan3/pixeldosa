import { ProductHero } from "@/registry/product-hero/product-hero";

export default function CenteredProductHeroDemo() {
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
          aria-label="Project workspace preview with a shared project plan"
          className="mx-auto grid max-w-3xl grid-cols-3 gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-md sm:gap-5 sm:p-6"
        >
          <div className="col-span-3 h-3 w-1/3 rounded-full bg-muted-foreground/30" />
          <div className="h-20 rounded-lg border bg-muted/50 sm:h-28" />
          <div className="h-20 rounded-lg border bg-primary/10 sm:h-28" />
          <div className="h-20 rounded-lg border bg-muted/50 sm:h-28" />
        </div>
      }
    />
  );
}
