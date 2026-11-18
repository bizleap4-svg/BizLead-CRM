/**
 * BizLead Revenue OS — Marketing & Campaign Repository
 * Storage facade, seed campaigns, daily metrics, and safe versioned persistence.
 */

import {
  MarketingCampaign,
  MarketingAccount,
  AdCreative,
  CampaignDailyMetric,
  CampaignTouchpoint,
  MarketingImport,
  ReportDefinition,
  ConversionEvent,
} from "../crm/types";

export const STORAGE_KEY_CAMPAIGNS = "bizlead_marketing_campaigns_v1";
export const STORAGE_KEY_METRICS = "bizlead_marketing_metrics_v1";
export const STORAGE_KEY_CREATIVES = "bizlead_marketing_creatives_v1";
export const STORAGE_KEY_TOUCHPOINTS = "bizlead_marketing_touchpoints_v1";
export const STORAGE_KEY_REPORTS = "bizlead_marketing_reports_v1";
export const STORAGE_KEY_CONVERSIONS = "bizlead_marketing_conversions_v1";

// Demo Marketing Accounts
export const INITIAL_MARKETING_ACCOUNTS: MarketingAccount[] = [
  {
    id: "acc_meta_main",
    name: "BizLead Official Meta Ads (INR)",
    platform: "meta",
    currency: "INR",
    timezone: "Asia/Kolkata",
    status: "demo",
    accountType: "paid",
    externalAccountId: "act_1048294820",
    createdAt: "2026-10-01",
  },
  {
    id: "acc_google_main",
    name: "Google Ads Growth Search",
    platform: "google",
    currency: "INR",
    timezone: "Asia/Kolkata",
    status: "demo",
    accountType: "paid",
    externalAccountId: "983-294-1029",
    createdAt: "2026-10-01",
  },
  {
    id: "acc_linkedin_main",
    name: "LinkedIn Campaign Manager — B2B",
    platform: "linkedin",
    currency: "INR",
    timezone: "Asia/Kolkata",
    status: "demo",
    accountType: "paid",
    externalAccountId: "50829104",
    createdAt: "2026-10-05",
  },
];

// Demo Campaigns
export const INITIAL_MARKETING_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: "camp_meta_q4",
    name: "Meta B2B Enterprise Lead Gen",
    platform: "meta",
    accountId: "acc_meta_main",
    accountName: "BizLead Official Meta Ads (INR)",
    externalCampaignId: "cam_meta_98124",
    objective: "lead_generation",
    status: "active",
    startDate: "2026-10-15",
    owner: "Sales Executive A",
    targetLocation: "India (Tier 1 & Metro Hubs)",
    targetAudience: "Founders, CMOs, Head of Sales, B2B SMEs",
    budgetType: "daily",
    plannedBudget: 60000,
    currency: "INR",
    landingPageUrl: "https://bizlead.io/enterprise-demo",
    utmParameters: {
      source: "meta",
      medium: "cpc",
      campaign: "meta_b2b_enterprise_leadgen",
    },
    notes: "Core top-of-funnel acquisition drive for Mid-Market B2B companies.",
    tags: ["b2b", "enterprise", "meta"],
    createdAt: "2026-10-15T09:00:00Z",
    updatedAt: "2026-11-15T12:00:00Z",
  },
  {
    id: "camp_google_search",
    name: "Google High-Intent CRM Search",
    platform: "google",
    accountId: "acc_google_main",
    accountName: "Google Ads Growth Search",
    externalCampaignId: "cam_goog_55102",
    objective: "conversions",
    status: "active",
    startDate: "2026-10-20",
    owner: "Sales Executive B",
    targetLocation: "All India",
    targetAudience: "Searches for 'best crm software india', 'lead automation tool'",
    budgetType: "daily",
    plannedBudget: 45000,
    currency: "INR",
    landingPageUrl: "https://bizlead.io/free-trial",
    utmParameters: {
      source: "google",
      medium: "cpc",
      campaign: "google_high_intent_crm_search",
    },
    notes: "Bottom-of-funnel capture targeting high search purchase intent.",
    tags: ["search", "high-intent", "google"],
    createdAt: "2026-10-20T10:00:00Z",
    updatedAt: "2026-11-16T14:30:00Z",
  },
  {
    id: "camp_linkedin_abm",
    name: "LinkedIn CXO Account-Based Marketing",
    platform: "linkedin",
    accountId: "acc_linkedin_main",
    accountName: "LinkedIn Campaign Manager — B2B",
    externalCampaignId: "cam_li_11928",
    objective: "sales",
    status: "active",
    startDate: "2026-11-01",
    owner: "Sales Executive A",
    targetLocation: "Bengaluru, Mumbai, Delhi NCR",
    targetAudience: "VPs of Revenue, Chief Commercial Officers, Agency Directors",
    budgetType: "lifetime",
    plannedBudget: 25000,
    currency: "INR",
    landingPageUrl: "https://bizlead.io/executive-brief",
    utmParameters: {
      source: "linkedin",
      medium: "cpc",
      campaign: "linkedin_cxo_abm",
    },
    notes: "High-ticket account acquisition driving pipeline directly to demo consultations.",
    tags: ["abm", "cxo", "linkedin"],
    createdAt: "2026-11-01T08:00:00Z",
    updatedAt: "2026-11-17T11:00:00Z",
  },
  {
    id: "camp_insta_creative",
    name: "Instagram Brand Awareness & Reel Creatives",
    platform: "meta",
    accountId: "acc_meta_main",
    accountName: "BizLead Official Meta Ads (INR)",
    externalCampaignId: "cam_meta_44012",
    objective: "brand_awareness",
    status: "paused",
    startDate: "2026-10-25",
    endDate: "2026-11-10",
    owner: "Sales Executive C",
    targetLocation: "Pan India",
    targetAudience: "Digital marketing agencies & startup founders",
    budgetType: "lifetime",
    plannedBudget: 15000,
    currency: "INR",
    landingPageUrl: "https://bizlead.io/overview",
    utmParameters: {
      source: "meta",
      medium: "cpc",
      campaign: "instagram_creative_reels",
    },
    notes: "Short-form video experiments highlighting pipeline leakages.",
    tags: ["awareness", "reels", "creative"],
    createdAt: "2026-10-25T11:00:00Z",
    updatedAt: "2026-11-10T18:00:00Z",
  },
];

// Demo Creatives
export const INITIAL_AD_CREATIVES: AdCreative[] = [
  {
    id: "cr_meta_01",
    campaignId: "camp_meta_q4",
    name: "Stop Pipeline Leakage — Bento Dark",
    creativeType: "image",
    headline: "The Intelligence Behind Growth",
    primaryText: "Stop losing warm leads between marketing campaigns and sales calls. Switch to BizLead Revenue OS.",
    cta: "Schedule Live Demo",
    landingPageUrl: "https://bizlead.io/enterprise-demo",
    status: "active",
    metrics: { impressions: 18200, clicks: 540, spend: 14500, leads: 185 },
  },
  {
    id: "cr_meta_02",
    campaignId: "camp_meta_q4",
    name: "From First Impression to Final Conversion",
    creativeType: "video",
    headline: "Unified Omnichannel CRM for Agencies",
    primaryText: "Connect WhatsApp, Instagram, and Facebook ads directly to your sales pipeline.",
    cta: "Start Free 14-Day Trial",
    landingPageUrl: "https://bizlead.io/enterprise-demo",
    status: "active",
    metrics: { impressions: 24300, clicks: 760, spend: 28000, leads: 335 },
  },
  {
    id: "cr_goog_01",
    campaignId: "camp_google_search",
    name: "B2B CRM Software India — RSA",
    creativeType: "text",
    headline: "Best B2B CRM for Indian Enterprises | BizLead OS",
    primaryText: "Track campaigns to closed-won revenue in INR. Live WhatsApp & Lead Intelligence built in.",
    cta: "Explore Solutions",
    landingPageUrl: "https://bizlead.io/free-trial",
    status: "active",
    metrics: { impressions: 14500, clicks: 680, spend: 31200, leads: 340 },
  },
  {
    id: "cr_li_01",
    campaignId: "camp_linkedin_abm",
    name: "CXO Executive Overview — Carousels",
    creativeType: "carousel",
    headline: "Revenue Attribution: Prove Your Marketing ROI",
    primaryText: "Directly tie paid ad campaigns to enterprise deal closures without attribution guessing.",
    cta: "Download Executive Brief",
    landingPageUrl: "https://bizlead.io/executive-brief",
    status: "active",
    metrics: { impressions: 8900, clicks: 240, spend: 18000, leads: 85 },
  },
];

// Generate 30 days of daily metrics
export const INITIAL_DAILY_METRICS: CampaignDailyMetric[] = [];
(function seedDailyMetrics() {
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    // Meta Q4
    INITIAL_DAILY_METRICS.push({
      id: `met_q4_${dateStr}`,
      campaignId: "camp_meta_q4",
      date: dateStr,
      impressions: 1200 + Math.floor(Math.sin(i) * 300) + i * 20,
      clicks: 45 + Math.floor(Math.sin(i) * 12) + Math.floor(i * 0.8),
      spend: 1400 + Math.floor(Math.sin(i) * 200),
      currency: "INR",
      providerLeads: 16 + (i % 5),
      providerConversions: 16 + (i % 5),
      providerConversionValue: 0,
      source: "demo",
    });

    // Google Search
    INITIAL_DAILY_METRICS.push({
      id: `goog_${dateStr}`,
      campaignId: "camp_google_search",
      date: dateStr,
      impressions: 480 + Math.floor(Math.cos(i) * 80),
      clicks: 22 + Math.floor(Math.cos(i) * 6),
      spend: 1040 + Math.floor(Math.cos(i) * 150),
      currency: "INR",
      providerLeads: 11 + (i % 3),
      providerConversions: 11 + (i % 3),
      providerConversionValue: 0,
      source: "demo",
    });

    // LinkedIn ABM (active last 18 days)
    if (i <= 18) {
      INITIAL_DAILY_METRICS.push({
        id: `li_${dateStr}`,
        campaignId: "camp_linkedin_abm",
        date: dateStr,
        impressions: 450 + (i % 4) * 40,
        clicks: 12 + (i % 3) * 2,
        spend: 950 + (i % 2) * 100,
        currency: "INR",
        providerLeads: 4 + (i % 2),
        providerConversions: 4 + (i % 2),
        providerConversionValue: 0,
        source: "demo",
      });
    }
  }
})();

// Touchpoints linking real CRM records to campaigns
export const INITIAL_TOUCHPOINTS: CampaignTouchpoint[] = [
  {
    id: "tp-001",
    timestamp: "2026-10-22T10:15:00Z",
    leadId: "lead-001",
    dealId: "deal-001",
    campaignId: "camp_meta_q4",
    channel: "meta",
    utmSource: "meta",
    utmMedium: "cpc",
    utmCampaign: "meta_b2b_enterprise_leadgen",
    landingPage: "https://bizlead.io/enterprise-demo",
  },
  {
    id: "tp-002",
    timestamp: "2026-10-25T14:30:00Z",
    leadId: "lead-002",
    dealId: "deal-002",
    campaignId: "camp_google_search",
    channel: "google",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "google_high_intent_crm_search",
    landingPage: "https://bizlead.io/free-trial",
  },
  {
    id: "tp-003",
    timestamp: "2026-11-02T11:00:00Z",
    leadId: "lead-003",
    dealId: "deal-003",
    campaignId: "camp_linkedin_abm",
    channel: "linkedin",
    utmSource: "linkedin",
    utmMedium: "cpc",
    utmCampaign: "linkedin_cxo_abm",
    landingPage: "https://bizlead.io/executive-brief",
  },
];

// Memory state
let memoryAccounts: MarketingAccount[] = [...INITIAL_MARKETING_ACCOUNTS];
let memoryCampaigns: MarketingCampaign[] = [...INITIAL_MARKETING_CAMPAIGNS];
let memoryCreatives: AdCreative[] = [...INITIAL_AD_CREATIVES];
let memoryDailyMetrics: CampaignDailyMetric[] = [...INITIAL_DAILY_METRICS];
let memoryTouchpoints: CampaignTouchpoint[] = [...INITIAL_TOUCHPOINTS];
let memoryReports: ReportDefinition[] = [];
let memoryConversions: ConversionEvent[] = [];
let isInitialized = false;

function safeGetStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function safeSetStorage(key: string, data: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn("Storage persist failed for " + key, err);
  }
}

export function ensureMarketingInitialized() {
  if (isInitialized) return;
  if (typeof window !== "undefined") {
    memoryCampaigns = safeGetStorage(STORAGE_KEY_CAMPAIGNS, INITIAL_MARKETING_CAMPAIGNS);
    memoryDailyMetrics = safeGetStorage(STORAGE_KEY_METRICS, INITIAL_DAILY_METRICS);
    memoryCreatives = safeGetStorage(STORAGE_KEY_CREATIVES, INITIAL_AD_CREATIVES);
    memoryTouchpoints = safeGetStorage(STORAGE_KEY_TOUCHPOINTS, INITIAL_TOUCHPOINTS);
    memoryReports = safeGetStorage(STORAGE_KEY_REPORTS, []);
    memoryConversions = safeGetStorage(STORAGE_KEY_CONVERSIONS, []);
  }
  isInitialized = true;
}

// -------------------------------------------------------------
// CAMPAIGN CRUD
// -------------------------------------------------------------
export async function listCampaigns(): Promise<MarketingCampaign[]> {
  ensureMarketingInitialized();
  return [...memoryCampaigns];
}

export async function getCampaign(id: string): Promise<MarketingCampaign | undefined> {
  ensureMarketingInitialized();
  return memoryCampaigns.find((c) => c.id === id);
}

export async function createCampaign(
  data: Omit<MarketingCampaign, "id" | "createdAt" | "updatedAt">
): Promise<MarketingCampaign> {
  ensureMarketingInitialized();
  const newCamp: MarketingCampaign = {
    ...data,
    id: `camp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryCampaigns = [newCamp, ...memoryCampaigns];
  safeSetStorage(STORAGE_KEY_CAMPAIGNS, memoryCampaigns);
  return newCamp;
}

export async function updateCampaign(
  id: string,
  updates: Partial<MarketingCampaign>
): Promise<MarketingCampaign> {
  ensureMarketingInitialized();
  const idx = memoryCampaigns.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Campaign not found: " + id);

  const updated: MarketingCampaign = {
    ...memoryCampaigns[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  memoryCampaigns[idx] = updated;
  safeSetStorage(STORAGE_KEY_CAMPAIGNS, memoryCampaigns);
  return updated;
}

export async function archiveCampaign(id: string): Promise<MarketingCampaign> {
  return updateCampaign(id, { status: "archived" });
}

export async function deleteCampaign(id: string): Promise<void> {
  ensureMarketingInitialized();
  memoryCampaigns = memoryCampaigns.filter((c) => c.id !== id);
  safeSetStorage(STORAGE_KEY_CAMPAIGNS, memoryCampaigns);
}

// -------------------------------------------------------------
// DAILY PERFORMANCE METRICS & IMPORTS
// -------------------------------------------------------------
export async function listDailyMetrics(campaignId?: string): Promise<CampaignDailyMetric[]> {
  ensureMarketingInitialized();
  if (campaignId && campaignId !== "all") {
    return memoryDailyMetrics.filter((m) => m.campaignId === campaignId);
  }
  return [...memoryDailyMetrics];
}

/**
 * Import performance metrics with strict duplicate prevention on overlapping date records.
 */
export async function importDailyMetrics(
  metrics: CampaignDailyMetric[]
): Promise<MarketingImport> {
  ensureMarketingInitialized();
  let updatedCount = 0;
  let addedCount = 0;

  for (const m of metrics) {
    // If a record with same campaignId and date exists, replace/update rather than double counting
    const existingIdx = memoryDailyMetrics.findIndex(
      (e) => e.campaignId === m.campaignId && e.date === m.date
    );

    if (existingIdx !== -1) {
      memoryDailyMetrics[existingIdx] = { ...memoryDailyMetrics[existingIdx], ...m };
      updatedCount++;
    } else {
      memoryDailyMetrics.push(m);
      addedCount++;
    }
  }

  safeSetStorage(STORAGE_KEY_METRICS, memoryDailyMetrics);

  const importRecord: MarketingImport = {
    id: `imp_${Date.now()}`,
    fileName: "metrics_import.csv",
    importedAt: new Date().toISOString(),
    rowCount: metrics.length,
    dataType: "performance_metrics",
    platform: metrics[0]?.campaignId?.includes("meta") ? "meta" : "custom",
    status: "success",
  };

  return importRecord;
}

// -------------------------------------------------------------
// AD CREATIVES
// -------------------------------------------------------------
export async function listCreatives(campaignId?: string): Promise<AdCreative[]> {
  ensureMarketingInitialized();
  if (campaignId && campaignId !== "all") {
    return memoryCreatives.filter((c) => c.campaignId === campaignId);
  }
  return [...memoryCreatives];
}

export async function createCreative(creative: Omit<AdCreative, "id">): Promise<AdCreative> {
  ensureMarketingInitialized();
  const newCr: AdCreative = {
    ...creative,
    id: `cr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
  };
  memoryCreatives = [newCr, ...memoryCreatives];
  safeSetStorage(STORAGE_KEY_CREATIVES, memoryCreatives);
  return newCr;
}

// -------------------------------------------------------------
// TOUCHPOINTS
// -------------------------------------------------------------
export async function listTouchpoints(): Promise<CampaignTouchpoint[]> {
  ensureMarketingInitialized();
  return [...memoryTouchpoints];
}

export async function recordTouchpoint(
  tp: Omit<CampaignTouchpoint, "id" | "timestamp">
): Promise<CampaignTouchpoint> {
  ensureMarketingInitialized();
  const newTp: CampaignTouchpoint = {
    ...tp,
    id: `tp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
  };
  memoryTouchpoints.push(newTp);
  safeSetStorage(STORAGE_KEY_TOUCHPOINTS, memoryTouchpoints);
  return newTp;
}

// -------------------------------------------------------------
// REPORTS & SNAPSHOTS
// -------------------------------------------------------------
export async function listReports(): Promise<ReportDefinition[]> {
  ensureMarketingInitialized();
  return [...memoryReports];
}

export async function saveReport(report: Omit<ReportDefinition, "id" | "createdAt">): Promise<ReportDefinition> {
  ensureMarketingInitialized();
  const newRep: ReportDefinition = {
    ...report,
    id: `rep_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  memoryReports = [newRep, ...memoryReports];
  safeSetStorage(STORAGE_KEY_REPORTS, memoryReports);
  return newRep;
}

// -------------------------------------------------------------
// CONVERSION EVENTS (Future Ad Platform Sync)
// -------------------------------------------------------------
export async function recordConversionEvent(
  ev: Omit<ConversionEvent, "id" | "timestamp">
): Promise<ConversionEvent> {
  ensureMarketingInitialized();
  const newEv: ConversionEvent = {
    ...ev,
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
  };
  memoryConversions.push(newEv);
  safeSetStorage(STORAGE_KEY_CONVERSIONS, memoryConversions);
  return newEv;
}
