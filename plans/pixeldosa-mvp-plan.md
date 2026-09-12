# PixelDosa MVP Plan

Status: proposed production-feedback scope

## Goal

Ship a small, coherent PixelDosa registry that real developers can install into a product, use in a polished screen, and give feedback on. The MVP is not a miniature version of the entire catalog. It is a proof that PixelDosa can deliver careful design engineering for premium product experiences.

## Positioning hypothesis

PixelDosa helps teams create high-trust, high-polish product interfaces for AI-native and premium brands without making every screen look like a generic dashboard.

The luxury-brand direction is a hypothesis to test through conversations, installs, and screenshots. The product should express restraint, craft, material quality, and editorial attention, but it must not assume that minimalism or luxury is universally preferred. The test is whether designers, founders, and frontend teams value a small library that feels considered and human-authored over a large library of interchangeable generated parts.

## MVP audience

Primary:

- design engineers and frontend developers building AI-enabled SaaS;
- small product teams that need a refined first version quickly;
- premium, luxury, hospitality, commerce, and service brands that need bespoke-feeling interfaces;
- agencies building high-touch client work.

Secondary:

- AI product teams that need trustworthy forms, review, document, and approval surfaces.

## MVP promise

A developer can install the theme and a focused set of components, then assemble one polished product workflow in an afternoon:

- a settings or onboarding form;
- an AI-assisted form;
- a document review or approval surface;
- a restrained premium marketing section.

## MVP scope

The active priority order is defined in `plans/pixeldosa-priority-roadmap.md`: AI first, marketing second, general/product third. The MVP begins with the AI trust workflow and adds one marketing demonstration after it is usable.

### Existing foundation to stabilize

1. **Button**
2. **Card**
3. **Field**
4. **Overlay**
5. **PixelDosa Theme**

Do not expand these unnecessarily. Fix accessibility, metadata, theme fidelity, documentation, and install reliability first.

### General components to ship after the AI feedback slice

6. **Command Menu** — the general-purpose flagship; keyboard-first navigation and action execution.
7. **Data Table** — focused product pattern using TanStack Table; include loading, empty, error, selection, sorting, and responsive states.
8. **Document Preview** — polished PDF/image review surface with accessible fallback, zoom, page controls, and download.
9. **File Upload / Attachment** — validation, progress, preview, replacement, cancellation, and removal.
10. **Empty State** — action-led setup and recovery state.

Use shadcn/Base UI/Radix for generic primitives. Do not add generic Input, Select, Dialog, Tabs, Tooltip, Toast, Avatar, Badge, Skeleton, or Pagination to the MVP unless a real workflow reveals a gap.

### AI components to ship first

11. **Smart Field** — AI autofill with preview, provenance, confidence, undo, loading, and error.
12. **Diff Accept** — clear proposed changes with per-hunk or field-level accept/reject and undo.
13. **Confidence Meter** — calibrated confidence/provenance disclosure for embedded AI decisions.
14. **AI Approval Gate** — review an AI action with risk, changed data, explanation, and explicit approve/reject outcomes.

Keep Ghost Input as the next AI experiment after the MVP unless early users specifically need predictive typing. It is technically interesting but less immediately useful for the first production workflow than Smart Field and approval.

### Marketing component to ship after the AI slice

15. **Product Demo Carousel** — controlled, keyboard and touch-friendly, reduced-motion-safe, and used to demonstrate the AI workflow.

### Blocks to ship

16. **AI-Assisted Form** — Field + Smart Field + Diff Accept + Confidence Meter + AI Approval Gate.
17. **Document Review Workspace** — Document Preview + File Upload/Attachment + Status + Confidence Meter + AI Approval Gate.
18. **Premium Settings / Onboarding Shell** — Navigation shell can remain a composed application layout using existing shadcn primitives until a dedicated navigation pattern is justified.

These three blocks are the MVP showcase. Each must be usable without a backend by accepting injected data and callbacks, while the demos use realistic local state.

## Explicitly out of MVP

- full chat/message/conversation primitives;
- generic AI Elements replacements;
- Agent Workflow Canvas;
- Knowledge Graph Explorer;
- Trace Waterfall and full observability suite;
- 3D, WebGL, shaders, liquid glass, and signature effects;
- large marketing catalog;
- full template marketplace;
- domain-specific CRM, maritime, or commerce screens;
- a second package for signature effects.

These are valuable later, but they increase dependency, accessibility, performance, and maintenance risk before the product has feedback.

## Visual direction: premium, human-made, not ornamental

The MVP should feel authored through details rather than decoration:

- one distinctive type pairing, locked in the theme and docs shell;
- clear typographic hierarchy and generous but disciplined spacing;
- neutral foundation with a restrained material accent reserved for meaningful states;
- 1px borders, precise alignment, and subtle depth before large shadows;
- tactile states for focus, press, loading, success, and error;
- editorial copy that explains decisions without sounding machine-generated;
- purposeful variation between product UI and marketing examples while preserving the same token system;
- motion only for orientation, feedback, progress, or state change;
- no gratuitous gradients, glowing blobs, glass effects, or novelty animation in the MVP.

Premium means consistency, fit, accessibility, and finish. It does not mean adding visual effects to every component.

## Production gates

Every MVP component must pass:

- `pnpm typecheck`;
- focused lint and repository lint where available;
- `pnpm --filter @pixeldosa/web registry:build`;
- clean-project shadcn install smoke test;
- keyboard and screen-reader-oriented review;
- light and dark theme review;
- 375px and desktop review;
- reduced-motion review;
- source and usage snippets that work after installation;
- no private colors, fonts, spacing, radius, shadow, duration, or easing;
- one documented reason it belongs in PixelDosa instead of shadcn or an existing AI registry.

## Feedback release

The first release should ask users to evaluate concrete tasks:

1. Install the theme and Button/Card/Field.
2. Build a small form using Smart Field.
3. Review a proposed change with Diff Accept and AI Approval Gate.
4. Assemble the Document Review Workspace.
5. Compare the result against their current shadcn workflow.

Collect feedback on:

- visual distinctiveness without forced branding;
- API clarity and ease of customization;
- whether the result feels premium and trustworthy;
- installation friction;
- accessibility and responsive gaps;
- which block they would use in a real project;
- whether the human-authored engineering notes change their confidence.

Do not measure success by registry item count. MVP success is repeated use, useful critique, and at least one real product screen built by someone outside the repository.

## Release sequence

1. Foundation audit and theme lock.
2. Stabilize existing five items.
3. Smart Field.
4. Diff Accept.
5. Confidence Meter.
6. AI Approval Gate.
7. AI-Assisted Form.
8. Feedback instrumentation.
9. Product Demo Carousel.
10. Publish a feedback release and pause feature expansion while feedback is reviewed.

## After MVP

Only after feedback, choose one direction:

- deepen AI trust and review workflows;
- deepen premium brand and marketing blocks;
- build the operational Agent Console;
- build the signature motion/3D tier;
- package starter kits and templates.

The next direction must be selected from observed demand, not from the size of the backlog.
