import { buildAgentMarkdown, getComponentDoc } from "@/lib/docs";
import { getComponents, getRegistryItem, installCommand } from "@/lib/registry";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getComponents().map((item) => ({ file: `${item.name}.md` }));
}

/** `/llms/<name>.md` — one component as agent-readable markdown. */
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const name = file.replace(/\.md$/, "");
  const item = getRegistryItem(name);

  if (!item) return new Response("Not found", { status: 404 });

  return new Response(buildAgentMarkdown(item, getComponentDoc(name), installCommand(name)), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
