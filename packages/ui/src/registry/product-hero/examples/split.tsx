import { ProductHero } from "@/registry/product-hero/product-hero";

export default function SplitProductHeroDemo() {
  return (
    <ProductHero
      eyebrow="The workspace for focused teams"
      title="Make your best work easier to find."
      description="Bring your team's projects, decisions, and next steps into one calm workspace."
      variant="split"
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
          aria-label="Project workspace preview with a navigation rail and active tasks"
          className="grid min-h-56 grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] overflow-hidden rounded-xl border border-border bg-card shadow-lg sm:min-h-72"
        >
          <div className="space-y-4 border-r border-border p-4">
            <div className="h-3 w-2/3 rounded-full bg-muted" />
            <div className="h-8 rounded-md bg-primary/10" />
            <div className="h-8 rounded-md bg-muted/70" />
            <div className="h-8 rounded-md bg-muted/70" />
          </div>
          <div className="space-y-4 p-4">
            <div className="h-3 w-1/3 rounded-full bg-muted-foreground/30" />
            <div className="h-20 rounded-lg border bg-background" />
            <div className="h-16 rounded-lg border bg-muted/50" />
          </div>
        </div>
      }
    />
  );
}
