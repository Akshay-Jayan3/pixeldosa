/**
 * Fails the build if Pro component source reached anything the public can download.
 *
 * Pro source is meant to leave this repo only through `/api/registry/[name]`, which checks
 * a licence key. Everything else the site produces is public: `public/` is served as-is,
 * and the pre-rendered pages and route outputs under `.next/server/app` (docs pages, llms
 * files) are what visitors and agents read. One missed filter in any of them would
 * publish Pro code, so this reads them back after `next build` and looks for it.
 *
 * It looks for code-only lines from each Pro component file: 40+ characters, no quotes,
 * backslashes or `<`. Rendered copy and markup can't produce a line like that by accident,
 * and the escaping a line goes through on its way into JSON, HTML or an RSC payload is
 * undone before matching, so it can't hide one either. Compiled client code in
 * `.next/static` is expected (it renders the previews) and minified past recognition, so
 * it isn't scanned.
 *
 * `--probe <free-item>` treats a free component as Pro, so the check must fail: its source
 * is in its public registry file, and its demo, fingerprinted too in this mode only, is in
 * the Code tab of its docs page. That proves the scan finds both raw and rendered source.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, "..");
const repoRoot = resolve(webRoot, "../..");

type Item = { name: string; files?: { path: string }[] };

const probeAt = process.argv.indexOf("--probe");
const probe = probeAt === -1 ? undefined : process.argv[probeAt + 1];

const subdirs = (root: string) =>
  existsSync(root)
    ? readdirSync(root, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => join(root, entry.name))
    : [];

const itemDirs = probe
  ? [resolve(repoRoot, "packages/ui/src/registry", probe)]
  : subdirs(resolve(repoRoot, "packages/ui/src/registry-pro"));

const items: Item[] = itemDirs
  .map((dir) => join(dir, "registry-item.json"))
  .filter((path) => existsSync(path))
  .map((path) => JSON.parse(readFileSync(path, "utf8")) as Item);

if (items.length === 0) {
  console.log("pro leak check → no Pro items, nothing to check");
  process.exit(0);
}

const CODE = /\b(const|let|function|return|if|for|await|use[A-Z]\w*)\b|=>/;

function fingerprints(source: string): string[] {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 40 && CODE.test(line))
    .filter((line) => !/["'`\\<]/.test(line))
    .filter((line) => !/^(import|export \{|\/\/|\/\*|\*)/.test(line));
}

/**
 * A line a free component also has is published anyway, so finding it proves nothing
 * about Pro and would only fail the deploy for nothing. Generic lines like
 * `onChange={(event) => setDraft(event.target.value)}` recur across components.
 */
const freeLines = new Set(
  probe
    ? []
    : [...files(resolve(repoRoot, "packages/ui/src/registry"), new Set([".tsx", ".ts"]))].flatMap((path) =>
        readFileSync(path, "utf8")
          .split(/\r?\n/)
          .map((line) => line.trim())
      )
);

const problems: string[] = [];
const prints: { item: string; line: string }[] = [];

for (const item of items) {
  // A Pro item published as a registry file is the leak this whole setup exists to stop.
  if (!probe && existsSync(resolve(webRoot, "public/r", `${item.name}.json`))) {
    problems.push(`${item.name}: public/r/${item.name}.json exists`);
  }

  const sources = (item.files ?? []).map((file) => resolve(webRoot, file.path));
  if (probe) sources.push(resolve(repoRoot, "packages/ui/src/registry", item.name, `${item.name}.demo.tsx`));

  const lines = sources
    .filter((path) => existsSync(path))
    .flatMap((path) => fingerprints(readFileSync(path, "utf8")))
    .filter((line) => !freeLines.has(line));

  if (lines.length === 0) {
    console.warn(`pro leak check → ${item.name}: no line long enough to fingerprint; only the file check covers it`);
  }
  for (const line of lines) prints.push({ item: item.name, line });
}

/** Undo JSON, RSC and HTML escaping, so text reads as the source it came from. */
function decode(text: string): string {
  return text
    .replace(/\\+u([0-9a-fA-F]{4})/g, (_match, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\\/g, "");
}

const TEXT = new Set([".json", ".txt", ".md", ".html", ".rsc", ".body", ".meta", ".xml", ".css", ".js", ".svg"]);

function* files(root: string, extensions: Set<string>): Generator<string> {
  if (!existsSync(root)) return;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) yield* files(path, extensions);
    else if (extensions.has(extname(entry.name)) && !entry.name.endsWith(".nft.json")) yield path;
  }
}

const serverApp = resolve(webRoot, ".next/server/app");
if (!existsSync(serverApp)) {
  console.warn("pro leak check → no .next build found; checking public/ only");
}

const scanned = [
  ...files(resolve(webRoot, "public"), TEXT),
  // Server bundles (.js) aren't served to anyone; the rendered outputs beside them are.
  ...files(serverApp, new Set([".html", ".rsc", ".body", ".txt", ".md", ".json", ".meta"])),
];

for (const path of scanned) {
  const raw = readFileSync(path, "utf8");
  const views = [decode(raw), decode(raw.replace(/<[^>]+>/g, ""))];

  for (const { item, line } of prints) {
    if (views.some((view) => view.includes(line))) {
      problems.push(`${item}: source found in ${relative(webRoot, path)} → ${line.slice(0, 80)}`);
      break;
    }
  }
}

if (problems.length > 0) {
  console.error(
    `${probe ? "Probe (a failure is expected here): " : ""}Pro source is publicly reachable:\n` +
      problems.map((problem) => `  - ${problem}`).join("\n")
  );
  process.exit(1);
}

console.log(
  `pro leak check → ${items.length} item(s), ${prints.length} fingerprint(s), ${scanned.length} file(s): clean`
);
