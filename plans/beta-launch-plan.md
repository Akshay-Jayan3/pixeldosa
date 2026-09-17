# PixelDosa Beta — Launch Plan

_Written 2026-09-14. Supersedes the build order in `pixeldosa-shipping-plan.md` for what
ships next and how it's announced. ROADMAP.md stays the full inventory._

## The decision

**Launch in beta now, then ship in weekly drops.** Each drop is small (one or two
components, or one block), gets its own announcement, and lands in a public changelog.
A finished big-bang release would hide the most valuable signal — which components
people actually install and ask for — until it's too late to act on it.

Beta means: the registry is live and installable, APIs may change between drops
(announced in the changelog), and feedback shapes the order of later drops.

## Positioning

> **PixelDosa is the trust layer for AI products.** Components for the moments where
> people decide whether to trust an agent — before it runs, while it works, and when
> they review what it did. Pure React, no SDK lock-in, installable by you or your
> coding agent.

What we don't claim: a general-purpose UI kit. Primitives (buttons, dialogs, tabs,
tables) stay shadcn/ui's job; PixelDosa composes on top of them.

---

## 1. Competitive check — the AI section of a general UI kit

The reference library (screenshot, 2026-09-14) is a broad kit: Layout, Feedback,
Overlays, Navigation, Data display, Primitives, Forms, plus an **AI** section of 12.

| Their AI component | PixelDosa | Status |
| --- | --- | --- |
| Agent Activity | Live Status Line, Agent Presence, Thinking Experience | ✅ covered, deeper |
| Thinking Indicator | Agent Presence (11 states, turn-taking grammar) | ✅ covered, deeper |
| Reasoning | Reasoning Stream | ✅ covered |
| Tool Call | Tool Call Card + Tool Call Group | ✅ covered |
| Sources | Inline Citations (passage + deep link) | ✅ covered, deeper |
| Composer | Prompt Composer (structured controls) | ✅ built |
| Todo List | Agent Plan (editable, pre-run) | ⚠️ **partial** — no live progress while running |
| File Diff | Diff Accept (prose, per-hunk) | ⚠️ **partial** — no code/multi-file diff |
| Message | — | ❌ **gap** (already planned) |
| Message Scroller | — (scroll anchoring exists inside Reasoning Stream) | ❌ **gap** |
| Code Block | — (docs site has one, not in the registry) | ❌ **gap** |
| Suggestion | — (only as props on Composer and Steer) | ❌ **gap**, small |

**What they have that we don't:** the chat fundamentals — Message, Message Scroller, Code
Block, Suggestions — and live progress on a plan. Without these, a team building a
normal assistant has to leave PixelDosa for the most common screen.

**Decision (2026-09-14): the chat fundamentals ship before launch**, as the pre-launch
build set in §2. Beta opens as a complete kit: a team can build an ordinary assistant
*and* its trust moments without a second library.

**What we have that they don't (the moat):** Intent Preview, editable Agent Plan, Agent
Steer, AI Approval Gate, Agent Ask, AI Triage Table, Autonomy Control, Agent Memory,
Confidence Meter, AI Context Surface, Smart Field / AI Form Fill, Diff Accept, Generation
Placeholder, and the Thinking Experience block. Their AI section shows what an agent is
doing; ours lets people **steer, approve, verify and correct** it.

**Their other 50 components:** don't chase them. Rebuilding primitives dilutes the
positioning and competes with shadcn/ui, which our users already have.

### Opportunities neither of us covers (from our research)

Ranked by how often the problem shows up in the research and how well it fits our story:

1. **Response Versions** — regenerate without losing the previous answer ("2 of 3"),
   compare, keep one. People regenerate constantly and lose good answers.
2. **Response Feedback** — thumbs plus a structured reason ("wrong source", "too long")
   that routes somewhere. Today "Report" in AI Action Toolbar is a dead end.
3. **Live Plan (Todo) progress** — Agent Plan's steps ticking through running / done /
   failed / skipped, with the current step expanded. Closes the Todo List gap *and* the
   "is it stuck?" anxiety.
4. **Change Summary** — multi-file / code diff for agent edits, per-file accept, grouped by
   effect. Closes the File Diff gap for coding and ops agents.
5. **Context & Cost Meter** — how full the context is and what a run costs, with
   thresholds, not raw token counts.
6. **Human Handoff** — "a person will take it from here", with what gets passed along.
7. **Artifact Panel** — side-by-side output (doc, code, image) next to the conversation.
8. **Voice Presence** — Agent Presence driven by audio input and output levels.

---

## 2. Before launch — build set and beta readiness (about three weeks)

Everything here is required before the first announcement.

### Pre-launch build set — chat fundamentals

Built in this order; each goes through the normal process (build, demo, registry item,
docs, QA, build). They're held back from announcements until launch week.

| # | Build | What it must get right |
| --- | --- | --- |
| 1 | ✅ **Message** (built 2026-09-14) | User and assistant roles; streaming text that never fakes typing; a slot for Reasoning Stream, Tool Call Group and Inline Citations *inside* the message; states for streaming, done, failed (with retry) and stopped; AI Action Toolbar attached. |
| 2 | ✅ **Message Scroller** (built 2026-09-14) | Stick to bottom only while the reader is at the bottom; "Jump to latest" with an unread count when they've scrolled up; no jump when older messages load above; a live region that announces completed messages, not every token. Reuses the scroll anchoring proven in Reasoning Stream. |
| 3 | ✅ **Code Block** (built 2026-09-14) | Safe with partial streaming (an unclosed fence doesn't break layout); copy with confirmation; optional Apply / Insert action; language label; long lines scroll; no dependency on a heavy highlighter (pluggable). |
| 4 | ✅ **Suggestions** (built 2026-09-14) | Follow-up chips after an answer; fill the composer or send (the caller chooses and it's labelled); keyboard navigable; never shown while streaming. |
| 5 | ✅ **AI Chat Experience** (block, built 2026-09-14) | Message, Message Scroller, Prompt Composer, Suggestions, Reasoning Stream, Tool Call Group, Inline Citations and Agent Presence composed into one working assistant screen. The hero demo for launch. |

### Content and site
- [x] Commit pending work: Prompt Composer, browse-card thumbnails.
- [x] Apply the thumbnail treatment to the homepage previews.
- [x] Homepage rewrite around the positioning line above, with the before / during / after
  structure and one hero demo (AI Chat Experience).
- [x] **"Beta" badge** in the header and a one-paragraph "What beta means" note on `/docs`.
- [x] **Changelog page** (`/changelog`) — one entry per drop, dated, with a link to each component.
- [x] **"New" badge** in the sidebar (and browse cards) for components added in the last two drops.
- [ ] Per-component social image (title + thumbnail) for link previews.

### Quality gate
- [x] Light mode pass on every component (2026-09-15: automated contrast audit of all 40 pages in both themes, 0 failures after fixes).
- [x] Keyboard and screen reader smoke test on the 5 hero components (2026-09-15: axe-core on all 35 component pages, 0 violations; real-key walk of the heroes; screen-reader tree checked. Not yet tested with a real screen reader).
- [x] Fresh-project install test of 5 components through the CLI and through a coding agent (2026-09-15: fresh Next.js 15 + shadcn project; installed, typechecked, built and ran; agent discovery via `shadcn search`, llms.txt and the agent guide checked; 5 issues fixed)
- [ ] Remove or finish anything half-done that a visitor could reach.

### Feedback loop
- [x] GitHub issue templates: "Component or template request" and "Bug" (2026-09-17).
- [ ] One place to follow drops (X/LinkedIn plus the changelog). A newsletter can come later.
- [ ] Basic analytics on docs page views and install-command copies, to rank what's used.

### Announcement assets
- [ ] 20–40s screen recording per hero component, captured from the live demos.
- [ ] Launch thread outline: the trust problem, then before / during / after with a clip each,
  then "install with your coding agent", then the link.

---

## 3. Beta launch (Drop 0) — "The trust layer"

Everything already built goes live together, but it's **announced as three stories**
over the launch week, not as a list of 24 names:

| Day | Story | Components shown |
| --- | --- | --- |
| Launch day | **The assistant, done right** — the full AI Chat Experience block | Message, Message Scroller, Prompt Composer, Code Block, Suggestions |
| +1 day | **Before it runs** — confirm intent, agree on the plan | Intent Preview, Agent Plan, Autonomy Control |
| +2 days | **While it works** — see it, steer it, approve it | Agent Presence, Live Status Line, Reasoning Stream, Agent Steer, AI Approval Gate, Agent Ask, Thinking Experience |
| +4 days | **When you review** — verify and correct | Inline Citations, Tool Call Card, AI Triage Table, Diff Accept, Confidence Meter, Agent Memory |

Also live, and mentioned in the docs rather than the thread: Smart Field, AI Form Fill,
Ghost Input, Selection Actions, AI Action Toolbar, AI Context Surface, Generation
Placeholder.

---

## 4. Weekly drops after launch

One drop per week. With chat shipped at launch, drops lead with what nobody else has.
Re-rank after every drop using install counts and issue requests.

| Drop | Ships | Why now | Announce as |
| --- | --- | --- | --- |
| **1** | **Live Plan progress** (Agent Plan running states) | Closes the Todo gap and "is it stuck?" | "Watch the plan happen" |
| **2** | **Response Versions** + **Response Feedback** | Top research pain; plugs straight into Message | "Regenerate without regret" |
| **3** | **Change Summary** (multi-file / code diff) | Closes File Diff gap; builds on Code Block | "Review agent edits like a PR" |
| **4** | **Variation Grid** + **Prompt → Result** block | Unlocks the generation story with Generation Placeholder | "From prompt to pick" |
| **5** | **Polish drop** — `stale` on Diff Accept, `uncertain` on Confidence Meter, scroll anchoring on Progressive Reveal, AI Action Toolbar adoption | Quality signal | "Details we went back for" |
| **6** | **Context & Cost Meter** | Builders ask about cost early | "Know the cost before the bill" |
| **7** | **Artifact Generation** block (audio/video result surface included) | Multimodal story | "Generation you can trust" |
| **8** | **Human Handoff** | Support and ops agents | "When a person should take over" |
| **9** | **Artifact Panel** | Side-by-side output next to the conversation | "Work beside the chat" |
| **10** | **Voice Presence** | Voice agents | "An agent you can hear thinking" |

After Drop 7, cut **v1.0** if the exit criteria below are met. Drops continue after it.

### What each drop includes (definition of done)
1. Component(s) through the normal process: build, demo, registry item, docs, QA, build.
2. Changelog entry and "New" badge.
3. 20–40s recording from the live demo.
4. Post: one sentence on the problem, the clip, the install command.
5. Agent guide updated, so coding agents pick the new component up.

---

## 5. Cut, parked, or explicitly not doing

| Item | Decision | Why |
| --- | --- | --- |
| Primitives, Layout, Navigation, Forms (≈50 in the reference kit) | **Not doing** | shadcn/ui covers them; building them dilutes the positioning |
| Data Table, Tabs, Empty State, Skeleton (own versions) | **Not doing for beta** | Use shadcn/ui inside blocks. Revisit only if a block needs behaviour shadcn lacks. |
| Product Blocks (Dashboard Shell, Settings Page, …) | **Parked** | Not the trust story |
| Motion Blocks (Scroll Story, Product Tour, …) | **Parked** | Marketing surface, not the product |
| Trace Waterfall, Agent Health Grid, Knowledge Graph Explorer, Retrieval Inspector | **Post-1.0** | Developer tooling; different audience |
| Bulk Prompt Table, Task Plan Runner, Error Replay Card | **Post-1.0**, re-rank on demand | Valuable, but niche for beta users |
| Human Handoff, Artifact Panel, Voice Presence | **Drops 8–10**, re-rank by request volume | Useful, but after the trust and generation stories |
| Figma sync | **Parked** | Only after the component API settles at 1.0 |

---

## 6. v1.0 exit criteria

- Chat fundamentals shipped at launch, and proven by at least one outside assistant built with them.
- No breaking API change in the last three drops.
- Light and dark, keyboard, and screen reader checks done on every component.
- Install verified from a clean project for every component, including through a coding agent.
- At least five external projects using it, or a clear signal of which components matter.

## 7. Weekly rhythm

- **Mon–Wed:** build and QA the drop.
- **Thu:** docs, changelog, recording.
- **Fri:** announce. Collect feedback over the weekend.
- **Mon:** re-rank the next drops from installs and requests.
