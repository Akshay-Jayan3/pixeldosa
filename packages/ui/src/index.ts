export { cn } from "./lib/utils";
export { Button, buttonVariants, type ButtonProps } from "./registry/button/button";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
  CardImage,
  cardVariants,
  type CardProps,
} from "./registry/card/card";
export {
  Field,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldError,
  type FieldProps,
} from "./registry/field/field";
export {
  AnimatePresence,
  OverlayScrim,
  OverlayContent,
  type OverlayPlacement,
  type OverlayScrimProps,
  type OverlayContentProps,
} from "./registry/overlay/overlay";
export { GhostInput, type GhostInputProps } from "./registry/ghost-input/ghost-input";
export {
  CommandMenu,
  CommandMenuInput,
  CommandMenuList,
  CommandMenuEmpty,
  CommandMenuGroup,
  CommandMenuSeparator,
  CommandMenuItem,
  type CommandMenuProps,
  type CommandMenuInputProps,
  type CommandMenuListProps,
  type CommandMenuEmptyProps,
  type CommandMenuGroupProps,
  type CommandMenuItemProps,
} from "./registry/command-menu/command-menu";
export {
  SmartField,
  type SmartFieldProps,
  type SmartFieldProposal,
  type SmartFieldConfidence,
  type FetchProposal,
} from "./registry/smart-field/smart-field";
export { DiffAccept, type DiffAcceptProps } from "./registry/diff-accept/diff-accept";
export {
  SelectionActions,
  type SelectionActionsProps,
  type SelectionAction,
  type SelectionActionResult,
  type OnSelectionAction,
} from "./registry/selection-actions/selection-actions";
export {
  ConfidenceMeter,
  type ConfidenceMeterProps,
  type ConfidenceTier,
} from "./registry/confidence-meter/confidence-meter";
export {
  ProgressiveReveal,
  type ProgressiveRevealProps,
} from "./registry/progressive-reveal/progressive-reveal";
export {
  AIContextSurface,
  type AIContextSurfaceProps,
  type ProvenanceSource,
} from "./registry/ai-context-surface/ai-context-surface";
export {
  AIActionToolbar,
  aiActionToolbarVariants,
  type AIActionToolbarProps,
  type AIAction,
  type AIActionIntent,
} from "./registry/ai-action-toolbar/ai-action-toolbar";
// `agentPresenceStates` is deliberately not re-exported here: the docs site spreads
// this module into its MDX component map, which only accepts components, and the state
// config is a plain data object. It stays available from the component file itself.
export {
  AgentPresence,
  type AgentPresenceProps,
  type AgentState,
  type AgentPresenceForm,
} from "./registry/agent-presence/agent-presence";
export {
  IntentPreview,
  type IntentPreviewProps,
  type IntentAssumption,
} from "./registry/intent-preview/intent-preview";
export {
  AgentPlan,
  type AgentPlanProps,
  type PlanStep,
} from "./registry/agent-plan/agent-plan";
export {
  AIChatExperience,
  type AIChatExperienceProps,
  type ChatTurn,
} from "./registry/ai-chat-experience/ai-chat-experience";
export { Suggestions, type SuggestionsProps, type Suggestion } from "./registry/suggestions/suggestions";
// `splitCodeFences` is deliberately not re-exported here, like `agentPresenceStates`: the
// docs site spreads this module into its MDX component map, which only accepts
// components. Import it from the component file.
export { CodeBlock, type CodeBlockProps, type MarkdownSegment } from "./registry/code-block/code-block";
export {
  MessageScroller,
  type MessageScrollerProps,
} from "./registry/message-scroller/message-scroller";
export {
  Message,
  MessageContent,
  type MessageProps,
  type MessageContentProps,
  type MessageRole,
  type MessageStatus,
} from "./registry/message/message";
export {
  PromptComposer,
  type PromptComposerProps,
  type ComposerControl,
  type ComposerOption,
  type ComposerAttachment,
  type ComposerSubmission,
} from "./registry/prompt-composer/prompt-composer";
export {
  CitedText,
  Cite,
  type CitedTextProps,
  type CiteProps,
  type CitationSource,
  type CitationSupport,
} from "./registry/inline-citations/inline-citations";
export {
  AutonomyControl,
  type AutonomyControlProps,
  type AutonomyLevel,
  type AutonomyAction,
  type ActionRisk,
} from "./registry/autonomy-control/autonomy-control";
export {
  AgentMemory,
  type AgentMemoryProps,
  type MemoryItem,
  type MemoryOrigin,
} from "./registry/agent-memory/agent-memory";
export {
  ToolCallCard,
  ToolCallGroup,
  type ToolCallCardProps,
  type ToolCallGroupProps,
  type ToolCall,
  type ToolCallKind,
  type ToolCallStatus,
  type ToolCallEffect,
} from "./registry/tool-call-card/tool-call-card";
export {
  AgentSteer,
  type AgentSteerProps,
  type SteerMessage,
  type SteerMode,
  type SteerStatus,
} from "./registry/agent-steer/agent-steer";
export {
  AITriageTable,
  type AITriageTableProps,
  type TriageItem,
  type TriageDecision,
} from "./registry/ai-triage-table/ai-triage-table";
export {
  AIFormFill,
  type AIFormFillProps,
  type FormFillField,
} from "./registry/ai-form-fill/ai-form-fill";
export {
  ThinkingExperience,
  type ThinkingExperienceProps,
  type AskRequest,
  type ApprovalRequest,
} from "./registry/thinking-experience/thinking-experience";
export {
  AIApprovalGate,
  type AIApprovalGateProps,
  type ApprovalRisk,
  type ApprovalImpact,
} from "./registry/ai-approval-gate/ai-approval-gate";
export {
  LiveStatusLine,
  type LiveStatusLineProps,
} from "./registry/live-status-line/live-status-line";
export {
  AgentAsk,
  type AgentAskProps,
  type AskField,
  type AskFieldOption,
} from "./registry/agent-ask/agent-ask";
export {
  ReasoningStream,
  type ReasoningStreamProps,
} from "./registry/reasoning-stream/reasoning-stream";
export {
  GenerationPlaceholder,
  type GenerationPlaceholderProps,
  type GenerationStatus,
  type GenerationForm,
} from "./registry/generation-placeholder/generation-placeholder";
export {
  AgentFigure,
  type AgentFigureProps,
  type AgentPose,
} from "./registry/agent-figure/agent-figure";
export {
  CostEstimate,
  type CostEstimateProps,
  type CostItem,
  type CostRange,
} from "./registry/cost-estimate/cost-estimate";
export {
  DraftMode,
  type DraftModeProps,
  type DraftItem,
} from "./registry/draft-mode/draft-mode";
export {
  ResponseVersions,
  type ResponseVersionsProps,
  type ResponseVersion,
} from "./registry/response-versions/response-versions";
export {
  ResponseFeedback,
  type ResponseFeedbackProps,
  type FeedbackReason,
  type FeedbackSubmission,
  type FeedbackVerdict,
} from "./registry/response-feedback/response-feedback";
export {
  AIDisclosure,
  type AIDisclosureProps,
  type DisclosureFact,
} from "./registry/ai-disclosure/ai-disclosure";
export {
  GenerationJob,
  type GenerationJobProps,
  type GenerationJobStatus,
} from "./registry/generation-job/generation-job";
export {
  VariationGrid,
  type VariationGridProps,
  type Variation,
  type VariationStatus,
} from "./registry/variation-grid/variation-grid";
export { CreditsMeter, type CreditsMeterProps } from "./registry/credits-meter/credits-meter";
export {
  ParameterPanel,
  type ParameterPanelProps,
  type ParameterGroup,
  type ParameterOption,
} from "./registry/parameter-panel/parameter-panel";
export { CompareView, type CompareViewProps } from "./registry/compare-view/compare-view";
export { MediaResult, type MediaResultProps, type MediaAction } from "./registry/media-result/media-result";
export { RunInbox, type RunInboxProps, type AgentRun, type RunState } from "./registry/run-inbox/run-inbox";
export {
  ActivityTrail,
  type ActivityTrailProps,
  type TrailEntry,
  type TrailActor,
} from "./registry/activity-trail/activity-trail";
export {
  HumanHandoff,
  type HumanHandoffProps,
  type HandoffStage,
  type HandoffFact,
} from "./registry/human-handoff/human-handoff";
export {
  AgentSchedule,
  type AgentScheduleProps,
  type ScheduleTrigger,
} from "./registry/agent-schedule/agent-schedule";
