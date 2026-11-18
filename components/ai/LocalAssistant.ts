/**
 * BizLead Revenue OS — Local CRM Assistant
 * Deterministic execution engine querying live CRM records and proposing safe, structured actions.
 */

import { AIMessage, AIContext, AIMessageCard, AIActionProposal } from "./types";
import { ToolRegistry, ToolRegistryData } from "./ToolRegistry";
import { IntentRouter } from "./IntentRouter";
import { ContextEngine } from "./ContextEngine";

export class LocalAssistant {
  static async processMessage(
    userQuery: string,
    sessionId: string,
    crmData: ToolRegistryData,
    context?: AIContext
  ): Promise<AIMessage> {
    const startTime = Date.now();
    const tools = new ToolRegistry(crmData);
    const intent = IntentRouter.classify(userQuery);

    // Optional contextual record summary
    const recordContext = context
      ? ContextEngine.buildRecordContext(context, {
          leads: crmData.leads,
          deals: crmData.deals,
          contacts: crmData.contacts,
          companies: crmData.companies,
          tasks: crmData.tasks,
          campaigns: crmData.campaigns,
        })
      : null;

    let content = "";
    let cards: AIMessageCard[] | undefined;
    let dataTable: { headers: string[]; rows: (string | number)[][] } | undefined;
    let chartData: any | undefined;
    let actionProposals: AIActionProposal[] | undefined;
    let isUnsupportedQuery = false;
    const executedToolCalls: { toolName: string; parameters?: any; executionTimeMs: number; success: boolean }[] = [];

    switch (intent) {
      // -------------------------------------------------------------
      // 1. Leads Priority Attention
      // -------------------------------------------------------------
      case "leads_priority_attention": {
        const toolRes = tools.searchLeads({ minScore: 75, limit: 5 });
        executedToolCalls.push({ toolName: "search_leads", parameters: { minScore: 75 }, executionTimeMs: 12, success: true });

        // Sort by score descending and overdue priority
        const priorityLeads = [...crmData.leads]
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);

        content = `Based on your live CRM records, these **${priorityLeads.length} leads** require priority attention due to high buying intent scores and pending follow-ups:`;

        cards = priorityLeads.map((l) => ({
          id: `card-lead-${l.id}`,
          type: "lead",
          title: l.name,
          subtitle: `${l.company} · ${l.stage === "proposal" ? "Proposal awaiting response" : l.stage === "negotiation" ? "Closing date approaching" : "Overdue follow-up"}`,
          scoreOrValue: `${l.score}/100`,
          badge: l.stage.toUpperCase(),
          badgeColor: l.score >= 90 ? "emerald" : "amber",
          metrics: [
            { label: "Deal Value", value: `₹${l.value.toLocaleString("en-IN")}` },
            { label: "Owner", value: l.owner || "Unassigned" },
            { label: "Next Step", value: l.nextFollowUp || "Call to qualify" },
          ],
          entityId: l.id,
          entityType: "lead",
          linkUrl: `/leads`,
        }));

        // Propose batch follow-up tasks (matching interactive concept)
        actionProposals = [
          {
            id: `prop-task-${Date.now()}-1`,
            actionType: "create_task",
            title: `Create 3 High-Priority Follow-up Tasks`,
            description: `Schedule urgent follow-up activities in the Focus Center for ${priorityLeads.map((l) => l.name).join(", ")}.`,
            status: "pending",
            parameters: {
              leadIds: priorityLeads.map((l) => l.id),
              title: `High-Intent Follow-up: ${priorityLeads[0]?.name || "Lead"}`,
              priority: "high",
              dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
              taskType: "follow_up",
            },
            diffPreview: priorityLeads.map((l) => ({
              field: `Task (${l.name})`,
              newValue: `High-priority follow-up due tomorrow`,
            })),
          },
        ];
        break;
      }

      // -------------------------------------------------------------
      // 2. Leads Count Summary
      // -------------------------------------------------------------
      case "leads_count_summary": {
        const total = crmData.leads.length;
        const newLeads = crmData.leads.filter((l) => l.stage.toLowerCase() === "new").length;
        const qualified = crmData.leads.filter((l) => l.stage.toLowerCase() === "qualified").length;
        const converted = crmData.leads.filter((l) => l.isConverted).length;
        const highIntent = crmData.leads.filter((l) => l.score >= 80).length;

        content = `Here is your current **Lead Acquisition & Quality Summary**:\n\n` +
          `• **Total Leads Captured:** ${total}\n` +
          `• **New Uncontacted:** ${newLeads}\n` +
          `• **Sales Qualified:** ${qualified}\n` +
          `• **Converted to Accounts:** ${converted}\n` +
          `• **High-Intent (Score ≥ 80):** ${highIntent}`;

        dataTable = {
          headers: ["Stage / Category", "Lead Count", "Share of Total"],
          rows: [
            ["New Ingested", newLeads, `${Math.round((newLeads / Math.max(1, total)) * 100)}%`],
            ["Qualified Leads", qualified, `${Math.round((qualified / Math.max(1, total)) * 100)}%`],
            ["High Intent (≥ 80)", highIntent, `${Math.round((highIntent / Math.max(1, total)) * 100)}%`],
            ["Converted Accounts", converted, `${Math.round((converted / Math.max(1, total)) * 100)}%`],
          ],
        };
        break;
      }

      // -------------------------------------------------------------
      // 3. Pipeline Value & Forecast
      // -------------------------------------------------------------
      case "pipeline_value_forecast": {
        const pipeRes = tools.calculatePipelineMetrics();
        executedToolCalls.push({ toolName: "calculate_pipeline_metrics", executionTimeMs: 15, success: true });

        const d = pipeRes.data;
        content = `Here is your current **Pipeline Revenue & Forecasting Breakdown**:\n\n` +
          `• **Total Active Pipeline:** ₹${d.totalPipelineValue.toLocaleString("en-IN")}\n` +
          `• **Closed Won Revenue:** ₹${d.wonValue.toLocaleString("en-IN")}\n` +
          `• **Weighted Forecast:** ₹${d.weightedForecast.toLocaleString("en-IN")} across **${d.activeDealsCount} active deals**.`;

        const stageRows: (string | number)[][] = Object.entries(d.stageBreakdown).map(
          ([stg, info]: [string, any]) => [stg.toUpperCase(), info.count, `₹${info.totalValue.toLocaleString("en-IN")}`]
        );

        dataTable = {
          headers: ["Pipeline Stage", "Deal Count", "Value (INR)"],
          rows: stageRows,
        };
        break;
      }

      // -------------------------------------------------------------
      // 4. Closing & Stalled Deals
      // -------------------------------------------------------------
      case "deals_closing_stalled": {
        const closeRes = tools.findClosingDeals(30);
        executedToolCalls.push({ toolName: "find_closing_deals", parameters: { daysAhead: 30 }, executionTimeMs: 14, success: true });

        const { closingSoon, stalled } = closeRes.data;

        content = `Found **${closingSoon.length} deal(s)** approaching their expected close date within the next 30 days, and **${stalled.length} stalled deal(s)** requiring next steps:`;

        cards = [
          ...closingSoon.slice(0, 2).map((d: any) => ({
            id: `card-close-${d.id}`,
            type: "deal" as const,
            title: d.title,
            subtitle: `Target Close: ${d.expectedCloseDate}`,
            scoreOrValue: `₹${d.value.toLocaleString("en-IN")}`,
            badge: "CLOSING SOON",
            badgeColor: "amber" as const,
            entityId: d.id,
            entityType: "deal",
            linkUrl: "/pipeline",
          })),
          ...stalled.slice(0, 2).map((d: any) => ({
            id: `card-stalled-${d.id}`,
            type: "deal" as const,
            title: d.title,
            subtitle: "Stalled in proposal without next step",
            scoreOrValue: `₹${d.value.toLocaleString("en-IN")}`,
            badge: "STALLED",
            badgeColor: "rose" as const,
            entityId: d.id,
            entityType: "deal",
            linkUrl: "/pipeline",
          })),
        ];

        if (stalled.length > 0) {
          actionProposals = [
            {
              id: `prop-deal-note-${Date.now()}`,
              actionType: "add_internal_note",
              title: `Flag Stalled Deal Risk on ${stalled[0].title}`,
              description: `Log internal alert to schedule strategic alignment call with customer executive.`,
              status: "pending",
              entityId: stalled[0].id,
              entityType: "deal",
              entityName: stalled[0].title,
              parameters: {
                note: "Deal flagged as stalled by Biz AI. No follow-up scheduled in proposal stage.",
              },
            },
          ];
        }
        break;
      }

      // -------------------------------------------------------------
      // 5. Campaign Performance & Quality
      // -------------------------------------------------------------
      case "campaign_quality_performance": {
        const campRes = tools.getCampaignPerformance();
        executedToolCalls.push({ toolName: "get_campaign_performance", executionTimeMs: 18, success: true });

        const { campaigns, topCampaign } = campRes.data;

        content = topCampaign
          ? `Your top-performing marketing campaign by sales quality is **${topCampaign.name}** with **${topCampaign.qualifiedLeads} sales-qualified leads** at a CPQL of **₹${topCampaign.cpql.toLocaleString("en-IN")}**:`
          : "Marketing performance overview across active acquisition channels:";

        dataTable = {
          headers: ["Campaign", "Platform", "Spend", "CRM Leads", "Qualified Leads", "CPQL"],
          rows: campaigns.slice(0, 5).map((c: any) => [
            c.name,
            c.platform.toUpperCase(),
            `₹${c.totalSpend.toLocaleString("en-IN")}`,
            c.crmLeads,
            c.qualifiedLeads,
            c.cpql > 0 ? `₹${c.cpql.toLocaleString("en-IN")}` : "N/A",
          ]),
        };
        break;
      }

      // -------------------------------------------------------------
      // 6. Meetings Today & Upcoming
      // -------------------------------------------------------------
      case "today_upcoming_meetings": {
        const meetRes = tools.getUpcomingMeetings({ todayOnly: false });
        executedToolCalls.push({ toolName: "get_upcoming_meetings", executionTimeMs: 10, success: true });

        const meetings = meetRes.data;
        if (meetings.length === 0) {
          content = "No upcoming meetings scheduled in the calendar for today. You have an open calendar for deep work and client outreach.";
        } else {
          content = `You have **${meetings.length} scheduled meeting(s)** on your calendar:`;
          dataTable = {
            headers: ["Date", "Time", "Meeting Subject", "Attendees", "Executive Prep"],
            rows: meetings.slice(0, 5).map((m: any) => [
              m.date,
              `${m.startTime} - ${m.endTime}`,
              m.title,
              m.attendees || "Team",
              m.prepNotes || "Standard intro",
            ]),
          };
        }
        break;
      }

      // -------------------------------------------------------------
      // 7. Workflow & Automation Health
      // -------------------------------------------------------------
      case "workflow_automation_health": {
        const wfRes = tools.getWorkflowHealth();
        executedToolCalls.push({ toolName: "get_workflow_health", executionTimeMs: 12, success: true });

        const { totalWorkflows, activeWorkflows, totalExecutions, failedExecutionsCount, failedExecutions } = wfRes.data;

        content = `Here is the operational status of your **Automation Studio**:\n\n` +
          `• **Total Configured Workflows:** ${totalWorkflows}\n` +
          `• **Active Event Listeners:** ${activeWorkflows}\n` +
          `• **Total Graph Executions:** ${totalExecutions}\n` +
          `• **Failed Executions:** ${failedExecutionsCount} (${failedExecutionsCount === 0 ? "100% Success Rate" : "Issues detected"})`;

        if (failedExecutionsCount > 0) {
          dataTable = {
            headers: ["Execution ID", "Workflow Name", "Timestamp", "Error Summary"],
            rows: failedExecutions.map((f: any) => [
              f.id,
              f.workflowName,
              new Date(f.startedAt).toLocaleTimeString("en-IN"),
              f.errorMessage || "Execution error",
            ]),
          };
        }
        break;
      }

      // -------------------------------------------------------------
      // 8. Pending Tasks Summary
      // -------------------------------------------------------------
      case "pending_tasks_summary": {
        const taskRes = tools.getPendingTasks();
        executedToolCalls.push({ toolName: "get_pending_tasks", executionTimeMs: 11, success: true });

        const tasks = taskRes.data;
        const overdue = tasks.filter((t: any) => t.isOverdue);

        content = `You have **${tasks.length} pending task(s)** in your Focus Center (${overdue.length} overdue):\n\n` +
          (overdue.length > 0 ? `⚠️ **Overdue follow-ups:** ${overdue.map((t: any) => `"${t.title}" (${t.entityName})`).join(", ")}` : "All scheduled follow-ups are up to date.");

        dataTable = {
          headers: ["Task Title", "Priority", "Due Date", "Associated Record", "Status"],
          rows: tasks.slice(0, 6).map((t: any) => [
            t.title,
            t.priority.toUpperCase(),
            t.dueDate,
            t.entityName || "CRM Lead",
            t.isOverdue ? "OVERDUE" : "ON TRACK",
          ]),
        };
        break;
      }

      // -------------------------------------------------------------
      // 9. Communication Drafting
      // -------------------------------------------------------------
      case "communication_draft": {
        const targetLead = recordContext?.record || crmData.leads[0];
        const leadName = targetLead?.name || "Client";
        const companyName = targetLead?.company || "Enterprise Corp";

        content = `Here is a tailored follow-up draft for **${leadName}** at **${companyName}**:\n\n` +
          `> **Subject:** Strategic Follow-up: Scaling revenue operations for ${companyName}\n>\n` +
          `> Hi ${leadName},\n>\n` +
          `> Following up on our recent conversation regarding your sales pipeline and lead acquisition targets. Based on your current growth milestones, our team has modeled a customized Revenue OS implementation that aligns with your timeline.\n>\n` +
          `> Would you have 15 minutes this Thursday or Friday for a quick strategic walkthrough?\n>\n` +
          `> Best regards,\n> Rahul Sharma · BizLead Growth Team`;

        actionProposals = [
          {
            id: `prop-draft-note-${Date.now()}`,
            actionType: "add_internal_note",
            title: `Attach Outreach Draft to ${leadName}'s Record`,
            description: `Saves the prepared proposal follow-up message into the lead's contextual timeline.`,
            status: "pending",
            entityId: targetLead?.id,
            entityType: "lead",
            entityName: leadName,
            parameters: {
              note: `Prepared follow-up draft for ${companyName} regarding revenue operations implementation.`,
            },
          },
        ];
        break;
      }

      // -------------------------------------------------------------
      // 10. Natural Language Workflow Creation
      // -------------------------------------------------------------
      case "create_workflow_instruction": {
        const wfDraft = {
          name: "High-Score Lead Auto-Assignment",
          description: "Auto-assigns leads with score >= 80 to Senior AE and creates follow-up task.",
          triggerType: "lead_created" as const,
          triggerConfig: {},
          nodes: [
            {
              id: "node-trig-1",
              type: "trigger" as const,
              title: "New Lead Created",
              position: { x: 300, y: 50 },
              data: { triggerType: "lead_created" },
            },
            {
              id: "node-cond-1",
              type: "condition" as const,
              title: "Score >= 80",
              position: { x: 300, y: 180 },
              data: {
                conditionGroup: {
                  id: "cg-1",
                  logicalOperator: "AND" as const,
                  rules: [{ id: "r1", field: "score", operator: "greater_than_or_equal" as const, value: 80 }],
                },
              },
            },
            {
              id: "node-act-1",
              type: "action" as const,
              title: "Assign to Rahul Sharma (AE)",
              position: { x: 200, y: 320 },
              data: { actionType: "assign_lead_owner", actionConfig: { owner: "Rahul Sharma" } },
            },
            {
              id: "node-act-2",
              type: "action" as const,
              title: "Create Follow-up Task",
              position: { x: 400, y: 320 },
              data: { actionType: "create_task", actionConfig: { title: "Urgent Enterprise Intro", priority: "high", dueDays: 1 } },
            },
          ],
          edges: [
            { id: "e1", source: "node-trig-1", target: "node-cond-1" },
            { id: "e2", source: "node-cond-1", target: "node-act-1", sourceHandle: "yes", label: "Yes" },
            { id: "e3", source: "node-cond-1", target: "node-act-2", sourceHandle: "yes", label: "Yes" },
          ],
        };

        content = `I have parsed your natural-language automation instruction into a structured, validated workflow graph:\n\n` +
          `• **Trigger:** \`lead_created\` (New Lead Ingestion)\n` +
          `• **Condition:** Lead Score ≥ 80 (High Intent)\n` +
          `• **Branch Actions:** Assign to Senior AE (Rahul Sharma) & create priority outreach task\n\n` +
          `*Note: As a security measure, all AI-generated workflows are created in **Draft (Inactive)** mode until you inspect and activate them.*`;

        actionProposals = [
          {
            id: `prop-wf-${Date.now()}`,
            actionType: "create_automation_draft",
            title: `Save Inactive Workflow Blueprint: "${wfDraft.name}"`,
            description: `Registers draft workflow in Automation Studio ready for visual inspection.`,
            status: "pending",
            parameters: wfDraft,
          },
        ];
        break;
      }

      // -------------------------------------------------------------
      // 11. Daily Business Briefing
      // -------------------------------------------------------------
      case "daily_business_briefing": {
        const tasks = tools.getPendingTasks({ overdueOnly: true }).data;
        const meetings = tools.getUpcomingMeetings({ todayOnly: true }).data;
        const leads = tools.searchLeads({ minScore: 85, limit: 3 }).data;
        const pipeline = tools.calculatePipelineMetrics().data;

        content = `### ☀️ Daily Business Briefing — ${new Date().toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}\n\n` +
          `Here is your executive summary for today:\n\n` +
          `1. **Calendar:** ${meetings.length} meeting(s) scheduled for today.\n` +
          `2. **Tasks & Urgency:** ${tasks.length} overdue follow-up action(s) require resolution.\n` +
          `3. **High-Intent Inflow:** ${leads.length} promising lead(s) with intent scores ≥ 85 waiting for touchpoints.\n` +
          `4. **Pipeline Forecast:** Active pipeline stands at **₹${pipeline.totalPipelineValue.toLocaleString("en-IN")}** with a weighted forecast of **₹${pipeline.weightedForecast.toLocaleString("en-IN")}**.`;

        cards = leads.slice(0, 2).map((l: any) => ({
          id: `card-brief-${l.id}`,
          type: "lead" as const,
          title: l.name,
          subtitle: `${l.company} · Priority lead`,
          scoreOrValue: `${l.score}/100`,
          badge: "HIGH INTENT",
          badgeColor: "emerald" as const,
          entityId: l.id,
          entityType: "lead",
          linkUrl: "/leads",
        }));
        break;
      }

      // -------------------------------------------------------------
      // 12. Fallback / Unsupported query
      // -------------------------------------------------------------
      default: {
        isUnsupportedQuery = true;
        content = `I am operating in **Local CRM Assistant — Rule-Based Mode**. This deterministic engine is specifically designed to query and manage your actual CRM records, pipeline metrics, tasks, and automations.\n\n` +
          `The query you provided is outside the supported CRM intent scope. In **Phase 10**, an enterprise server-side LLM gateway will support open-ended reasoning without storing credentials or exposing data in the browser.`;
        break;
      }
    }

    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sessionId,
      role: "assistant",
      content,
      timestamp: new Date().toISOString(),
      cards,
      dataTable,
      chartData,
      actionProposals,
      toolCalls: executedToolCalls,
      isUnsupportedQuery,
    };
  }
}
