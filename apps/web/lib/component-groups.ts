/**
 * Docs-site navigation grouping.
 *
 * The AI/foundation split is derived from each item's real `categories[0]`
 * (`ai-assisted`), not from a hand-kept list — so a new AI component can never be
 * accidentally omitted from the nav. The sub-grouping below is a docs-site concern
 * and deliberately lives here rather than in `registry-item.json`, which is published
 * to consumers and shouldn't carry our navigation opinions.
 */

export type ComponentGroupId = "ai" | "product";

export const GROUP_ORDER: ComponentGroupId[] = ["ai", "product"];

export const GROUP_LABELS: Record<ComponentGroupId, string> = {
  ai: "AI",
  product: "Product",
};

/**
 * Only components that are *not* `ai-assisted` need an entry here. Everything else
 * groups under "AI" automatically, so a new AI component can never be missed.
 *
 * A finer split (assisted input / review / trust / output) was tried and removed:
 * at nine components it fragmented a short list into four two-item groups, which made
 * the nav look longer and busier than the thing it was describing. Revisit only if the
 * AI list grows past roughly fifteen.
 */
const GROUP_BY_NAME: Record<string, ComponentGroupId> = {
  "command-menu": "product",
};

/**
 * Foundation primitives — Button, Card, Field, Overlay. Still shipped, still
 * installable, still composed internally by the AI tier; just not part of the docs
 * site's navigation, which is focused on the AI story. Their pages remain reachable
 * by URL and through "Browse all".
 */
export function isFoundation(item: { name: string; categories?: string[] }): boolean {
  if (GROUP_BY_NAME[item.name]) return false;
  return item.categories?.[0] !== "ai-assisted";
}

export function groupFor(item: { name: string; categories?: string[] }): ComponentGroupId {
  return GROUP_BY_NAME[item.name] ?? "ai";
}
