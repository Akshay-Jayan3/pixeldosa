import type { Metadata } from "next";
import Link from "next/link";

import { ComponentThumbnail } from "@/components/component-thumbnail";
import { GROUP_LABELS, GROUP_ORDER, groupFor, isFoundation } from "@/lib/component-groups";
import { getComponentDoc } from "@/lib/docs";
import { getComponents, type RegistryItem } from "@/lib/registry";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Components",
  description: "Every PixelDosa component, browsable with a live preview.",
};

/**
 * The docs page's one-line frontmatter description, not the registry description. The
 * registry text is written for install tooling and coding agents, often a full paragraph
 * with prop names in backticks, which reads as a wall of docs inside a thumbnail card.
 */
function summaryFor(item: RegistryItem) {
  return getComponentDoc(item.name)?.frontmatter.description || item.description;
}

function ComponentCard({ item, wide }: { item: RegistryItem; wide: boolean }) {
  return (
    <Link
      href={`/docs/components/${item.name}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border bg-card outline-none transition-colors duration-[var(--pd-duration-instant)] ease-[var(--pd-ease-standard)] motion-reduce:transition-none hover:border-foreground/25 focus-visible:ring-[3px] focus-visible:ring-ring/40",
        wide && "sm:col-span-2"
      )}
    >
      <ComponentThumbnail name={item.name} tall={wide} />
      <div className="flex flex-col gap-1 border-t px-5 py-4">
        <h3 className="flex items-center gap-1.5 font-medium text-foreground">
          {item.title}
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5 -translate-x-1 text-muted-foreground opacity-0 transition-[opacity,transform] duration-[var(--pd-duration-fast)] ease-[var(--pd-ease-decelerate)] motion-reduce:transition-none group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
          >
            <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" />
          </svg>
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">{summaryFor(item)}</p>
      </div>
    </Link>
  );
}

export default function ComponentsIndexPage() {
  const components = getComponents();
  const sections = [
    ...GROUP_ORDER.map((group) => ({
      id: group,
      label: GROUP_LABELS[group],
      items: components.filter((item) => !isFoundation(item) && groupFor(item) === group),
    })),
    { id: "foundation", label: "Foundation", items: components.filter(isFoundation) },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-semibold tracking-tight">Components</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground text-pretty">
        Every shipped component, previewed from its real demo. Open one for the install
        command, usage, props and engineering notes.
      </p>

      {sections.map((section) =>
        section.items.length === 0 ? null : (
          <section key={section.id} className="mt-12" aria-labelledby={`group-${section.id}`}>
            <h2
              id={`group-${section.id}`}
              className="flex items-baseline gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground"
            >
              {section.label}
              <span className="tabular-nums tracking-normal text-muted-foreground/60">{section.items.length}</span>
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {section.items.map((item) => (
                <ComponentCard key={item.name} item={item} wide={section.id === "blocks"} />
              ))}
            </div>
          </section>
        )
      )}
    </div>
  );
}
