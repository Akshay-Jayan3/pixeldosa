export function ProductPreview() {
  return (
    <div
      role="img"
      aria-label="Illustration of a project workspace with active tasks and team updates"
      className="overflow-hidden rounded-xl border border-border bg-card shadow-lg"
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <div className="ml-3 h-2 w-28 rounded-full bg-muted" />
      </div>
      <div className="grid min-h-56 grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] sm:min-h-72">
        <div className="space-y-4 border-r border-border p-4 sm:p-6">
          <div className="h-3 w-2/3 rounded-full bg-muted" />
          <div className="space-y-3">
            <div className="h-8 rounded-md bg-primary/10" />
            <div className="h-8 rounded-md bg-muted/70" />
            <div className="h-8 rounded-md bg-muted/70" />
          </div>
        </div>
        <div className="space-y-4 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="h-3 w-1/3 rounded-full bg-muted-foreground/30" />
            <div className="size-7 rounded-full bg-primary/15" />
          </div>
          <div className="space-y-3">
            <div className="rounded-lg border border-border p-3">
              <div className="h-2.5 w-2/3 rounded-full bg-muted-foreground/30" />
              <div className="mt-3 h-2 w-full rounded-full bg-muted" />
              <div className="mt-2 h-2 w-3/4 rounded-full bg-muted" />
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="h-2.5 w-1/2 rounded-full bg-muted-foreground/30" />
              <div className="mt-3 flex gap-2">
                <span className="h-5 w-12 rounded-full bg-primary/10" />
                <span className="h-5 w-16 rounded-full bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
