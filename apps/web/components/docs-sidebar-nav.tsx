"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type SidebarExample = { slug: string; title: string };
type SidebarItem = { name: string; title: string; isNew?: boolean; isPro?: boolean; examples: SidebarExample[] };

/** Quiet by design: a sidebar with ten loud badges stops meaning anything. */
function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="shrink-0 rounded-sm border border-border px-1 text-[0.625rem] font-medium uppercase leading-4 tracking-wide text-muted-foreground">
      {children}
    </span>
  );
}

function ItemBadges({ item }: { item: SidebarItem }) {
  return (
    <>
      {item.isPro ? <Badge>Pro</Badge> : null}
      {item.isNew ? <Badge>New</Badge> : null}
    </>
  );
}
export type SidebarCategory = {
  id: string;
  label: string;
  items: SidebarItem[];
};

export type SidebarGroup = {
  id: string;
  label: string;
  categories: SidebarCategory[];
  emptyMessage?: string;
};

function ChevronIcon({ direction = "down" }: { direction?: "down" | "right" | "group" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn(
        "size-3.5 shrink-0 transition-transform duration-(--pd-duration-instant)",
        direction === "right"
          ? "-rotate-90 group-open/category:rotate-0"
          : direction === "group"
            ? "group-open/group:rotate-180"
            : "group-open/example:rotate-180"
      )}
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
        "block rounded-md px-3 py-1.5 text-sm transition-colors duration-(--pd-duration-instant)",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-accent-foreground"
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

  return (
    <>
      <div className="space-y-0.5 text-sm">
        <NavLink href="/docs" active={pathname === "/docs"}>
          Getting started
        </NavLink>
        <NavLink href="/docs/ai" active={pathname === "/docs/ai"}>
          Build with AI
        </NavLink>
        <NavLink
          href="/docs/components"
          active={pathname === "/docs/components"}
        >
          Library
        </NavLink>
        <NavLink href="/changelog" active={pathname === "/changelog"}>
          Changelog
        </NavLink>
      </div>

      {groups.map((group) => (
        <section key={group.id} className="mt-4">
          <details open className="group/group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-foreground hover:bg-muted/60 [&::-webkit-details-marker]:hidden">
              <span className="flex min-w-0 items-center gap-2">
                <span aria-hidden="true" className="text-muted-foreground">
                  {group.id === "components" ? (
                    <svg viewBox="0 0 16 16" fill="currentColor" className="size-3.5">
                      <path d="M2 2h4.5v4.5H2zM9.5 2H14v4.5H9.5zM2 9.5h4.5V14H2zM9.5 9.5H14V14H9.5z" />
                    </svg>
                  ) : group.id === "sections" ? (
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-3.5">
                      <path d="m8 1.75 6 3.1-6 3.1-6-3.1 6-3.1Z" />
                      <path d="m2 7.8 6 3.1 6-3.1M2 10.75l6 3.1 6-3.1" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-3.5">
                      <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
                      <path d="M2 5.5h12M5 5.5v8" />
                    </svg>
                  )}
                </span>
                <h2 id={`sidebar-${group.id}`} className="truncate">
                  {group.label}
                </h2>
              </span>
              <ChevronIcon direction="group" />
            </summary>

            <ul className="mt-0.5 space-y-0.5">
              {group.categories.map((category) => {
                const categoryActive = category.items.some((item) => {
                  const href = `/docs/components/${item.name}`;

                  return (
                    pathname === href ||
                    pathname.startsWith(`${href}/`)
                  );
                });

                return (
                  <li key={category.id}>
                    <details
                      open={categoryActive}
                      className="group/category"
                    >
                      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted/60 [&::-webkit-details-marker]:hidden">
                        <ChevronIcon direction="right" />
                        <span className="truncate">{category.label}</span>
                      </summary>

                      <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-border/70 pl-2">
                        {category.items.map((item) => {
                          const href = `/docs/components/${item.name}`;
                          const active =
                            pathname === href ||
                            pathname.startsWith(`${href}/`);

                          return (
                            <li key={item.name}>
                              <Link
                                href={href}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                  "flex items-center justify-between gap-2 rounded-md py-1.5 pl-2 pr-1 text-sm transition-colors duration-(--pd-duration-instant)",
                                  active
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground hover:text-accent-foreground"
                                )}
                              >
                                <span>{item.title}</span>

                                {item.isNew || item.isPro ? (
                                  <span className="flex shrink-0 items-center gap-1.5">
                                    <ItemBadges item={item} />
                                  </span>
                                ) : null}
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

            {group.emptyMessage ? (
              <p className="px-2 py-1 text-xs text-muted-foreground">
                {group.emptyMessage}
              </p>
            ) : null}
          </details>
        </section>
      ))}
    </>
  );
}
