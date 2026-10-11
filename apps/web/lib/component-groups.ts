/**
 * Docs navigation follows the library's public-facing shape: reusable components,
 * composed sections/blocks, then templates. This taxonomy is docs-only and does not
 * affect registry metadata or install names.
 */
export type ComponentGroupId = "components" | "sections" | "templates";

export const GROUP_ORDER: ComponentGroupId[] = ["components", "sections", "templates"];

export const GROUP_LABELS: Record<ComponentGroupId, string> = {
  components: "Components",
  sections: "Sections & Blocks",
  templates: "Templates",
};

export const SUBGROUP_ORDER: Record<ComponentGroupId, string[]> = {
  components: [
    "ai-components",
    "cards",
    "data-display",
    "navigation",
    "inputs",
    "feedback",
  ],
  sections: ["sections", "blocks"],
  templates: [],
};

const SUBGROUP_LABELS: Record<ComponentGroupId, Record<string, string>> = {
  components: {
    "ai-components": "AI components",
    cards: "Cards",
    "data-display": "Data display",
    navigation: "Navigation",
    inputs: "Inputs",
    feedback: "Feedback",
  },
  sections: {
    sections: "Sections",
    blocks: "Blocks",
  },
  templates: {},
};

const FOUNDATION_SUBGROUP_BY_CATEGORY: Record<string, string> = {
  actions: "buttons",
  content: "cards",
  forms: "inputs",
  overlays: "navigation",
};

export function groupFor(item: {
  name: string;
  type?: string;
  categories?: string[];
}): ComponentGroupId {
  if (item.type === "registry:block") return "sections";
  return "components";
}

export function subgroupFor(item: {
  name: string;
  type?: string;
  categories?: string[];
}): string {
  const group = groupFor(item);

  if (group === "components" && item.categories?.[0] === "ai-assisted") {
    return "ai-components";
  }
  if (group === "components") {
    return FOUNDATION_SUBGROUP_BY_CATEGORY[item.categories?.[0] ?? ""] ?? "cards";
  }
  if (group === "sections") {
    return item.categories?.includes("marketing") || item.categories?.includes("section")
      ? "sections"
      : "blocks";
  }
  return "sections";
}

export function subgroupLabel(group: ComponentGroupId, subgroup: string): string {
  return SUBGROUP_LABELS[group][subgroup] ?? "Other";
}
