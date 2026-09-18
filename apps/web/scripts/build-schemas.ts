/**
 * Derives a machine-readable prop schema for every component from the TypeScript
 * source, and writes `apps/web/schemas.generated.json` for `build-registry.ts` to
 * fold into each item's `meta`.
 *
 * Why this exists: a component's props are already described precisely — in its types
 * and its JSDoc. But only the TypeScript compiler can read that. Anything else that
 * wants to drive these components (a coding agent, a generative-UI runtime, an A2UI
 * or AG-UI catalogue, an MCP server) has to be handed the same contract in a format
 * it can parse, or it guesses — and a guessed `state: "in_progress"` renders a grey
 * dot instead of failing loudly.
 *
 * Why it is generated rather than authored: 50-odd hand-written schemas would be
 * stale within a month, and a schema that disagrees with the component is worse than
 * no schema at all. This runs at registry build, so the contract is the code.
 *
 * Two deliberate limits:
 *
 * - Only the interface's **own** members are read, never what it inherits from
 *   `React.ComponentPropsWithoutRef<"section">`. The DOM attributes are real props,
 *   but they are not the component's design; listing 250 of them would bury the
 *   dozen that matter. The element being spread onto is recorded as `element`.
 * - Callbacks are pulled out into `events` rather than described as props, because
 *   no JSON format can carry a function. A runtime reads the parameter list and maps
 *   it onto however it sends interactions home. Nothing here names a protocol: the
 *   components stay pure React, and the adapters live outside them.
 */
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, "..");
const repoRoot = resolve(webRoot, "../..");
const registrySrc = resolve(repoRoot, "packages/ui/src/registry");

type JsonSchema = Record<string, unknown>;

type EventParam = { name: string; type: string };
type EventDef = {
  name: string;
  required: boolean;
  params: EventParam[];
  description?: string;
};

type ComponentSchema = {
  component: string;
  element?: string;
  props: JsonSchema;
  events: EventDef[];
};

type ItemSchema = {
  primary: string;
  components: Record<string, ComponentSchema>;
};

/** `ai-action-toolbar` → `AIActionToolbar`, matching the exported component names. */
const pascal = (dir: string) =>
  dir
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")
    .replace(/^Ai(?=[A-Z])/, "AI");

const dirs = readdirSync(registrySrc, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const sources = dirs
  .map((dir) => join(registrySrc, dir, `${dir}.tsx`))
  .filter((path) => existsSync(path));

const program = ts.createProgram(sources, {
  jsx: ts.JsxEmit.ReactJSX,
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: true,
  skipLibCheck: true,
  noEmit: true,
  baseUrl: resolve(repoRoot, "packages/ui/src"),
  paths: { "@/*": ["./*"] },
});

const checker = program.getTypeChecker();

const REACT_NODE = new Set(["ReactNode", "ReactElement", "ReactPortal", "JSX.Element"]);

/**
 * What a child can be, for a consumer that renders from JSON.
 *
 * React nodes are unions of a dozen things, and the first version of this flattened them
 * to `string` — which quietly made the catalogue unable to express a tree. Generation Job
 * takes its finished outputs as children, and those are Media Results, not text: a model
 * held to a string-only schema would emit the alt text where the picture goes.
 */
const UI_NODE: JsonSchema = {
  type: "object",
  description: "A nested component: a name from this catalogue, and the props to give it.",
  required: ["component"],
  properties: {
    component: {
      type: "string",
      description: 'The component\'s exported name, e.g. "MediaResult".',
    },
    props: {
      type: "object",
      description: "That component's own props, matching its entry in this catalogue.",
    },
  },
};

const docOf = (symbol: ts.Symbol | undefined): string | undefined => {
  if (!symbol) return undefined;
  const text = ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();
  return text.length > 0 ? text : undefined;
};

const typeName = (type: ts.Type): string | undefined =>
  type.aliasSymbol?.name ?? type.getSymbol()?.getName();

/**
 * A type declared outside this repo — React, the DOM lib, a dependency.
 *
 * These are never expanded. Walking into `HTMLAttributes` or a motion component's
 * props reaches thousands of members and, the first time this ran, exhausted the
 * heap. It is also the wrong output: a catalogue needs the shapes *this* design
 * system defines, and `React.CSSProperties` described member by member tells a
 * generating model nothing it can use.
 */
function isExternal(type: ts.Type): boolean {
  const symbol = type.aliasSymbol ?? type.getSymbol();
  const file = symbol?.declarations?.[0]?.getSourceFile().fileName;
  if (!file) return false;
  return file.includes("node_modules") || file.includes("/typescript/lib/");
}

const opaque = (type: ts.Type): JsonSchema => ({ "x-type": checker.typeToString(type) });

/** One conversion pass per component, so `$defs` names stay local and readable. */
function makeConverter() {
  const defs: Record<string, JsonSchema> = {};
  const started = new Set<string>();

  const isFunction = (type: ts.Type) =>
    // Non-nullable first: an optional `onStop?` is `fn | undefined`, and a union has
    // no call signatures of its own, so testing it directly missed every one.
    checker.getNonNullableType(type).getCallSignatures().length > 0 &&
    !checker.isArrayType(type);

  function convert(type: ts.Type, depth: number): JsonSchema {
    if (depth > 8) return {};

    const name = typeName(type);

    // Checked before the union branch: ReactNode *is* a union, and expanding it
    // produces noise no consumer can act on.
    if (name && REACT_NODE.has(name)) {
      defs.UINode = UI_NODE;
      const child = { anyOf: [{ type: "string" }, { $ref: "#/$defs/UINode" }] };
      return {
        anyOf: [{ type: "string" }, { $ref: "#/$defs/UINode" }, { type: "array", items: child }],
        "x-react": "ReactNode",
      };
    }

    const flags = type.getFlags();
    if (flags & ts.TypeFlags.BooleanLike) return { type: "boolean" };
    if (flags & ts.TypeFlags.StringLiteral) {
      return { const: (type as ts.StringLiteralType).value };
    }
    // Before NumberLike, which a literal also carries — `headingLevel: 2 | 3 | 4`
    // has to keep its values or the schema permits 7.
    if (flags & ts.TypeFlags.NumberLiteral) {
      return { const: (type as ts.NumberLiteralType).value };
    }
    if (flags & ts.TypeFlags.NumberLike) return { type: "number" };
    if (flags & ts.TypeFlags.StringLike) return { type: "string" };
    if (flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) return {};

    // Before the external check: an array's own symbol is `Array`, declared in the
    // TypeScript lib, so testing that first turned every `AgentRun[]` opaque.
    if (checker.isArrayType(type)) {
      const [element] = checker.getTypeArguments(type as ts.TypeReference);
      return { type: "array", items: element ? convert(element, depth + 1) : {} };
    }

    // `Record<string, string>` and friends: a real, renderable shape, even though the
    // alias itself is declared in the lib.
    const indexType = checker.getIndexTypeOfType(type, ts.IndexKind.String);
    if (indexType) {
      return { type: "object", additionalProperties: convert(indexType, depth + 1) };
    }

    if (isExternal(type)) return opaque(type);

    if (type.isUnion()) {
      const members = type.types.filter(
        (member) => !(member.getFlags() & (ts.TypeFlags.Undefined | ts.TypeFlags.Null))
      );
      const [first] = members;
      if (!first) return {};
      // A union this wide is a lib type in disguise; describing every arm helps nobody.
      if (members.length > 24) return opaque(type);
      if (members.length === 1) return convert(first, depth);

      if (members.every((member) => member.getFlags() & ts.TypeFlags.StringLiteral)) {
        return { enum: members.map((member) => (member as ts.StringLiteralType).value) };
      }
      if (members.every((member) => member.getFlags() & ts.TypeFlags.NumberLiteral)) {
        return { enum: members.map((member) => (member as ts.NumberLiteralType).value) };
      }
      if (members.every((member) => member.getFlags() & ts.TypeFlags.BooleanLike)) {
        return { type: "boolean" };
      }
      return { anyOf: members.map((member) => convert(member, depth + 1)) };
    }

    if (isFunction(type)) return { "x-function": true };

    if (flags & ts.TypeFlags.Object) {
      // A named object type (`AgentRun`, `PlanStep`) is hoisted, so a runtime can
      // see that the same record shape recurs instead of meeting it three times.
      const named = name && name !== "__type" && name !== "__object" ? name : undefined;

      if (named) {
        if (started.has(named)) return { $ref: `#/$defs/${named}` };
        started.add(named);
        defs[named] = {}; // reserve the slot before recursing, so cycles terminate
        defs[named] = objectSchema(type, depth);
        return { $ref: `#/$defs/${named}` };
      }

      return objectSchema(type, depth);
    }

    return {};
  }

  function objectSchema(type: ts.Type, depth: number): JsonSchema {
    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];

    for (const symbol of checker.getPropertiesOfType(type)) {
      const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
      if (!declaration) continue;

      const memberType = checker.getTypeOfSymbolAtLocation(symbol, declaration);

      // A callback nested inside a record (an action's own handler) can't be carried
      // by JSON either, but dropping it would describe a shape that isn't the real
      // one. It is listed and marked as the host's to supply.
      const schema = isFunction(memberType)
        ? { "x-function": true, "x-host": true }
        : convert(memberType, depth + 1);
      const description = docOf(symbol);
      properties[symbol.getName()] = description ? { ...schema, description } : schema;

      const optional = symbol.getFlags() & ts.SymbolFlags.Optional;
      if (!optional) required.push(symbol.getName());
    }

    const schema: JsonSchema = { type: "object", properties };
    if (required.length > 0) schema.required = required;
    return schema;
  }

  return { convert, defs };
}

function eventFrom(symbol: ts.Symbol, type: ts.Type): EventDef | undefined {
  const [signature] = type.getCallSignatures();
  if (!signature) return undefined;

  return {
    name: symbol.getName(),
    required: !(symbol.getFlags() & ts.SymbolFlags.Optional),
    params: signature.getParameters().map((param) => {
      const declaration = param.valueDeclaration ?? param.declarations?.[0];
      const paramType = declaration
        ? checker.getTypeOfSymbolAtLocation(param, declaration)
        : undefined;
      return {
        name: param.getName(),
        type: paramType ? checker.typeToString(paramType) : "unknown",
      };
    }),
    description: docOf(symbol),
  };
}

/** The DOM element the rest of the props are spread onto, from the extends clause. */
function elementOf(declaration: ts.InterfaceDeclaration): string | undefined {
  const text = declaration.heritageClauses
    ?.map((clause) => clause.getText())
    .join(" ");
  const match = text?.match(/ComponentPropsWithoutRef<"([a-z0-9]+)">/);
  return match?.[1];
}

/**
 * Items whose main component is not named after the directory. Kept explicit rather
 * than falling back to "the first exported interface", so a component added with a
 * mismatched name fails the build instead of silently getting the wrong primary.
 */
const PRIMARY: Record<string, string> = {
  "inline-citations": "CitedText",
  overlay: "OverlayContent",
};

function schemaFor(declaration: ts.InterfaceDeclaration): ComponentSchema {
  const name = declaration.name.text.replace(/Props$/, "");
  const { convert, defs } = makeConverter();

  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  const events: EventDef[] = [];

  for (const member of declaration.members) {
    if (!ts.isPropertySignature(member) || !member.name) continue;
    const symbol = checker.getSymbolAtLocation(member.name);
    if (!symbol) continue;

    const memberName = symbol.getName();
    // `className` belongs to the element, not the design. `children` is kept: where a
    // component takes them, what goes inside is part of the contract.
    if (memberName === "className") continue;

    const memberType = checker.getTypeOfSymbolAtLocation(symbol, member);
    const callable = checker.getNonNullableType(memberType);

    if (callable.getCallSignatures().length > 0 && !checker.isArrayType(memberType)) {
      const event = eventFrom(symbol, callable);
      if (event) events.push(event);
      continue;
    }

    const schema = convert(memberType, 0);
    const description = docOf(symbol);
    properties[memberName] = description ? { ...schema, description } : schema;
    if (!member.questionToken) required.push(memberName);
  }

  // A component whose whole API is inherited (Card) still belongs in the catalogue.
  const props: JsonSchema = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: name,
    type: "object",
    properties,
  };
  if (required.length > 0) props.required = required;
  if (Object.keys(defs).length > 0) props.$defs = defs;

  return { component: name, element: elementOf(declaration), props, events };
}

const output: Record<string, ItemSchema> = {};
const problems: string[] = [];

for (const dir of dirs) {
  const path = join(registrySrc, dir, `${dir}.tsx`);
  if (!existsSync(path)) continue; // theme and skill items have no component

  const source = program.getSourceFile(path);
  if (!source) {
    problems.push(`${dir}: source file not in program`);
    continue;
  }

  const components: Record<string, ComponentSchema> = {};

  source.forEachChild((node) => {
    if (!ts.isInterfaceDeclaration(node)) return;
    if (!node.name.text.endsWith("Props")) return;
    const exported = node.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
    );
    if (!exported) return;

    const schema = schemaFor(node);
    components[schema.component] = schema;
  });

  if (Object.keys(components).length === 0) {
    problems.push(`${dir}: no exported *Props interface produced a schema`);
    continue;
  }

  const primary = PRIMARY[dir] ?? pascal(dir);
  if (!components[primary]) {
    problems.push(
      `${dir}: expected a "${primary}Props" interface; found ${Object.keys(components)
        .map((name) => `${name}Props`)
        .join(", ")}`
    );
    continue;
  }

  output[dir] = { primary, components };
}

if (problems.length > 0) {
  console.error(
    "Schema generation failed:\n" + problems.map((problem) => `  - ${problem}`).join("\n")
  );
  process.exit(1);
}

writeFileSync(
  resolve(webRoot, "schemas.generated.json"),
  `${JSON.stringify(output, null, 2)}\n`,
  "utf8"
);

const componentCount = Object.values(output).reduce(
  (total, item) => total + Object.keys(item.components).length,
  0
);
const eventCount = Object.values(output).reduce(
  (total, item) =>
    total +
    Object.values(item.components).reduce((sum, component) => sum + component.events.length, 0),
  0
);

console.log(
  `schemas.generated.json → ${Object.keys(output).length} item(s), ${componentCount} component(s), ${eventCount} event(s)`
);
