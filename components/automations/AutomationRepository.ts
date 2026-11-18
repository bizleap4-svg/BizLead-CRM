/**
 * BizLead Revenue OS — Automation Repository & Seed Templates
 * Versioned persistence, 7 prebuilt workflow templates, and execution audit logging.
 */

import {
  Workflow,
  WorkflowExecution,
  AutomationEvent,
  ScheduledAction,
} from "../crm/types";

export const STORAGE_KEY_WORKFLOWS = "bizlead_automations_v1";
export const STORAGE_KEY_EXECUTIONS = "bizlead_automation_executions_v1";
export const STORAGE_KEY_SCHEDULED_ACTIONS = "bizlead_scheduled_actions_v1";

// 7 Prebuilt Production Templates (Default status: "inactive")
export const PREBUILT_WORKFLOW_TEMPLATES: Workflow[] = [
  {
    id: "wf-tpl-high-intent-routing",
    name: "High-Intent Enterprise Lead Routing",
    description: "Automatically routes inbound leads with score >= 75 to Senior Account Executive with #enterprise tag.",
    status: "inactive",
    version: 1,
    isTemplate: true,
    category: "lead_routing",
    triggerType: "lead_created",
    triggerConfig: {},
    nodes: [
      {
        id: "node-trigger-1",
        type: "trigger",
        title: "New Lead Created",
        description: "Fires when any lead enters CRM",
        position: { x: 300, y: 50 },
        data: { triggerType: "lead_created" },
      },
      {
        id: "node-cond-1",
        type: "condition",
        title: "Score >= 75 (High Intent)",
        description: "Checks if lead score is 75 or higher",
        position: { x: 300, y: 180 },
        data: {
          conditionGroup: {
            id: "cg-1",
            logicalOperator: "AND",
            rules: [
              {
                id: "rule-1",
                field: "score",
                operator: "greater_than_or_equal",
                value: 75,
              },
            ],
          },
        },
      },
      {
        id: "node-action-assign",
        type: "action",
        title: "Assign Senior AE (Rahul Sharma)",
        description: "Sets lead owner to Rahul Sharma",
        position: { x: 160, y: 320 },
        data: {
          actionType: "assign_lead_owner",
          actionConfig: { owner: "Rahul Sharma" },
        },
      },
      {
        id: "node-action-tag",
        type: "action",
        title: "Add Tag #enterprise",
        description: "Attaches enterprise classification tag",
        position: { x: 160, y: 440 },
        data: {
          actionType: "add_lead_tag",
          actionConfig: { tag: "enterprise" },
        },
      },
      {
        id: "node-action-task",
        type: "action",
        title: "Create 1-Hour Outreach Task",
        description: "Creates urgent follow-up task in Focus Center",
        position: { x: 160, y: 560 },
        data: {
          actionType: "create_task",
          actionConfig: {
            title: "Urgent: High-Intent Enterprise Outreach",
            priority: "urgent",
            dueDays: 1,
            taskType: "call",
          },
        },
      },
      {
        id: "node-action-std",
        type: "action",
        title: "Assign General SDR Queue",
        description: "Standard inbound routing for nurturing",
        position: { x: 440, y: 320 },
        data: {
          actionType: "assign_lead_owner",
          actionConfig: { owner: "Priya Patel" },
        },
      },
    ],
    edges: [
      { id: "e1", source: "node-trigger-1", target: "node-cond-1" },
      { id: "e2", source: "node-cond-1", target: "node-action-assign", sourceHandle: "yes", label: "Yes" },
      { id: "e3", source: "node-action-assign", target: "node-action-tag" },
      { id: "e4", source: "node-action-tag", target: "node-action-task" },
      { id: "e5", source: "node-cond-1", target: "node-action-std", sourceHandle: "no", label: "No" },
    ],
    executionCount: 24,
    successCount: 24,
    failureCount: 0,
    lastExecutedAt: "2026-11-18T09:15:00Z",
    createdAt: "2026-10-15T10:00:00Z",
    updatedAt: "2026-11-18T10:00:00Z",
  },
  {
    id: "wf-tpl-instant-followup",
    name: "Instant Inbound Lead Engagement",
    description: "Schedules immediate discovery outreach task and logs initial CRM welcome note.",
    status: "inactive",
    version: 1,
    isTemplate: true,
    category: "follow_up",
    triggerType: "lead_created",
    triggerConfig: {},
    nodes: [
      {
        id: "node-trigger-2",
        type: "trigger",
        title: "Lead Enters Pipeline",
        position: { x: 300, y: 50 },
        data: { triggerType: "lead_created" },
      },
      {
        id: "node-action-welcome-task",
        type: "action",
        title: "Create Discovery Call Task",
        position: { x: 300, y: 180 },
        data: {
          actionType: "create_task",
          actionConfig: {
            title: "Introductory Discovery Call",
            priority: "high",
            dueDays: 1,
            taskType: "call",
          },
        },
      },
      {
        id: "node-action-note",
        type: "action",
        title: "Log Inbound Welcome Note",
        position: { x: 300, y: 300 },
        data: {
          actionType: "add_internal_note",
          actionConfig: {
            note: "System: Lead ingested from marketing campaign. Discovery workflow initiated.",
          },
        },
      },
    ],
    edges: [
      { id: "e2-1", source: "node-trigger-2", target: "node-action-welcome-task" },
      { id: "e2-2", source: "node-action-welcome-task", target: "node-action-note" },
    ],
    executionCount: 18,
    successCount: 18,
    failureCount: 0,
    lastExecutedAt: "2026-11-17T14:20:00Z",
    createdAt: "2026-10-20T11:00:00Z",
    updatedAt: "2026-11-17T14:20:00Z",
  },
  {
    id: "wf-tpl-proposal-reminder",
    name: "Stalled Proposal Follow-up Cadence",
    description: "When deal enters Proposal stage, sets follow-up task and notification reminder.",
    status: "inactive",
    version: 1,
    isTemplate: true,
    category: "sales",
    triggerType: "deal_stage_changed",
    triggerConfig: {},
    nodes: [
      {
        id: "node-trigger-3",
        type: "trigger",
        title: "Deal Stage Changed",
        position: { x: 300, y: 50 },
        data: { triggerType: "deal_stage_changed" },
      },
      {
        id: "node-cond-stage",
        type: "condition",
        title: "Stage == Proposal",
        position: { x: 300, y: 180 },
        data: {
          conditionGroup: {
            id: "cg-prop",
            logicalOperator: "AND",
            rules: [
              {
                id: "r-prop",
                field: "stage",
                operator: "equals",
                value: "proposal",
              },
            ],
          },
        },
      },
      {
        id: "node-delay-48h",
        type: "delay",
        title: "Wait 48 Hours",
        position: { x: 160, y: 320 },
        data: {
          delayMinutes: 2880,
          delayLabel: "48 Hours",
        },
      },
      {
        id: "node-action-prop-task",
        type: "action",
        title: "Create Proposal Review Task",
        position: { x: 160, y: 440 },
        data: {
          actionType: "create_task",
          actionConfig: {
            title: "Follow up on Sent Commercial Proposal",
            priority: "high",
            dueDays: 2,
            taskType: "follow_up",
          },
        },
      },
    ],
    edges: [
      { id: "e3-1", source: "node-trigger-3", target: "node-cond-stage" },
      { id: "e3-2", source: "node-cond-stage", target: "node-delay-48h", sourceHandle: "yes", label: "Yes" },
      { id: "e3-3", source: "node-delay-48h", target: "node-action-prop-task" },
    ],
    executionCount: 12,
    successCount: 12,
    failureCount: 0,
    lastExecutedAt: "2026-11-16T16:45:00Z",
    createdAt: "2026-10-25T09:00:00Z",
    updatedAt: "2026-11-16T16:45:00Z",
  },
  {
    id: "wf-tpl-task-escalation",
    name: "Overdue Follow-up Task Escalation",
    description: "Escalates priority to Urgent and triggers notification when a follow-up becomes overdue.",
    status: "inactive",
    version: 1,
    isTemplate: true,
    category: "operations",
    triggerType: "followup_overdue",
    triggerConfig: {},
    nodes: [
      {
        id: "node-trigger-4",
        type: "trigger",
        title: "Follow-up Overdue",
        position: { x: 300, y: 50 },
        data: { triggerType: "followup_overdue" },
      },
      {
        id: "node-action-urgent",
        type: "action",
        title: "Set Task Priority to Urgent",
        position: { x: 300, y: 180 },
        data: {
          actionType: "update_lead_priority",
          actionConfig: { priority: "urgent" },
        },
      },
      {
        id: "node-action-remind",
        type: "action",
        title: "Trigger Escalation Notification",
        position: { x: 300, y: 300 },
        data: {
          actionType: "create_reminder",
          actionConfig: {
            message: "Escalation: Follow-up is past SLA deadline. Immediate action required.",
            priority: "urgent",
          },
        },
      },
    ],
    edges: [
      { id: "e4-1", source: "node-trigger-4", target: "node-action-urgent" },
      { id: "e4-2", source: "node-action-urgent", target: "node-action-remind" },
    ],
    executionCount: 7,
    successCount: 7,
    failureCount: 0,
    lastExecutedAt: "2026-11-18T08:30:00Z",
    createdAt: "2026-10-28T12:00:00Z",
    updatedAt: "2026-11-18T08:30:00Z",
  },
  {
    id: "wf-tpl-deal-won-onboarding",
    name: "Deal Won Client Onboarding Kickoff",
    description: "When deal closes won, generates onboarding task and adds customer tag.",
    status: "inactive",
    version: 1,
    isTemplate: true,
    category: "sales",
    triggerType: "deal_won",
    triggerConfig: {},
    nodes: [
      {
        id: "node-trigger-5",
        type: "trigger",
        title: "Deal Closed Won",
        position: { x: 300, y: 50 },
        data: { triggerType: "deal_won" },
      },
      {
        id: "node-action-onboard-task",
        type: "action",
        title: "Create Onboarding Kickoff Task",
        position: { x: 300, y: 180 },
        data: {
          actionType: "create_task",
          actionConfig: {
            title: "Schedule Implementation Kickoff Call",
            priority: "high",
            dueDays: 2,
            taskType: "onboarding",
          },
        },
      },
      {
        id: "node-action-tag-client",
        type: "action",
        title: "Tag Account #active_client",
        position: { x: 300, y: 300 },
        data: {
          actionType: "add_lead_tag",
          actionConfig: { tag: "active_client" },
        },
      },
    ],
    edges: [
      { id: "e5-1", source: "node-trigger-5", target: "node-action-onboard-task" },
      { id: "e5-2", source: "node-action-onboard-task", target: "node-action-tag-client" },
    ],
    executionCount: 15,
    successCount: 15,
    failureCount: 0,
    lastExecutedAt: "2026-11-17T11:00:00Z",
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-17T11:00:00Z",
  },
  {
    id: "wf-tpl-unanswered-chat",
    name: "Unanswered Inbound Conversation Alert",
    description: "Creates urgent task if new customer message remains unassigned for 15 minutes.",
    status: "inactive",
    version: 1,
    isTemplate: true,
    category: "operations",
    triggerType: "conversation_received",
    triggerConfig: {},
    nodes: [
      {
        id: "node-trigger-6",
        type: "trigger",
        title: "Customer Message Received",
        position: { x: 300, y: 50 },
        data: { triggerType: "conversation_received" },
      },
      {
        id: "node-action-assign-chat",
        type: "action",
        title: "Auto-assign to Duty Executive",
        position: { x: 300, y: 180 },
        data: {
          actionType: "assign_conversation",
          actionConfig: { assignee: "Rahul Sharma" },
        },
      },
      {
        id: "node-action-chat-task",
        type: "action",
        title: "Create Response Task",
        position: { x: 300, y: 300 },
        data: {
          actionType: "create_task",
          actionConfig: {
            title: "Respond to Customer Message (SLA < 15m)",
            priority: "urgent",
            dueDays: 0,
            taskType: "whatsapp",
          },
        },
      },
    ],
    edges: [
      { id: "e6-1", source: "node-trigger-6", target: "node-action-assign-chat" },
      { id: "e6-2", source: "node-action-assign-chat", target: "node-action-chat-task" },
    ],
    executionCount: 22,
    successCount: 21,
    failureCount: 1,
    lastExecutedAt: "2026-11-18T07:15:00Z",
    createdAt: "2026-11-05T09:00:00Z",
    updatedAt: "2026-11-18T07:15:00Z",
  },
  {
    id: "wf-tpl-campaign-quality-audit",
    name: "Campaign Quality Investigation",
    description: "Triggers growth team review task when campaign spend is high but qualification rate is low.",
    status: "inactive",
    version: 1,
    isTemplate: true,
    category: "marketing",
    triggerType: "campaign_threshold_reached",
    triggerConfig: {},
    nodes: [
      {
        id: "node-trigger-7",
        type: "trigger",
        title: "Campaign Threshold Reached",
        position: { x: 300, y: 50 },
        data: { triggerType: "campaign_threshold_reached" },
      },
      {
        id: "node-action-audit-task",
        type: "action",
        title: "Create Growth Audit Task",
        position: { x: 300, y: 180 },
        data: {
          actionType: "create_task",
          actionConfig: {
            title: "Audit Underperforming Ad Creative & Audience Targeting",
            priority: "high",
            dueDays: 1,
            taskType: "prep",
          },
        },
      },
    ],
    edges: [
      { id: "e7-1", source: "node-trigger-7", target: "node-action-audit-task" },
    ],
    executionCount: 6,
    successCount: 6,
    failureCount: 0,
    lastExecutedAt: "2026-11-16T18:00:00Z",
    createdAt: "2026-11-08T11:00:00Z",
    updatedAt: "2026-11-16T18:00:00Z",
  },
];

export class AutomationRepository {
  static getWorkflows(): Workflow[] {
    if (typeof window === "undefined") return PREBUILT_WORKFLOW_TEMPLATES;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WORKFLOWS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_WORKFLOWS, JSON.stringify(PREBUILT_WORKFLOW_TEMPLATES));
        return PREBUILT_WORKFLOW_TEMPLATES;
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEY_WORKFLOWS, JSON.stringify(PREBUILT_WORKFLOW_TEMPLATES));
        return PREBUILT_WORKFLOW_TEMPLATES;
      }
      return parsed;
    } catch {
      return PREBUILT_WORKFLOW_TEMPLATES;
    }
  }

  static saveWorkflows(workflows: Workflow[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_WORKFLOWS, JSON.stringify(workflows));
    } catch (e) {
      console.error("Failed to persist workflows to localStorage", e);
    }
  }

  static getExecutions(): WorkflowExecution[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EXECUTIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static saveExecutions(executions: WorkflowExecution[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_EXECUTIONS, JSON.stringify(executions.slice(0, 100))); // keep last 100
    } catch (e) {
      console.error("Failed to persist execution history to localStorage", e);
    }
  }
}
