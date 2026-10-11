import { buildAgentMarkdown, getAgentGuide, getComponentDoc } from "@/lib/docs";
import { getComponents, installCommand } from "@/lib/registry";
import { GROUP_ORDER, groupFor } from "@/lib/component-groups";

export const dynamic = "force-static";

/** Every component's agent markdown in one file, following the public catalogue order. */
export function GET() {
  const items = [...getComponents()].sort(
    (a, b) =>
      GROUP_ORDER.indexOf(groupFor(a)) - GROUP_ORDER.indexOf(groupFor(b))
  );

  const body = [
    getAgentGuide(),
    "",
    ...items.flatMap((item) => [
      "",
      "---",
      "",
      buildAgentMarkdown(item, getComponentDoc(item.name), installCommand(item.name)),
    ]),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
