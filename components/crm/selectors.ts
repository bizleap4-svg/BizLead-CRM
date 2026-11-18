import {
  Lead,
  Contact,
  Company,
  Deal,
  PipelineStage,
  Conversation,
  Message,
  Channel,
} from "./types";

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
