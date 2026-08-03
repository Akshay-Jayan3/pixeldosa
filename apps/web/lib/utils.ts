import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * The standard shadcn `cn` helper. It lives here as well as in `packages/ui`
 * because component source imports it as `@/lib/utils` — the path it will resolve
 * to in a consumer's project after `shadcn add`. Keeping the docs site on the same
 * alias means the previewed file and the installed file are byte-identical.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
