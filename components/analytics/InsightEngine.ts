/**
 * BizLead Revenue OS — Deterministic Marketing Insight Engine
 * Generates actionable, rule-based recommendations for marketing and sales optimization.
 */

import {
  MarketingCampaign,
  CampaignDailyMetric,
  Lead,
  Deal,
} from "../crm/types";
import { calculateCPQL, calculateQualificationRate } from "./metricCalculators";

export interface MarketingInsight {
  id: string;
  ruleId: string;
  title: string;
  severity: "critical" | "warning" | "opportunity" | "info";
  reason: string;
  campaignId?: string;
  campaignName?: string;
  sourceMetrics: string;
  recommendedAction: string;
  confidenceWarning?: string;
}

export function generateMarketingInsights(
  campaigns: MarketingCampaign[],
  dailyMetrics: CampaignDailyMetric[],
  leads: Lead[],
  deals: Deal[]
): MarketingInsight[] {
  const insights: MarketingInsight[] = [];

  // Group metrics by campaign
  const spendByCampaign: Record<string, number> = {};
  for (const m of dailyMetrics) {
    spendByCampaign[m.campaignId] = (spendByCampaign[m.campaignId] || 0) + m.spend;
  }

  // Group leads by campaign
  const leadsByCampaign: Record<string, Lead[]> = {};
  for (const l of leads) {
    if (l.campaignId) {
      if (!leadsByCampaign[l.campaignId]) leadsByCampaign[l.campaignId] = [];
      leadsByCampaign[l.campaignId].push(l);
    }
  }

  // Rule 1: High Spend but Zero Qualified Leads (Critical Leakage)
  for (const camp of campaigns) {
    if (camp.status !== "active" && camp.status !== "completed") continue;
    const spend = spendByCampaign[camp.id] || 0;
    const campLeads = leadsByCampaign[camp.id] || [];
    const qualifiedCount = campLeads.filter(
      (l) => l.status === "qualified" || l.status === "contacted"
    ).length;

    if (spend >= 10000 && qualifiedCount === 0) {
      insights.push({
        id: `ins_leak_${camp.id}`,
        ruleId: "high_spend_zero_qualified",
        title: "Zero Qualified Leads on High Spend Campaign",
        severity: "critical",
        reason: `Campaign "${camp.name}" has spent ₹${spend.toLocaleString("en-IN")} but produced 0 qualified leads across ${campLeads.length} total captured leads.`,
        campaignId: camp.id,
        campaignName: camp.name,
        sourceMetrics: `Spend: ₹${spend.toLocaleString("en-IN")} · Qualified: 0`,
        recommendedAction: "Review targeting criteria, negative keywords, and landing page form qualification questions immediately.",
        confidenceWarning: "Based on local CRM lead status classifications.",
      });
    }
  }

  // Rule 2: High Lead Volume with Low Qualification Rate (Quality Warning)
  for (const camp of campaigns) {
    const campLeads = leadsByCampaign[camp.id] || [];
    if (campLeads.length >= 15) {
      const qualified = campLeads.filter((l) => l.status === "qualified").length;
      const qRate = calculateQualificationRate(qualified, campLeads.length) || 0;

      if (qRate < 20) {
        insights.push({
          id: `ins_low_qual_${camp.id}`,
          ruleId: "low_qualification_rate",
          title: "Low Lead Qualification Rate Alert",
          severity: "warning",
          reason: `Campaign "${camp.name}" has generated ${campLeads.length} leads but only ${qRate}% are qualified. High volume of unqualified leads is creating sales overhead.`,
          campaignId: camp.id,
          campaignName: camp.name,
          sourceMetrics: `Total Leads: ${campLeads.length} · Qualification Rate: ${qRate}%`,
          recommendedAction: "Add qualification friction (e.g. required company size or budget range field) to the lead generation form.",
        });
      }
    }
  }

  // Rule 3: Budget Utilization Overspend Warning
  for (const camp of campaigns) {
    if (camp.plannedBudget > 0) {
      const spend = spendByCampaign[camp.id] || 0;
      const utilPercent = (spend / camp.plannedBudget) * 100;

      if (utilPercent >= 95) {
        insights.push({
          id: `ins_budget_${camp.id}`,
          ruleId: "budget_limit_reached",
          title: "Planned Budget Nearing Exhaustion",
          severity: utilPercent >= 100 ? "critical" : "warning",
          reason: `Campaign "${camp.name}" has consumed ${utilPercent.toFixed(1)}% (₹${spend.toLocaleString("en-IN")}) of its planned ₹${camp.plannedBudget.toLocaleString("en-IN")} budget.`,
          campaignId: camp.id,
          campaignName: camp.name,
          sourceMetrics: `Spend: ₹${spend.toLocaleString("en-IN")} / ₹${camp.plannedBudget.toLocaleString("en-IN")}`,
          recommendedAction: utilPercent >= 100
            ? "Evaluate ROAS to decide whether to pause the campaign or increase planned allocation."
            : "Review daily pacing to avoid exceeding the monthly budget ceiling.",
        });
      }
    }
  }

  // Rule 4: High-Performing Hidden Gem (Scale Opportunity)
  for (const camp of campaigns) {
    const campLeads = leadsByCampaign[camp.id] || [];
    if (campLeads.length >= 5 && campLeads.length <= 25) {
      const qualified = campLeads.filter((l) => l.status === "qualified").length;
      const qRate = calculateQualificationRate(qualified, campLeads.length) || 0;

      if (qRate >= 40) {
        insights.push({
          id: `ins_gem_${camp.id}`,
          ruleId: "high_quality_scale_opportunity",
          title: "High-Quality Campaign Ready to Scale",
          severity: "opportunity",
          reason: `Campaign "${camp.name}" demonstrates a standout qualification rate of ${qRate}% with low total volume (${campLeads.length} leads).`,
          campaignId: camp.id,
          campaignName: camp.name,
          sourceMetrics: `Qualification Rate: ${qRate}% · Total Leads: ${campLeads.length}`,
          recommendedAction: "Consider increasing ad spend by 20–30% to capture higher market share while monitoring CPL.",
        });
      }
    }
  }

  // Rule 5: Unattributed Recent Leads Detection
  const unattributedLeads = leads.filter(
    (l) => !l.campaignId && (!l.source || l.source.toLowerCase() === "unknown")
  );
  if (unattributedLeads.length >= 3) {
    insights.push({
      id: "ins_unattributed_leads",
      ruleId: "missing_campaign_attribution",
      title: "Unattributed Inbound Leads Detected",
      severity: "warning",
      reason: `${unattributedLeads.length} leads in the CRM currently have no marketing source or campaign attribution attached.`,
      sourceMetrics: `Unattributed Leads: ${unattributedLeads.length}`,
      recommendedAction: "Audit landing page UTM parameters and lead capture forms to prevent attribution gaps.",
    });
  }

  return insights;
}
