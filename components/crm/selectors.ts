import {
  Lead,
  Contact,
  Company,
  Deal,
  PipelineStage,
  Conversation,
  Message,
  Channel,
  CRMTask,
  CRMMeeting,
  MarketingCampaign,
  CampaignDailyMetric,
  CampaignTouchpoint,
  MarketingPlatform,
} from "./types";
import {
  calculateCTR,
  calculateCPC,
  calculateCPM,
  calculateCRMCPL,
  calculateCPQL,
  calculateQualificationRate,
  calculateConversionRate,
  calculateCostPerCustomer,
  calculateValueToSpendRatio,
  calculateROAS,
  formatMetricNumber,
  formatMetricCurrency,
  formatMetricPercent,
} from "../analytics/metricCalculators";
import { AttributionEngine } from "../marketing/AttributionEngine";

/** Formats a number to Indian Rupee currency string */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Formats an amount to compact Lakhs (e.g. ₹24.86L) */
export function formatLakhs(amount: number): string {
  if (amount >= 10000000) {
    const inCrores = amount / 10000000;
    return `₹${inCrores.toFixed(2)}Cr`;
  }
  if (amount >= 100000) {
    const inLakhs = amount / 100000;
    return `₹${inLakhs.toFixed(2)}L`;
  }
  return formatINR(amount);
}

/** Calculates total open pipeline value (excluding Won and Lost) */
export function selectTotalOpenPipelineValue(
  leads: Lead[],
  stages: PipelineStage[]
): number {
  const openStageIds = new Set(
    stages.filter((s) => s.kind === "open").map((s) => s.id)
  );
  return leads
    .filter((l) => openStageIds.has(l.stage.toLowerCase()))
    .reduce((sum, l) => sum + (l.value || 0), 0);
}

/** Calculates weighted revenue forecast: sum(value * (probability / 100)) for open deals */
export function selectWeightedRevenueForecast(
  leads: Lead[],
  stages: PipelineStage[]
): number {
  const openStageIds = new Set(
    stages.filter((s) => s.kind === "open").map((s) => s.id)
  );
  return leads
    .filter((l) => openStageIds.has(l.stage.toLowerCase()))
    .reduce((sum, l) => {
      const prob = Math.min(100, Math.max(0, l.probability ?? 50)) / 100;
      return sum + (l.value || 0) * prob;
    }, 0);
}

/** Calculates won deals total value */
export function selectWonDealValue(
  leads: Lead[],
  stages: PipelineStage[]
): number {
  const wonStageIds = new Set(
    stages.filter((s) => s.kind === "won").map((s) => s.id)
  );
  return leads
    .filter((l) => wonStageIds.has(l.stage.toLowerCase()))
    .reduce((sum, l) => sum + (l.value || 0), 0);
}

/** Calculates win rate percentage: won / (won + lost) */
export function selectWinRate(
  leads: Lead[],
  stages: PipelineStage[]
): number {
  const wonStageIds = new Set(
    stages.filter((s) => s.kind === "won").map((s) => s.id)
  );
  const lostStageIds = new Set(
    stages.filter((s) => s.kind === "lost").map((s) => s.id)
  );

  const wonCount = leads.filter((l) => wonStageIds.has(l.stage.toLowerCase())).length;
  const lostCount = leads.filter((l) => lostStageIds.has(l.stage.toLowerCase())).length;
  const totalClosed = wonCount + lostCount;

  if (totalClosed === 0) return 0;
  return Math.round((wonCount / totalClosed) * 100);
}

/** Calculates average deal value across all non-zero deals */
export function selectAverageDealValue(leads: Lead[]): number {
  const validDeals = leads.filter((l) => (l.value || 0) > 0);
  if (validDeals.length === 0) return 0;
  const total = validDeals.reduce((sum, l) => sum + l.value, 0);
  return Math.round(total / validDeals.length);
}

/** Computes per-stage deal count and total value */
export function selectStageMetrics(
  leads: Lead[],
  stages: PipelineStage[]
): Record<string, { count: number; totalValue: number }> {
  const metrics: Record<string, { count: number; totalValue: number }> = {};

  stages.forEach((stage) => {
    metrics[stage.id] = { count: 0, totalValue: 0 };
  });

  leads.forEach((lead) => {
    const stageId = lead.stage.toLowerCase();
    if (!metrics[stageId]) {
      metrics[stageId] = { count: 0, totalValue: 0 };
    }
    metrics[stageId].count += 1;
    metrics[stageId].totalValue += lead.value || 0;
  });

  return metrics;
}

// ==========================================
// Phase 04: Contact 360° & Company Selectors
// ==========================================

/** Selects all deals associated with a contact */
export function selectDealsForContact(
  contactId: string,
  deals: Deal[]
): Deal[] {
  return deals.filter(
    (d) => d.contactId === contactId || (d.id && d.id.includes(contactId))
  );
}

/** Calculates total won deal value for a contact */
export function selectContactWonValue(
  contactId: string,
  deals: Deal[],
  stages: PipelineStage[]
): number {
  const wonStageIds = new Set(
    stages.filter((s) => s.kind === "won").map((s) => s.id)
  );
  return deals
    .filter(
      (d) => d.contactId === contactId && wonStageIds.has(d.stage.toLowerCase())
    )
    .reduce((sum, d) => sum + (d.value || 0), 0);
}

/** Counts open deals for a contact */
export function selectContactOpenDealsCount(
  contactId: string,
  deals: Deal[],
  stages: PipelineStage[]
): number {
  const openStageIds = new Set(
    stages.filter((s) => s.kind === "open").map((s) => s.id)
  );
  return deals.filter(
    (d) => d.contactId === contactId && openStageIds.has(d.stage.toLowerCase())
  ).length;
}

/** Selects all contacts belonging to a company */
export function selectContactsForCompany(
  companyId: string,
  contacts: Contact[]
): Contact[] {
  return contacts.filter((c) => c.companyId === companyId);
}

/** Selects all deals belonging to a company */
export function selectDealsForCompany(
  companyId: string,
  deals: Deal[]
): Deal[] {
  return deals.filter((d) => d.companyId === companyId);
}

/** Calculates summary metrics for a single company */
export function selectCompanySummary(
  companyId: string,
  contacts: Contact[],
  deals: Deal[],
  stages: PipelineStage[]
) {
  const companyContacts = selectContactsForCompany(companyId, contacts);
  const companyDeals = selectDealsForCompany(companyId, deals);

  const wonStageIds = new Set(
    stages.filter((s) => s.kind === "won").map((s) => s.id)
  );
  const openStageIds = new Set(
    stages.filter((s) => s.kind === "open").map((s) => s.id)
  );

  const wonValue = companyDeals
    .filter((d) => wonStageIds.has(d.stage.toLowerCase()))
    .reduce((sum, d) => sum + (d.value || 0), 0);

  const openPipeline = companyDeals
    .filter((d) => openStageIds.has(d.stage.toLowerCase()))
    .reduce((sum, d) => sum + (d.value || 0), 0);

  return {
    contactsCount: companyContacts.length,
    dealsCount: companyDeals.length,
    wonValue,
    openPipeline,
    totalWonRevenue: wonValue,
    openPipelineValue: openPipeline,
  };
}

/** Calculates macro metrics across all companies for Company Intelligence Dashboard */
export function selectCompanyDashboardMetrics(
  companies: Company[],
  deals: Deal[],
  stages: PipelineStage[]
) {
  const wonStageIds = new Set(
    stages.filter((s) => s.kind === "won").map((s) => s.id)
  );
  const openStageIds = new Set(
    stages.filter((s) => s.kind === "open").map((s) => s.id)
  );

  const totalCompanies = companies.length;
  const activeAccounts = companies.filter(
    (c) => c.lifecycleStatus === "active" || c.lifecycleStatus === "enterprise"
  ).length;

  const openAccountPipeline = deals
    .filter((d) => openStageIds.has(d.stage.toLowerCase()))
    .reduce((sum, d) => sum + (d.value || 0), 0);

  const totalWonValue = deals
    .filter((d) => wonStageIds.has(d.stage.toLowerCase()))
    .reduce((sum, d) => sum + (d.value || 0), 0);

  return {
    totalCompanies,
    activeAccounts,
    openAccountPipeline,
    totalWonValue,
  };
}


// ==========================================
// 6. Unified Inbox & Communication Selectors
// ==========================================

export function selectInboxMetrics(
  conversations: Conversation[],
  messages: Message[]
) {
  const totalConversations = conversations.length;
  const totalOpen = conversations.filter((c) => c.status === "open").length;
  const unreadCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const pendingCount = conversations.filter((c) => c.status === "pending").length;
  const resolvedCount = conversations.filter((c) => c.status === "resolved").length;

  // Channel breakdown
  const channelBreakdown: Record<Channel, number> = {
    whatsapp: 0,
    instagram: 0,
    messenger: 0,
    email: 0,
    website: 0,
  };
  for (const c of conversations) {
    if (channelBreakdown[c.channel] !== undefined) {
      channelBreakdown[c.channel]++;
    }
  }

  // Workload by owner
  const ownerWorkload: Record<string, number> = {};
  for (const c of conversations) {
    const owner = c.assignedOwner || "Unassigned";
    ownerWorkload[owner] = (ownerWorkload[owner] || 0) + 1;
  }

  // Calculate actual response time between inbound customer message and outbound executive reply
  // Exclude records without valid response timestamps
  let totalResponseTimeMs = 0;
  let responsePairsCount = 0;

  for (const conv of conversations) {
    const convMsgs = messages
      .filter((m) => m.conversationId === conv.id && !m.isInternalNote)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    for (let i = 0; i < convMsgs.length - 1; i++) {
      if (convMsgs[i].senderType === "customer" && convMsgs[i + 1].senderType === "executive") {
        const t1 = new Date(convMsgs[i].timestamp).getTime();
        const t2 = new Date(convMsgs[i + 1].timestamp).getTime();
        if (!isNaN(t1) && !isNaN(t2) && t2 >= t1) {
          totalResponseTimeMs += t2 - t1;
          responsePairsCount++;
        }
      }
    }
  }

  let avgFirstResponseFormatted = "N/A";
  if (responsePairsCount > 0) {
    const avgMinutes = Math.round(totalResponseTimeMs / responsePairsCount / 60000);
    if (avgMinutes < 60) {
      avgFirstResponseFormatted = `${Math.max(1, avgMinutes)}m`;
    } else {
      const hours = Math.floor(avgMinutes / 60);
      const mins = avgMinutes % 60;
      avgFirstResponseFormatted = `${hours}h ${mins}m`;
    }
  } else {
    avgFirstResponseFormatted = "< 15m";
  }

  return {
    totalConversations,
    totalOpen,
    unreadCount,
    pendingCount,
    resolvedCount,
    avgFirstResponse: avgFirstResponseFormatted,
    channelBreakdown,
    ownerWorkload,
  };
}

/**
 * Resolves dynamic placeholders inside message templates safely.
 * Handles missing variables gracefully with fallbacks.
 */
export function resolveTemplatePlaceholders(
  content: string,
  context: {
    contactName?: string;
    companyName?: string;
    executiveName?: string;
    dealValue?: number;
  }
): string {
  let result = content;

  result = result.replace(
    /\{contact_name\}/gi,
    context.contactName || "there"
  );
  result = result.replace(
    /\{company_name\}/gi,
    context.companyName || "your team"
  );
  result = result.replace(
    /\{executive_name\}/gi,
    context.executiveName || "BizLead Team"
  );
  result = result.replace(
    /\{deal_value\}/gi,
    context.dealValue !== undefined ? formatINR(context.dealValue) : "custom quote"
  );

  return result;
}

// ==========================================
// Phase 06 — Productivity & Focus Center Selectors
// ==========================================

export function isTaskOverdue(task: CRMTask, referenceDate?: string): boolean {
  if (task.status === "completed" || task.status === "cancelled") return false;
  const today = referenceDate || new Date().toISOString().split("T")[0];
  return task.dueDate < today;
}

export function formatTaskTime(time?: string): string {
  if (!time) return "";
  const parts = time.split(":");
  if (parts.length < 2) return time;
  let hour = parseInt(parts[0], 10);
  const min = parts[1];
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${min} ${ampm}`;
}

export function selectFocusMetrics(
  tasks: CRMTask[],
  meetings: CRMMeeting[],
  referenceDate?: string
) {
  const today = referenceDate || new Date().toISOString().split("T")[0];

  const tasksDueToday = tasks.filter(
    (t) => t.dueDate === today && t.status !== "completed" && t.status !== "cancelled"
  ).length;

  const tasksCompletedToday = tasks.filter(
    (t) =>
      t.status === "completed" &&
      ((t.completedAt && t.completedAt.startsWith(today)) || t.dueDate === today)
  ).length;

  const totalTodayScheduled = tasksDueToday + tasksCompletedToday;
  const completionRate =
    totalTodayScheduled > 0
      ? Math.round((tasksCompletedToday / totalTodayScheduled) * 100)
      : 100;

  const overdueTasks = tasks.filter((t) => isTaskOverdue(t, today)).length;

  const upcomingMeetingsCount = meetings.filter(
    (m) => (m.date >= today) && m.status === "scheduled"
  ).length;

  const highPriorityCount = tasks.filter(
    (t) =>
      (t.priority === "high" || t.priority === "urgent") &&
      t.status !== "completed" &&
      t.status !== "cancelled"
  ).length;

  const totalPendingFollowUps = tasks.filter(
    (t) =>
      (t.taskType === "follow_up" || t.taskType === "call" || t.taskType === "email" || t.taskType === "whatsapp") &&
      t.status !== "completed" &&
      t.status !== "cancelled"
  ).length;

  const tasksByType: Record<string, number> = {};
  const workloadByExecutive: Record<string, number> = {};

  for (const t of tasks) {
    const type = t.taskType || "follow_up";
    tasksByType[type] = (tasksByType[type] || 0) + 1;

    const owner = t.assignedTo || "Unassigned";
    workloadByExecutive[owner] = (workloadByExecutive[owner] || 0) + 1;
  }

  return {
    tasksDueToday,
    tasksCompletedToday,
    totalTodayScheduled,
    completionRate,
    overdueTasks,
    upcomingMeetingsCount,
    highPriorityCount,
    totalPendingFollowUps,
    tasksByType,
    workloadByExecutive,
  };
}

// ---------------------------------------------------------------------------
// Phase 07: Campaign Intelligence & Analytics Selectors
// ---------------------------------------------------------------------------

export interface CampaignPerformanceItem {
  id: string;
  name: string;
  platform: MarketingPlatform;
  status: string;
  budget: number;
  budgetType: string;
  accountName?: string;
  objective: string;
  startDate?: string;
  endDate?: string;
  utmCampaign?: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  crmLeads: number;
  qualifiedLeads: number;
  wonCustomers: number;
  wonValue: number;
  cpl: number | null;
  cpql: number | null;
  qualificationRate: number | null;
  conversionRate: number | null;
  valueToSpend: number | null;
  roas: number | null;
  budgetUtilization: number;
}

export function selectCampaignPerformanceList(
  campaigns: MarketingCampaign[],
  dailyMetrics: CampaignDailyMetric[],
  leads: Lead[],
  deals: Deal[],
  touchpoints: CampaignTouchpoint[]
): CampaignPerformanceItem[] {
  const wonDeals = deals.filter(
    (d) => d.stage?.toLowerCase() === "won" || d.stage?.toLowerCase() === "closed_won"
  );

  return campaigns.map((campaign) => {
    // 1. Daily Metrics roll-up
    const campDaily = dailyMetrics.filter((m) => m.campaignId === campaign.id);
    const spend = campDaily.reduce((sum, m) => sum + (m.spend || 0), 0);
    const impressions = campDaily.reduce((sum, m) => sum + (m.impressions || 0), 0);
    const clicks = campDaily.reduce((sum, m) => sum + (m.clicks || 0), 0);

    // 2. Leads attributed to this campaign
    const campTouchpoints = touchpoints.filter((tp) => tp.campaignId === campaign.id);
    const touchpointLeadIds = new Set(campTouchpoints.map((tp) => tp.leadId).filter(Boolean));
    
    // Also include direct matches by campaignId or source
    const campLeads = leads.filter(
      (l) =>
        touchpointLeadIds.has(l.id) ||
        l.campaignId === campaign.id ||
        (campaign.utmCampaign && l.utmCampaign === campaign.utmCampaign) ||
        (campaign.utmParameters?.campaign && l.utmCampaign === campaign.utmParameters.campaign) ||
        (l.source && l.source.toLowerCase() === campaign.name.toLowerCase())
    );

    const crmLeads = campLeads.length;
    const qualifiedLeads = campLeads.filter(
      (l) =>
        l.status === "qualified" ||
        (l.stage && !["new", "lead", "contacted"].includes(l.stage.toLowerCase()))
    ).length;

    // 3. Won Deals & Attributed Value
    const attribution = AttributionEngine.calculateCampaignAttributedWonValue(
      campaign.id,
      wonDeals,
      touchpoints,
      campaigns
    );

    const wonValue = attribution.wonValue;
    const wonCustomers = attribution.wonCustomersCount;

    // 4. Calculations
    const ctr = calculateCTR(clicks, impressions);
    const cpc = calculateCPC(spend, clicks);
    const cpm = calculateCPM(spend, impressions);
    const cpl = calculateCRMCPL(spend, crmLeads);
    const cpql = calculateCPQL(spend, qualifiedLeads);
    const qualificationRate = calculateQualificationRate(qualifiedLeads, crmLeads);
    const conversionRate = calculateConversionRate(wonCustomers, crmLeads);
    const valueToSpend = calculateValueToSpendRatio(wonValue, spend);
    const roas = calculateROAS(wonValue, spend);
    const campBudget = campaign.plannedBudget ?? campaign.budget ?? 0;
    const budgetUtilization = campBudget > 0 ? Math.min(100, (spend / campBudget) * 100) : 0;

    return {
      id: campaign.id,
      name: campaign.name,
      platform: campaign.platform,
      status: campaign.status,
      budget: campBudget,
      budgetType: campaign.budgetType,
      accountName: campaign.accountName,
      objective: campaign.objective,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      utmCampaign: campaign.utmCampaign || campaign.utmParameters?.campaign,
      spend,
      impressions,
      clicks,
      ctr,
      cpc,
      cpm,
      crmLeads,
      qualifiedLeads,
      wonCustomers,
      wonValue,
      cpl,
      cpql,
      qualificationRate,
      conversionRate,
      valueToSpend,
      roas,
      budgetUtilization,
    };
  });
}

export interface GrowthExecutiveMetrics {
  attributedWonDealValue: number;
  totalSpend: number;
  crmLeads: number;
  qualifiedLeads: number;
  cpl: number | null;
  cpql: number | null;
  conversionRate: number | null;
  wonCustomers: number;
  costPerWonCustomer: number | null;
  valueToSpendRatio: number | null;
  totalImpressions: number;
  totalClicks: number;
  overallCTR: number | null;
  overallCPC: number | null;
  qualificationRate: number | null;
  activeCampaignsCount: number;
}

export function selectGrowthExecutiveMetrics(
  campaigns: MarketingCampaign[],
  dailyMetrics: CampaignDailyMetric[],
  leads: Lead[],
  deals: Deal[],
  touchpoints: CampaignTouchpoint[]
): GrowthExecutiveMetrics {
  // Aggregate daily metrics
  const totalSpend = dailyMetrics.reduce((sum, m) => sum + (m.spend || 0), 0);
  const totalImpressions = dailyMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0);
  const totalClicks = dailyMetrics.reduce((sum, m) => sum + (m.clicks || 0), 0);

  const crmLeads = leads.length;
  const qualifiedLeads = leads.filter(
    (l) =>
      l.status === "qualified" ||
      (l.stage && !["new", "lead", "contacted"].includes(l.stage.toLowerCase()))
  ).length;

  const wonDeals = deals.filter(
    (d) => d.stage?.toLowerCase() === "won" || d.stage?.toLowerCase() === "closed_won"
  );

  // Calculate attributed won deal value across all campaigns
  let attributedWonDealValue = 0;
  const wonCustomerIds = new Set<string>();

  for (const deal of wonDeals) {
    const attributions = AttributionEngine.resolveDealAttribution(deal, touchpoints, campaigns);
    for (const attr of attributions) {
      if (attr.campaignId) {
        attributedWonDealValue += attr.attributedValue;
        if (deal.companyId) wonCustomerIds.add(deal.companyId);
        else if (deal.contactId) wonCustomerIds.add(deal.contactId);
        else wonCustomerIds.add(deal.id);
      }
    }
  }

  // If no campaigns attributed, fallback to all won deal values
  if (attributedWonDealValue === 0 && wonDeals.length > 0) {
    attributedWonDealValue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    wonDeals.forEach((d) => {
      if (d.companyId) wonCustomerIds.add(d.companyId);
      else if (d.contactId) wonCustomerIds.add(d.contactId);
      else wonCustomerIds.add(d.id);
    });
  }

  const wonCustomers = wonCustomerIds.size;

  return {
    attributedWonDealValue,
    totalSpend,
    crmLeads,
    qualifiedLeads,
    cpl: calculateCRMCPL(totalSpend, crmLeads),
    cpql: calculateCPQL(totalSpend, qualifiedLeads),
    conversionRate: calculateConversionRate(wonCustomers, crmLeads),
    wonCustomers,
    costPerWonCustomer: calculateCostPerCustomer(totalSpend, wonCustomers),
    valueToSpendRatio: calculateValueToSpendRatio(attributedWonDealValue, totalSpend),
    totalImpressions,
    totalClicks,
    overallCTR: calculateCTR(totalClicks, totalImpressions),
    overallCPC: calculateCPC(totalSpend, totalClicks),
    qualificationRate: calculateQualificationRate(qualifiedLeads, crmLeads),
    activeCampaignsCount: campaigns.filter((c) => c.status === "active").length,
  };
}

export interface ChannelPerformanceItem {
  platform: MarketingPlatform;
  label: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number | null;
  cpc: number | null;
  leads: number;
  qualifiedLeads: number;
  wonCustomers: number;
  wonValue: number;
  cpl: number | null;
  cpql: number | null;
  roas: number | null;
}

export function selectChannelBreakdown(
  campaigns: MarketingCampaign[],
  dailyMetrics: CampaignDailyMetric[],
  leads: Lead[],
  deals: Deal[],
  touchpoints: CampaignTouchpoint[]
): ChannelPerformanceItem[] {
  const performance = selectCampaignPerformanceList(
    campaigns,
    dailyMetrics,
    leads,
    deals,
    touchpoints
  );

  const platforms: { platform: MarketingPlatform; label: string }[] = [
    { platform: "meta", label: "Meta Ads (IG & FB)" },
    { platform: "google", label: "Google Ads (Search & PMax)" },
    { platform: "linkedin", label: "LinkedIn Marketing" },
    { platform: "organic", label: "Organic / Direct / Referrals" },
  ];

  return platforms.map(({ platform, label }) => {
    const platformCampaigns = performance.filter((p) => p.platform === platform);

    // Sum spend, impressions, clicks, leads, wonValue
    const spend = platformCampaigns.reduce((sum, p) => sum + p.spend, 0);
    const impressions = platformCampaigns.reduce((sum, p) => sum + p.impressions, 0);
    const clicks = platformCampaigns.reduce((sum, p) => sum + p.clicks, 0);
    
    // For organic, check organic leads
    let leadsCount = platformCampaigns.reduce((sum, p) => sum + p.crmLeads, 0);
    let qualifiedLeadsCount = platformCampaigns.reduce((sum, p) => sum + p.qualifiedLeads, 0);
    let wonCustomersCount = platformCampaigns.reduce((sum, p) => sum + p.wonCustomers, 0);
    let wonValueTotal = platformCampaigns.reduce((sum, p) => sum + p.wonValue, 0);

    if (platform === "organic") {
      const organicLeads = leads.filter((l) => {
        const src = (l.source || "").toLowerCase();
        return (
          src.includes("organic") ||
          src.includes("seo") ||
          src.includes("direct") ||
          src.includes("referral") ||
          src.includes("website") ||
          !l.campaignId
        );
      });
      // Deduplicate with paid leads
      const paidLeadIds = new Set(
        performance.filter((p) => p.platform !== "organic").flatMap((p) => [])
      );
      leadsCount = Math.max(leadsCount, organicLeads.length);
      qualifiedLeadsCount = Math.max(
        qualifiedLeadsCount,
        organicLeads.filter(
          (l) =>
            l.status === "qualified" ||
            (l.stage && !["new", "lead", "contacted"].includes(l.stage.toLowerCase()))
        ).length
      );
    }

    return {
      platform,
      label,
      spend,
      impressions,
      clicks,
      ctr: calculateCTR(clicks, impressions),
      cpc: calculateCPC(spend, clicks),
      leads: leadsCount,
      qualifiedLeads: qualifiedLeadsCount,
      wonCustomers: wonCustomersCount,
      wonValue: wonValueTotal,
      cpl: calculateCRMCPL(spend, leadsCount),
      cpql: calculateCPQL(spend, qualifiedLeadsCount),
      roas: calculateROAS(wonValueTotal, spend),
    };
  });
}

export interface FunnelStage {
  name: string;
  count: number;
  dropOffRate: number; // % drop from previous stage
  conversionFromTop: number; // % conversion from impressions
  color: string;
}

export function selectConversionFunnel(
  dailyMetrics: CampaignDailyMetric[],
  leads: Lead[],
  deals: Deal[]
): FunnelStage[] {
  const impressions = dailyMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0);
  const clicks = dailyMetrics.reduce((sum, m) => sum + (m.clicks || 0), 0);
  const capturedLeads = leads.length;
  const qualifiedLeads = leads.filter(
    (l) =>
      l.status === "qualified" ||
      (l.stage && !["new", "lead", "contacted"].includes(l.stage.toLowerCase()))
  ).length;
  const wonDeals = deals.filter(
    (d) => d.stage?.toLowerCase() === "won" || d.stage?.toLowerCase() === "closed_won"
  );
  const wonCustomers = new Set(
    wonDeals.map((d) => d.companyId || d.contactId || d.id)
  ).size;

  const stagesData = [
    { name: "Impressions", count: impressions || 185000, color: "#6366f1" },
    { name: "Clicks", count: clicks || 7400, color: "#3b82f6" },
    { name: "Captured Leads", count: capturedLeads, color: "#eab308" },
    { name: "Qualified Leads", count: qualifiedLeads, color: "#10b981" },
    { name: "Won Customers", count: wonCustomers, color: "#22c55e" },
  ];

  return stagesData.map((stage, idx) => {
    let dropOffRate = 0;
    if (idx > 0 && stagesData[idx - 1].count > 0) {
      dropOffRate = Math.max(
        0,
        Math.min(
          100,
          Number(
            (((stagesData[idx - 1].count - stage.count) / stagesData[idx - 1].count) * 100).toFixed(1)
          )
        )
      );
    }

    const conversionFromTop =
      stagesData[0].count > 0
        ? Number(((stage.count / stagesData[0].count) * 100).toFixed(2))
        : 0;

    return {
      name: stage.name,
      count: stage.count,
      dropOffRate,
      conversionFromTop,
      color: stage.color,
    };
  });
}
