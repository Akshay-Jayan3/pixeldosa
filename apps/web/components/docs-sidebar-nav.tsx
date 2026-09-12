"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type SidebarExample = { slug: string; title: string };
type SidebarItem = { name: string; title: string; examples: SidebarExample[] };
export type SidebarGroup = { id: string; label: string; items: SidebarItem[] };

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="size-3.5 shrink-0 transition-transform duration-[var(--pd-duration-instant)] group-open:rotate-180"
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "block rounded-md px-3 py-2 text-sm transition-colors duration-[var(--pd-duration-instant)]",
        active
          ? "bg-accent text-accent-foreground"
          : "text-foreground/40 hover:text-accent-foreground"
      )}
    >
      {children}
    </Link>
  );
}

/**
 * Client component because it needs `usePathname` for active-state highlighting.
 * Data (groups/items/examples) is computed server-side in DocsLayout — this file
 * cannot import lib/registry itself, since that module is `server-only` and reads
 * the filesystem.
 */
export function DocsSidebarNav({ groups }: { groups: SidebarGroup[] }) {
  const pathname = usePathname();
  const isExampleActive = (name: string, slug: string) =>
    pathname === `/docs/components/${name}/${slug}`;

  return (
    <>
      <div className="space-y-1 text-sm">
        <NavLink href="/docs" active={pathname === "/docs"}>
          Getting started
        </NavLink>
        <NavLink href="/docs/components" active={pathname === "/docs/components"}>
          Browse all
        </NavLink>
      </div>

      {groups.map((group) => (
        <div key={group.id} className="mt-6">
          <h2 className="px-2 pb-1.5 text-xs font-medium tracking-wide text-muted-foreground">
            {group.label}
          </h2>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const href = `/docs/components/${item.name}`;
              const hasMultipleExamples = item.examples.length > 1;
              const isComponentActive =
                pathname === href ||
                item.examples.some((example) => isExampleActive(item.name, example.slug));

              if (!hasMultipleExamples) {
                return (
                  <li key={item.name}>
                    <Link
                      href={href}
                      aria-current={isComponentActive ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-md py-1.5 pl-2 pr-1 text-sm transition-colors duration-[var(--pd-duration-instant)]",
                        isComponentActive
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground/40 hover:text-accent-foreground"
                      )}
                    >
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.name}>
                  <details open={isComponentActive} className="group/example">
                    <summary
                      className={cn(
                        "flex cursor-pointer list-none items-center justify-between gap-2 rounded-md py-1.5 pl-2 pr-1 text-sm transition-colors duration-[var(--pd-duration-instant)] [&::-webkit-details-marker]:hidden",
                        isComponentActive
                          ? "text-accent-foreground"
                          : "text-foreground/40 hover:text-accent-foreground"
                      )}
                    >
                      <span>{item.title}</span>
                      <ChevronIcon />
                    </summary>
                    <ul className="ml-2 mt-0.5 space-y-0.5 border-l border-border/70 pl-2">
                      <li>
                        <Link
                          href={href}
                          aria-current={pathname === href ? "page" : undefined}
                          className={cn(
                            "block rounded-md px-2 py-1.5 text-xs transition-colors duration-[var(--pd-duration-instant)]",
                            pathname === href
                              ? "bg-accent text-accent-foreground"
                              : "text-foreground/40 hover:text-accent-foreground"
                          )}
                        >
                          Overview
                        </Link>
                      </li>
                      {item.examples.map((example) => {
                        const exampleHref = `${href}/${example.slug}`;
                        const isActive = isExampleActive(item.name, example.slug);
                        return (
                          <li key={example.slug}>
                            <Link
                              href={exampleHref}
                              aria-current={isActive ? "page" : undefined}
                              className={cn(
                                "block rounded-md px-2 py-1.5 text-xs transition-colors duration-[var(--pd-duration-instant)]",
                                isActive
                                  ? "bg-accent text-accent-foreground"
                                  : "text-foreground/40 hover:text-accent-foreground"
                              )}
                            >
                              {example.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}
