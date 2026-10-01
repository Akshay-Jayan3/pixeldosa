/**
 * Rewrites cross-component imports in the published registry output.
 *
 * Source files import a sibling component by its position in this repo:
 *
 *   import { AgentPresence } from "@/registry/agent-presence/agent-presence";
 *
 * That path does not exist in a consumer's project, where the same file has been
 * installed to `components/ui/agent-presence.tsx`. shadcn only rewrites imports that
 * match its own `registry/<style>/ui/<name>` layout; this repo uses
 * `registry/<name>/<name>`, so nothing was rewritten and every composed component
 * installed broken — Selection Actions, Live Status Line, AI Approval Gate and
 * Thinking Experience all shipped with an unresolvable import.
 *
 * This runs after `shadcn build` has inlined file contents into `public/r/*.json`,
 * and **fails the build** if any `@/registry/` path survives — so the class of bug
 * cannot come back silently.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * `--pro` processes the Pro output in `.registry-pro/`, where a component may also import
 * another Pro component. The free output never rewrites `@/registry-pro/`, so such an
 * import survives and fails the check below: free code can't reach into Pro.
 */
const pro = process.argv.includes("--pro");
const outDir = resolve(here, pro ? "../.registry-pro" : "../public/r");

/** `@/registry/<name>/<name>` → `@/components/ui/<name>`, where dir and file agree. */
const CROSS_COMPONENT = pro
  ? /@\/registry(?:-pro)?\/([a-z0-9-]+)\/\1(?=["'])/g
  : /@\/registry\/([a-z0-9-]+)\/\1(?=["'])/g;
const REPO_PATH = /@\/registry(?:-pro)?\//;

type RegistryFile = { path: string; target?: string; type: string; content?: string };
type Published = { name: string; files?: RegistryFile[] };

const files = readdirSync(outDir).filter((name) => name.endsWith(".json") && name !== "registry.json");

let rewritten = 0;
const leftovers: string[] = [];

for (const fileName of files) {
  const path = join(outDir, fileName);
  const item = JSON.parse(readFileSync(path, "utf8")) as Published;
  let changed = false;

  for (const file of item.files ?? []) {
    if (typeof file.content !== "string") continue;

    const next = file.content.replace(CROSS_COMPONENT, "@/components/ui/$1");
    if (next !== file.content) {
      file.content = next;
      changed = true;
      rewritten += 1;
    }

    // Anything still pointing into this repo's layout would 404 in a consumer project.
    if (REPO_PATH.test(file.content)) {
      const offending = file.content
        .split("\n")
        .filter((line) => REPO_PATH.test(line))
        .map((line) => line.trim());
      leftovers.push(`${item.name} → ${offending.join(" | ")}`);
    }
  }

  if (changed) writeFileSync(path, `${JSON.stringify(item, null, 2)}\n`, "utf8");
}

if (leftovers.length > 0) {
  console.error(
    "Registry postprocess failed — unresolvable imports would ship:\n" +
      leftovers.map((l) => `  - ${l}`).join("\n")
  );
  process.exit(1);
}

console.log(`registry postprocess → rewrote imports in ${rewritten} file(s)`);
