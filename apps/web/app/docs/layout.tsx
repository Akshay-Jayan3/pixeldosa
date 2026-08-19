import { DocsSidebarNav } from "@/components/docs-sidebar-nav";
import { demoExamples } from "@/components/registry-demos";
import { PILLARS, getComponentsByPillar } from "@/lib/registry";

/**
 * Navigation is grouped by `meta.pillar` (Section 7), read from the registry
 * items themselves — so a new component appears in the sidebar as soon as its
 * registry item declares a pillar, with no separate nav config to keep in sync.
 * Data is resolved here (a server component, so it can read the filesystem via
 * lib/registry) and handed to DocsSidebarNav as plain props, since that component
 * needs `usePathname` for active-state highlighting and must run on the client.
 */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pillars = PILLARS.map((pillar) => ({
    id: pillar.id,
    label: pillar.label,
    items: getComponentsByPillar(pillar.id).map((item) => ({
      name: item.name,
      title: item.title,
      count: demoExamples[item.name]?.length ?? 1,
    })),
  }));

  return (
    <div className="flex">
      <aside className="hidden w-52 shrink-0 border-r border-border md:block">
        <nav className="sticky top-14 h-[calc(100svh-3.5rem)] overflow-y-auto p-3">
          <DocsSidebarNav pillars={pillars} />
        </nav>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-10 sm:px-6 lg:px-10">{children}</main>
    </div>
  );
}
