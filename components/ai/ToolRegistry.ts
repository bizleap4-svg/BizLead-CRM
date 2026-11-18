/**
 * BizLead Revenue OS — AI Tool Registry
 * Read-only structured tools querying live CRM records with explicit source references.
 */

import {
  Lead,
  Deal,
  Contact,
  Company,
  CRMTask,
  CRMMeeting,
  MarketingCampaign,
  CampaignDailyMetric,
  Conversation,
  Workflow,
  WorkflowExecution,
  PipelineStage,
} from "../crm/types";
import { CRMToolDefinition, CRMToolResult } from "./types";

export interface ToolRegistryData {
  leads: Lead[];
  deals: Deal[];
  stages: PipelineStage[];
  contacts: Contact[];
  companies: Company[];
  tasks: CRMTask[];
  meetings: CRMMeeting[];
  campaigns: MarketingCampaign[];
  dailyMetrics: CampaignDailyMetric[];
  conversations: Conversation[];
  workflows: Workflow[];
  executions: WorkflowExecution[];
}

export class ToolRegistry {
  private data: ToolRegistryData;

  constructor(data: ToolRegistryData) {
    this.data = data;
  }

  // Tool Definitions
  static getDefinitions(): CRMToolDefinition[] {
    return [
      {
        name: "search_leads",
        description: "Search leads by name, company, score, or stage.",
        parametersSchema: { query: "string", minScore: "number", stage: "string" },
      },
      {
        name: "get_lead_details",
        description: "Retrieve complete sanitized profile for a specific lead ID.",
        parametersSchema: { leadId: "string" },
      },
      {
        name: "calculate_pipeline_metrics",
        description: "Aggregate pipeline value, deal counts by stage, and weighted forecasts.",
        parametersSchema: {},
      },
      {
        name: "find_closing_deals",
        description: "Find deals approaching expected close date or stalled with no next step.",
        parametersSchema: { daysAhead: "number" },
      },
      {
        name: "get_campaign_performance",
        description: "Retrieve marketing campaigns with spend, CRM leads, qualified leads, and CPQL.",
        parametersSchema: { platform: "string" },
      },
      {
        name: "get_pending_tasks",
        description: "Retrieve incomplete CRM tasks, sorted by urgency and priority.",
        parametersSchema: { priority: "string", overdueOnly: "boolean" },
      },
      {
        name: "get_upcoming_meetings",
        description: "Retrieve upcoming scheduled meetings for today and future dates.",
        parametersSchema: { todayOnly: "boolean" },
      },
      {
        name: "get_workflow_health",
        description: "Retrieve automation workflows, execution counts, success rates, and failures.",
        parametersSchema: {},
      },
    ];
  }

  // 1. Search Leads
  searchLeads(params: { query?: string; minScore?: number; stage?: string; limit?: number }): CRMToolResult {
    const q = (params.query || "").toLowerCase().trim();
    const minScore = params.minScore ?? 0;
    const stage = params.stage?.toLowerCase();
    const limit = params.limit ?? 10;

    const filtered = this.data.leads
      .filter((l) => {
        if (minScore > 0 && l.score < minScore) return false;
        if (stage && l.stage.toLowerCase() !== stage) return false;
        if (q) {
          const matchName = l.name.toLowerCase().includes(q);
          const matchCompany = (l.company || "").toLowerCase().includes(q);
          const matchSource = (l.source || "").toLowerCase().includes(q);
          if (!matchName && !matchCompany && !matchSource) return false;
        }
        return true;
      })
      .slice(0, limit);

    return {
      toolName: "search_leads",
      success: true,
      data: filtered.map((l) => ({
        id: l.id,
        name: l.name,
        company: l.company,
        score: l.score,
        stage: l.stage,
        value: l.value,
        owner: l.owner || "Unassigned",
        source: l.source,
      })),
      recordReferences: filtered.map((l) => ({ id: l.id, type: "lead", name: `${l.name} (${l.company})` })),
    };
  }

  // 2. Get Lead Details
  getLeadDetails(leadId: string): CRMToolResult {
    const lead = this.data.leads.find((l) => l.id === leadId);
    if (!lead) {
      return { toolName: "get_lead_details", success: false, data: null, error: `Lead ${leadId} not found` };
    }
    return {
      toolName: "get_lead_details",
      success: true,
      data: {
        id: lead.id,
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        score: lead.score,
        stage: lead.stage,
        value: lead.value,
        owner: lead.owner,
        source: lead.source,
        nextFollowUp: lead.nextFollowUp,
        notes: lead.notes || "",
        createdAt: lead.createdAt,
      },
      recordReferences: [{ id: lead.id, type: "lead", name: lead.name }],
    };
  }

  // 3. Calculate Pipeline Metrics
  calculatePipelineMetrics(): CRMToolResult {
    const deals = this.data.deals;
    const totalPipelineValue = deals
      .filter((d) => d.stage !== "lost")
      .reduce((sum, d) => sum + (d.value || 0), 0);

    const wonValue = deals
      .filter((d) => d.stage === "won")
      .reduce((sum, d) => sum + (d.value || 0), 0);

    const stageBreakdown: Record<string, { count: number; totalValue: number }> = {};
    for (const d of deals) {
      const stage = d.stage || "open";
      if (!stageBreakdown[stage]) {
        stageBreakdown[stage] = { count: 0, totalValue: 0 };
      }
      stageBreakdown[stage].count += 1;
      stageBreakdown[stage].totalValue += d.value || 0;
    }

    // Weighted forecast (sum of deal value * probability)
    const weightedForecast = Math.round(
      deals
        .filter((d) => d.stage !== "lost" && d.stage !== "won")
        .reduce((sum, d) => sum + (d.value || 0) * ((d.probability || 50) / 100), 0) + wonValue
    );

    return {
      toolName: "calculate_pipeline_metrics",
      success: true,
      data: {
        totalDeals: deals.length,
        activeDealsCount: deals.filter((d) => d.stage !== "won" && d.stage !== "lost").length,
        totalPipelineValue,
        wonValue,
        weightedForecast,
        stageBreakdown,
      },
      recordReferences: deals.map((d) => ({ id: d.id, type: "deal", name: d.title })),
    };
  }

  // 4. Find Closing & Stalled Deals
  findClosingDeals(daysAhead: number = 30): CRMToolResult {
    const today = new Date();
    const thresholdDate = new Date(Date.now() + daysAhead * 86400000);

    const activeDeals = this.data.deals.filter((d) => d.stage !== "won" && d.stage !== "lost");

    // Close to closing date
    const closingSoon = activeDeals.filter((d) => {
      if (!d.expectedCloseDate) return false;
      const cd = new Date(d.expectedCloseDate);
      return cd >= today && cd <= thresholdDate;
    });

    // Stalled deals: Proposal or Negotiation with no next step
    const stalled = activeDeals.filter(
      (d) =>
        (d.stage.toLowerCase() === "proposal" || d.stage.toLowerCase() === "negotiation") &&
        (!d.nextFollowUp || d.nextFollowUp.trim() === "")
    );

    return {
      toolName: "find_closing_deals",
      success: true,
      data: {
        closingSoon: closingSoon.map((d) => ({
          id: d.id,
          title: d.title,
          value: d.value,
          stage: d.stage,
          expectedCloseDate: d.expectedCloseDate,
          owner: d.owner,
        })),
        stalled: stalled.map((d) => ({
          id: d.id,
          title: d.title,
          value: d.value,
          stage: d.stage,
          owner: d.owner,
        })),
      },
      recordReferences: [...closingSoon, ...stalled].map((d) => ({
        id: d.id,
        type: "deal",
        name: d.title,
      })),
    };
  }

  // 5. Campaign Performance & Quality
  getCampaignPerformance(): CRMToolResult {
    const campaigns = this.data.campaigns;
    const metrics = this.data.dailyMetrics;

    const campaignStats = campaigns.map((c) => {
      const cMetrics = metrics.filter((m) => m.campaignId === c.id);
      const totalSpend = cMetrics.reduce((sum, m) => sum + (m.spend || 0), 0) || c.plannedBudget || 0;
      const crmLeads = this.data.leads.filter((l) => l.campaignId === c.id || l.source?.toLowerCase().includes(c.platform.toLowerCase())).length;
      const qualifiedLeads = this.data.leads.filter(
        (l) => (l.campaignId === c.id || l.source?.toLowerCase().includes(c.platform.toLowerCase())) && l.score >= 70
      ).length;

      const cpql = qualifiedLeads > 0 ? Math.round(totalSpend / qualifiedLeads) : 0;
      const cpl = crmLeads > 0 ? Math.round(totalSpend / crmLeads) : 0;

      return {
        id: c.id,
        name: c.name,
        platform: c.platform,
        status: c.status,
        totalSpend,
        budget: c.plannedBudget,
        crmLeads,
        qualifiedLeads,
        cpl,
        cpql,
      };
    });

    // Best campaign by qualified leads
    const sorted = [...campaignStats].sort((a, b) => b.qualifiedLeads - a.qualifiedLeads);

    return {
      toolName: "get_campaign_performance",
      success: true,
      data: {
        campaigns: sorted,
        topCampaign: sorted[0] || null,
      },
      recordReferences: campaigns.map((c) => ({ id: c.id, type: "campaign", name: c.name })),
    };
  }

  // 6. Pending Tasks
  getPendingTasks(params?: { overdueOnly?: boolean; priority?: string }): CRMToolResult {
    const todayStr = new Date().toISOString().split("T")[0];
    let tasks = this.data.tasks.filter((t) => t.status !== "completed");

    if (params?.overdueOnly) {
      tasks = tasks.filter((t) => t.dueDate < todayStr);
    }
    if (params?.priority) {
      tasks = tasks.filter((t) => t.priority.toLowerCase() === params.priority?.toLowerCase());
    }

    // Sort by dueDate ascending
    tasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    return {
      toolName: "get_pending_tasks",
      success: true,
      data: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate,
        priority: t.priority,
        isOverdue: t.dueDate < todayStr,
        entityName: t.entityName,
        assignedTo: t.assignedTo,
      })),
      recordReferences: tasks.map((t) => ({ id: t.id, type: "task", name: t.title })),
    };
  }

  // 7. Upcoming Meetings
  getUpcomingMeetings(params?: { todayOnly?: boolean }): CRMToolResult {
    const todayStr = new Date().toISOString().split("T")[0];
    let meetings = this.data.meetings.filter((m) => m.status !== "cancelled");

    if (params?.todayOnly) {
      meetings = meetings.filter((m) => m.date === todayStr);
    } else {
      meetings = meetings.filter((m) => m.date >= todayStr);
    }

    meetings.sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));

    return {
      toolName: "get_upcoming_meetings",
      success: true,
      data: meetings.map((m) => ({
        id: m.id,
        title: m.title,
        date: m.date,
        startTime: m.startTime,
        endTime: m.endTime,
        attendees: m.participants?.map((p) => p.name).join(", "),
        prepNotes: m.prepNotes,
      })),
      recordReferences: meetings.map((m) => ({ id: m.id, type: "meeting", name: m.title })),
    };
  }

  // 8. Workflow Automation Health
  getWorkflowHealth(): CRMToolResult {
    const workflows = this.data.workflows;
    const executions = this.data.executions;

    const failedExecutions = executions.filter((e) => e.status === "failure");
    const activeCount = workflows.filter((w) => w.status === "active").length;

    return {
      toolName: "get_workflow_health",
      success: true,
      data: {
        totalWorkflows: workflows.length,
        activeWorkflows: activeCount,
        totalExecutions: executions.length,
        failedExecutionsCount: failedExecutions.length,
        failedExecutions: failedExecutions.slice(0, 5).map((e) => ({
          id: e.id,
          workflowName: e.workflowName,
          startedAt: e.startedAt,
          errorMessage: e.errorMessage,
        })),
      },
      recordReferences: workflows.map((w) => ({ id: w.id, type: "workflow", name: w.name })),
    };
  }
}
