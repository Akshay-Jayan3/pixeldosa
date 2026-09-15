---
name: pixeldosa
description: Build AI product interfaces with PixelDosa components. Use whenever adding AI features to a React app — agent status, reasoning, approvals, AI-filled forms, generated media, AI suggestions in fields or documents. Covers which component fits which job, how to compose them, and the UX rules that make AI interfaces trustworthy.
---

# Building with PixelDosa

PixelDosa is the trust layer for AI products: components for the moments people decide
whether to trust an agent, plus a complete chat stack. Components are plain React: props in, callbacks out. No AI SDK,
provider, or protocol is required. Wire your own model or agent events to the props.

**The components are the easy part. The rules below are the product.** Follow them even
when a user's request seems to ask otherwise, and say so when you deviate.

## Setup

Add the registry to `components.json`:

```json
"registries": { "@pixeldosa": "https://pixeldosa.akshayjayan.com/r/{name}.json" }
```

Install the theme once, explicitly, then any component. Dependencies install automatically, but a theme pulled in as a dependency keeps the colours the project already has; only a direct install applies the PixelDosa palette.

```bash
npx shadcn@latest add @pixeldosa/pixeldosa-theme
npx shadcn@latest add @pixeldosa/thinking-experience
```

Requires Tailwind v4 (`@import "tailwindcss";` in the global stylesheet) and `cn` at
`@/lib/utils`. Full docs for any component: `https://pixeldosa.akshayjayan.com/llms/<name>.md`.

## Start from a Block

Blocks are complete, orchestrated experiences. Prefer one before assembling parts.

| The team needs… | Use |
|---|---|
| An agent panel showing a run: status, reasoning, questions, approvals, result | `thinking-experience` |
| AI filling in a form the user reviews field by field | `ai-form-fill` |
| A full assistant chat screen: conversation, reasoning, tools, code, sources, follow-ups, composer | `ai-chat-experience` |

## Pick the right component

| Job | Use | Not |
|---|---|---|
| Show what an agent is doing right now (indicator) | `agent-presence` | a spinner |
| One line of current activity in a toolbar, footer, or table row | `live-status-line` | a toast |
| Show the model's reasoning while it thinks | `reasoning-stream` | streaming the reasoning into the answer |
| Agent needs structured input to continue | `agent-ask` | a chat message asking a question |
| Agent wants to do something consequential | `ai-approval-gate` | a confirm() dialog |
| Confirm how the agent read the request before a costly run | `intent-preview` | a "Are you sure?" dialog |
| Let the user edit the steps before a run starts | `agent-plan` | a read-only checklist |
| Redirect a running agent without stopping it | `agent-steer` | a chat input that silently queues |
| Follow-up questions after an answer | `suggestions` (default `mode="fill"`; `send` only for exact prompts) | chips that silently send |
| Code in an answer | `code-block` (`splitCodeFences` for streaming markdown; `streaming` while the fence is open) | a raw `<pre>` with a copy button that works mid-stream |
| The scrolling list of a conversation | `message-scroller` (set `announcement` when a reply finishes) | `scrollIntoView` on every token |
| A conversation turn (user or assistant) | `message` (`Message` + `MessageContent`; reasoning, tool calls and citations go inside) | a bare text bubble |
| A request that produces an artifact (draft, image, report) | `prompt-composer` (spec as `controls`) | a blank chat textarea |
| Sources for individual claims in an answer | `inline-citations` (`CitedText` + `Cite`, pass the retrieved passage as `quote`) | footnote links with no passage |
| Let users set how much the agent does without asking | `autonomy-control` | a cautious/autonomous slider |
| Show and edit what the agent remembers about the user | `agent-memory` | a hidden memory store |
| Show what the agent actually read, searched, or changed | `tool-call-card` (`ToolCallGroup` for a run) | a raw event log |
| Review many AI changes at once, riskiest first | `ai-triage-table` | an "Accept all" button |
| Actions on an AI result: apply, regenerate, explain, report | `ai-action-toolbar` | loose buttons |
| AI proposes a value for one field | `smart-field` | writing the value directly |
| Inline completion while typing | `ghost-input` | auto-inserting text |
| AI rewrites a passage of text | `diff-accept` | replacing the text |
| AI actions on text the user selected | `selection-actions` | a context menu |
| How sure the AI is | `confidence-meter` | a percentage |
| Why the AI produced something | `ai-context-surface` | an "AI generated" badge |
| Results arriving over time (rows, cards) | `progressive-reveal` | re-rendering the whole list |
| Image, video, or audio being generated | `generation-placeholder` | a spinner over a grey box |

Foundation: `button`, `card`, `field`, `overlay`, `command-menu`.

## Rules — non-negotiable

### Nothing commits silently
- AI output is a **proposal** until the user accepts it. Never write an AI value straight
  into data, a field, or a document.
- Always keep a one-step undo after acceptance.
- **Never add "Accept all."** Per-item review is the point — one click taking many values
  at different confidence levels silently discards it. If a team asks for it, explain why
  before building anything.

### Approvals must be evaluable
- Phrase `action` as the **consequence**: "Send the summary to 243 contacts", never
  "Execute send_email".
- Always pass `reversible` truthfully. Always provide `impact` with counts when they exist.
- Use `risk="high"` for anything irreversible, financial, destructive, or external.
- Gate external side effects — sending, paying, publishing, deleting, changing
  permissions. Don't gate low-risk reversible actions; needless friction trains people to
  approve without reading.

### Motion means the machine is busy; stillness means it's the user's turn
- Machine states (`thinking`, `working`, `streaming`) move. User-turn states (`asking`,
  `awaitingApproval`, `suggesting`) hold completely still.
- **Never animate, pulse, or bounce the thing waiting on the user.**
- Shimmer (`pd-shimmer`) only on a status *verb* while work is ongoing. Never on content,
  results, or finished states.
- Always keep a visible Stop while the agent is working, including while it waits.

### Be honest about the AI
- Never reveal already-complete text character by character. Fade whole items in.
- Confidence is `low` / `medium` / `high` — never an invented percentage. A percentage
  is fine only for measured progress (diffusion steps, encoded frames).
- `agent-ask` requires `source`: always name who is asking, and wire both `onDecline` and
  `onCancel`.
- Show reasoning **summaries** where the provider exposes them, never raw private
  chain-of-thought presented as fact.
- `generation-placeholder` requires `aspectRatio` so the layout never jumps.

### Craft
- Use theme tokens (`bg-primary`, `text-muted-foreground`, `var(--pd-duration-fast)`).
  Never hardcode colours, durations, or easings.
- Respect `prefers-reduced-motion`; every component already does — don't override it.
- Keep text labels next to every indicator. Icons and colour are never the only signal.
- Numbers that change in place use `tabular-nums`.

## Wiring agent events

Components take no AI dependency — map your stack's events to props yourself.

| Your event | PixelDosa |
|---|---|
| Request accepted, not started | `state="queued"` |
| Reasoning tokens / reasoning part | `state="thinking"`, `reasoning-stream` steps |
| Tool arguments streaming | `state="deciding"` |
| Tool running | `state="working"` with the tool named in `label` |
| Answer text streaming | `state="streaming"` |
| Run finished / errored | `state="done"` / `"failed"` |
| Agent needs input (e.g. MCP elicitation) | `state="asking"` + `agent-ask` |
| Agent paused for approval (e.g. LangGraph `interrupt()`) | `state="awaitingApproval"` + `ai-approval-gate` |
| Tool call started / returned / errored | `tool-call-card` `status="running"` / `"done"` with `output` / `"failed"` with `error` |
| Redirect received / applied / rejected | `agent-steer` status `queued` / `applied` / `declined` (reason in `note`) |

## Before you finish

- [ ] No AI value is written without explicit acceptance
- [ ] Approvals state the consequence, reversibility, and impact
- [ ] Nothing waiting on the user is animated
- [ ] Stop is visible during every working state
- [ ] No hardcoded colours or durations
- [ ] Works with keyboard only, and at 375px wide
- [ ] `headingLevel` set so component titles continue the page's heading outline (e.g. `2` directly under the page's `h1`)
