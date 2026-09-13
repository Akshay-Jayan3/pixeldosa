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
