/**
 * BizLead Revenue OS — Biz AI Architecture Types
 * Fully typed abstractions for sessions, context, tools, actions, and provider readiness.
 */

export type AIProviderId =
  | "local_rule_based"
  | "openai"
  | "gemini"
  | "anthropic"
  | "custom_local";

export interface AIProviderStatus {
  id: AIProviderId;
  name: string;
  version: string;
  status: "active" | "pending_integration";
  statusLabel: string;
  isLocal: boolean;
  description: string;
  requiresGateway: boolean;
}

export interface AISession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
  contextEntity?: {
    type: "lead" | "deal" | "contact" | "company" | "campaign" | "task";
    id: string;
    name: string;
  };
  messageCount: number;
}

export type AIMessageRole = "user" | "assistant" | "system";

export interface AIMessageCard {
  id: string;
  type: "lead" | "deal" | "campaign" | "task" | "insight" | "metric_summary";
  title: string;
  subtitle?: string;
  scoreOrValue?: string | number;
  badge?: string;
  badgeColor?: "emerald" | "amber" | "rose" | "purple" | "blue";
  metrics?: { label: string; value: string | number }[];
  entityId?: string;
  entityType?: string;
  linkUrl?: string;
}

export type AIActionType =
  | "create_task"
  | "create_followup"
  | "assign_lead_owner"
  | "add_internal_note"
  | "update_lead_priority"
  | "update_deal_stage"
  | "create_meeting_draft"
  | "create_automation_draft";

export type AIActionStatus = "pending" | "approved" | "rejected" | "executed";

export interface AIActionProposal {
  id: string;
  actionType: AIActionType;
  title: string;
  description: string;
  status: AIActionStatus;
  entityId?: string;
  entityType?: "lead" | "deal" | "contact" | "company" | "meeting" | "workflow";
  entityName?: string;
  parameters: Record<string, any>;
  diffPreview?: {
    field: string;
    oldValue?: string | number;
    newValue: string | number;
  }[];
  executedAt?: string;
  error?: string;
}

export interface AIMessage {
  id: string;
  sessionId: string;
  role: AIMessageRole;
  content: string;
  timestamp: string;
  contextEntity?: {
    type: "lead" | "deal" | "contact" | "company" | "campaign" | "task";
    id: string;
    name: string;
  };
  cards?: AIMessageCard[];
  dataTable?: {
    headers: string[];
    rows: (string | number)[][];
  };
  chartData?: {
    type: "bar" | "funnel" | "trend";
    labels: string[];
    values: number[];
    datasetLabel?: string;
  };
  actionProposals?: AIActionProposal[];
  toolCalls?: {
    toolName: string;
    parameters?: any;
    executionTimeMs?: number;
    success: boolean;
  }[];
  isError?: boolean;
  isUnsupportedQuery?: boolean;
}

export interface AIContext {
  selectedEntityType?: "lead" | "deal" | "contact" | "company" | "campaign" | "task";
  selectedEntityId?: string;
  selectedEntityName?: string;
  period?: "7d" | "30d" | "90d" | "all";
}

export interface CRMToolDefinition {
  name: string;
  description: string;
  parametersSchema: Record<string, string>;
}

export interface CRMToolResult<T = any> {
  toolName: string;
  success: boolean;
  data: T;
  recordReferences?: { id: string; type: string; name: string }[];
  error?: string;
}

export interface AIUsageEvent {
  id: string;
  timestamp: string;
  queryType: string;
  toolsExecuted: string[];
  actionsProposedCount: number;
  sessionId: string;
}

export const AI_PROVIDERS: AIProviderStatus[] = [
  {
    id: "local_rule_based",
    name: "Local CRM Assistant",
    version: "v1.0 (Deterministic Engine)",
    status: "active",
    statusLabel: "Rule-Based Mode Active",
    isLocal: true,
    description: "In-browser deterministic assistant operating directly over local CRM records with zero external data sharing.",
    requiresGateway: false,
  },
  {
    id: "openai",
    name: "OpenAI GPT-4o / Reasoning",
    version: "GPT-4o (Planned)",
    status: "pending_integration",
    statusLabel: "Gateway Integration Pending",
    isLocal: false,
    description: "Requires secure enterprise server-side gateway in Phase 10. API keys are never stored in client browser.",
    requiresGateway: true,
  },
  {
    id: "gemini",
    name: "Google Gemini 1.5 Pro",
    version: "Gemini 1.5 Pro (Planned)",
    status: "pending_integration",
    statusLabel: "Gateway Integration Pending",
    isLocal: false,
    description: "Direct server-to-server connection planned for Phase 10 with multimodal attachment analysis.",
    requiresGateway: true,
  },
  {
    id: "anthropic",
    name: "Anthropic Claude 3.5 Sonnet",
    version: "Claude 3.5 Sonnet (Planned)",
    status: "pending_integration",
    statusLabel: "Gateway Integration Pending",
    isLocal: false,
    description: "High-accuracy reasoning gateway planned for complex deal strategy and enterprise contracts.",
    requiresGateway: true,
  },
  {
    id: "custom_local",
    name: "On-Premise / Ollama LLM",
    version: "Llama 3 / Mistral (Planned)",
    status: "pending_integration",
    statusLabel: "Gateway Integration Pending",
    isLocal: false,
    description: "Self-hosted private LLM gateway container for air-gapped corporate deployments.",
    requiresGateway: true,
  },
];
