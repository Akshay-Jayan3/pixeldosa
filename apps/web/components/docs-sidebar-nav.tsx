"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type SidebarItem = { name: string; title: string; count: number };
type SidebarPillar = { id: string; label: string; items: SidebarItem[] };

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
      className={cn(
        "block rounded-md px-3 py-2 text-sm transition-colors duration-[var(--pd-duration-instant)]",
        active
          ? "text-accent-foreground"
          : "text-foreground/40 hover:text-accent-foreground"
      )}
    >
      {children}
    </Link>
  );
}

/**
 * Client component because it needs `usePathname` for active-state highlighting.
 * Data (pillars/items/counts) is computed server-side in DocsLayout — this file
 * cannot import lib/registry itself, since that module is `server-only` and reads
 * the filesystem.
 */
export function DocsSidebarNav({ pillars }: { pillars: SidebarPillar[] }) {
  const pathname = usePathname();

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

      <div className="mt-6 space-y-4">
        {pillars.map((pillar) => (
          <details key={pillar.id} open className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground [&::-webkit-details-marker]:hidden">
              {pillar.label}
              <ChevronIcon />
            </summary>

            <div className="mt-1">
              {pillar.items.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground/70">Coming soon</p>
              ) : (
                <ul className="space-y-0.5">
                  {pillar.items.map((item) => {
                    const href = `/docs/components/${item.name}`;
                    return (
                      <li key={item.name}>
                        <Link
                          href={href}
                          className={cn(
                            "flex items-center justify-between gap-2 rounded-md pl-2 pr-1 py-1.5 text-sm transition-colors duration-[var(--pd-duration-instant)]",
                            pathname === href
                              ? "text-accent-foreground"
                              : "text-foreground/40 hover:text-accent-foreground"
                          )}
                        >
                          <span>{item.title}</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {item.count}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
