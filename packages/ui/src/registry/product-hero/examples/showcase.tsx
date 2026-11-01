import { ProductHero } from "@/registry/product-hero/product-hero";

export default function ShowcaseProductHeroDemo() {
  return (
    <ProductHero
      eyebrow="One view. The whole launch."
      title="From first draft to shipped."
      description="Keep the plan, the people, and the details together while the work moves forward."
      variant="showcase"
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
          aria-label="Wide product preview showing a project timeline and status"
          className="grid min-h-56 grid-cols-3 gap-3 rounded-xl border border-border bg-card p-4 shadow-lg sm:min-h-72 sm:gap-5 sm:p-6"
        >
          <div className="col-span-3 flex items-center justify-between border-b pb-3">
            <div className="h-3 w-1/3 rounded-full bg-muted-foreground/30" />
            <div className="h-6 w-20 rounded-full bg-primary/10" />
          </div>
          <div className="space-y-3">
            <div className="h-16 rounded-lg border bg-muted/50" />
            <div className="h-10 rounded-lg border bg-background" />
          </div>
          <div className="space-y-3">
            <div className="h-10 rounded-lg border bg-background" />
            <div className="h-16 rounded-lg border bg-primary/10" />
          </div>
          <div className="space-y-3">
            <div className="h-16 rounded-lg border bg-muted/50" />
            <div className="h-10 rounded-lg border bg-background" />
          </div>
        </div>
      }
    />
  );
}
