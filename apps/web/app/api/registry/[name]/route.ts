import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { SITE_URL } from "@/lib/docs";
import { isValidProKey } from "@/lib/pro-keys";

/**
 * The Pro registry. A buyer's components.json points `@pixeldosa-pro` here and sends their
 * licence key as a bearer token, which shadcn reads from `PIXELDOSA_PRO_KEY` in their env.
 *
 * The key is checked on every request and before the name is looked up, so without one
 * every name gets the same 401. Every response is `private, no-store`, so no cache between
 * here and the buyer ever holds Pro source.
 */
export const dynamic = "force-dynamic";

const PRO_DIR = join(process.cwd(), ".registry-pro");
const NO_STORE = { "Cache-Control": "private, no-store" };

/** The shadcn CLI prints `[error] message`, so both are set. */
function error(status: number, code: string, message: string) {
  return Response.json(
    { error: code, message: `${message} Setup: ${SITE_URL}/llms.txt` },
    { status, headers: NO_STORE }
  );
}

export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const slug = name.replace(/\.json$/, "");
  if (!/^[a-z0-9-]+$/.test(slug)) return error(404, "Not found", "No such Pro component.");

  const key = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (!key) {
    return error(401, "Licence key missing", "This is a PixelDosa UI Pro component, so it needs a licence key.");
  }
  if (!(await isValidProKey(key))) {
    return error(403, "Invalid licence key", "That PixelDosa UI Pro licence key isn't valid.");
  }

  try {
    const item = await readFile(join(PRO_DIR, `${slug}.json`), "utf8");
    return new Response(item, {
      headers: { ...NO_STORE, "Content-Type": "application/json; charset=utf-8" },
    });
  } catch {
    return error(404, "Not found", `No Pro component is called "${slug}".`);
  }
}
