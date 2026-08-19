# Command Menu — Build Plan

Status: **draft, awaiting review**. Pilot component for the Pixeldosa build process (see `ROADMAP.md`).

---

# Research

Two tracks, per the Planning phase in `.agents/skills/pixeldosa-components/SKILL.md`.

**Pattern research.** Command palettes were pioneered by Sublime Text (`⌘+Shift+P`) and are now standard on the web via `⌘K` (Linear, Vercel, GitHub, Notion, Raycast) — there's no need to justify using the conventional shortcut. Structurally it's the ARIA combobox pattern: a text input that keeps focus while `aria-activedescendant` points at the highlighted row in a `listbox`. That distinction matters — the highlighted item is never *actually* focused, which is what lets fast typing and arrow-key navigation coexist correctly for screen reader users too. It also serves two audiences at once: power users who type/arrow-key without looking, and casual users who need visible hotkey hints and sensible defaults before they've typed anything. A good implementation doesn't force a choice between them.

**Company research, and why each one works:**

- **Linear** — keyboard-first culture, mnemonic G-prefixed navigation (`GI` inbox, `GM` my issues) and single-letter actions (`C` create, `S` status). Why it works: shortcuts are hierarchical and guessable rather than arbitrary, so muscle memory forms fast, and `?` always surfaces the full shortcut list — the system documents itself. Takeaway: any shortcuts we ship should be legible, not clever, and the palette itself should double as shortcut-discovery UI.
- **Vercel (Geist design system)** — has a real, shipped, accessibility-audited spec for this exact component ([vercel.com/geist/command-menu](https://vercel.com/geist/command-menu)), the single most directly reusable reference found. Key rules pulled from it: CommandMenu is reserved for *global* cross-app actions only — a menu opened from a visible trigger is `Menu`, right-click is `ContextMenu` (a boundary Pixeldosa should also draw, so people don't reach for Command Menu when they mean a dropdown); items are Title Case verb phrases because commands *act*, they don't browse (`Deploy Project`, never `Go to project page`); the empty-input state shows recents/defaults, never a blank box, because the palette has to be useful before anyone types; sub-pages preserve the typed query on back-navigation; focus traps in the overlay and returns to the trigger on close.
- **Raycast** — the discipline is restraint: hover feedback is an opacity shift (0.6), not a color swap, keeping the surface calm; the product philosophy is "do things, not open things" — every result should be one keystroke from execution. Where it overreaches (per Destiner's critique below): every OS-level toggle ships in the default unfiltered view with no easy way to trim it — a caution against over-populating the empty/default state.
- **Notion** — groups results by category as the default organizing principle, and uses prefix-triggered mode switches (`/` for blocks, space for AI-only commands) — a scoped-palette pattern worth knowing about for later AI-pillar components even though this v1 doesn't need it.
- **Arc** — its command bar surfaces inline results from connected services (e.g. recent Notion pages) rather than a separate search mode — one of two valid approaches to the "built-in search" extension point noted below.
- **Destiner, "Designing a Command Palette"** (independent cross-product analysis) — the sharpest single list of requirements: list every action reachable via menus, not a curated subset; show hotkeys inline so the palette teaches itself; fuzzy search is a requirement, not a nice-to-have, because users mistype and half-remember names; discoverability at the empty state matters as much as search accuracy (independently confirming Vercel's "recent/default items" rule from an unrelated source); the palette must be togglable — triggering it again while open should close it.
- **cmdk** (the library several of the above build on, including Vercel's own menu) formalizes the accessibility contract described above and ships filtering/sorting/keyboard-nav correct by default, provided custom styling doesn't strip the generated ARIA attributes.

**Common mistakes across sources:** untrapped focus (tabbing out of an open overlay), no open/closed announcement for screen readers, icon-only rows with no `aria-label`, and result counts that change silently with no live region — Vercel's spec calls this last one out explicitly (`aria-live="polite"` on the result count).

---

# User Workflow

**Who:** a developer using an app built with Pixeldosa — most relevantly, a developer who installed Command Menu into their own product via `npx shadcn add`.
**What:** jump to a destination, run an action, or search app content without leaving the keyboard.
**When it appears:** bound globally to `⌘K`/`Ctrl+K`, plus optionally a visible trigger button for mouse users and for people who don't know the shortcut yet.
**Before:** the user is mid-task anywhere in the app and doesn't want to break flow reaching for the mouse.
**After:** an action fires immediately, or the user is navigated — the palette should close instantly either way; no confirmation step for reversible actions.

# Product Context

Relevant for any product with enough destinations or repeat actions that menu-hunting has real cost — dashboards, admin panels, developer tools. Trigger is the shortcut (primary) or a visible search button, often shown in a navbar with the shortcut hint inline (a small `⌘K` badge) — the badge is itself a discoverability mechanism, not just decoration. Business dependency: reduces time-to-action for repeat users, an efficiency/retention lever for whatever product installs it. Visible: query input, grouped results with icons, per-item keybind hints, group headings. Hidden until relevant: once a flat list would exceed ~30 items, it collapses into scoped sub-pages instead of growing indefinitely. The decision it speeds up is simply "where do I go / what do I run" — one searchable surface instead of two separate mental models (nav vs. menu).

# Component Strategy

**Pattern**, not primitive, not full workflow.

More than a primitive: it composes several sub-parts (input, list, group, item, empty state) with interaction contracts that have to move together as one unit — that's a pattern, not a single-responsibility control like `Button`. Not a workflow/experience: it holds no state beyond open/closed and query, and delegates the actual command list and execution to whatever installs it. It composes the existing `overlay` primitive for scrim/positioning rather than reinventing overlay mechanics, which also validates that primitive under real use. This also sets a useful precedent — most of the remaining Product-tier components (Sidebar, Data Table, Multi-step Form) will likely land at "pattern" too, and Command Menu is a reasonable first case to calibrate that tier against.

# UX Flow

- **Entry:** `⌘K`/`Ctrl+K` anywhere, or click a visible trigger.
- **Primary action:** type to filter, arrow keys to highlight, Enter to execute the highlighted item.
- **Secondary actions:** click a result directly; Escape closes and returns focus to the trigger; Backspace on an empty query pops out of a sub-page, once sub-pages exist (see Variants).
- **Loading:** async result sources show an in-place loading affordance in the list region only — the input stays interactive, no full-overlay spinner.
- **Empty (no query yet):** show recents or a sensible default set — never a blank box. Confirmed independently by both Vercel's spec and Destiner's analysis.
- **Empty (query, no matches):** `No results match "{query}"`, quoting the literal query, per Vercel's content rule.
- **Error:** an async source failure shows inline in the list region with a retry affordance, not a blocking modal.
- **Success/after:** overlay closes immediately on action or navigation — no confirmation toast stacked on top for reversible actions.
- **Edge cases:** triggering the shortcut while already open toggles it closed (togglable, per Destiner); a per-item hotkey must not fire while the palette itself is capturing keystrokes for the query.
- **Responsive:** full-width sheet under ~640px instead of a centered floating panel; touch users get a visible trigger since `⌘K` has no on-screen-keyboard equivalent.
- **Accessibility:** focus trapped while open and returned to the trigger on close (delegates to Overlay's existing trap behaviour); `role="dialog"` wrapping a `combobox` input bound via `aria-activedescendant` to a `listbox`/`option` structure; `aria-live="polite"` region announcing result-count changes.
- **Keyboard:** `⌘K`/`Ctrl+K` open/toggle, `↑`/`↓` move highlight, `Enter` activate, `Esc` close, `Backspace` on empty pops a sub-page.

# Visual Direction

Centered floating panel on desktop, full-width sheet on mobile, max-width capped so results don't stretch line length uncomfortably. Generous vertical rhythm between groups, tight rhythm within a group — spacing itself signals grouping, not just the heading text. Input text sized slightly larger than list-item text since it's the primary focus target; group headings small, muted, Title Case (following Vercel's convention — it reads calmer than all-caps tracking). Tokens only, system-wide rule: `bg-popover`/`text-popover-foreground` for the panel, `bg-accent`/`text-accent-foreground` for the highlighted row, `text-muted-foreground` for headings and keybind hints. The highlighted row should be the only strong visual signal in the list — no competing icon colors or borders fighting it for attention. Optional per-item leading icon at `size-4`, muted by default so it recedes behind the label. Single elevated surface (shadow + scrim from Overlay), no nested cards inside the list. Comfortable density by default (matches Button's `h-9` rhythm), compact variant available for denser surfaces. Overall feel: calm and fast, closer to Raycast's restraint than a busy autocomplete widget.

# Motion Plan

Entrance reuses Overlay's existing fade + slight scale-up rather than inventing bespoke motion — keeps this consistent with every other overlay-based component. Exit mirrors entrance but faster, since dismissal should feel quicker than arrival (a convention confirmed across the reference products, not just an aesthetic guess). Highlighted-row background transitions on the fast/instant duration token with no easing overshoot — state feedback, not decoration, same rationale as the Button's press-feedback note already in this file. Loading uses the existing reduced-motion-safe pulse convention on the list region, not a spinner overlay. When filtered result count changes, the list container's max-height animates on the fast duration token rather than snapping, to avoid layout jank — but only above the reduced-motion threshold. Under `prefers-reduced-motion`: overlay entrance/exit fall back to Overlay's existing opacity-only behaviour (no scale), and list reflow becomes an instant height snap. Every motion here maps to a state change — open/close, highlight, loading, result-count change — none of it is decorative.

# AI Opportunities

Applicable, but deliberately scoped down for v1 — this is a `core` product-pillar component, not `ai`-pillar, so AI is additive, not a defining feature.

- **Natural-language command resolution** (v2 idea): interpreting the query itself rather than just fuzzy-matching it, so "make this issue urgent" resolves to "Set Priority: Urgent" even without a literal string match. Genuinely useful, but it belongs at the Prompt Composer / AI Suggestion Card level — pulling it into v1 would blur this primitive's contract and add a dependency it doesn't need yet.
- **AI Suggestion Card** (from the roadmap's AI tier) could later plug into the same "Suggestions" group slot the empty-state spec already requires — worth shaping that group API so it can host either static recents or an AI-suggested item later without a breaking change.

Decision: no AI-specific behaviour ships in v1. The API is shaped so an AI-powered suggestion source can be added later as just another item group.

# Variants

- **Default** — comfortable density, centered floating panel.
- **Compact** — tighter row height for dense product surfaces (later: Dashboard Shell, Command Workspace blocks).
- **Scoped/multi-page** — supports Vercel's "pages" pattern for apps with >30 flat actions. Not built in v1; the API is left additive so it can be introduced later without a breaking change (see Public API).
- **Mobile/touch** — full-width sheet, larger touch targets, requires a visible trigger since there's no on-screen `⌘K`.

Deliberately not building: an "AI" variant (see above — deferred, not cut), or an "Enterprise" variant (no concrete requirement surfaced by research; would be speculative).

# Public API

```tsx
<CommandMenu open={open} onOpenChange={setOpen}>
  <CommandMenuInput placeholder="Type a command or search…" />
  <CommandMenuList>
    <CommandMenuEmpty>No results match "{query}"</CommandMenuEmpty>
    <CommandMenuGroup heading="Recent">
      <CommandMenuItem onSelect={fn} icon={<Icon />} keybind="⌘S">
        Save Changes
      </CommandMenuItem>
    </CommandMenuGroup>
    <CommandMenuSeparator />
  </CommandMenuList>
</CommandMenu>
```

- Composition mirrors the sub-component pattern `Field` already established in this repo (`FieldLabel`, `FieldControl`, ...) rather than one monolithic prop-driven component — consistent with the codebase, and necessary here since consumers supply arbitrary items/groups.
- `CommandMenuItem` takes `onSelect`, optional `icon`, optional `keybind` (rendered through a `Kbd`-style slot so it's both visible and announced, per Vercel's rule), and `disabled`.
- `open`/`onOpenChange` is **controlled-only**, no internal-state fallback — the global keybind listener has to live in the consumer's app anyway, so controlled state matches how it actually gets wired; an uncontrolled mode would be a false convenience.
- No fuzzy search hardcoded into the primitive — filtering is exposed as an injectable `filter` prop with a sensible default (matching `cmdk`'s approach), so consumers with structured or remote data sources aren't fighting a built-in matcher.
- `CommandMenuPage`/nested scoping is deferred but the API is additive-only, so it can ship later without breaking v1 consumers.
- Theming/dark mode: tokens-only, free by default per system rules.

**Open question for you:** this leans on `cmdk` as a dependency for the combobox/filter engine, the same way `button` leans on Radix Slot — building the ARIA combobox contract from scratch would be re-auditing a well-tested wheel. Flag if you'd rather build it from first principles instead.

# Registry Structure

- `name`: `command-menu`
- `categories`: `["core", "navigation", "action"]`
- `dependencies`: `cmdk` (pending your call above), plus the existing `class-variance-authority` / `clsx` / `tailwind-merge` set.
- `registryDependencies`: `@pixeldosa/pixeldosa-theme`, and likely `overlay` for scrim/positioning (composition, not duplication) — need to confirm the shadcn registry protocol supports one registry item depending on another; if not, we vendor the minimal Overlay usage directly rather than duplicating its logic.
- Docs page: `apps/web/content/docs/components/command-menu.mdx` — Usage section shows the default composed example; Props table documents each sub-component, not just the top-level `CommandMenu`.
- Related components: `overlay` (composition dependency), future `search-input` (Product tier), and possibly a small `kbd` primitive for rendering keybind hints if one doesn't exist yet — flagging this as a likely small prerequisite.
- Future templates: this unlocks the `Command Workspace` and `Dashboard Shell` blocks later on the roadmap.

# Documentation Notes

**One-line description:** A global, keyboard-first overlay for finding resources and running actions across an app.
**Problem solved:** collapses navigation and action execution into one searchable, keyboard-driven surface, cutting the steps between "I want X" and "X happens."
**When to use:** apps with enough destinations/actions that menu-hunting has real cost — dashboards, admin tools, developer products.
**When not to use:** a single-page marketing site, or a menu triggered from one visible button/row — use `Menu` or `ContextMenu` instead (this boundary comes directly from Vercel's spec and is worth stating explicitly so people don't reach for Command Menu when they mean a dropdown).
**Key differentiators:** composes the existing `overlay` primitive instead of a bespoke modal; controlled-only API matched to how the global shortcut actually has to be wired in a host app; empty-state and no-results content rules are baked into the sub-components' contract instead of left for every consumer to reinvent.

# Pixeldosa Score

- **Design Value: 9/10** — one of the most referenced, most scrutinized patterns in modern product design; getting the details right is a strong statement for the whole registry.
- **Developer Value: 9/10** — real implementation time saved (ARIA combobox correctness is easy to get subtly wrong), and one of the most commonly hand-rolled components in dashboards — high install likelihood.
- **Business Value: 7/10** — indirect: an efficiency/retention lever for host products rather than revenue-generating on its own, but exactly the kind of component that tips a team toward adopting a registry instead of building in-house.
- **Marketing Value: 8/10** — flagship, homepage-demo-worthy; visually and interactively more impressive than a static component like Button.
- **Reusability: 9/10** — nearly every dashboard/product surface needs one, and it's the first component to validate the `overlay`-composition pattern other Product-tier components will likely reuse.
- **Originality: 5/10** — intentionally not novel. The value here is disciplined execution of a known contract, not invention — consistent with this file's existing "motion must earn its place" stance against novelty for its own sake.
- **Learning Value: 9/10** — as a first build together it touches nearly every hard part at once: composed sub-component API design, ARIA combobox correctness, focus management, controlled state, and content/copy rules.

No score lands below 6 — plan is ready to build, pending your review below.

# Next Steps

1. **Your review** — flag anything to cut, add, or redirect. Two open questions above worth a direct answer: the `cmdk` dependency call, and whether a `kbd` primitive should be built alongside this one or deferred.
2. On approval: implement `command-menu.tsx` + `.demo.tsx` + `registry-item.json`, composing the existing `overlay` primitive.
3. Local visual QA (dev server + screenshots) and a self-run accessibility check before showing you the built result.
4. Wire into `registry-demos.ts`, `packages/ui/src/index.ts`, the docs page; run `pnpm registry:build`.
5. Mark shipped in `ROADMAP.md`.
