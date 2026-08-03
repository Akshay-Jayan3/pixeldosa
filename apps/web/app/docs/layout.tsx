import Link from "next/link";

import { PILLARS, getComponentsByPillar } from "@/lib/registry";

/**
 * Navigation is grouped by `meta.pillar` (Section 7), read from the registry
 * items themselves — so a new component appears in the sidebar as soon as its
 * registry item declares a pillar, with no separate nav config to keep in sync.
 */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-6xl gap-10 px-4 py-10 sm:px-6">
      <aside className="hidden w-56 shrink-0 md:block">
        <nav className="sticky top-24 space-y-6">
          <div>
            <Link
              href="/docs"
              className="text-sm font-medium text-foreground hover:text-primary"
            >
              Getting started
            </Link>
          </div>

          {PILLARS.map((pillar) => {
            const items = getComponentsByPillar(pillar.id);
            return (
              <div key={pillar.id}>
                <h2 className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {pillar.label}
                </h2>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground/70">Coming soon</p>
                ) : (
                  <ul className="space-y-1">
                    {items.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={`/docs/components/${item.name}`}
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
