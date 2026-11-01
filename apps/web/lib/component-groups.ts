/**
 * Docs navigation is a flat set of public-facing groups. Registry blocks stay in
 * the Blocks group until they are explicitly assigned to a dedicated top-level group.
 */
export type ComponentGroupId =
  | "components"
  | "heroes"
  | "media"
  | "controls"
  | "text"
  | "backgrounds"
  | "illustrations"
  | "charts"
  | "carousels"
  | "card-stacks"
  | "grids"
  | "blocks"
  | "templates";

export const GROUP_ORDER: ComponentGroupId[] = [
  "components",
  "heroes",
  "media",
  "controls",
  "text",
  "backgrounds",
  "illustrations",
  "charts",
  "carousels",
  "card-stacks",
  "grids",
  "blocks",
  "templates",
];

export const GROUP_LABELS: Record<ComponentGroupId, string> = {
  components: "Components",
  heroes: "Heroes",
  media: "Media",
  controls: "Controls",
  text: "Text",
  backgrounds: "Backgrounds",
  illustrations: "Illustrations",
  charts: "Charts",
  carousels: "Carousels",
  "card-stacks": "Card stacks",
  grids: "Grids",
  blocks: "Blocks",
  templates: "Templates",
};

export const SUBGROUP_ORDER: Record<ComponentGroupId, string[]> = {
  components: [
    "ai-components",
    "cards",
    "data-display",
    "navigation",
    "buttons",
    "form-controls",
    "feedback",
  ],
  heroes: [],
  media: [],
  controls: [],
  text: [],
  backgrounds: [],
  illustrations: [],
  charts: [],
  carousels: [],
  "card-stacks": [],
  grids: [],
  blocks: [],
  templates: [],
};

const COMPONENT_SUBGROUP_LABELS: Record<string, string> = {
  "ai-components": "AI",
  cards: "Cards",
  "data-display": "Data display",
  navigation: "Navigation",
  buttons: "Buttons",
  "form-controls": "Form controls",
  feedback: "Feedback",
};

const FOUNDATION_SUBGROUP_BY_CATEGORY: Record<string, string> = {
  actions: "buttons",
  content: "cards",
  forms: "form-controls",
  overlays: "navigation",
};

export function groupFor(item: {
  name: string;
  type?: string;
  categories?: string[];
}): ComponentGroupId {
  return item.type === "registry:block" ? "blocks" : "components";
}

export function subgroupFor(item: {
  name: string;
  type?: string;
  categories?: string[];
}): string {
  if (groupFor(item) !== "components") return "";
  if (item.categories?.[0] === "ai-assisted") return "ai-components";
  return FOUNDATION_SUBGROUP_BY_CATEGORY[item.categories?.[0] ?? ""] ?? "cards";
}

export function subgroupLabel(group: ComponentGroupId, subgroup: string): string {
  if (group !== "components") return GROUP_LABELS[group];
  return COMPONENT_SUBGROUP_LABELS[subgroup] ?? "Other";
}
