/**
 * BizLead Revenue OS — AI Action Executor
 * Safely executes explicitly approved CRM action proposals with strict idempotency guards
 * and Phase 10 role-based permission revalidation.
 */

import { AIActionProposal } from "./types";
import { CRMTask, Lead, Deal, CRMMeeting, Workflow } from "../crm/types";
import * as repo from "../crm/repository";
import { AutomationRepository } from "../automations/AutomationRepository";
import { PermissionService } from "../settings/PermissionService";
import { SettingsRepository } from "../settings/SettingsRepository";
import { WorkspaceMember, Role } from "../settings/types";

export interface ExecutionContext {
  leads: Lead[];
  deals: Deal[];
  tasks: CRMTask[];
  meetings: CRMMeeting[];
  workflows: Workflow[];
  executingMember?: WorkspaceMember;
  executingRole?: Role;
  createTask?: (task: Partial<CRMTask> & { title: string }) => Promise<CRMTask>;
  updateLead?: (id: string, updates: Partial<Lead>) => Promise<Lead>;
  updateDeal?: (id: string, updates: Partial<Deal>) => Promise<Deal>;
  createMeeting?: (meeting: Partial<CRMMeeting> & { title: string; date: string; startTime: string; endTime: string }) => Promise<CRMMeeting>;
  createWorkflow?: (wf: Omit<Workflow, "id" | "createdAt" | "updatedAt">) => Promise<Workflow>;
  refreshAll?: () => Promise<void>;
}

export class ActionExecutor {
  /**
   * Executes an action proposal once approved.
   * Throws an error if already executed (idempotency protection)
   * or if executing identity lacks requisite permissions (Phase 10 RBAC).
   */
  static async executeAction(
    proposal: AIActionProposal,
    ctx: ExecutionContext
  ): Promise<AIActionProposal> {
    if (proposal.status === "executed" || proposal.executedAt) {
      throw new Error(`Action "${proposal.title}" has already been executed. Duplicate execution prevented.`);
    }

    if (proposal.status === "rejected") {
      throw new Error(`Action "${proposal.title}" was rejected and cannot be executed.`);
    }

    try {
      // Phase 10: Revalidate permissions at action execution time
      const activeMember = ctx.executingMember || SettingsRepository.getActiveMember();
      const activeRole = ctx.executingRole || activeMember.roleId;

      const validation = PermissionService.validateActionExecution(
        activeRole,
        proposal.actionType,
        proposal.entityType || "lead",
        proposal.parameters?.owner,
        activeMember.name
      );

      if (!validation.allowed) {
        const errMessage = validation.reason || "Permission Denied: User role lacks permission to execute this CRM action.";
        throw new Error(errMessage);
      }

      const now = new Date().toISOString();
      switch (proposal.actionType) {
        case "create_task":
        case "create_followup": {
          const taskData = {
            title: proposal.parameters.title || "Follow-up task",
            priority: proposal.parameters.priority || "high",
            dueDate: proposal.parameters.dueDate || new Date(Date.now() + 86400000).toISOString().split("T")[0],
            taskType: proposal.parameters.taskType || "follow_up",
            assignedTo: proposal.parameters.assignedTo || activeMember.name,
            entityType: proposal.entityType as any,
            entityId: proposal.entityId,
            entityName: proposal.entityName || "CRM Contact",
          };

          if (ctx.createTask) {
            await ctx.createTask(taskData);
          } else {
            await repo.createTask(taskData);
          }
          break;
        }

        case "assign_lead_owner": {
          if (!proposal.entityId) throw new Error("Missing lead entity ID for owner assignment.");
          const updates = { owner: proposal.parameters.owner || activeMember.name };

          if (ctx.updateLead) {
            await ctx.updateLead(proposal.entityId, updates);
          } else {
            await repo.updateLead(proposal.entityId, updates);
          }
          break;
        }

        case "update_lead_priority": {
          if (!proposal.entityId) throw new Error("Missing lead entity ID for priority update.");
          const updates = { priority: proposal.parameters.priority || "high" };

          if (ctx.updateLead) {
            await ctx.updateLead(proposal.entityId, updates);
          } else {
            await repo.updateLead(proposal.entityId, updates);
          }
          break;
        }

        case "add_internal_note": {
          if (!proposal.entityId) throw new Error("Missing entity ID for internal note.");
          const currentLead = ctx.leads.find((l) => l.id === proposal.entityId);
          const existingNotes = currentLead?.notes || "";
          const newNotes = `${existingNotes}\n[Biz AI Note ${new Date().toLocaleDateString("en-IN")}]: ${proposal.parameters.note}`.trim();

          if (ctx.updateLead) {
            await ctx.updateLead(proposal.entityId, { notes: newNotes });
          } else {
            await repo.updateLead(proposal.entityId, { notes: newNotes });
          }
          break;
        }

        case "update_deal_stage": {
          if (!proposal.entityId) throw new Error("Missing deal entity ID for stage update.");
          const updates = { stage: proposal.parameters.stage || "qualified" };

          if (ctx.updateDeal) {
            await ctx.updateDeal(proposal.entityId, updates);
          } else {
            await repo.updateDeal(proposal.entityId, updates);
          }
          break;
        }

        case "create_meeting_draft": {
          const meetingData = {
            title: proposal.parameters.title || "Introductory Strategy Call",
            date: proposal.parameters.date || new Date(Date.now() + 86400000).toISOString().split("T")[0],
            startTime: proposal.parameters.startTime || "11:00",
            endTime: proposal.parameters.endTime || "11:30",
            leadId: proposal.entityId,
            prepNotes: proposal.parameters.prepNotes || "Generated via Biz AI Assistant.",
          };

          if (ctx.createMeeting) {
            await ctx.createMeeting(meetingData);
          } else {
            await repo.createMeeting(meetingData);
          }
          break;
        }

        case "create_automation_draft": {
          const wfData: Omit<Workflow, "id" | "createdAt" | "updatedAt"> = {
            name: proposal.parameters.name || "AI Generated Workflow (Draft)",
            description: proposal.parameters.description || "Drafted via natural language instruction in Biz AI.",
            status: "draft",
            version: 1,
            triggerType: proposal.parameters.triggerType || "lead_created",
            triggerConfig: proposal.parameters.triggerConfig || {},
            nodes: proposal.parameters.nodes || [],
            edges: proposal.parameters.edges || [],
            executionCount: 0,
            successCount: 0,
            failureCount: 0,
          };

          if (ctx.createWorkflow) {
            await ctx.createWorkflow(wfData);
          } else {
            const stored = AutomationRepository.getWorkflows();
            const newWf: Workflow = {
              ...wfData,
              id: `wf-ai-${Date.now()}`,
              createdAt: now,
              updatedAt: now,
            };
            AutomationRepository.saveWorkflows([newWf, ...stored]);
          }
          break;
        }

        default:
          throw new Error(`Unsupported action type: ${(proposal as any).actionType}`);
      }

      // Record audit event for action execution
      SettingsRepository.logAuditEvent({
        actorId: activeMember.id,
        actorName: activeMember.name,
        actorEmail: activeMember.email,
        action: "AI_ACTION_APPROVED_AND_EXECUTED",
        category: "ai",
        targetEntity: `${proposal.entityType || "CRM Record"}: ${proposal.entityName || proposal.entityId || "General"}`,
        details: `Approved and executed AI proposal: "${proposal.title}". Action type: ${proposal.actionType}.`,
      });

      // Refresh CRM data if available
      if (ctx.refreshAll) {
        await ctx.refreshAll();
      }

      return {
        ...proposal,
        status: "executed",
        executedAt: now,
      };
    } catch (err: any) {
      return {
        ...proposal,
        error: err.message || "Execution failed",
      };
    }
  }
}
