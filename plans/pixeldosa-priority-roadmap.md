# PixelDosa Priority Roadmap

Status: active priority order for production feedback

PixelDosa will build in three queues:

1. AI-native components first
2. Marketing components second
3. General/product components third

Before all queues, stabilize the existing foundation. Work on one item at a time and complete the registry, accessibility, theme, responsive, documentation, and install gates before starting the next item.

## Positioning

PixelDosa focuses on high-trust AI inside ordinary product interfaces: forms, documents, tables, approvals, and operational workflows. It should not compete with Vercel AI Elements on generic chat primitives or with Magic UI/Aceternity on effect volume.

The visual advantage is human attention to detail: typography, hierarchy, spacing, state design, copy, accessibility, responsive behavior, and a coherent PixelDosa theme. Luxury and premium-brand support are market hypotheses to validate through real users, not reasons to add ornamental effects.

## Prerequisite: foundation audit

Stabilize the existing registry before new feature work:

1. Button
2. Card
3. Field
4. Overlay
5. Ghost Input
6. PixelDosa Theme

Audit metadata, docs, keyboard behavior, ARIA, light/dark theme behavior, reduced motion, 375px layout, consumer imports, and clean shadcn installation. Keep Ghost Input as an audited existing experiment; do not expand it until user feedback proves demand.

## Queue 1: AI components

### Production-feedback MVP

1. **Smart Field**
   - AI autofill for one field.
   - Preview before commit, provenance, confidence, loading, error, and one-step undo.
   - Depends on Field and the shared token/state vocabulary.

2. **Diff Accept**
   - Shows AI-proposed field or text changes.
   - Per-hunk or field-level accept/reject, conflict handling, and undo.
   - Depends on Field and Smart Field's proposal model.

3. **Confidence Meter**
   - Communicates calibrated uncertainty and explanation/provenance.
   - Must not present model confidence as factual certainty.
   - Reused by Smart Field, Diff Accept, and approval workflows.

4. **AI Approval Gate**
   - Reviews an AI action or proposed change.
   - Shows what will happen, what changed, risk/reversibility, confidence, and explicit approve/reject outcomes.
   - Composes Overlay, Diff Accept, Confidence Meter, and Field.

5. **AI-Assisted Form block**
   - Field + Smart Field + Diff Accept + Confidence Meter + AI Approval Gate.
   - First flagship proof of the PixelDosa thesis.

6. **Feedback Capture**
   - Thumbs or structured reason, optional comment, optimistic state, and injectable callback.
   - Can begin as release feedback instrumentation, then become a registry component if reuse is proven.

### Follow-on AI components

7. **Selection Actions** — selected text to explain, rewrite, translate, classify, or extract actions.
8. **Progressive Reveal** — stable structured streaming for rows, cards, and sections; no fake typewriter prose.
9. **AI Context / Provenance Surface** — sources, retrieved context, model metadata, freshness, and explanation.
10. **Bulk Prompt Table** — per-row progress, cancellation, partial failure, and retry.
11. **Risk-Aware Approval Card** — a richer approval pattern once AI Approval Gate proves the contract.
12. **Inline Edit Before Approve** — schema-aware structured editing.
13. **Task Plan Runner** — nested tasks and real execution states.
14. **Live Tool-Call Console** — streamed args/results and retry.
15. **Trace Waterfall** — nested LLM/tool/sub-agent spans.
16. **Agent Health Grid** — accessible multi-agent status aggregation.
17. **Error Replay Card** — failure snapshot and safe replay.
18. **Knowledge Graph Explorer** — only after a real knowledge workflow exists.

### Do not prioritize

Generic Message, Conversation, Prompt Input, Streaming Response, Markdown Renderer, Code Block, Citation Card, Source Viewer, Loader, and basic Tool components. Integrate established solutions such as AI Elements where they already solve the generic contract.

## Queue 2: marketing components

Marketing follows the AI MVP so it can tell the story of a real workflow instead of showcasing disconnected effects.

1. **Product Demo Carousel**
   - Controlled slides, previous/next buttons, pagination, keyboard navigation, touch support, captions, and reduced motion.
   - No autoplay by default.
   - First use: demonstrate the AI-Assisted Form and approval flow.

2. **Feature Card composition**
   - Compose existing Card, Button, media, and content slots.
   - Do not create another generic Card primitive.

3. **Feature Showcase block**
   - Carousel plus Feature Card narrative sequence.
   - One clear story is more valuable than a large bento catalog.

4. **Stats Card composition**
   - Add Animated Number only when the metric has meaning; preserve accessible static text.

5. **Pricing composition**
   - Build from Card and Button with billing toggle and responsive comparison.

6. **Testimonial or Comparison composition**
   - Only when a real marketing page needs it.

### Skip as commodity

Generic marquee, infinite logo wall, beam, spotlight, aurora, glowing border, particle background, generic bento grid, hero badge, CTA banner, FAQ item, standalone Pricing Card, logo cloud, and decorative 3D hero. These are already well-served by Magic UI, Aceternity, and similar libraries.

## Queue 3: general/product components

1. **Command Menu** — controlled, keyboard-first, async-capable; use cmdk or Base UI/Radix semantics.
2. **Data Table** — use TanStack Table for behavior; PixelDosa owns visual/state composition.
3. **Empty State** — action-led setup, import, recovery, and optional AI action.
4. **Document Preview** — PDF/image review, page controls, zoom, download, fullscreen, and accessible fallback.
5. **File Upload / Attachment** — validation, progress, cancellation, preview, replacement, removal, and injected transport.
6. **Status / Progress vocabulary** — pending, active, success, warning, failed, paused, needs review.
7. **Filter Builder** — async options, saved filters, date ranges, clear-all, serializable state.
8. **Navigation Shell** — responsive sidebar/topbar using Base UI/Radix primitives.
9. **Audit Metadata Row** — owner, verifier, timestamp, provenance, and status.
10. **Date and Date Range Controls** — calendar/popover semantics with timezone guidance.

Generic Input, Select, Checkbox, Radio, Tabs, Tooltip, Dialog, Drawer, Accordion, Toast, Avatar, Badge, Skeleton, Spinner, Pagination, Slider, and Breadcrumbs should come from shadcn/Base UI/Radix unless a concrete PixelDosa-specific gap appears.

## Blocks

Build blocks only after their component dependencies ship.

### First feedback showcase

1. **AI-Assisted Form** — first MVP block.
2. **Product Demo Carousel** — marketing demonstration of the AI workflow.

### Next blocks

3. **Document Review Workspace** — Document Preview + Attachment + Status + Confidence + AI Approval Gate.
4. **AI Compliance Briefing** — structured summary + status buckets + documents + provenance + actions.
5. **Premium Settings / Onboarding Shell** — Field, navigation composition, sections, action footer.
6. **Dashboard Shell** — Navigation + Command Menu + responsive content frame + table slots.
7. **Document Verification Workspace** — preview + metadata + document list + review actions.
8. **Agent Operations Console** — task plan + tool console + traces + health + replay.

## Release sequence

1. Foundation audit and theme lock.
2. Smart Field.
3. Diff Accept.
4. Confidence Meter.
5. AI Approval Gate.
6. AI-Assisted Form.
7. Feedback instrumentation.
8. Product Demo Carousel.
9. Release for external feedback.
10. Pause feature expansion and review install friction, API clarity, trust, accessibility, responsive behavior, and visual distinctiveness.
11. Continue with follow-on marketing or general components based on observed demand.

## Success criteria

MVP success is not item count. It is:

- an external developer installs the registry successfully;
- someone builds a real AI-assisted form from the shipped pieces;
- the interaction feels trustworthy and understandable;
- the theme remains coherent in light and dark modes;
- accessibility and responsive issues are found and fixed through real use;
- at least one person would reuse the components in a real product;
- feedback identifies the next queue item with evidence.
