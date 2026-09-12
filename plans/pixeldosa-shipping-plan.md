# PixelDosa Shipping Plan

Status: locked for MVP feedback release
Owner: design engineering
Product: a shadcn registry component library, portfolio, and template-business foundation

## 1. Product thesis

PixelDosa is a design-engineering library for modern product interfaces, especially AI-native products. It is distributed as source through the shadcn registry, so every shipped item must be useful in a real project, visually distinctive enough to demonstrate craft, and documented well enough for a developer or agent to install it without a conversation.

The business model has three layers:

- **Registry components:** installable source that earns trust and demonstrates implementation quality.
- **Blocks:** composed product and marketing sections that show how components work together.
- **Templates/kits:** later, complete starting points assembled from the registry. Templates stay outside this repository; this repository owns the registry and docs.

The portfolio standard is not visual novelty alone. Each item should show product judgment, API design, accessibility, responsive behavior, motion restraint, token discipline, and excellent documentation.

The active release target is defined in `plans/pixeldosa-mvp-plan.md`. The larger catalog is a post-MVP queue and must not expand the first production feedback release.

## 2. What is locked now

### System lock

- **Distribution:** shadcn registry items are the public API. Consumers copy source into their own projects; there is no required runtime package dependency on PixelDosa.
- **Source of truth:** implementation lives in `packages/ui/src/registry`; docs previews import the same demo files; generated registry files are never hand-edited.
- **Theme:** semantic shadcn-compatible tokens, light and dark modes, motion tokens, and reduced-motion fallbacks. Components use token-backed classes only.
- **Theme fidelity:** the PixelDosa theme is a product constraint, not an optional skin. New components, demos, docs previews, blocks, and templates must inherit the shared semantic tokens and visual rules. A component may introduce no private palette, one-off radius, shadow language, typography system, or motion scale without an explicit token-layer decision. If a design need is missing, extend the token source first and then consume the new semantic token everywhere.
- **Visual language:** quiet, editorial, high-contrast product UI with near-neutral surfaces, 1px borders for depth, restrained radius, purposeful typography, and one clear interaction signal at a time. Motion communicates state, orientation, or feedback; it is never decoration without a user benefit.
- **Accessibility:** WCAG 2.2 AA target, keyboard-complete behavior, visible focus, correct ARIA, stable loading states, and responsive behavior down to 375px.
- **Docs shell:** every component page has a live preview, install command, usage, props, engineering notes, motion notes, and source. The sidebar is generated from registry metadata, not a second navigation list.
- **Component browsing UX:** the component page is the canonical hub. It shows all useful variations together for comparison; a variation gets its own route only when it needs a larger preview, substantial explanation, interactive state, responsive inspection, or a long code sample. The sidebar mirrors this with a component row and expandable example children. Example counts alone are not the navigation model.
- **Quality bar:** a component is shipped only when registry build, typecheck, lint, install smoke test, visual QA, responsive QA, dark/light QA, and accessibility QA pass.

### Catalog lock

Pillar remains the engineering classification:

- `core`: dependable product primitives and patterns.
- `ai`: AI embedded in conventional product surfaces, with uncertainty and streaming treated as real states.
- `motion`: interaction-led motion and visual effects.

Surface is independent and must be exactly one of:

- `application`: helps a user operate a product.
- `marketing`: explains, persuades, or converts.

Do not add a `business` or `3d` pillar during this cycle. Domain tags such as `business` are category metadata. 3D can be reconsidered after the first product-facing block proves demand.

### Existing inventory lock

The first six registry items remain in scope and must be stabilized before expanding the catalog:

1. Button
2. Card
3. Field
4. Overlay Motion Primitive
5. Ghost Input
6. PixelDosa Theme

Command Menu is the first new component. The existing `plans/command-menu-plan.md` is the component-level research document and must be resolved before implementation.

## 3. Build order

For the first production feedback release, use this shorter sequence:

1. Stabilize Button, Card, Field, Overlay, and PixelDosa Theme.
2. Build Command Menu.
3. Build Smart Field, Diff Accept, Confidence Meter, and AI Approval Gate.
4. Build Data Table, Empty State, Document Preview, and File Upload/Attachment.
5. Build AI-Assisted Form, Document Review Workspace, and Premium Settings/Onboarding Shell.
6. Publish the feedback release and pause feature expansion.

The detailed general, AI-native, and block queues remain in `plans/pixeldosa-component-catalog.md` for post-MVP planning.

One component is active at a time. No parallel component implementation.

### Phase 0: foundation audit

1. Audit the existing six items against the definition of done.
2. Run a contrast audit for all semantic token pairs and record the result.
3. Lock typography, spacing, radius, elevation, focus, icon, and motion rules in the token/docs layer.
4. Define the theme conformance checklist: semantic classes only, no ad hoc palette values, shared type scale, shared radius/elevation, and shared motion tokens.
5. Lock the docs layout at desktop and 375px: header, sidebar, content width, preview frame, code block, metadata, and navigation.
6. Add contribution, versioning, release, and research-record conventions.

Exit: the visual shell and token decisions are stable enough that a new component will not force global restyling.

### Phase 1: general product foundation

1. **Field** — audit and stabilize first because AI-in-product components compose it.
2. **Overlay** — audit and stabilize shared motion and Radix composition.
3. **Command Menu** — first new flagship; controlled, keyboard-first, accessible, and registry-installable.

Exit: a developer can build a serious product surface from trusted form, overlay, and command primitives.

### Phase 2: AI-native components

1. **Ghost Input** — audit and stabilize explicit acceptance, cancellation, stale response handling, and caret integrity.
2. **Smart Field** — AI autofill with provenance and one-step undo.
3. **Selection Actions** — selected text to contextual actions with dismissal and keyboard reachability.
4. **Progressive Reveal** — structured streaming for rows and cards, not prose.
5. **Diff Accept** — per-hunk accept/reject for AI edits.
6. **Confidence Meter** — confidence and explanation surface for non-chat contexts.
7. **AI Context / Provenance Surface** — explain sources, context, and model metadata inside product UI.
8. **Bulk Prompt Table** — per-row progress, partial failure, and retry.
9. **AI Approval Gate** — review AI actions and edits with risk, diff, confidence, and explicit outcomes.

Exit: the AI thesis is demonstrated inside ordinary forms, tables, and editing workflows rather than only in chat.

### Phase 3: supporting general components

1. **Data Table** — use TanStack Table for the behavior engine.
2. **Filter Builder** — async options, saved filters, ranges, and serializable state.
3. **Navigation Shell** — Radix Collapsible and Sheet for desktop/mobile semantics.
4. **Empty State** — action-led setup, import, and recovery states.
5. **Document Preview** and **File Upload / Attachment**.

Exit: the library can support serious forms, tables, document workflows, and responsive application shells.

### Phase 4: blocks and kits

Build blocks only from shipped components:

1. AI-Assisted Form
2. Compliance Review Workspace
3. AI Compliance Briefing
4. Settings Shell
5. Dashboard Shell
6. Command Workspace
7. Document Verification Workspace
8. Onboarding Checklist

Then validate one-install kits through `registry:base`: `pixeldosa-base`, `pixeldosa-ai-product`, and `pixeldosa-marketing`. Full application templates remain separate repositories.

## 4. Per-component operating loop

Every component follows this exact sequence:

1. **Select:** confirm it is in the locked catalog and name the block or kit it unlocks.
2. **Research:** record pattern research, visual research, accessibility guidance, competing solutions, and the specific lesson from each reference. Existing research is reused but must be checked for current assumptions.
3. **Plan:** write the component plan in the order required by `.agents/skills/pixeldosa-components/SKILL.md`.
4. **Review gate:** resolve open API, dependency, scope, category, surface, and visual questions before coding.
5. **Build:** implementation, demo, metadata, docs, exports, and registry wiring as one vertical slice.
6. **Validate:** typecheck, lint, registry build, install smoke test, accessibility, 375px, desktop, light/dark, and reduced-motion checks.
7. **Critique:** compare the result to the plan and inspect it as both a consumer and a portfolio reviewer.
8. **Ship:** update roadmap/status and record the decision, known limitations, and next dependency.

A component that fails a gate returns to that component's slice. Do not start the next component to hide an unfinished one.

## 5. Research protocol

Research is decision support, not a moodboard. For every reference, capture:

- the pattern or interaction being studied;
- what the reference does well and which user problem that solves;
- what PixelDosa will intentionally do differently;
- accessibility and responsive implications;
- whether the idea is already commoditized and should be installed from another registry instead.

Primary references include Linear, Vercel, Raycast, Notion, GitHub, Cursor, Framer, Stripe, Perplexity, Apple, shadcn/ui, Magic UI, Aceternity, Componentry, and AI Elements. The existing `docs/vault-plan.md` is the current research baseline, especially its decision to focus on AI inside ordinary product UI instead of rebuilding commoditized chat components.

Research freeze: once a component plan is approved, new research may change implementation details but cannot expand scope without reopening the review gate.

## 6. Component documentation flow

The developer journey is:

1. **Discover:** browse all components alphabetically or by practical category, then open a component hub.
2. **Compare:** scan the hub's live variation grid to understand the component's design range and intended compositions.
3. **Inspect:** open a variation detail route only when the example needs deeper context or a larger interactive surface.
4. **Install:** copy the one install command for the primitive, never an example-specific command.
5. **Adapt:** copy a clearly labelled usage snippet for the variation and inspect the full primitive source lower on the hub page.
6. **Continue:** use explicit back-to-components, back-to-component, previous, and next navigation without relying on browser history.

Documentation rules:

- Examples are compositions and demonstrations by default, not separate registry items.
- A component hub must show the examples that explain its API; a single default demo is not enough for a composition-heavy component such as Card.
- Example cards may link to a detail route, but copy controls must be separate interactive elements and must never be nested inside a link.
- Sidebar example children use the real example title, not only a count. The active component accordion opens when viewing either its hub or one of its examples.
- Install, copy usage, and copy full source are three distinct actions with distinct labels.
- Copyable usage should be consumer-oriented. Repository-only aliases must be rewritten or clearly marked as preview source before shipping.
- Preview source, copyable usage, and installable primitive source are separate concepts and should not be silently conflated.

## 7. Definition of done

- Registry metadata is complete, specific, and validates.
- The component installs into a clean shadcn project.
- The live docs preview uses the real demo source.
- API and props are exported and documented.
- Keyboard, focus, ARIA, loading, empty, error, and success states are intentional.
- Light and dark themes use semantic tokens only.
- The component visually belongs to PixelDosa: it uses the shared typography, spacing, radius, border/elevation, icon, color, and motion language in both demos and installed source.
- A token audit confirms there are no private color, radius, shadow, duration, easing, or font decisions hiding in component code.
- Responsive behavior works at 375px and desktop widths.
- Motion has a named interaction purpose and a reduced-motion fallback.
- Typecheck, lint, registry build, and focused QA pass.
- The implementation is composed into or clearly unlocks a future block.
- The plan and the built result agree, or the plan is updated before shipping.

## 8. Immediate next actions

1. Approve this system and catalog lock.
2. Finish the foundation audit, especially contrast and docs-shell measurements.
3. Resolve the two open decisions in `plans/command-menu-plan.md`: `cmdk` dependency and whether keybind rendering needs a separate primitive.
4. Audit Field and Overlay, then implement Command Menu as the first new vertical slice.
5. Run the full definition of done before moving to Smart Field or any new component.
