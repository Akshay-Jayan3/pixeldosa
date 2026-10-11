import { DocsSidebarNav, type SidebarGroup } from "@/components/docs-sidebar-nav";
import { demoExamples } from "@/components/registry-demos";
import {
  GROUP_LABELS,
  GROUP_ORDER,
  groupFor,
  subgroupFor,
  subgroupLabel,
  SUBGROUP_ORDER,
} from "@/lib/component-groups";
import { getNewComponents } from "@/lib/changelog";
import { getComponents, isPro } from "@/lib/registry";

/**
 * Navigation reads directly from the registry. Small editorial subgroups make the
 * growing collection browseable while empty catalog groups signal what's next.
 *
 * Data is resolved here (a server component, so it can read the filesystem via
 * lib/registry) and handed to DocsSidebarNav as plain props, since that component
 * needs `usePathname` for active-state highlighting and must run on the client.
 */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const recent = getNewComponents();
  const items = getComponents()
    .map((item) => ({
      name: item.name,
      title: item.title,
      isNew: recent.has(item.name),
      isPro: isPro(item),
      group: groupFor(item),
      subgroup: subgroupFor(item),
      examples: (demoExamples[item.name] ?? []).map((example) => ({
        slug: example.slug,
        title: example.title,
      })),
    }));

  const groups: SidebarGroup[] = GROUP_ORDER.map((id) => {
    const groupItems = items.filter((item) => item.group === id);
    return {
      id,
      label: GROUP_LABELS[id],
      categories: SUBGROUP_ORDER[id]
        .map((subgroup) => ({
          id: subgroup,
          label: subgroupLabel(id, subgroup),
          items: groupItems.filter((item) => item.subgroup === subgroup),
        }))
        .filter((category) => category.items.length > 0),
      emptyMessage:
        id === "sections" && !groupItems.some((item) => item.subgroup === "sections")
          ? "More sections are coming soon."
          : id === "templates" && groupItems.length === 0
            ? "Templates are coming soon."
            : undefined,
    };
  }).filter((group) => group.categories.length > 0 || group.emptyMessage);

  return (
    <div className="flex">
      <aside aria-label="Docs sidebar" className="hidden w-52 shrink-0 border-r border-border md:block">
        <nav aria-label="Docs" className="sticky top-14 h-[calc(100svh-3.5rem)] overflow-y-auto p-3">
          <DocsSidebarNav groups={groups} />
        </nav>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-10 sm:px-6 lg:px-10">{children}</main>
    </div>
  );
}
