# Design system strategy — industry standard vs. PixelDosa

A benchmark of how established design systems (Material 3, IBM Carbon, Atlassian, Shopify Polaris, Adobe Spectrum) structure themselves, checked against what's actually in `packages/tokens` and the Figma file being built.

## 1. Token architecture: the three-tier model

Every mature system separates tokens into three layers instead of hardcoding values into components.

- **Global/primitive tokens** — raw values with no meaning: `blue-500`, `gray-900`, `4px`. Platform-agnostic, never referenced directly by a component.
- **Alias/semantic tokens** — map a primitive to a role: `color-bg-primary`, `color-text-danger`. This is the layer components actually consume, and the layer that changes when you theme or switch light/dark.
- **Component tokens** (optional, used by larger systems like Carbon and Spectrum) — scoped to one component: `button-bg-hover`, `input-border-error`, usually derived from alias tokens.

Theming works by swapping alias-token values; primitives stay constant. This is also now a W3C standard, not just convention — the [Design Tokens Community Group format](https://www.designtokens.org/tr/drafts/format/) reached its first stable version in late 2025, a JSON shape using `$value`/`$type`, readable by Style Dictionary, Tokens Studio, Supernova, and Penpot. Roughly three-quarters of mature design systems now ship tokens as a first-class deliverable in this or an equivalent format.

**Where PixelDosa stands:** `design-tokens.ts` defines only the semantic layer — `background`, `primary`, `muted`, etc. — with OKLCH values baked directly in. There's no separate primitive tier (no `gray-50…gray-900` ramp sitting behind those semantic values), and no W3C DTCG-format JSON export. That's not wrong — plenty of small, opinionated systems (shadcn/ui itself does this) skip the primitive tier deliberately to keep the token count low. Worth a conscious call: keep it flat, or add a primitive tier now while the system is still small, since retrofitting one later means touching every semantic token.

## 2. Naming convention

The most common pattern in the industry is **CTI — Category > Type > Item > (State)**: `color-background-input-disabled`. It's verbose but unambiguous at scale (Carbon, Spectrum use variants of it).

**Where PixelDosa stands:** flat semantic names — `primary`, `muted-foreground`, `destructive` — which is the shadcn/Radix convention, not CTI. This is a legitimate and common alternative for smaller systems, and it buys ecosystem compatibility (every shadcn component, Tailwind config, and theming tool already expects these exact names). The naming is consistent throughout the codebase, which is the part that actually matters — the specific scheme matters less than everyone following it.

## 3. Accessibility baseline

Standard target across nearly all major systems in 2026 is **WCAG 2.1/2.2 Level AA**: 4.5:1 contrast for body text, 3:1 for large text and UI components, visible focus indicators, 44×44px minimum touch targets. Carbon goes further and layers in Section 508 and EU standards. The best practice is to push this decision into the token layer so individual designers don't have to re-derive contrast-safe pairs by hand.

**Where PixelDosa stands:** no documented contrast audit yet. The dark-mode neutrals were hand-converted from a measured Linear snapshot (per the code comments — "not bit-exact"), which is a good provenance note but means the actual contrast ratios haven't been verified against AA. This is worth doing before the token set is called done — I can run it as part of the verification pass.

## 4. Documentation & governance

Systems that scale well share: a documented contribution/change process, an ownership model (a named owner beats "everyone owns it" — shared ownership is the most commonly cited failure mode in 2026 governance write-ups), semantic versioning on token and component changes, and per-component usage docs (when to use, when not to, do/don't examples, accessibility notes).

**Where PixelDosa stands:** none of this exists yet — no CONTRIBUTING doc, no versioning policy on the tokens/UI packages, no per-component usage guidance beyond code comments. Given there's already a working registry with 5 components (`button`, `field`, `overlay`, `ghost-input`, `card`), this is worth setting up before the component count grows further — retrofitting governance onto an already-sprawling registry is much harder than starting it now.

## 5. Where PixelDosa is already ahead of the curve

Motion as a first-class token tier (`duration`, `easing`, `stagger`, emitted as both CSS custom properties and TS exports, with an explicit reduced-motion fallback contract) is more rigorous than most systems bother with — Carbon and Material both treat motion as documentation/guidelines rather than enforced tokens. Worth keeping and mirroring in Figma as real variables, which is already done.

## Recommended priority order

1. Run a contrast/accessibility audit on the existing semantic pairs (cheap, high value, catches real bugs).
2. Decide deliberately on primitive tier: add one now, or explicitly document "flat by design" so it's not read as an oversight later.
3. Write a one-page ownership + versioning policy before the component registry grows past 5.
4. Consider a DTCG-format JSON export if you ever want tokens to flow into non-Style-Dictionary tooling (Tokens Studio, Supernova) or into a native iOS/Android app later.

## Sources

- [Design Tokens Format Module — W3C Design Tokens Community Group](https://www.designtokens.org/tr/drafts/format/)
- [Design Tokens specification reaches first stable version](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)
- [Token Tiers: building token architecture in layers — Honcho](https://honcho.agency/design-systems/glossary/token-tiers)
- [Design Tokens: global, alias and component tokens — Medium](https://medium.com/@yamini1020.yanamala/design-system-what-are-global-alias-and-component-tokens-part-1-78420a5827a1)
- [Naming Tokens in Design Systems — Nathan Curtis, EightShapes](https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676)
- [Best Practices For Naming Design Tokens — Smashing Magazine](https://www.smashingmagazine.com/2024/05/naming-best-practices/)
- [Carbon Design System — Accessibility overview](https://carbondesignsystem.com/guidelines/accessibility/overview/)
- [Design System Accessibility — UXPin](https://www.uxpin.com/studio/blog/design-system-accessibility/)
- [How to Create a Design System Governance Plan — Netguru](https://www.netguru.com/blog/design-system-governance)
- [Design system governance: who owns what — Product Rocket](https://productrocket.ro/articles/design-system-governance/)
- [Carbon (IBM) — Design System Breakdown](https://www.designsystems.one/design-systems/carbon-design)
