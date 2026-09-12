# PixelDosa Component Catalog

> This is the broad post-MVP catalog. The active build order is [pixeldosa-priority-roadmap.md](pixeldosa-priority-roadmap.md): AI components first, marketing components second, and general/product components third.

Status: proposed build order

This catalog adapts useful product patterns observed in the local `smac-core-components-ui-develop` codebase without copying its implementations, APIs, styling, or domain screens. PixelDosa owns a different distribution model: source-first shadcn registry items, a coherent token theme, and high-quality compositions for AI-native products.

## Principles

- Build one component at a time through the research, plan, implementation, QA, and registry gates in `plans/pixeldosa-shipping-plan.md`.
- Use shadcn conventions and Radix or Base UI primitives for interaction semantics, focus management, keyboard behavior, and popover/dialog/combobox patterns.
- Prefer TanStack Table or an established engine for complex data behavior. Do not hand-build sorting, virtualization, or focus systems that a proven library already solves.
- Take workflow insight from SMAC, not source code. Rebuild the API, visual language, and state model for PixelDosa.
- Keep the PixelDosa theme invariant: semantic tokens, shared typography/spacing/radius/elevation/motion, light/dark support, and reduced motion.
- Keep general components reusable. Put AI behavior in the AI queue. Put composed experiences in the Blocks queue.
- Do not build commodity primitives merely to increase the registry count.

## Queue A: General Components

These are reusable product components and patterns that support many blocks. They are not AI-specific unless explicitly stated.

### A0: Stabilize existing foundation

1. **Button** — reference implementation for tokens, CVA, loading, focus, and registry metadata.
2. **Field** — shared label, description, error, ID, and ARIA contract.
3. **Overlay** — motion layer composed under Radix Dialog, Sheet, Popover, and Drawer.
4. **Card** — keep as a composable content primitive; avoid expanding it into domain cards.
5. **Command Menu** — keyboard-first navigation/action pattern using a proven command engine and Radix dialog semantics.

### A1: Highest-value product patterns

6. **Data Table** — TanStack Table adapter with sorting, filtering slots, selection, column visibility, loading, empty, error, partial data, and responsive behavior.
7. **Filter Builder** — composable filters with async options, date ranges, saved filters, clear-all, and serializable state.
8. **Navigation Shell** — sidebar/topbar pattern with collapsible desktop navigation and Sheet-based mobile navigation.
9. **Document Preview** — PDF/image preview with page navigation, zoom, rotation, download, fullscreen, keyboard support, and an accessible fallback.
10. **File Upload / Attachment** — validation, progress, replacement, deletion, preview, download, cancellation, and injected upload transport.
11. **Empty State** — action-led zero-data state with optional setup/import/AI action slots.
12. **Status and Progress** — small shared state vocabulary for pending, active, success, warning, failed, paused, and needs-review states.
13. **Audit Metadata Row** — compact provenance, owner, timestamp, verifier, status, and last-updated pattern.

### A2: Useful support patterns

14. **Form Section / Action Footer** — composable sections with save, cancel, dirty, disabled, and validation states.
15. **Date and Date Range Controls** — use Base UI/Radix-compatible calendar and popover semantics; include timezone-aware integration guidance.
16. **Document List** — reusable list pattern for file name, type, status, date, owner, and row actions.
17. **Pagination** — only as part of Data Table or Document List, not as a portfolio item by itself.

### Do not build as PixelDosa priorities

Use shadcn or Base UI/Radix directly for generic Input, Select, Checkbox, Radio, Tabs, Tooltip, Popover, Dialog, Drawer, Accordion, Toast, Avatar, Badge, Skeleton, Spinner, Toggle, Slider, Breadcrumbs, Rating, Container, Paper, basic List, and basic Pagination. They can be composed or themed, but do not duplicate mature primitives without a specific product pattern to justify the work.

## Queue B: AI-Native Components

These mean AI embedded inside ordinary product UI: forms, tables, documents, editors, settings, and approvals. Generic chat infrastructure is intentionally excluded.

### B0: Differentiating foundation

1. **Ghost Input** — explicit acceptance, debounced provider request, abort-on-keystroke, stale-response rejection, caret integrity, and accessible suggestion announcement.
2. **Smart Field** — AI autofill with provenance, confidence, preview, and one-step undo.
3. **Selection Actions** — selected text to contextual explain/rewrite/translate/classify/extract actions using accessible positioning and dismissal.

### B1: Trust and structured editing

4. **Progressive Reveal** — stable streaming of structured rows, cards, and sections without a typewriter illusion.
5. **Diff Accept** — inline proposed changes with per-hunk accept/reject, conflict handling, and undo.
6. **Confidence Meter** — calibrated confidence/provenance disclosure without presenting model output as certainty.
7. **AI Context / Provenance Surface** — sources, retrieved context, field provenance, model metadata, and explanation details for embedded decisions.
8. **AI Action Toolbar** — shared actions for apply, explain, retry, regenerate, undo, and report.

### B2: Operational AI

9. **Bulk Prompt Table** — apply one instruction across rows with per-row status, retry, cancellation, and partial failure.
10. **AI Approval Gate** — proposed action/change with input, risk, diff, confidence, and approve/reject outcomes.
11. **Risk-Aware Approval Card** — risk, reversibility, blast radius, confidence, inline edit, and deliberate visual weight.
12. **Inline Edit Before Approve** — schema-aware structured edits with before/after review.
13. **Task Plan Runner** — nested tasks with pending/running/failed/done/paused/needs-review states and retry.
14. **Live Tool-Call Console** — streamed arguments/results with structured states and branded console presentation.
15. **Chain-of-Thought Timeline** — only where product policy permits showing reasoning summaries; use status events or rationale summaries rather than exposing private chain-of-thought.

### B3: AI observability and knowledge

16. **Trace Waterfall** — nested LLM/tool/sub-agent spans with duration and status, using real trace data.
17. **Live Cost / Token Meter** — real-time token/cost counters with budget threshold states.
18. **Agent Health Grid** — aggregate health across agents/tools with accessible status text, not color alone.
19. **Error Replay Card** — failure snapshot with input/state, safe replay, and recovery outcome.
20. **Knowledge Graph Explorer** — only after a concrete knowledge workflow exists; provide keyboard and non-canvas fallback.
21. **Retrieval Relevance Inspector** — ranked retrieved chunks and relevance explanation for debugging or trust.
22. **Freshness Badge** — stale/verified metadata with a meaningful heuristic exposed as data, not a decorative date.

### Intentionally integrate, not duplicate

Do not make generic Message, Conversation, Prompt Input, Markdown Renderer, Code Block, Loader, Citation Card, Source Viewer, or basic Tool components primary PixelDosa priorities. Use Vercel AI Elements, Agent Elements, shadcn, or Base UI where they solve the generic contract well. PixelDosa can compose them inside a block or add state-aware wrappers only when a specific product workflow requires it.

## Queue C: Blocks

Blocks are complete experiences assembled from shipped components. A block is not a large component file and must not ship before its dependencies are stable.

### C0: First proof blocks

1. **AI-Assisted Form** — Field + Ghost Input + Smart Field + Diff Accept + Confidence Meter.
2. **Compliance Review Workspace** — Data Table + Status/Progress + Document Preview + Attachment + Confidence + Approval Gate.
3. **AI Compliance Briefing** — structured AI summary + status buckets + document rows + provenance + action drill-down.

### C1: Product foundation blocks

4. **Settings Shell** — Navigation Shell + Field + form sections + action footer.
5. **Dashboard Shell** — Navigation Shell + Command Menu + topbar + responsive content frame + table/analytics slots.
6. **Command Workspace** — Command Menu + recent actions + search results + optional contextual AI suggestions.
7. **Document Verification Workspace** — Document Preview + Audit Metadata Row + Document List + status + request/archive/approve actions.

### C2: AI workflow blocks

8. **AI Research / Knowledge Workspace** — search/filter + Progressive Reveal + provenance + structured results + export/review action.
9. **Proposal / Approval Workspace** — form sections + Diff Accept + Confidence + Approval Gate + audit timeline.
10. **Onboarding Checklist** — Empty State + Progress + Smart Field + step navigation + contextual suggestions.
11. **Agent Operations Console** — Task Plan Runner + Tool-Call Console + Trace Waterfall + Health Grid + Error Replay.

### C3: Marketing and business kit blocks

12. **Product Hero** — restrained Reveal + token-backed visual treatment + Button.
13. **Pricing Section** — pricing compositions and billing toggle; useful for the marketing kit but not an early product priority.

## Build order

1. Audit tokens, contrast, accessibility, metadata, and existing docs UX.
2. Stabilize Field, Overlay, Button, and Card.
3. Build Command Menu.
4. Build Ghost Input, Smart Field, and Selection Actions.
5. Build Progressive Reveal, Diff Accept, and Confidence Meter.
6. Build AI-Assisted Form.
7. Build Data Table, Filter Builder, Navigation Shell, and Empty State.
8. Build Document Preview and File Upload / Attachment.
9. Build Compliance Review Workspace and AI Compliance Briefing.
10. Build Approval Gate, Bulk Prompt Table, and Task Plan Runner.
11. Build Settings Shell, Dashboard Shell, Command Workspace, and Document Verification Workspace.
12. Build observability and knowledge components only when a real block gives them a concrete workflow.
13. Validate `pixeldosa-base` and `pixeldosa-ai-product` kits.

## Portfolio and business priority

The strongest showcase sequence is:

1. AI-Assisted Form
2. Compliance Review Workspace
3. AI Compliance Briefing
4. Bulk Prompt Table
5. Document Verification Workspace
6. Ghost Input
7. Diff Accept
8. Dashboard Shell
9. Agent Operations Console
10. Agent Workflow Canvas, only after the operational model is proven

This order shows design engineering depth, practical business value, AI trust, accessibility, state modeling, and visual craft without competing on raw component count.
