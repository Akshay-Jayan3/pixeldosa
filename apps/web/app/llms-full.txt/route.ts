import { buildAgentMarkdown, getAgentGuide, getComponentDoc } from "@/lib/docs";
import { getComponents, installCommand } from "@/lib/registry";
import { groupFor } from "@/lib/component-groups";

export const dynamic = "force-static";

/** Every component's agent markdown in one file, Blocks first, after the usage rules. */
export function GET() {
  const items = [...getComponents()].sort((a, b) =>
    groupFor(a) === "blocks" && groupFor(b) !== "blocks" ? -1 : 0
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
