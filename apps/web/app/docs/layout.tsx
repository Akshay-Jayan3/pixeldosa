import { DocsSidebarNav, type SidebarGroup } from "@/components/docs-sidebar-nav";
import { demoExamples } from "@/components/registry-demos";
import { GROUP_LABELS, GROUP_ORDER, groupFor, isFoundation } from "@/lib/component-groups";
import { getComponents } from "@/lib/registry";

/**
 * Navigation reads directly from the registry, so a new component appears without a
 * separate nav config. Foundation primitives (Button, Card, Field, Overlay) are
 * filtered out here rather than deleted — they still ship and are still composed
 * internally by the AI tier, they just aren't the story this site tells. They stay
 * reachable by URL and through "Browse all".
 *
 * Data is resolved here (a server component, so it can read the filesystem via
 * lib/registry) and handed to DocsSidebarNav as plain props, since that component
 * needs `usePathname` for active-state highlighting and must run on the client.
 */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const items = getComponents()
    .filter((item) => !isFoundation(item))
    .map((item) => ({
      name: item.name,
      title: item.title,
      group: groupFor(item),
      examples: (demoExamples[item.name] ?? []).map((example) => ({
        slug: example.slug,
        title: example.title,
      })),
    }));

  const groups: SidebarGroup[] = GROUP_ORDER.map((id) => ({
    id,
    label: GROUP_LABELS[id],
    items: items.filter((item) => item.group === id),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="flex">
      <aside className="hidden w-52 shrink-0 border-r border-border md:block">
        <nav className="sticky top-14 h-[calc(100svh-3.5rem)] overflow-y-auto p-3">
          <DocsSidebarNav groups={groups} />
        </nav>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-10 sm:px-6 lg:px-10">{children}</main>
    </div>
  );
}
