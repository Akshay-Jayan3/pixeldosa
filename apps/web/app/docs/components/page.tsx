import type { Metadata } from "next";
import Link from "next/link";

import { ComponentThumbnail } from "@/components/component-thumbnail";
import { Card } from "@/registry/card/card";
import { CopyIconButton } from "@/components/copy-icon-button";
import {
  GROUP_LABELS,
  GROUP_ORDER,
  groupFor,
  subgroupFor,
  subgroupLabel,
} from "@/lib/component-groups";
import { getNewComponents } from "@/lib/changelog";
import { getComponentDoc } from "@/lib/docs";
import { getComponents, installCommand, isPro, type RegistryItem } from "@/lib/registry";
import { SketchRule } from "@/components/sketch";

export const metadata: Metadata = {
  title: "Components",
  description: "Every PixelDosa UI component, browsable with a live preview.",
};

/**
 * The docs page's one-line frontmatter description, not the registry description. The
 * registry text is written for install tooling and coding agents, often a full paragraph
 * with prop names in backticks, which reads as a wall of docs inside a thumbnail card.
 */
function summaryFor(item: RegistryItem) {
  return getComponentDoc(item.name)?.frontmatter.description || item.description;
}

function ComponentCard({
  item,
  category,
  isNew,
}: {
  item: RegistryItem;
  category: string;
  isNew: boolean;
}) {
  return (
    <Link
      href={`/docs/components/${item.name}`}
      className="group block rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
    >
      <Card
        variant="showcase"
        className="h-full transition-colors duration-(--pd-duration-instant) group-hover:border-foreground/25"
      >
        <div className="relative p-1.5">
          <ComponentThumbnail
            name={item.name}
            title={item.title}
            className="aspect-[16/10] rounded-lg border"
          />
          <span className="absolute left-3 top-3 rounded-full border bg-background/90 px-2 py-0.5 text-xs text-muted-foreground backdrop-blur-sm">
            {category}
          </span>
          {isPro(item) ? (
            <span className="absolute right-3 top-3 rounded-full border border-primary/30 bg-background/90 px-2 py-0.5 text-xs font-medium text-primary backdrop-blur-sm">
                Pro
              </span>
            ) : null}
        </div>
        <div className="flex min-w-0 items-center justify-between gap-3 px-4 pb-4 pt-2">
          <div className="min-w-0">
            <h3 className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
              <span className="truncate">{item.title}</span>
              {isNew ? (
                <span className="shrink-0 rounded-sm border px-1 text-[0.625rem] font-medium uppercase leading-4 tracking-wide text-muted-foreground">
                  New
                </span>
              ) : null}
            </h3>
            <p className="truncate text-sm text-muted-foreground">{summaryFor(item)}</p>
          </div>
          <CopyIconButton
            text={installCommand(item.name)}
            label={`Copy install command for ${item.title}`}
            className="size-9 rounded-full"
          />
        </div>
      </Card>
    </Link>
  );
}

export default function ComponentsIndexPage() {
  const components = getComponents();
  const recent = getNewComponents();
  const sections = GROUP_ORDER.map((group) => ({
    id: group,
    label: GROUP_LABELS[group],
    items: components.filter((item) => groupFor(item) === group),
  }));

  return (
    <div className="mx-auto w-full max-w-screen-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">Components</h1>
      <SketchRule className="mt-2" />
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
              <span className="tabular-nums tracking-normal text-muted-foreground">{section.items.length}</span>
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => (
                <ComponentCard
                  key={item.name}
                  item={item}
                  category={subgroupLabel(groupFor(item), subgroupFor(item))}
                  isNew={recent.has(item.name)}
                />
              ))}
            </div>
          </section>
        )
      )}
    </div>
  );
}
