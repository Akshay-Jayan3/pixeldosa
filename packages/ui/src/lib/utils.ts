import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class lists, with later conflicting utilities winning.
 *
 * This is the standard shadcn `cn` helper and is intentionally identical to it:
 * PixelDosa components are installed into host projects that already have this
 * file at `@/lib/utils`, so diverging here would break every consumer.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
