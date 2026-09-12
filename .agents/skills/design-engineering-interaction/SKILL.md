---
name: design-engineering-interaction
description: >
  Build polished, production-quality UI components by treating visual design,
  interaction behavior, motion, accessibility, responsive behavior, and code
  architecture as one system. Use this skill whenever creating or refining
  frontend components, design-system primitives, Framer components, or UI
  patterns where quality and interaction details matter.
version: 1.0
---

# Design Engineering + Interaction Design Skill

## Mission

Build interfaces that feel **intentional, responsive, understandable, accessible, and finished**.

Do not treat a component as a static visual.

A production component is:

**Anatomy + Visual hierarchy + States + Behavior + Feedback + Motion + Accessibility + Responsive behavior + Content resilience**

The goal is not to add animation everywhere. The goal is to make every interaction communicate something useful.

---

# 1. Core Design Engineering Principles

## 1.1 Design for the user's goal

Before styling a component, identify:

- What is the user trying to accomplish?
- What action is primary?
- What information must be understood before acting?
- What can go wrong?
- What feedback does the user need?
- What should happen after success?
- How can the user recover?

Prefer the simplest interaction that communicates the answer.

## 1.2 Familiarity over novelty

Use established interaction patterns whenever possible.

Examples:

- Button → activates an action
- Checkbox → independent selection
- Radio → one choice from a group
- Switch → immediate on/off setting
- Tabs → switch between peer views
- Dialog → focused decision/task
- Popover → contextual information/action
- Tooltip → supplementary explanation
- Accordion → reveal/hide related content
- Dropdown → choose from a menu

Do not invent a gesture or interaction merely because it looks interesting.

## 1.3 Consistency compounds

Once a component establishes a behavior, reuse that behavior across the product.

The same semantic state should have the same:

- visual treatment
- motion language
- timing
- interaction model
- focus behavior
- error behavior

A component library should feel like one product, not a collection of isolated experiments.

## 1.4 Every visual decision should earn its place

Prefer:

- clear hierarchy
- strong alignment
- predictable spacing
- restrained decoration
- readable typography
- obvious affordances
- useful feedback

Avoid:

- decoration that competes with content
- animation without purpose
- excessive shadows
- unnecessary gradients
- tiny controls
- hidden functionality
- ambiguous icon-only actions

---

# 2. Component Anatomy

Every interactive component should be designed as a system.

Define:

1. **Root**
2. **Trigger / primary interaction**
3. **Content**
4. **Supporting elements**
5. **Feedback**
6. **State**
7. **Exit / recovery action**

Example:

```text
Button
├── Root
├── Label
├── Leading icon
├── Trailing icon
├── Loading indicator
└── Feedback state
```

For more complex components:

```text
Dialog
├── Trigger
├── Overlay
├── Content
│   ├── Header
│   ├── Title
│   ├── Description
│   ├── Body
│   └── Actions
└── Close
```

Use composition instead of building one giant configurable component.

Prefer:

```tsx
<Card>
  <Card.Header />
  <Card.Content />
  <Card.Footer />
</Card>
```

over dozens of boolean props that attempt to control every visual possibility.

---

# 3. State-First Design

Never design only the default state.

Before implementation, define the state machine.

## Universal interaction states

At minimum consider:

- default
- hover
- focus-visible
- pressed / active
- disabled
- loading
- success
- error

Depending on the component also consider:

- selected
- checked
- expanded
- collapsed
- open
- closed
- dragging
- dragged-over
- invalid
- readonly
- empty
- populated
- partially complete

Represent meaningful states explicitly.

Prefer semantic state names:

```text
closed
open
loading
success
error
disabled
selected
```

over vague visual booleans:

```text
isBlue
isBig
isHighlighted
```

The visual style should derive from semantic state.

---

# 4. State Matrix

For every interactive component, create a state matrix before coding.

| State | User sees | User can do | Feedback |
|---|---|---|---|
| Default | Normal component | Primary action | Clear affordance |
| Hover | Subtle emphasis | Activate | Pointer feedback |
| Focus | Strong focus indicator | Keyboard action | Focus location obvious |
| Pressed | Immediate compression/emphasis | Action underway | Tactile response |
| Disabled | Reduced emphasis | Nothing | Why/availability remains understandable |
| Loading | Progress indicator | Usually prevent duplicate action | Work is happening |
| Success | Confirmation | Continue/retry next task | Result is clear |
| Error | Error treatment | Correct/retry | Recovery path is obvious |

Do not automatically implement every state visually if the component does not need it, but explicitly decide.

---

# 5. Microinteraction Model

A microinteraction is a **trigger → feedback** relationship.

Use microinteractions to:

- confirm an action
- communicate system status
- prevent errors
- show a state transition
- preserve spatial context
- explain cause and effect
- add restrained personality

A microinteraction should normally be:

- single-purpose
- contextual
- brief
- easy to understand
- close to the action that caused it

### Trigger examples

- pointer enters
- pointer leaves
- press
- click
- keyboard focus
- value changes
- drag begins
- drag ends
- validation runs
- request starts
- request succeeds
- request fails
- content enters viewport

### Feedback examples

- color change
- opacity change
- scale
- position shift
- icon transition
- progress indicator
- inline message
- toast
- skeleton
- confirmation
- subtle sound/haptic where appropriate

---

# 6. Interaction Feedback Rules

## Immediate feedback

For direct manipulation, respond immediately.

Examples:

- button press → immediate visual response
- checkbox click → immediate checked state
- drag → element follows pointer
- toggle → thumb/state changes immediately
- navigation → show transition/loading state

Never make a user wonder whether their action registered.

## Preserve causality

Feedback should visually relate to the action.

If the user clicks a save button:

```text
Save
→ Pressed
→ Loading
→ Saved
```

Do not make an unrelated part of the screen suddenly animate unless that change explains the result.

## Keep feedback local when possible

Prefer:

```text
Input
→ inline validation
```

over:

```text
Input
→ unrelated global toast
```

Use global feedback when the result is global or the original context is unavailable.

---

# 7. Motion Rules

Motion must communicate something.

Use motion for:

- state change
- spatial relationship
- hierarchy
- continuity
- direct-manipulation feedback
- loading/progress
- attention when necessary

Do not animate simply because an animation is available.

## Motion hierarchy

### Level 1 — Instant

Use for:

- color changes
- very small visual state changes
- frequently repeated interactions

### Level 2 — Micro

Use for:

- button press
- hover
- icon transition
- checkbox
- toggle
- tooltip

Typical range:

```text
~100–180ms
```

### Level 3 — Component transition

Use for:

- popover
- dropdown
- accordion
- sheet
- modal
- expanding cards

Typical range:

```text
~180–300ms
```

### Level 4 — Large transition

Use carefully for:

- page transitions
- major layout changes
- onboarding
- large spatial transformations

Typical range:

```text
~250–500ms
```

These are starting points, not rigid laws. Interaction frequency and distance should determine timing.

## Easing

General rule:

- entering → ease-out / decelerating
- leaving → ease-in / accelerating
- moving between states → ease-in-out
- direct manipulation → track the user's input rather than playing an unrelated canned animation

Avoid exaggerated bounce for ordinary product UI unless it has a deliberate brand purpose.

## Motion should not block work

Users should not have to wait for animation to finish before continuing.

Animations should be:

- interruptible where possible
- short
- purposeful
- responsive to input

---

# 8. Reduced Motion

Always support reduced-motion preferences.

When reduced motion is requested:

- remove decorative movement
- reduce large translations/scales
- reduce repeated animation
- avoid parallax
- avoid unnecessary blur transitions
- prefer opacity or instant state changes where appropriate
- preserve functional feedback

Do not remove important information just because motion is disabled.

The state must remain understandable without animation.

---

# 9. Hover Is Not an Interaction Model

Hover exists primarily for pointer-based environments.

Never make hover the only way to:

- discover an action
- reveal essential information
- understand state
- perform a required task

For touch:

- no hover assumption
- use visible affordances
- support tap/press
- avoid requiring hover to discover controls

---

# 10. Focus Is a First-Class State

Keyboard focus must be visually obvious.

Never remove the browser focus indicator without replacing it with a better one.

Focus should:

- have sufficient contrast
- be clearly distinguishable from hover
- remain visible while navigating
- not be hidden behind overlays
- move logically when context changes

For complex components:

- manage focus intentionally
- return focus when a temporary surface closes
- trap focus when appropriate for modal dialogs
- support expected keyboard navigation

---

# 11. Accessibility Is Part of Component Design

Accessibility is not a finishing pass.

Every interactive component must answer:

### Semantics

- Is the correct native HTML element used?
- If not, is the semantic role correct?

### Keyboard

- Can it be reached?
- Can it be operated?
- Are expected arrow keys / Escape / Enter / Space behaviors supported?

### Focus

- Is focus visible?
- Is focus order logical?
- Does focus move correctly after opening/closing dynamic UI?

### Naming

- Does every interactive control have an accessible name?
- Are icon-only controls labelled?

### Status

- Is important status communicated without relying only on color?
- Are validation errors connected to their fields?
- Are asynchronous updates announced when necessary?

### Motion

- Does reduced motion work?

### Touch

- Are controls large enough and sufficiently separated?

Use native HTML semantics whenever they provide the required behavior.

---

# 12. Touch Target Rules

Interactive controls should be comfortable to operate.

As a baseline for web interfaces:

- target approximately 44px or larger when practical
- provide adequate spacing between adjacent targets
- don't judge target size only by the visible icon
- use the interactive hit area, not just the visual shape

A 16px icon can have a 44px hit area.

Do not create tiny clickable icons simply because the visual design looks cleaner.

---

# 13. Responsive Interaction

Responsive design is not only layout.

Consider changes in:

- input method
- control density
- navigation
- content priority
- touch targets
- hover availability
- keyboard access
- motion
- overlay positioning

A desktop dropdown may become a bottom sheet on mobile if that produces a better interaction.

Do not blindly shrink desktop UI.

---

# 14. Loading States

Never leave users staring at an unchanged interface while work is happening.

Choose the appropriate pattern:

### Skeleton

Use when:

- content structure is known
- loading is expected
- preserving layout is useful

### Spinner

Use when:

- the operation is short
- the exact result shape is unknown
- a localized progress indicator is enough

### Progress

Use when:

- duration is meaningful
- progress can be measured

### Optimistic update

Use when:

- the action is highly likely to succeed
- immediate feedback improves responsiveness
- rollback is possible

Always handle failure.

---

# 15. Error Design

Errors should help the user recover.

Every meaningful error should answer:

1. What happened?
2. Why did it happen, if useful?
3. What can the user do now?

Prefer:

```text
Couldn't save changes.
Check your connection and try again.
[Try again]
```

over:

```text
Error 500
```

Prevent errors before they occur when possible.

Use:

- constraints
- sensible defaults
- validation
- confirmation for destructive actions
- undo when possible

---

# 16. Destructive Actions

For destructive operations:

- make the consequence clear
- avoid accidental activation
- prefer undo when practical
- require confirmation for difficult-to-recover actions
- make recovery obvious

Do not make destructive actions visually identical to harmless primary actions.

---

# 17. Forms

A high-quality field should define:

```text
Label
Description / hint
Input
Focus state
Validation
Error
Success (when useful)
Disabled / readonly
Required state
```

Rules:

- labels should remain understandable
- don't use placeholder text as the only label
- validate close to the user's action
- don't clear valid input unnecessarily
- preserve user-entered data after errors
- explain how to fix invalid values

---

# 18. Buttons

Every button should communicate:

- what it does
- whether it is available
- whether it is currently active
- whether the action is processing

Recommended states:

```text
default
hover
focus-visible
pressed
disabled
loading
success/error when relevant
```

Loading buttons should normally preserve their footprint to prevent layout shift.

Example:

```text
[ Save changes ]

→ [ spinner  Saving… ]

→ [ ✓ Saved ]
```

Do not let text changes unexpectedly resize the button.

---

# 19. Icon Buttons

An icon-only control must have:

- accessible label
- obvious affordance
- sufficient hit area
- tooltip where useful on desktop
- visible focus state

Do not assume an icon is universally understood.

For ambiguous actions, combine icon + text.

---

# 20. Overlays

For popovers, menus, dialogs, sheets, and tooltips:

Consider:

- trigger relationship
- positioning
- viewport collision
- z-index
- focus
- Escape
- outside interaction
- scrolling
- mobile behavior
- open/close motion
- reduced motion

Dialogs:

- move focus into the dialog
- prevent interaction with the inert background
- provide a clear close path
- restore focus appropriately when closed

Menus:

- support keyboard navigation
- support Escape
- manage active item
- position relative to trigger
- account for viewport edges

---

# 21. Content Resilience

Components must survive real content.

Test:

- short labels
- long labels
- localization
- empty content
- long numbers
- missing images
- slow loading
- error messages
- narrow widths
- large text
- zoom

Do not design only for the ideal screenshot.

---

# 22. Visual Quality Checklist

Before calling a component finished, inspect:

### Layout

- alignment
- spacing
- rhythm
- container sizing
- edge padding
- responsive behavior

### Typography

- hierarchy
- line-height
- truncation
- wrapping
- readability

### Color

- semantic meaning
- contrast
- disabled treatment
- dark mode if applicable
- non-color status cues

### Shape

- radius consistency
- border consistency
- icon alignment
- control proportions

### Depth

- shadow hierarchy
- overlays
- layering
- focus rings

### Motion

- purpose
- timing
- easing
- interruptibility
- reduced motion

---

# 23. Component Quality Gate

Before shipping, ask:

## Behavior

- Does every interaction have clear feedback?
- Are states explicit?
- Can users recover from mistakes?
- Does it work with keyboard, pointer, and touch?

## Design

- Is hierarchy obvious?
- Are spacing and alignment consistent?
- Does the component work with real content?

## Motion

- Does motion explain change?
- Is it subtle enough for frequent use?
- Can users continue working during animation?
- Does reduced motion work?

## Accessibility

- Correct semantic element?
- Accessible name?
- Visible focus?
- Keyboard support?
- Sufficient target size?
- No information conveyed by color alone?

## Engineering

- Is the API composable?
- Is state represented semantically?
- Are styles derived from state?
- Is the implementation reusable?
- Are unnecessary abstractions avoided?

---

# 24. Agent Workflow

When asked to build a component:

### Step 1 — Understand

Identify:

- purpose
- user action
- primary state
- expected environment
- content
- accessibility requirements

### Step 2 — Define anatomy

Write the component tree.

### Step 3 — Define states

Create the state matrix.

### Step 4 — Define interaction

For each trigger:

```text
Trigger
→ immediate feedback
→ state transition
→ final feedback
→ recovery path
```

### Step 5 — Define motion

Only animate meaningful transitions.

### Step 6 — Implement semantics

Choose native HTML first.

### Step 7 — Implement responsive behavior

Consider touch, pointer, keyboard, viewport, and content.

### Step 8 — Stress test

Test:

- keyboard
- touch
- hover
- focus
- loading
- error
- long content
- narrow viewport
- reduced motion

### Step 9 — Polish

Only after behavior works:

- tune spacing
- tune typography
- tune motion
- tune shadows
- tune borders
- tune icon alignment

### Step 10 — Final quality pass

Ask:

> What would a user notice if this component were slightly wrong?

Fix those details.

---

# 25. Design Engineering Heuristic

When choosing between two implementations, prefer the one that:

1. is easier to understand
2. behaves more predictably
3. uses familiar interaction patterns
4. provides clearer feedback
5. is more accessible
6. handles more input methods
7. survives real content
8. preserves user context
9. is easier to compose
10. has fewer unnecessary moving parts

---

# 26. Anti-Patterns

Avoid:

- animation for decoration alone
- hover-only functionality
- invisible focus
- icon-only controls without labels
- tiny hit areas
- custom gestures for common actions
- arbitrary spring/bounce everywhere
- long blocking transitions
- loading with no feedback
- error messages with no recovery
- destructive actions without protection
- giant components with dozens of boolean props
- styling states without semantic state definitions
- assuming desktop interaction works on mobile
- designing only the happy path
- relying on color alone
- replacing native semantics unnecessarily
- excessive toast notifications
- auto-dismiss UI that disappears before users can understand it
- layout shifts caused by loading/success states

---

# 27. Default Component Contract

When generating a component, the agent should internally produce:

```text
Component
├── Purpose
├── Anatomy
├── Variants
├── Semantic states
├── Interaction map
├── Motion map
├── Accessibility behavior
├── Responsive behavior
├── Content edge cases
└── Quality checklist
```

For interactive components, do not consider the task complete until the state and interaction maps have been considered.

---

# 28. Design Intent Rule

The final result should feel like:

> "Of course this is how it should work."

not:

> "Look at this cool animation."

Polish comes from **clarity, consistency, responsiveness, restraint, and attention to edge cases**.

---

# Research Basis

This skill synthesizes established guidance from:

- Apple Human Interface Guidelines — design principles, accessibility, gestures, and motion
- Nielsen Norman Group — usability heuristics, microinteractions, and purposeful animation
- W3C WCAG 2.2 — focus visibility/appearance and accessibility requirements
- Radix Primitives — composable accessible primitives, explicit component states, keyboard/focus behavior
- Material Design — component state systems and meaningful motion

Key references:

- https://developer.apple.com/design/human-interface-guidelines/design-principles
- https://developer.apple.com/design/human-interface-guidelines/accessibility
- https://developer.apple.com/design/human-interface-guidelines/motion
- https://developer.apple.com/design/human-interface-guidelines/gestures
- https://www.nngroup.com/articles/ten-usability-heuristics/
- https://www.nngroup.com/articles/microinteractions/
- https://www.nngroup.com/articles/animation-purpose-ux/
- https://www.w3.org/TR/WCAG22/
- https://www.radix-ui.com/primitives/docs/overview/accessibility
- https://www.radix-ui.com/primitives
- https://m2.material.io/design/introduction/


# 29. AI UI/UX — Design for Probabilistic Systems

AI interfaces are different from deterministic UI.

A normal button can usually be modeled as:

```text
Input → deterministic action → result
```

An AI interaction is closer to:

```text
Intent → interpretation → generation/tool use → uncertain result → user evaluation → correction/continuation
```

Therefore AI UI must optimize for:

- calibrated trust
- user control
- transparency
- recoverability
- editability
- feedback
- uncertainty
- progressive disclosure
- visible system status

Microsoft's HAX Toolkit provides 18 evidence-based Human-AI Interaction guidelines, covering initial interaction, active interaction, failures, and longer-term use. Google's People + AI Guidebook similarly emphasizes mental models, explainability/trust, feedback/control, and graceful failure. citeturn0search0turn1search0

## 29.1 AI is a collaborator, not an oracle

Do not design AI output as if it is automatically correct.

Prefer:

```text
AI suggestion
    ↓
User reviews
    ↓
User edits / accepts / rejects
```

over:

```text
AI answer
    ↓
Automatically committed result
```

When the consequence is meaningful, give the user a checkpoint before committing the result.

---

# 30. AI Mental Models

Users need to understand:

- what the AI can do
- what it cannot do
- what context it is using
- what it is currently doing
- when it needs the user
- what happens after they submit an instruction
- whether the result is generated, retrieved, or transformed

Do not force users to understand model internals.

Explain behavior at the level needed for the user's decision.

Good:

```text
Based on the documents in this project…
```

Better than:

```text
RAG pipeline retrieved 12 chunks from embedding index…
```

The goal is **useful mental models**, not technical disclosure.

---

# 31. AI Input Design

Do not make every AI feature a blank chat box.

Choose the input model based on the task.

## Use conversational input when:

- intent is open-ended
- the user needs exploration
- the task cannot be easily parameterized

## Use structured controls when:

- the task is repeatable
- users need precision
- important parameters are known

Examples:

```text
Tone: [Professional ▼]
Length: [Short ▼]
Audience: [Customers ▼]
Language: [English ▼]
```

## Best pattern: combine both

```text
[ Describe what you want…                    ]

Suggestions:
[Summarize this] [Make shorter] [Explain] [Rewrite]

Controls:
Tone · Length · Format
```

The interface should reduce prompt-writing burden rather than making users learn "prompt engineering."

---

# 32. AI Empty States

An AI empty state should teach the user what is possible.

Weak:

```text
Ask anything
```

Better:

```text
What can I help you create?

[Draft a proposal]
[Analyze this dataset]
[Turn notes into a plan]
```

Use example prompts when they genuinely teach capability.

Examples should:

- represent real tasks
- demonstrate useful specificity
- be easy to modify
- disappear naturally once the user begins

Do not overwhelm the user with a wall of prompt suggestions.

---

# 33. AI Streaming

Streaming is not merely a technical optimization.

It communicates:

> "The system is actively working."

For generated text:

```text
Thinking/working
→ partial output
→ completed output
```

Design streaming states deliberately.

Consider:

- cursor/caret behavior
- partial markdown
- code blocks
- links
- citations
- tables
- images
- tool calls
- cancellation
- errors during generation

Do not make partially generated content look like a finalized answer if that distinction matters.

---

# 34. AI Progress and Long-Running Tasks

For short generation:

```text
Generating…
```

may be enough.

For longer agentic work, show meaningful progress.

Prefer:

```text
Researching
✓ Found relevant sources
✓ Compared results
→ Writing summary
```

over an unexplained spinner.

For long-running work provide:

- current status
- elapsed/progress information when useful
- cancellation
- pause/stop when feasible
- ability to inspect results
- clear completion state

Anthropic's agent guidance emphasizes obtaining ground truth from the environment, using checkpoints for human feedback, and adding complexity only when it improves the outcome. citeturn0search7

---

# 35. Agentic UI

When AI can take actions rather than only generate text, the UI must expose a stronger control model.

Think:

```text
User intent
    ↓
Agent plan
    ↓
Tool/action
    ↓
Result
    ↓
Next action
```

Important states:

```text
planning
working
waiting_for_user
waiting_for_permission
tool_running
tool_failed
needs_clarification
completed
cancelled
```

The user should be able to understand:

- what the agent is trying to accomplish
- what it has already done
- what it is about to do
- where it is blocked
- what requires approval
- how to stop it

Do not expose every internal reasoning token.

Expose **useful action-level status**, not private chain-of-thought.

---

# 36. Human-in-the-Loop Checkpoints

Add checkpoints before consequential actions.

Examples:

```text
The agent found 18 matching files.

[Review changes] [Continue]
```

or:

```text
Ready to send this email to 243 contacts.

[Review] [Send]
```

Use approval when:

- an external side effect occurs
- data is deleted
- money is spent
- content is published
- permissions change
- messages are sent
- irreversible actions occur

For low-risk reversible actions, reduce friction.

---

# 37. AI Output Should Be Editable

AI output is often a draft, not a final artifact.

Whenever practical, provide:

- edit
- regenerate
- shorten
- expand
- rewrite
- change tone
- copy
- export
- undo

For structured output, make the result directly manipulable.

Example:

```text
AI-generated plan

[Edit]
[Regenerate]
[Apply]
```

Avoid forcing users back into the prompt box for every correction.

---

# 38. Regeneration Is Not Enough

A "Regenerate" button is useful, but it should not be the only recovery mechanism.

If output is wrong, provide contextual controls.

Example:

```text
This section

[Make shorter]
[Change tone]
[Fix factual issue]
[Try another approach]
```

AI interfaces should reduce the cost of correction.

---

# 39. AI Feedback

Feedback should be purposeful.

Useful feedback can include:

```text
👍 Helpful
👎 Not helpful
```

but richer feedback is often more useful when tied to a specific failure:

```text
What was wrong?

○ Incorrect
○ Irrelevant
○ Too verbose
○ Missing context
○ Unsafe
```

Do not interrupt users with feedback requests after every interaction.

Google's guidance emphasizes aligning feedback with model improvement, explaining the value/time-to-impact, and balancing user control with automation. citeturn1search2

---

# 40. AI Trust and Uncertainty

Do not invent fake precision.

Avoid:

```text
Confidence: 93.7%
```

unless that number has meaningful interpretation.

Instead communicate uncertainty in ways relevant to the decision:

```text
Likely
Possible
Needs verification
Based on available sources
```

For consequential output, make verification easy.

Useful patterns:

- citations
- source links
- supporting evidence
- timestamps
- retrieved context
- "verify this" affordance
- comparison views

Google's People + AI guidance emphasizes calibrating trust rather than asking users to blindly trust AI, and optimizing explanations for actual user understanding. citeturn1search36

---

# 41. AI Citations and Provenance

When an answer depends on external information, provenance can be part of the UI.

Prefer:

```text
Answer

According to…
[Source 1] [Source 2]

────────────
Sources
```

over hiding all evidence behind a generic "AI generated" badge.

When citations are available, make them:

- contextual
- clickable
- understandable
- associated with the relevant claim where practical

Do not add citations merely as decorative UI.

---

# 42. AI Error States

AI failure is different from traditional software failure.

Possible failures:

- model refusal
- hallucination
- missing context
- ambiguous request
- tool failure
- retrieval failure
- timeout
- rate limit
- malformed tool output
- partial completion
- unsafe request
- low-quality generation

Design recovery paths.

Example:

```text
I couldn't complete the analysis because the spreadsheet
couldn't be accessed.

[Reconnect]
[Try another file]
```

Not:

```text
Something went wrong.
```

Microsoft's HAX approach explicitly recommends designing for AI failure rather than treating it as an edge case. citeturn0search3turn0search6

---

# 43. Clarification UX

When the AI lacks required information, ask a targeted question.

Bad:

```text
Can you provide more information?
```

Better:

```text
Which audience is this for?

[Customers]
[Internal team]
[Investors]
[Other]
```

Or:

```text
I found two possible files.

○ Q3 Revenue.xlsx
○ Q3 Revenue Final.xlsx

Which should I use?
```

Good AI clarification minimizes user effort.

---

# 44. AI Undo and Reversibility

AI can make large changes quickly.

Therefore:

**more automation → stronger undo/recovery**

For editing systems:

```text
Before
    ↓
AI changes
    ↓
Preview
    ↓
Accept / Reject
```

For batch operations:

```text
37 files changed

[Review changes]
[Undo all]
```

Prefer reversible actions whenever possible.

---

# 45. AI Preview Before Commit

When AI creates something consequential, preview first.

Examples:

- generated code → diff
- design changes → preview
- email → draft
- database mutation → change summary
- bulk edits → affected-item list
- calendar changes → event preview

The preview should answer:

```text
What will change?
How much will change?
What could be affected?
```

---

# 46. AI Tool Calls

If an AI agent uses tools, distinguish:

```text
AI response
```

from:

```text
Tool/action
```

Useful UI:

```text
Searching 12 sources…
✓ Retrieved 8 relevant documents

Updating project…
✓ 4 tasks changed
```

Do not pretend the AI "knows" something when it actually retrieved it.

Tool provenance improves understanding and debugging.

---

# 47. AI Permissions

AI actions should have appropriate permission boundaries.

Use clear language:

```text
Allow access to:
✓ Project files
✓ Calendar
✓ Contacts

[Allow] [Cancel]
```

For recurring access, communicate persistence.

Avoid dark patterns such as making "Allow" the only obvious path.

---

# 48. AI Personalization

Personalization should be:

- understandable
- controllable
- reversible

Users should be able to understand meaningful preferences the system remembers.

Provide controls such as:

```text
Memory
[Manage]
[Forget]
[Turn off]
```

Do not silently create a strong personalization model that users cannot inspect or correct.

---

# 49. AI Conversation Design

Conversation is stateful UI.

Treat messages as structured objects, not just text.

A message may contain:

```text
role
content
attachments
citations
actions
tool results
status
error
timestamp
```

Conversation UI should support:

- regenerate
- edit prompt
- branch/continue
- copy
- retry
- stop generation
- attach context
- inspect sources
- recover from errors

Avoid making the conversation history carry every interaction.

Use direct manipulation where it is faster.

---

# 50. Multimodal AI UI

When users provide:

- images
- files
- audio
- video
- structured data

show what the AI received.

Example:

```text
You
[image.png] [invoice.pdf]

AI
I found 3 invoices…
```

Make attachments:

- removable
- inspectable
- clearly scoped
- associated with the task

Do not make users guess which context the AI is using.

---

# 51. AI Empty → Active → Complete Lifecycle

AI components should have a lifecycle.

```text
EMPTY
  ↓
INPUT
  ↓
SUBMITTED
  ↓
UNDERSTANDING
  ↓
WORKING
  ↓
STREAMING / PROGRESS
  ↓
RESULT
  ↓
REVIEW
  ↓
ACCEPTED / EDITED / REGENERATED
```

Failure can occur at every stage:

```text
SUBMITTED → ERROR
WORKING → TOOL FAILURE
RESULT → USER REJECTS
```

The component must define each meaningful transition.

---

# 52. AI Component State Matrix

For AI components, extend the normal state matrix:

| State | UI responsibility |
|---|---|
| Empty | Teach capability |
| Ready | Make input obvious |
| Submitted | Confirm request |
| Interpreting | Show useful activity |
| Working | Show meaningful progress |
| Streaming | Distinguish partial output |
| Needs input | Ask focused clarification |
| Needs approval | Explain consequence |
| Result | Make output useful |
| Uncertain | Calibrate trust |
| Error | Explain + recover |
| Rejected | Make revision easy |
| Accepted | Confirm completion |
| Cancelled | Preserve control |

---

# 53. AI Microinteraction Rules

AI microinteractions should communicate system state.

Good:

```text
Send
→ generating indicator
→ streaming
→ complete
```

Good:

```text
AI suggestion
→ hover/focus actions appear
→ Accept / Edit / Reject
```

Good:

```text
Agent
→ "Searching files…"
→ "Found 12 files"
→ "Comparing…"
→ "Ready for review"
```

Bad:

```text
AI button
→ random glowing animation
→ bouncing icon
→ no useful status
```

The AI should feel **alive because it is communicating**, not because it is constantly moving.

---

# 54. AI Motion Language

Use motion to communicate:

### Generation

Subtle progress / streaming.

### Tool execution

Status transition.

### New result

Gentle entrance.

### Updated result

Highlight the changed region.

### Agent action

Sequential state progression.

### Completion

Brief confirmation.

Avoid:

- perpetual glow
- pulsing everything
- decorative "AI magic" animations
- excessive gradients
- large bouncing assistant avatars
- motion that obscures content

---

# 55. AI-Specific Accessibility

AI UI must remain understandable without animation or visual AI branding.

Ensure:

- streaming updates are accessible
- status changes can be announced appropriately
- tool progress is not visual-only
- citations are keyboard accessible
- generated content has normal semantics
- stop/cancel is keyboard accessible
- errors are announced appropriately
- focus does not jump unpredictably
- dynamic content does not overwhelm screen readers

Do not make the AI "typing animation" the only indication that content is arriving.

---

# 56. AI Design System Tokens

An AI design system should include semantic tokens beyond ordinary color/spacing.

Example:

```text
--ai-surface
--ai-accent
--ai-active
--ai-progress
--ai-success
--ai-warning
--ai-error
--ai-citation
--ai-generated
--ai-user
--ai-tool
--ai-review
```

But avoid making AI UI visually disconnected from the rest of the product.

AI should feel like a native capability, not a separate theme pasted onto the interface.

---

# 57. AI Design-System Components

Useful reusable primitives include:

```text
AIInput
AIPromptSuggestions
AIMessage
AIResponse
AIStreamingText
AIStatus
AIToolCall
AISource
AICitation
AIConfidence
AIError
AIClarification
AIApproval
AIReview
AIDiff
AIActions
AIRegenerate
AIEdit
AIUndo
AIMemoryControl
```

Higher-order patterns:

```text
CopilotPanel
AgentTimeline
ResearchWorkspace
AIReviewFlow
AICommandBar
GenerativeEditor
AIWorkflow
```

The goal is not to create 30 AI components immediately.

Start with primitives that encode repeated behavior.

---

# 58. AI + Traditional UI Principle

Do not replace a good GUI interaction with chat merely because AI is available.

Prefer:

```text
Direct manipulation
        +
AI assistance
```

over:

```text
Everything becomes chat
```

Examples:

- Use a date picker for dates.
- Use a color picker for colors.
- Use drag-and-drop for spatial organization.
- Use structured filters for known dimensions.
- Use natural language for ambiguous/high-level intent.

The best AI interfaces are often **hybrid interfaces**.

---

# 59. AI Agent UX Principle

As autonomy increases, visibility and control should increase.

A useful heuristic:

```text
More autonomy
    ↓
More potential side effects
    ↓
More need for:
- progress
- checkpoints
- permissions
- previews
- undo
- auditability
```

Do not expose maximum autonomy by default.

Match autonomy to risk.

---

# 60. AI Quality Gate

Before shipping an AI component, ask:

### Capability

- Is it obvious what the AI can do?
- Are examples useful?
- Is the input appropriate for the task?

### Trust

- Can users understand limitations?
- Is uncertainty communicated?
- Can important claims be verified?

### Control

- Can users edit?
- Can they stop generation?
- Can they undo?
- Are consequential actions gated?

### Feedback

- Is progress visible?
- Is the result clearly complete?
- Can users provide useful feedback?

### Failure

- What happens when the model is wrong?
- What happens when a tool fails?
- What happens when context is missing?
- Can the user recover?

### Agent behavior

- Can the user see meaningful progress?
- Are tool actions understandable?
- Are approval checkpoints present where needed?

### Accessibility

- Are dynamic updates accessible?
- Is keyboard control complete?
- Does reduced motion work?
- Is focus stable?

---

# 61. AI Agent Instruction

When an AI coding/design agent builds an AI feature, it should **not** default to:

```text
Chat box + sparkle icon + streaming text
```

Instead determine:

1. What is the user's actual goal?
2. Is conversation the right interaction?
3. What context does the AI need?
4. What can the AI change?
5. What could go wrong?
6. Which actions need approval?
7. What should be previewable?
8. What should be reversible?
9. What progress should be visible?
10. What should happen when the AI is wrong?

Then choose the UI pattern.

---

# 62. Design-System Context for AI Agents

AI coding/design agents perform better when the design system exposes structured context.

For components intended to be consumed by agents:

- use meaningful component names
- define semantic variants
- define component properties
- use design tokens
- document interaction behavior
- document accessibility behavior
- provide examples
- provide higher-order compositions
- encode responsive rules
- expose states explicitly

Figma's current AI guidance similarly recommends reusable blocks, meaningful names, auto layout, component properties/variants, variables, and descriptions; it also notes that higher-order reusable compositions help AI produce coherent layouts instead of guessing how atomic components fit together. citeturn1search3

This means a good design system is increasingly also an **AI-readable design language**.

---

# 63. Agent-Readable Component Contract

For every component, prefer documentation structured like:

```yaml
component: Button

purpose: Perform a user action.

variants:
  - primary
  - secondary
  - destructive
  - ghost

states:
  - default
  - hover
  - focus-visible
  - pressed
  - disabled
  - loading

interaction:
  click: execute action
  keyboard:
    enter: execute action
    space: execute action

motion:
  hover: subtle emphasis
  pressed: short compression
  loading: inline progress

accessibility:
  semantic_element: button
  accessible_name: required
  focus_visible: required

responsive:
  minimum_touch_target: 44px

do_not:
  - use hover as the only affordance
  - remove focus indicator
  - change width during loading
```

This turns design knowledge into something an AI agent can reliably execute.

---

# 64. AI Design Philosophy

The best AI UX is not:

> "Make the AI look intelligent."

It is:

> "Make the system's intelligence useful, understandable, controllable, and recoverable."

AI should reduce cognitive load without removing user agency.

---

# 65. Updated Master Heuristic

For ordinary UI:

```text
Intent
→ Action
→ Feedback
→ State
→ Result
```

For AI UI:

```text
Intent
→ Context
→ AI interpretation
→ Action / generation
→ Progress
→ Result
→ Verification
→ User control
→ Correction / acceptance
```

For agentic UI:

```text
Goal
→ Plan
→ Execute
→ Observe
→ Checkpoint
→ Continue
→ Review
→ Commit
→ Undo / recover
```

Use the simplest lifecycle that accurately represents the feature.

---

# 66. Research Basis — AI UX

Additional research and guidance:

- Microsoft HAX Toolkit — 18 evidence-based Human-AI Interaction guidelines, design patterns, workbook, and failure-oriented playbook. citeturn0search0turn0search2turn0search3
- Microsoft Research CHI 2019 — validated Human-AI Interaction guidelines based on multiple evaluation rounds and 49 design practitioners testing 20 AI-infused products. citeturn0search12turn0search13
- Google People + AI Guidebook — mental models, explainability/trust, feedback/control, errors/graceful failure, and AI product development. citeturn1search0turn1search36
- Google Responsible AI UX — responsible product design and GenAI UX guidance. citeturn1view2
- Anthropic — simple composable agent patterns, transparency, checkpoints, ground truth, and human feedback. citeturn0search7
- Figma AI guidance — design-system structure, reusable blocks, component properties, variables, descriptions, and AI-readable design context. citeturn1search3
- Figma AI guidance — AI output can be inaccurate and should be treated as a reference requiring appropriate judgment and verification. citeturn1search1


# 67. Motion Design System — Motion Is Part of the UX

Motion is not decoration.

Use motion to communicate:

- what changed
- why it changed
- where something came from
- where it went
- what is currently happening
- what the user caused
- what the system is doing
- what requires attention

Apple explicitly recommends purposeful, brief, precise motion and warns against gratuitous animation; NN/g similarly identifies feedback, state change, navigation metaphors, and signifiers as primary UX uses for animation. Material describes motion as a way to communicate spatial relationships, functionality, hierarchy, and intention. citeturn0search0turn0search3turn0search7

The default rule:

> **If removing the animation makes the interaction harder to understand, the motion is probably useful. If removing it changes nothing except aesthetics, question whether it belongs.**

---

# 68. The Five Jobs of UI Motion

Every meaningful animation should primarily perform one or more of these jobs.

## 1. Feedback

Tell the user:

> "Your action registered."

Examples:

```text
Button press
Checkbox check
Toggle switch
Drag start
Save confirmation
```

Feedback should be immediate and short.

---

## 2. Continuity

Show that two states are related.

Example:

```text
Card
  ↓ expands
Expanded card
```

Instead of:

```text
Card disappears
  ↓
Large panel suddenly appears
```

Continuity helps users maintain spatial context.

---

## 3. Hierarchy

Show which surface is entering above/below another.

Examples:

```text
Button
  ↓
Popover emerges from button
```

```text
Page
  ↓
Modal rises above page
```

The transition should communicate the relationship between source and destination.

---

## 4. Status

Show that the system is doing something.

Examples:

```text
Uploading
Generating
Searching
Saving
Processing
Syncing
```

For AI, status motion is especially valuable because computation is often invisible.

---

## 5. Delight / Character

Add personality after usability is solved.

Examples:

- subtle success animation
- playful empty state
- brand-specific transition
- expressive completion moment

Delight should never compete with the task. Apple explicitly cautions against confusing delight with decoration. citeturn0search2

---

# 69. Motion Hierarchy

Not every interaction deserves the same amount of motion.

Use a hierarchy.

## Level 0 — No animation

Use when:

- the change is obvious
- interaction is extremely frequent
- animation would slow the user
- accessibility/context makes motion inappropriate

Example:

```text
Static text color update
```

---

## Level 1 — Micro feedback

Typical:

```text
~80–180ms
```

Use for:

- hover
- press
- focus
- checkbox
- toggle
- icon state
- button feedback

The user should barely notice the duration.

---

## Level 2 — Component transition

Typical:

```text
~160–300ms
```

Use for:

- popover
- dropdown
- tooltip
- accordion
- expanding card
- toast
- sheet

The user should understand where the element came from and where it is going.

---

## Level 3 — Spatial transition

Typical:

```text
~250–450ms
```

Use for:

- navigation
- modal
- page-level transformation
- shared-element transitions
- major layout changes

Use sparingly.

---

## Level 4 — Expressive / cinematic

Typical:

```text
~400ms+
```

Use only for:

- onboarding
- major brand moments
- creative experiences
- meaningful completion moments

Never use this duration as the default for ordinary UI.

---

# 70. Duration Is Based on Distance + Importance

Do not hard-code one animation duration for everything.

A useful heuristic:

```text
Small distance + frequent interaction
→ shorter

Large distance + major transition
→ longer

High-frequency action
→ shorter

Important conceptual change
→ enough time to understand
```

Material explicitly recommends keeping transitions quick enough that users never have to wait for the animation. citeturn0search7

The numbers above are starting ranges, not laws.

---

# 71. Easing

Use easing to describe how motion behaves.

## Entering

Prefer deceleration:

```text
fast → slow
```

The element arrives and settles.

Good for:

- menus
- modals
- cards
- panels
- tooltips

---

## Exiting

Prefer acceleration:

```text
slow → fast
```

The element leaves quickly.

Good for:

- dismissing
- closing
- removing
- collapsing

---

## Moving between states

Use smooth ease-in-out when appropriate.

Good for:

- layout transitions
- repositioning
- mode changes

---

## Direct manipulation

Do not impose a canned easing curve when the user is physically controlling the object.

If dragging:

```text
pointer position
≈
object position
```

The UI should follow the user.

---

# 72. Animate Properties With Intent

Preferred high-performance UI properties:

```text
transform
opacity
```

Use with care:

```text
scale
translate
rotate
```

Other properties can be useful when they communicate meaning:

```text
color
background
border
clip-path
height
width
filter
blur
```

But avoid animating expensive layout properties unnecessarily.

Do not animate everything simply because the browser can.

---

# 73. Avoid the "Everything Moves" Problem

A common weak implementation:

```text
opacity
+ scale
+ blur
+ translate
+ rotate
+ border
+ shadow
+ color
```

all changing simultaneously.

Prefer:

```text
translate + opacity
```

or:

```text
scale + opacity
```

or:

```text
color + small transform
```

One coherent motion story is usually stronger than six unrelated effects.

Material's motion guidance emphasizes transitions that are clear, simple, and coherent rather than having multiple elements moving in confusing directions. citeturn0search7

---

# 74. Shared-Element / Continuity Principle

When the same conceptual object exists in two states, consider transforming the object itself.

Example:

```text
Thumbnail
   ↓
Full image
```

Instead of:

```text
thumbnail disappears
   ↓
full image appears
```

Use:

```text
thumbnail
   ↘
    expands into
      ↓
full image
```

This preserves spatial context.

Useful for:

- cards → detail pages
- avatar → profile
- thumbnail → gallery
- button → dialog
- command bar → expanded search
- compact AI result → detailed AI workspace

---

# 75. Enter/Exit Symmetry

If an element enters from a direction, its exit should generally make spatial sense.

Example:

```text
Panel enters from right
→
Panel exits to right
```

Avoid:

```text
Panel enters from right
→
Panel exits upward
```

unless the change in direction communicates a deliberate hierarchy or new relationship.

Apple explicitly recommends realistic feedback that follows people's expectations and gestures. citeturn0search0

---

# 76. Transform Origin Matters

A component should appear to originate from a meaningful location.

For example:

```text
Tooltip
transform-origin: bottom center
```

```text
Popover
transform-origin: top right
```

```text
Dropdown
transform-origin: top center
```

```text
Context menu
transform-origin: pointer / trigger
```

This makes motion feel physically connected to the interaction.

---

# 77. The Motion Budget

Treat motion as a limited attention budget.

At any moment ask:

```text
What should the user look at?
```

Do not animate five unrelated things simultaneously.

A strong transition usually has:

```text
1 primary moving object
+
1 supporting response
```

Example:

```text
Dialog enters
+
background subtly dims
```

not:

```text
Dialog moves
background scales
header slides
sidebar bounces
icons rotate
text fades
```

Motion attracts attention, so unnecessary motion competes with the task. NN/g specifically warns that motion can easily distract because peripheral vision is highly sensitive to movement. citeturn0search3

---

# 78. Choreography

When multiple elements need to move, establish an order.

Example:

```text
Container
    ↓
Header
    ↓
Content
    ↓
Actions
```

But avoid excessive staggering.

Bad:

```text
Element 1 → 150ms
Element 2 → 300ms
Element 3 → 450ms
Element 4 → 600ms
Element 5 → 750ms
```

The user should not have to watch the UI finish animating.

Prefer a compact choreography where elements overlap in time.

---

# 79. Motion Should Preserve Context

When content changes, ask:

> Where was the user's attention before the transition?

Then preserve it when possible.

Examples:

### Accordion

Keep the clicked item anchored.

### Infinite list

Do not unexpectedly reposition existing content.

### AI response

Do not constantly push the user's viewport away from the content they're reading.

### Navigation

Preserve the relationship between source and destination.

### Modal

Keep the underlying context visually present but inactive.

---

# 80. Layout Animation

Layout animation is powerful but dangerous.

When content changes:

```text
A
B
C
```

becomes:

```text
A
NEW
B
C
```

Prefer smoothly moving B and C rather than making them jump.

But avoid animating every layout change if it occurs frequently.

Use layout motion for:

- insertion
- deletion
- expansion
- reordering
- filtering
- drag/drop
- AI-generated content appearing

Avoid excessive motion for:

- rapidly updating data
- typing
- frequent cursor movement
- high-frequency dashboards

---

# 81. AI Motion — The New Interaction Opportunity

AI creates an unusual UX problem:

**A lot of meaningful work happens invisibly.**

Traditional UI:

```text
click
→ immediate deterministic result
```

AI:

```text
request
→ interpretation
→ retrieval
→ tool use
→ generation
→ verification
→ result
```

Motion can make this invisible process understandable.

Microsoft's HAX framework treats AI interaction as a lifecycle that includes initial interaction, active interaction, failures, and longer-term use; motion should support those states rather than merely decorate them. citeturn0search1turn0search9

---

# 82. AI Motion Principle: Show Progress, Not "Magic"

Avoid:

```text
✨✨✨
AI is thinking…
```

when nothing useful is communicated.

Prefer:

```text
Searching your files…
      ↓
Found 12 relevant documents
      ↓
Comparing information…
      ↓
Drafting answer…
```

Motion should correspond to meaningful state changes.

---

# 83. AI Generation Motion

For streaming responses:

```text
Submitted
   ↓
Working
   ↓
Streaming
   ↓
Complete
```

Possible motion language:

### Submitted

Small immediate response:

```text
send button → pressed
```

### Working

Subtle activity:

```text
AI status → active
```

### Streaming

Content appears progressively.

### Complete

Brief transition:

```text
active indicator
→
complete state
```

Do not make the entire response continuously shimmer.

---

# 84. AI Streaming Best Practice

The text itself should be the primary motion.

Do not simultaneously animate:

```text
message
avatar
background
gradient
border
cursor
toolbar
```

Prefer:

```text
content streams
+
small generation indicator
```

The generated content is already moving.

Additional motion should be subordinate.

---

# 85. AI Tool-Use Motion

Tool execution is an excellent place for motion.

Example:

```text
AI
│
├── Searching files       ✓
├── Reading documents     ✓
├── Comparing results     ●
└── Writing answer        ○
```

Use state transitions:

```text
pending
→ active
→ success
```

or:

```text
pending
→ active
→ error
```

This turns hidden computation into understandable system status.

---

# 86. Agent Timeline Motion

For agentic workflows, use a timeline.

```text
Goal
 ↓
Planning
 ↓
Researching
 ↓
Tool execution
 ↓
Review
 ↓
Result
```

Motion can reveal each completed stage.

Good:

```text
Planning ✓
Researching ✓
Writing ●
```

Bad:

```text
Everything constantly pulsing
```

The motion should tell the user:

> "Where are we?"

---

# 87. AI Transition: Input → Result

One of the strongest AI transitions is transforming the user's intent into the result.

Example:

```text
Prompt composer
      ↓
      ↓
AI result workspace
```

Preserve visual continuity.

The prompt should not simply disappear.

Instead:

```text
prompt
  ↓
submitted
  ↓
becomes context/header
  ↓
result appears beneath
```

This reinforces:

> "The thing I asked for produced this."

---

# 88. AI Approval Motion

For consequential AI actions:

```text
AI suggestion
      ↓
Review
      ↓
Approve
      ↓
Committed result
```

Motion can make the commitment boundary clear.

Example:

```text
Draft
  ↓
Review panel expands
  ↓
User approves
  ↓
Draft transforms into committed state
```

Do not animate a consequential action as if it were already committed before approval.

---

# 89. AI Correction Motion

When the AI is corrected, preserve the relationship between old and new.

Instead of:

```text
wrong answer disappears
new answer appears
```

prefer:

```text
old answer
   ↓
edited/regenerated region
   ↓
new answer
```

For structured content, highlight the changed portion.

This helps users understand what the AI changed.

---

# 90. AI "Thinking" Indicators

Avoid anthropomorphic theater.

A small animated indicator is acceptable when it communicates activity.

Prefer:

```text
Generating…
```

or:

```text
Searching…
```

over:

```text
AI is thinking deeply…
```

unless the product intentionally uses that metaphor.

The system should communicate **observable work**, not pretend to expose internal cognition.

---

# 91. AI Latency and Perceived Performance

Motion can make waiting feel shorter, but it must not become deception.

Good:

```text
Immediate feedback
→ useful progress
→ partial result
```

Bad:

```text
Beautiful 4-second animation
→ actual result still not ready
```

Do not use animation to hide poor performance indefinitely.

Use progressive disclosure:

```text
Immediate acknowledgement
      ↓
First useful information
      ↓
More complete result
```

---

# 92. Interruptible AI Motion

AI generation should be stoppable.

Provide:

```text
Generating…
[Stop]
```

When stopped:

```text
Generation stopped
[Continue] [Edit prompt]
```

Do not make users wait through a transition before they can regain control.

Apple specifically recommends allowing users to cancel motion whenever possible rather than forcing them to wait for animation completion. citeturn0search0

---

# 93. Motion + User Agency

Motion should never make the user feel trapped.

Avoid:

- mandatory intro animations
- blocking transitions
- delayed buttons
- slow modals
- unskippable AI generation animations
- automatic scrolling that fights the user
- content moving while the user is reading

Rule:

> **The user owns the interaction timeline.**

---

# 94. Auto-Scroll With AI

AI streaming creates a subtle UX problem.

Do not blindly scroll to the bottom on every token.

Use:

```text
User near bottom
→ follow new content
```

But:

```text
User scrolled upward
→ preserve their position
→ show "Jump to latest"
```

This is a critical AI interaction pattern.

Motion should follow the user's context, not fight it.

---

# 95. Motion and Reduced Motion

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

When reduced motion is enabled:

Replace:

```text
large movement
```

with:

```text
opacity
```

or:

```text
instant state change
```

Reduce:

- translation
- scaling
- parallax
- looping animation
- large spatial transitions
- decorative motion

Preserve:

- state clarity
- progress information
- success/error feedback
- important status

Motion must never be the only communication channel. Apple explicitly recommends making motion optional and supplementing it with other feedback. citeturn0search0

---

# 96. Motion Accessibility Beyond Reduced Motion

Also consider:

- vestibular sensitivity
- flashing
- high-frequency movement
- rapidly changing contrast
- motion near screen edges
- cognitive load
- screen-reader announcements
- keyboard focus movement

Do not assume `prefers-reduced-motion` solves every motion-accessibility problem.

---

# 97. Motion Token System

A production design system should define motion tokens.

Example:

```css
--motion-duration-instant: 80ms;
--motion-duration-fast: 140ms;
--motion-duration-normal: 200ms;
--motion-duration-slow: 300ms;
--motion-duration-emphasis: 450ms;

--motion-ease-standard: ...;
--motion-ease-enter: ...;
--motion-ease-exit: ...;
--motion-ease-emphasis: ...;
```

Then components consume tokens:

```tsx
transition:
  transform var(--motion-duration-fast) var(--motion-ease-standard);
```

Do not let every component invent its own timing.

---

# 98. Motion Tokens Should Be Semantic

Prefer:

```text
--motion-interaction
--motion-enter
--motion-exit
--motion-state-change
--motion-layout
--motion-emphasis
```

over:

```text
--animation-173ms
--animation-241ms
--animation-317ms
```

Semantic tokens communicate intent.

---

# 99. Component Motion Contract

Every reusable component should document motion.

Example:

```yaml
motion:
  hover:
    property: opacity
    duration: fast

  press:
    property: transform
    behavior: subtle-scale
    duration: instant

  enter:
    property: opacity+transform
    duration: normal
    easing: enter

  exit:
    property: opacity+transform
    duration: fast
    easing: exit

  reduced_motion:
    enter: opacity-only
    exit: opacity-only
```

For AI components:

```yaml
ai_motion:
  working:
    indicator: subtle
  streaming:
    content: progressive
  tool_call:
    states: pending-active-complete
  completion:
    feedback: brief
  cancellation:
    immediate
```

This makes motion **agent-readable**.

---

# 100. Motion QA Checklist

Before shipping a motion interaction:

### Purpose

- What does this animation communicate?
- Would the UI be less understandable without it?

### Timing

- Is it fast enough?
- Does the user ever have to wait?

### Direction

- Does movement match the spatial relationship?
- Does it preserve context?

### Easing

- Does it feel responsive?
- Is the curve appropriate to entering/exiting/direct manipulation?

### Complexity

- Is there a clear focal point?
- Are too many elements moving?

### Interaction

- Can the user continue working?
- Can they interrupt it?

### Accessibility

- Does reduced motion work?
- Is important information available without animation?

### AI

- Does motion expose useful system status?
- Does it distinguish working/streaming/completed?
- Does it preserve the user's scroll/context?
- Can generation be stopped?
- Are consequential transitions gated by user approval?

---

# 101. Golden Rule for Motion

Use this hierarchy:

```text
1. Understandability
       ↓
2. Feedback
       ↓
3. Continuity
       ↓
4. Responsiveness
       ↓
5. Character
       ↓
6. Decoration
```

Never reverse the order.

---

# 102. Motion Philosophy for Pixel Dosa

Pixel Dosa components should have a recognizable motion language.

Not:

> Every component has a cool animation.

Instead:

> Every component behaves like it belongs to the same product.

The motion language should feel:

- quick
- precise
- responsive
- restrained
- spatially coherent
- interruptible
- accessible
- slightly expressive

AI components can become more expressive because AI has longer, more ambiguous states — but the same underlying motion language should remain recognizable.

---

# 103. Pixel Dosa AI Motion Examples

### AI Button

```text
idle
 ↓
press
 ↓
working
 ↓
success
```

### AI Input

```text
idle composer
 ↓
submit
 ↓
composer contracts
 ↓
response workspace expands
```

### AI Response

```text
request
 ↓
status
 ↓
stream
 ↓
complete
 ↓
actions appear
```

### AI Agent

```text
goal
 ↓
planning
 ↓
tool 1
 ↓
tool 2
 ↓
review
 ↓
approval
 ↓
commit
```

### AI Editing

```text
original
 ↓
AI proposal
 ↓
highlight changes
 ↓
accept / reject
 ↓
committed result
```

### AI Error

```text
working
 ↓
tool failure
 ↓
failed step
 ↓
recovery action
```

These are not merely animations. They are **visual representations of system state**.

---

# 104. Final Motion Principle

> **Motion should make the interface easier to understand, easier to trust, and easier to control.**

For AI specifically:

> **Use motion to reveal system state, not to simulate intelligence.**

The best AI motion makes invisible computation visible without pretending to expose private reasoning.


# 105. Creative Problem Solving & Design Expression

A high-quality design-engineering agent must do more than reproduce established UI patterns.

It must know when to:

- follow convention
- improve a convention
- combine patterns
- invent a new interaction
- express a product's personality through the interface

Creativity is not random novelty.

> **Creative design is finding a better expression of the user's goal within real constraints.**

Apple's current design principles explicitly combine purpose, familiarity, simplicity, craft, experimentation, and delight. It recommends finding new ways to solve problems rather than simply recreating existing solutions, while also warning that delight should not become decoration for its own sake. citeturn0search0turn0search4

Google's Material 3 Expressive research similarly treats expression as a combination of color, shape, size, motion, and containment that can communicate function and direct attention—not merely visual decoration. Its research involved 46 studies and more than 18,000 participants. citeturn0search10

IDEO's human-centered design process adds another critical principle: creativity should start from human needs, generate multiple possibilities, prototype them, and converge using desirability, feasibility, and viability. citeturn0search2turn0search6turn0search11

---

# 106. Creativity Is a Design Method, Not a Visual Style

Do not interpret "creative" as:

- unusual gradients
- excessive animation
- experimental typography
- strange navigation
- novel gestures
- decorative 3D
- random asymmetry
- excessive glass effects

Instead ask:

```text
What is the user's problem?
        ↓
What is the obvious solution?
        ↓
What assumption does the obvious solution make?
        ↓
Can we solve the underlying problem differently?
        ↓
Can the solution become clearer, faster, or more memorable?
```

The agent should challenge the **solution**, not randomly challenge the user.

---

# 107. Conventional First, Creative Second

Before inventing an interaction, establish the conventional baseline.

Example:

```text
Problem:
User needs to compare AI-generated options.

Conventional:
Tabs or dropdown.

Alternative:
Side-by-side comparison cards.

Creative:
A "decision canvas" where differences are visually surfaced
and the user can merge the strongest parts of each option.
```

The creative solution should exist because it improves the problem—not because the agent wants to demonstrate creativity.

---

# 108. The Creative Exploration Loop

For meaningful design problems, use:

```text
1. Understand
      ↓
2. Frame
      ↓
3. Establish baseline
      ↓
4. Diverge
      ↓
5. Combine / transform
      ↓
6. Prototype
      ↓
7. Compare
      ↓
8. Converge
      ↓
9. Polish
```

Do not immediately commit to the first solution.

When the problem is ambiguous or important, explore multiple interaction models before implementation.

---

# 109. Frame the Problem Before Solving It

Convert:

```text
"Build a dashboard."
```

into:

```text
"What decisions does the user need to make from this information?"
```

Convert:

```text
"Build an AI chat."
```

into:

```text
"What job is the user hiring the AI to perform?"
```

Convert:

```text
"Add an AI assistant."
```

into:

```text
"Where does intelligence reduce friction in the existing workflow?"
```

The agent should solve the **job**, not blindly implement the requested artifact.

---

# 110. How Might We

When appropriate, reframe constraints as opportunities.

Examples:

```text
How might we make waiting useful?

How might we make AI uncertainty understandable?

How might we let users correct AI without rewriting prompts?

How might we turn a complex workflow into a single understandable surface?

How might we make progress feel informative rather than passive?

How might we let the user explore without fear of making a mistake?

How might we make the empty state teach the product?
```

This produces better design questions than:

```text
Which component should I use?
```

---

# 111. Diverge Before Converging

For non-trivial problems, generate several distinct approaches.

Example:

```text
Problem:
AI needs to show progress during research.

Option A:
Progress bar

Option B:
Tool timeline

Option C:
Research canvas

Option D:
Live source stream

Option E:
Progressive evidence cards
```

Do not generate five cosmetic variations.

Generate five **different mental models**.

Then choose.

---

# 112. Explore Interaction Models, Not Just Visuals

When brainstorming alternatives, vary:

### Input model

```text
chat
command
direct manipulation
structured controls
voice
drag/drop
selection
```

### Output model

```text
message
canvas
card
table
timeline
preview
diff
workspace
```

### Control model

```text
manual
assisted
suggested
semi-automatic
agentic
```

### Temporal model

```text
instant
progressive
streaming
background
scheduled
interactive
```

### Spatial model

```text
inline
overlay
side panel
full screen
canvas
split view
```

Creativity becomes more powerful when the agent explores these dimensions.

---

# 113. Transform, Don't Just Add

A strong creative technique is to transform an existing interaction.

Examples:

### Instead of adding a progress bar

Transform progress into a **story of work**.

```text
Searching
→ Found
→ Comparing
→ Writing
```

### Instead of adding a tooltip

Transform the object into a **contextual explanation** on focus.

### Instead of adding a modal

Transform the selected object into an **expanded workspace**.

### Instead of adding a settings page

Transform the setting into **direct manipulation**.

### Instead of adding an AI chat

Transform the existing workflow so AI appears exactly where assistance is useful.

---

# 114. Remove Before You Add

Creativity often comes from subtraction.

Before adding:

```text
new button
new panel
new menu
new AI assistant
new animation
```

ask:

```text
Can an existing element do this?
Can the user manipulate the object directly?
Can two steps become one?
Can information appear contextually?
Can the system infer the obvious choice?
Can we remove this entire step?
```

A simpler interaction can be more innovative than a more elaborate one.

---

# 115. Use Existing Metaphors Carefully

Metaphors can make unfamiliar systems understandable.

Examples:

```text
Canvas
Workspace
Timeline
Stack
Inbox
Command palette
Inspector
Layers
Draft
Review
```

But do not force physical metaphors where they create unnecessary complexity.

The metaphor must clarify the model.

---

# 116. Creative Expression Through Interaction

The strongest product personality often comes from **how the interface behaves**, not from decoration.

Examples:

```text
A music app:
playback controls feel rhythmic.

A drawing app:
tools respond spatially.

A finance app:
numbers transition with precision and restraint.

A creative AI app:
generation feels exploratory and manipulable.

A developer tool:
state changes feel precise and technical.
```

The interaction model should express the product's character.

---

# 117. Design for Emotional Intent

Before adding expressive elements, decide what emotion is appropriate.

Possible goals:

```text
confidence
calm
curiosity
energy
focus
playfulness
precision
trust
control
wonder
```

Then express the emotion through:

- typography
- color
- density
- shape
- sound when appropriate
- motion
- language
- interaction

Do not default to "playful."

An enterprise workflow may benefit more from:

```text
confidence + clarity + precision
```

than:

```text
playfulness + spectacle
```

---

# 118. Defining Moments

Every product has moments where personality matters disproportionately.

Examples:

```text
first successful action
AI generates the first result
task completed
file uploaded
error recovered
empty state
first interaction
major transformation
```

Identify 1–3 defining moments.

Spend disproportionate design effort there.

Apple explicitly frames delight around "defining moments" and the emotional quality of the whole experience rather than isolated decoration. citeturn0search0

---

# 119. Delight Should Be Earned

A useful hierarchy:

```text
Useful
  ↓
Understandable
  ↓
Responsive
  ↓
Reliable
  ↓
Expressive
  ↓
Delightful
```

Never jump directly to delight.

A beautifully animated broken interaction is still a broken interaction.

---

# 120. Creative AI UX

AI creates new opportunities because the system can generate states, content, alternatives, and actions dynamically.

Do not limit AI UX to:

```text
prompt → response
```

Explore:

```text
prompt → artifact
prompt → workspace
prompt → options
prompt → transformation
prompt → simulation
prompt → conversation
prompt → plan
prompt → editable structure
prompt → interactive result
```

The output format should match the user's job.

---

# 121. AI as Material

Treat AI output as something the user can manipulate.

Instead of:

```text
AI says:
"Here is a marketing plan..."
```

consider:

```text
AI creates:
┌─────────────────────────────┐
│ Marketing Plan              │
│                             │
│ Goal                        │
│ Audience                    │
│ Campaign                    │
│ Timeline                    │
│                             │
│ [Edit] [Reorder] [Expand]   │
└─────────────────────────────┘
```

The AI has created a **usable object**, not merely a paragraph.

This is one of the most important directions for AI product design.

---

# 122. AI Output Should Match the Work

Ask:

```text
Is the user reading?
→ prose

Is the user deciding?
→ comparison

Is the user editing?
→ editable artifact

Is the user planning?
→ timeline / board

Is the user analyzing?
→ visualization / table

Is the user creating?
→ canvas / workspace

Is the user executing?
→ action-oriented controls
```

Do not force every AI task into chat.

Microsoft's Human-AI guidelines emphasize contextual information, efficient invocation, dismissal, correction, disambiguation, and conveying consequences. citeturn0search1turn0search3

---

# 123. Creative AI Interaction Patterns

The agent should consider these patterns when appropriate:

## Generate → Refine

```text
Generate
 ↓
select
 ↓
refine
 ↓
commit
```

## Explore → Compare

```text
Idea A
Idea B
Idea C
 ↓
compare
 ↓
combine
```

## Suggest → Manipulate

```text
AI suggestion
 ↓
user directly edits
```

## Draft → Review → Commit

```text
AI draft
 ↓
review
 ↓
approve
```

## AI → Human → AI

```text
AI generates
 ↓
human edits
 ↓
AI continues from human changes
```

This last pattern is especially powerful because it creates a collaborative loop rather than treating AI as a one-shot generator.

---

# 124. AI Should Create Options, Not Always Answers

For creative work, one answer can prematurely narrow exploration.

Instead:

```text
Here are 3 directions:

A — Minimal
B — Editorial
C — Expressive
```

Then:

```text
[Explore A]
[Explore B]
[Explore C]
```

This supports divergent thinking.

But do not generate multiple options when the task has a clearly correct answer.

---

# 125. Controlled Serendipity

Creative products can occasionally expose unexpected possibilities.

Examples:

```text
You might also try…
Explore another direction
Unexpected combination
Related idea
```

But discovery should remain:

- dismissible
- contextual
- low interruption
- clearly optional

Never make serendipity interfere with a task.

---

# 126. Creative Constraints

Constraints can improve creativity.

When exploring alternatives, deliberately constrain:

```text
one interaction
one gesture
one motion idea
one visual metaphor
one screen
one primary action
```

Example:

> Solve this workflow without adding a new page.

or:

> Solve this without a modal.

or:

> Make this understandable without explanatory text.

Constraints force better thinking.

---

# 127. Analogy as a Creative Tool

When stuck, look outside the immediate product category.

Ask:

```text
How does an IDE solve this?

How does a camera solve this?

How does a map solve this?

How does a physical workshop solve this?

How does a game teach this?

How does an editor handle this?

How does a spreadsheet handle this?
```

Then extract the underlying interaction principle.

Do not copy the surface.

---

# 128. Cross-Pollination

Strong design often comes from combining patterns from different domains.

Example:

```text
Timeline
+
AI agent
=
Agent activity timeline
```

```text
Command palette
+
AI
=
Natural-language command workspace
```

```text
Diff viewer
+
AI writing
=
AI revision interface
```

```text
Canvas
+
AI generation
=
Generative workspace
```

The agent should look for **productive combinations**, not novelty for novelty's sake.

---

# 129. Prototype the Idea, Not the Polish

When testing a creative concept:

Do not spend an hour polishing shadows.

Build the smallest prototype that answers:

```text
Does this interaction make the task better?
```

Prototype:

- transition
- interaction
- state
- information hierarchy
- spatial model

Then polish.

IDEO explicitly treats prototyping as a way to learn and iterate rather than merely producing a final artifact. citeturn0search2turn0search11

---

# 130. Creative Quality Test

For an unconventional solution, ask:

### Clarity

Can a new user understand it?

### Familiarity

Does it build on something recognizable?

### Efficiency

Does it reduce effort?

### Discoverability

Can users discover it without training?

### Accessibility

Does the concept work across input methods?

### Recoverability

Can users undo or escape?

### Expression

Does it communicate the product's character?

### Memorability

Will users remember how it works?

### Feasibility

Can it actually be built and maintained?

### Value

Is the creative idea improving the outcome?

If the answer is "no" to most of these, creativity has become decoration.

---

# 131. Creative Risk Levels

Not every component deserves experimentation.

## Low risk

Safe places for creativity:

- hover
- success feedback
- empty states
- illustrations
- microinteractions
- loading states
- subtle transitions

## Medium risk

Experiment carefully:

- navigation
- filtering
- editing
- search
- AI workflows
- dashboards

## High risk

Prefer established patterns unless there is a compelling reason:

- authentication
- payment
- destructive actions
- permissions
- accessibility-critical controls
- security
- emergency workflows

The higher the consequence, the stronger the case required for unconventional interaction.

---

# 132. Familiar Core + Expressive Edge

A powerful design strategy:

```text
Familiar core
+
Creative edge
```

Example:

```text
Standard button
+
distinctive press feedback
```

```text
Standard editor
+
innovative AI collaboration
```

```text
Standard navigation
+
expressive page transitions
```

```text
Standard form
+
beautiful validation/recovery experience
```

Users get familiarity where they need it and personality where it adds value.

---

# 133. The 80/20 Expression Rule

A practical heuristic:

```text
80% recognizable
20% distinctive
```

This is not a mathematical rule.

It means the user should recognize the product's basic interaction language while still encountering moments that feel uniquely designed.

For a new product, increase the expressive portion only where the context supports it.

---

# 134. Creative Component Contract

Add an expressive layer to reusable component documentation.

Example:

```yaml
component: AIResearchCard

purpose:
  Help users understand and review AI research findings.

baseline_pattern:
  expandable-card

creative_intent:
  Make research feel like an evolving investigation.

expression:
  visual:
    - progressive evidence
    - source relationships

  motion:
    - evidence enters progressively
    - active source subtly highlights

  interaction:
    - click finding to reveal evidence
    - drag finding into synthesis area

constraints:
  - must remain understandable without animation
  - must support keyboard navigation
  - must not auto-scroll unexpectedly
  - must provide explicit review state
```

This is much better than:

```text
Make it creative.
```

---

# 135. Agent Creative Decision Tree

When designing a component:

```text
Is there a well-established pattern?
        │
       YES
        ↓
Does it solve the user's problem well?
        │
   ┌────┴────┐
  YES       NO
   │         │
Use it     Explore alternatives
   │         │
   ↓         ↓
Can it be improved without
breaking familiarity?
        │
   ┌────┴────┐
  YES       NO
   │         │
Improve    Explore new model
   │         │
   └────┬────┘
        ↓
Prototype
        ↓
Validate
        ↓
Polish
```

---

# 136. Agent Creativity Rules

When asked to "make it creative":

### Do

- identify the user's actual goal
- establish a conventional baseline
- generate multiple interaction models
- explore metaphors and analogies
- challenge unnecessary steps
- consider direct manipulation
- consider AI-generated artifacts
- use motion to communicate state
- use visual expression intentionally
- prototype unusual ideas
- preserve accessibility
- preserve user agency
- keep recovery easy

### Do not

- add random animations
- invent unfamiliar gestures without reason
- turn everything into AI chat
- hide important controls for aesthetics
- sacrifice accessibility
- sacrifice discoverability
- create novelty for portfolio screenshots alone
- use motion as decoration
- make users learn an interaction when a standard one works better
- add complexity merely to look innovative

---

# 137. Creative Design Review

Before finalizing an important experience, ask:

```text
What is the obvious solution?

Why does it exist?

What assumption does it make?

What would happen if we removed one step?

What if the output became an object instead of text?

What if the user manipulated the result directly?

What if AI helped at the exact point of friction?

What if progress itself became useful information?

What could be combined?

What could be transformed?

What could be made reversible?

What could become a defining moment?

Where should the experience remain boring and familiar?

Where should it express personality?
```

The last question is important.

**Good design is not expressive everywhere.**

It knows where to be quiet.

---

# 138. Design Expression Is a System

Expression should emerge from a consistent language:

```text
Typography
+
Color
+
Shape
+
Density
+
Motion
+
Interaction
+
Language
+
Sound (when appropriate)
```

These should reinforce one another.

For example:

```text
Product personality = calm + precise

Typography → restrained
Color → low-noise
Shape → controlled
Motion → smooth/short
Language → concise
AI → transparent
```

versus:

```text
Product personality = playful + exploratory

Typography → expressive
Color → energetic
Shape → softer
Motion → slightly more expressive
Language → conversational
AI → exploratory
```

Do not choose expressive elements independently.

---

# 139. The "One Idea" Rule

A creative interaction should usually have one memorable idea.

Examples:

```text
"The card becomes the workspace."

"The AI answer becomes an editable artifact."

"The progress timeline shows the actual work."

"The empty state teaches through interaction."

"The selected object becomes the editor."
```

If the interaction requires a paragraph to explain why it is clever, reconsider it.

---

# 140. Creative Excellence

The highest-quality design often has this sequence:

```text
Familiar
    ↓
Useful
    ↓
Clear
    ↓
Responsive
    ↓
Unexpected
    ↓
Delightful
    ↓
Feels inevitable
```

The final goal is not:

> "Wow, that's unusual."

It is:

> **"Of course — why doesn't every product work this way?"**

That is the standard the agent should aim for.

---

# 141. Updated Master Design Philosophy

The complete design-engineering model is now:

```text
PROBLEM
  ↓
USER GOAL
  ↓
MENTAL MODEL
  ↓
CONVENTIONAL BASELINE
  ↓
CREATIVE EXPLORATION
  ↓
INTERACTION MODEL
  ↓
COMPONENT ANATOMY
  ↓
SEMANTIC STATES
  ↓
MICROINTERACTIONS
  ↓
MOTION LANGUAGE
  ↓
AI BEHAVIOR (when applicable)
  ↓
ACCESSIBILITY
  ↓
RESPONSIVE BEHAVIOR
  ↓
PROTOTYPE
  ↓
TEST
  ↓
POLISH
  ↓
DEFINING MOMENT
```

The agent should be capable of moving backward through this chain.

If polishing cannot fix the experience:

```text
go back to interaction model.
```

If interaction cannot fix it:

```text
go back to problem framing.
```

This prevents the common mistake of trying to solve a fundamentally wrong interaction with increasingly sophisticated visuals.


# 142. Motion Pattern Vocabulary

Motion should be treated as a reusable design-system vocabulary, not a collection of one-off animations.

Transitions.dev demonstrates a useful model for AI-assisted implementation: give common transitions recognizable names and make the implementation inspectable, reusable, and token-driven. citeturn0search14

Before inventing a custom animation, first determine whether an established motion pattern fits.

The agent should think:

```text
User action / system event
        ↓
Semantic transition
        ↓
Known motion pattern
        ↓
Component implementation
        ↓
Motion tokens
        ↓
Accessibility / reduced motion
```

---

# 143. Core Motion Pattern Catalog

The following vocabulary should be available to the agent.

## Feedback

```text
press
hover-emphasis
focus-ring
toggle
checkbox-check
radio-select
icon-swap
success-confirmation
error-feedback
```

Use for immediate response to user actions.

---

## Reveal / Hide

```text
fade-in
fade-out
scale-in
scale-out
slide-in
slide-out
expand
collapse
accordion
popover
tooltip
dropdown
sheet
modal
toast
banner
```

Choose the pattern based on the element's spatial relationship.

---

## Transformation

```text
card-expand
thumbnail-to-detail
button-to-progress
button-to-success
icon-to-icon
compact-to-expanded
list-to-detail
input-to-workspace
```

Use when the same conceptual object changes form.

Transformation is often stronger than removing one component and introducing another unrelated component.

---

## Layout

```text
layout-shift
item-insert
item-remove
item-reorder
filter-transition
sort-transition
grid-to-list
list-to-grid
panel-resize
sidebar-collapse
```

Use layout motion to preserve spatial context.

Avoid animating constantly changing data.

---

## Navigation

```text
page-enter
page-exit
shared-element
tab-switch
breadcrumb-transition
view-switch
drawer-navigation
```

Use when spatial continuity helps users understand where they went.

---

## Feedback / Status

```text
loading
progress
skeleton-to-content
spinner-to-success
spinner-to-error
saving
saved
syncing
offline
retry
```

Status motion should communicate system state, not create decorative activity.

---

# 144. AI Motion Pattern Catalog

AI needs a specialized vocabulary because AI interactions have more intermediate states than ordinary UI.

## Generation

```text
ai-submit
ai-working
ai-stream
ai-complete
ai-cancel
ai-error
```

Lifecycle:

```text
idle
 ↓
submitted
 ↓
working
 ↓
streaming
 ↓
complete
```

---

## Agent

```text
agent-start
agent-planning
agent-tool-call
agent-tool-success
agent-tool-error
agent-waiting
agent-needs-approval
agent-complete
agent-cancel
```

Lifecycle:

```text
goal
 ↓
plan
 ↓
execute
 ↓
observe
 ↓
checkpoint
 ↓
continue
 ↓
review
 ↓
complete
```

---

## AI Content

```text
ai-draft
ai-suggestion
ai-rewrite
ai-regenerate
ai-diff
ai-accept
ai-reject
ai-undo
```

Use motion to preserve the relationship between the original and generated content.

---

## AI Evidence

```text
source-reveal
citation-popover
source-highlight
evidence-stack
research-progress
result-grounding
```

These patterns should help users understand where information came from.

---

# 145. Pattern Selection Rules

The agent should choose the pattern according to semantic meaning.

### Something appears from a trigger

Use:

```text
popover
dropdown
tooltip
```

not a generic fade.

### Something expands into more detail

Use:

```text
expand
card-expand
shared-element
```

not a completely unrelated entrance.

### An action starts processing

Use:

```text
button-to-progress
loading
```

not a page-wide spinner.

### An operation completes

Use:

```text
spinner-to-success
success-confirmation
```

not confetti by default.

### AI starts working

Use:

```text
ai-working
ai-progress
```

not an arbitrary pulsing gradient.

### AI uses a tool

Use:

```text
agent-tool-call
agent-tool-success
agent-tool-error
```

not fake "thinking."

### AI changes an artifact

Use:

```text
ai-diff
ai-review
ai-accept
ai-reject
```

not simply replacing the entire artifact.

---

# 146. Motion Pattern Anatomy

Every motion pattern should define:

```yaml
motion_pattern:
purpose:
trigger:
from_state:
to_state:
duration:
easing:
properties:
origin:
stagger:
interruptible:
reversible:
reduced_motion:
accessibility:
```

Example:

```yaml
motion_pattern: dropdown

purpose: Reveal a contextual menu associated with a trigger.

trigger: trigger activation

from_state:
  opacity: 0
  scale: subtle
  y: small offset

to_state:
  opacity: 1
  scale: 1
  y: 0

origin: trigger

duration: normal
easing: enter

interruptible: true

reduced_motion:
  use: opacity-only
```

This should be enough for an agent to implement the pattern without inventing behavior.

---

# 147. Motion Tokens + Patterns

Patterns should consume tokens.

Example:

```yaml
tokens:
  duration:
    instant: 80ms
    fast: 140ms
    normal: 200ms
    slow: 300ms
    emphasis: 450ms

  distance:
    micro: 2px
    small: 6px
    medium: 12px
    large: 24px

  scale:
    subtle-in: 0.98
    subtle-press: 0.98
```

The exact values may vary by product.

The important rule is:

> **Patterns reference semantic tokens instead of inventing arbitrary values.**

---

# 148. Motion Pattern Composition

Patterns can be composed.

Example:

```text
Modal
+
Backdrop fade
+
Content scale/translate
+
Focus management
```

or:

```text
AI generation
+
Status transition
+
Streaming text
+
Completion confirmation
```

But composition must have hierarchy.

Example:

```text
Primary:
AI content streams

Secondary:
status indicator changes

Tertiary:
subtle completion feedback
```

Do not make every layer equally expressive.

---

# 149. Motion Pattern Families

The agent should recognize these families:

```text
FEEDBACK
  press
  focus
  success
  error

REVEAL
  fade
  scale
  slide
  expand

TRANSFORM
  morph
  shared-element
  compact-to-expanded

LAYOUT
  insert
  remove
  reorder
  resize

NAVIGATION
  page
  tab
  drawer
  view-switch

STATUS
  loading
  progress
  saving
  syncing

AI
  generate
  stream
  tool-call
  agent-progress
  review
  approval
  correction
```

This provides a vocabulary the agent can reason with.

---

# 150. Custom Motion Rule

Only create a custom motion pattern when:

1. no existing pattern fits
2. the interaction has a genuinely different semantic meaning
3. the custom motion improves comprehension, control, or product expression
4. accessibility remains supported
5. the behavior can be documented and reused

Do not create:

```text
FancyButtonAnimation17
```

Create:

```text
button-to-success
```

if the behavior represents a reusable semantic pattern.

---

# 151. Motion Pattern Naming

Names should describe **meaning**, not implementation.

Good:

```text
button-to-success
card-expand
ai-stream
agent-tool-call
source-reveal
panel-enter
```

Bad:

```text
scale-opacity-200
slide-up-animation
blue-button-motion
fancy-fade
```

Semantic names make motion discoverable to both designers and AI agents.

---

# 152. Pattern Selection Prompt for Agents

Before implementing motion, internally answer:

```text
What caused this transition?

What changed?

What relationship should the user understand?

Is there an existing motion pattern?

What is the primary moving object?

What should remain still?

What is the minimum motion needed?

What happens if the user interrupts it?

What happens with reduced motion?
```

Then implement.

---

# 153. Motion Reference Library

For each pattern in a design system, provide:

```text
Pattern name
↓
Live example
↓
When to use
↓
When not to use
↓
State diagram
↓
Motion tokens
↓
Accessibility behavior
↓
Code example
↓
Variants
```

This is the ideal structure for an AI-readable motion library.

A visual catalog is especially valuable because motion is difficult to communicate through static documentation.

---

# 154. Motion Playground

A design-engineering system should ideally include a motion playground.

Controls can expose:

```text
Duration
Easing
Distance
Scale
Opacity
Direction
Origin
Stagger
Reduced motion
```

But the playground is for exploration.

Production components should still consume standardized semantic tokens.

---

# 155. AI Motion Playground

AI-specific motion should be previewable through simulated states.

Example:

```text
[Run simulation]

Idle
 ↓
Working
 ↓
Searching
 ↓
Tool call
 ↓
Streaming
 ↓
Complete
```

Controls:

```text
Generation speed
Tool count
Latency
Error
Cancellation
Reduced motion
```

This lets designers evaluate the **experience of time**, not just individual animation frames.

---

# 156. Designing for Time

AI interfaces introduce a new design dimension:

> **time**

Traditional component design often focuses on:

```text
space
type
color
interaction
```

AI adds:

```text
waiting
progress
uncertainty
partial results
interruption
completion
```

Therefore AI components should be designed as **temporal experiences**.

Ask:

```text
What does the user see at 0ms?
What happens at 200ms?
What happens at 1s?
What happens at 3s?
What happens if it takes 10s?
What happens if it fails?
What happens if the user stops it?
```

Do not design only the final state.

---

# 157. Latency-Aware Motion

Design around realistic timing.

Example:

```text
0–100ms
Immediate acknowledgement

100ms–1s
Useful activity feedback

1s+
Meaningful progress

Long task
Progress + control + partial results

Very long task
Background execution + notification
```

These are UX heuristics, not hard performance thresholds.

Never use a long animation simply to make a slow system appear intentional.

---

# 158. Motion and AI Trust

Motion can accidentally anthropomorphize AI.

Avoid motion that implies:

```text
emotion
human-like thinking
certainty
confidence
personality
```

unless that metaphor is explicitly part of the product.

Prefer observable system states:

```text
Searching…
Reading…
Generating…
Waiting for approval…
```

The user should understand **what the system is doing**, not be manipulated into feeling that it is "thinking like a person."

---

# 159. Motion as Information Architecture

Motion can communicate hierarchy.

For example:

```text
Primary result
   ↓
large / immediate entrance

Supporting evidence
   ↓
secondary reveal

Optional details
   ↓
on demand
```

This means motion itself can help organize information.

But static hierarchy must remain understandable without motion.

---

# 160. Creative Motion

Once functional motion is correct, expression can be introduced.

Examples:

```text
Success
→ subtle shape transformation

AI generation
→ content emerges from the source context

Card
→ transforms into workspace

Image
→ expands from thumbnail to editor

Agent
→ timeline progressively builds itself
```

Creative motion should be **semantically attached** to the interaction.

The agent should prefer:

```text
meaningful metaphor
```

over:

```text
generic visual effect
```

---

# 161. Motion Anti-Patterns

Avoid:

```text
animation everywhere
```

```text
multiple simultaneous focal points
```

```text
long easing curves for frequent actions
```

```text
bounce for ordinary controls
```

```text
random spring physics
```

```text
fake AI thinking
```

```text
continuous gradient movement
```

```text
auto-scroll fighting the user
```

```text
animation that blocks interaction
```

```text
different durations for visually identical patterns
```

```text
custom animation when an established pattern exists
```

---

# 162. Motion Review: "Why This Motion?"

Every non-trivial animation should be explainable in one sentence.

Good:

> "The card expands from the clicked location so the user understands that the detail view belongs to that card."

Good:

> "The AI timeline reveals completed tool calls so the user can understand progress."

Bad:

> "It looks more premium."

"Premium" can be an outcome, but it is not sufficient rationale for functional motion.

---

# 163. Motion Quality Standard

The agent should aim for motion that feels:

```text
Immediate
        +
Intentional
        +
Spatially coherent
        +
Consistent
        +
Interruptible
        +
Accessible
        +
Expressive when appropriate
```

The user should rarely consciously think:

> "That was a nice animation."

Instead they should feel:

> "That behaved exactly how I expected."

---

# 164. Pixel Dosa Motion Library Direction

For Pixel Dosa, motion should become a first-class asset category.

Potential structure:

```text
Pixel Dosa
│
├── Components
│
├── Patterns
│
├── AI Patterns
│
├── Motion
│   ├── Feedback
│   ├── Reveal
│   ├── Transform
│   ├── Layout
│   ├── Navigation
│   ├── Status
│   └── AI
│
└── Design Tokens
    ├── Color
    ├── Type
    ├── Spacing
    ├── Radius
    └── Motion
```

Each motion asset should be:

```text
Live
Editable
Composable
Tokenized
Accessible
AI-readable
```

---

# 165. Motion + Component Release Format

When releasing a Pixel Dosa component, consider documenting:

```text
Component
↓
Problem
↓
Conventional behavior
↓
Chosen interaction
↓
States
↓
Motion pattern
↓
AI behavior (if relevant)
↓
Accessibility
↓
Responsive behavior
↓
Code
```

This makes each component a **design-engineering case study**, not just a visual snippet.

---

# 166. Motion Agent Golden Rule

When an agent is asked:

> "Make this feel polished."

It should NOT immediately add:

```text
spring
blur
scale
parallax
gradient
stagger
```

It should first inspect:

```text
state
feedback
hierarchy
continuity
timing
interaction
```

Then select the smallest motion pattern that solves the problem.

Only after that should it consider expressive enhancement.

---

# 167. Final Motion Stack

The complete system should now be understood as:

```text
MOTION PRINCIPLES
       ↓
MOTION TOKENS
       ↓
MOTION VOCABULARY
       ↓
MOTION PATTERNS
       ↓
COMPONENT MOTION
       ↓
AI TEMPORAL PATTERNS
       ↓
CREATIVE EXPRESSION
       ↓
ACCESSIBILITY
```

This prevents two opposite failures:

```text
No motion
→ static / lifeless / unclear
```

and:

```text
Too much motion
→ distracting / slow / confusing
```

The target is:

> **Motion that feels inevitable, communicates state, preserves context, and gives the product a recognizable character.**
