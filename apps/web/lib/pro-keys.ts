import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

const digest = (value: string) => createHash("sha256").update(value).digest();

/**
 * Whether a licence key unlocks Pro installs.
 *
 * For now keys are issued by hand and listed in `PIXELDOSA_PRO_KEYS`, comma-separated.
 * Digests are compared rather than the keys, so every comparison takes the same time
 * whatever the key's length, and every listed key is compared so the position of a match
 * doesn't show either. Keys are never logged. With the variable unset, every key is
 * refused. Async so a payment provider's validation can slot in without touching the route.
 */
export async function isValidProKey(key: string): Promise<boolean> {
  const candidate = digest(key);
  let valid = false;

  for (const listed of (process.env.PIXELDOSA_PRO_KEYS ?? "").split(",")) {
    const trimmed = listed.trim();
    if (trimmed && timingSafeEqual(digest(trimmed), candidate)) valid = true;
  }

  return valid;
}
