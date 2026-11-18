/**
 * BizLead Revenue OS — Intent Router
 * Deterministic query classifier for the Local CRM Assistant.
 */

export type IntentType =
  | "leads_priority_attention"
  | "leads_count_summary"
  | "pipeline_value_forecast"
  | "deals_closing_stalled"
  | "campaign_quality_performance"
  | "today_upcoming_meetings"
  | "pending_tasks_summary"
  | "workflow_automation_health"
  | "communication_draft"
  | "create_workflow_instruction"
  | "daily_business_briefing"
  | "unsupported_general_query";

export class IntentRouter {
  static classify(query: string): IntentType {
    const q = query.toLowerCase().trim();

    // 1. Leads Priority Attention
    if (
      (q.includes("lead") && (q.includes("attention") || q.includes("priority") || q.includes("follow-up") || q.includes("follow up") || q.includes("immediate"))) ||
      q.includes("promising leads") ||
      q.includes("high intent") ||
      q.includes("which leads need")
    ) {
      return "leads_priority_attention";
    }

    // 2. Leads Count Summary
    if (
      (q.includes("how many lead") || q.includes("lead count") || q.includes("leads received") || q.includes("leads this month")) ||
      (q.includes("leads") && (q.includes("total") || q.includes("overview") || q.includes("summary")))
    ) {
      return "leads_count_summary";
    }

    // 3. Pipeline Value & Forecast
    if (
      q.includes("pipeline") ||
      q.includes("pipeline value") ||
      q.includes("revenue forecast") ||
      q.includes("weighted forecast") ||
      q.includes("total deal value")
    ) {
      return "pipeline_value_forecast";
    }

    // 4. Closing & Stalled Deals
    if (
      (q.includes("deal") && (q.includes("close") || q.includes("closing") || q.includes("stalled") || q.includes("risk"))) ||
      q.includes("closing date") ||
      q.includes("stalled opportunities")
    ) {
      return "deals_closing_stalled";
    }

    // 5. Campaign Performance & Quality
    if (
      q.includes("campaign") ||
      q.includes("marketing") ||
      q.includes("cpl") ||
      q.includes("cpql") ||
      q.includes("ad spend") ||
      q.includes("most qualified leads")
    ) {
      return "campaign_quality_performance";
    }

    // 6. Meetings Today & Upcoming
    if (
      q.includes("meeting") ||
      q.includes("call scheduled") ||
      q.includes("today's schedule") ||
      q.includes("schedule today")
    ) {
      return "today_upcoming_meetings";
    }

    // 7. Workflow & Automation Health
    if (
      q.includes("workflow") ||
      q.includes("automation") ||
      q.includes("failed execution") ||
      q.includes("failed workflow") ||
      q.includes("automations health")
    ) {
      if (q.includes("create") || q.includes("when ") || q.includes("build") || q.includes("draft")) {
        return "create_workflow_instruction";
      }
      return "workflow_automation_health";
    }

    // 8. Pending Tasks
    if (
      q.includes("task") ||
      q.includes("to-do") ||
      q.includes("pending action") ||
      q.includes("overdue")
    ) {
      return "pending_tasks_summary";
    }

    // 9. Communication Drafting
    if (
      q.includes("draft") ||
      q.includes("reply to") ||
      q.includes("write an email") ||
      q.includes("draft message") ||
      q.includes("follow-up message")
    ) {
      return "communication_draft";
    }

    // 10. Natural Language Workflow Creation
    if (
      q.startsWith("when ") ||
      (q.includes("when a new lead") || q.includes("assign to") || q.includes("create automation"))
    ) {
      return "create_workflow_instruction";
    }

    // 11. Daily Business Briefing
    if (
      q.includes("daily brief") ||
      q.includes("morning brief") ||
      q.includes("focus today") ||
      q.includes("what should i focus on") ||
      q.includes("business briefing")
    ) {
      return "daily_business_briefing";
    }

    // 12. Fallback / Unsupported query
    return "unsupported_general_query";
  }
}
