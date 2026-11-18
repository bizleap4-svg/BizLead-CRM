/**
 * BizLead Revenue OS — Metric Calculators & Performance Mathematics
 * Deterministic formulas, safe zero-denominator handling, and aggregate ratios.
 */

export interface MetricCalculationInput {
  impressions?: number;
  clicks?: number;
  spend?: number;
  providerLeads?: number;
  crmLeads?: number;
  qualifiedLeads?: number;
  wonCustomers?: number;
  attributedWonValue?: number;
  closedDeals?: number;
  wonDeals?: number;
}

/** Click-Through Rate: (clicks / impressions) * 100 */
export function calculateCTR(clicks: number, impressions: number): number | null {
  if (!impressions || impressions <= 0 || clicks < 0) return null;
  return Number(((clicks / impressions) * 100).toFixed(2));
}

/** Cost Per Click: spend / clicks */
export function calculateCPC(spend: number, clicks: number): number | null {
  if (!clicks || clicks <= 0 || spend < 0) return null;
  return Number((spend / clicks).toFixed(2));
}

/** Cost Per Mille (Thousand Impressions): (spend / impressions) * 1000 */
export function calculateCPM(spend: number, impressions: number): number | null {
  if (!impressions || impressions <= 0 || spend < 0) return null;
  return Number(((spend / impressions) * 1000).toFixed(2));
}

/** CRM Cost Per Lead: spend / attributed CRM leads */
export function calculateCRMCPL(spend: number, crmLeads: number): number | null {
  if (!crmLeads || crmLeads <= 0 || spend < 0) return null;
  return Number((spend / crmLeads).toFixed(2));
}

/** Provider Cost Per Lead: spend / provider-reported leads */
export function calculateProviderCPL(spend: number, providerLeads: number): number | null {
  if (!providerLeads || providerLeads <= 0 || spend < 0) return null;
  return Number((spend / providerLeads).toFixed(2));
}

/** Cost Per Qualified Lead: spend / qualified CRM leads */
export function calculateCPQL(spend: number, qualifiedLeads: number): number | null {
  if (!qualifiedLeads || qualifiedLeads <= 0 || spend < 0) return null;
  return Number((spend / qualifiedLeads).toFixed(2));
}

/** Qualification Rate: (qualified CRM leads / total CRM leads) * 100 */
export function calculateQualificationRate(qualifiedLeads: number, totalLeads: number): number | null {
  if (!totalLeads || totalLeads <= 0 || qualifiedLeads < 0) return null;
  return Number(((qualifiedLeads / totalLeads) * 100).toFixed(2));
}

/** Lead-to-Customer Conversion Rate: (distinct won customers / distinct leads) * 100 */
export function calculateConversionRate(wonCustomers: number, totalLeads: number): number | null {
  if (!totalLeads || totalLeads <= 0 || wonCustomers < 0) return null;
  return Number(((wonCustomers / totalLeads) * 100).toFixed(2));
}

/** Deal Win Rate: (won deals / closed deals) * 100 */
export function calculateDealWinRate(wonDeals: number, closedDeals: number): number | null {
  if (!closedDeals || closedDeals <= 0 || wonDeals < 0) return null;
  return Number(((wonDeals / closedDeals) * 100).toFixed(2));
}

/** Cost Per Won Customer: spend / distinct attributed won customers */
export function calculateCostPerCustomer(spend: number, wonCustomers: number): number | null {
  if (!wonCustomers || wonCustomers <= 0 || spend < 0) return null;
  return Number((spend / wonCustomers).toFixed(2));
}

/** Won Deal Value-to-Spend Ratio: attributed won deal value / ad spend */
export function calculateValueToSpendRatio(attributedWonValue: number, spend: number): number | null {
  if (!spend || spend <= 0 || attributedWonValue < 0) return null;
  return Number((attributedWonValue / spend).toFixed(2));
}

/** Return on Ad Spend (ROAS): attributed ad revenue / ad spend */
export function calculateROAS(revenue: number, spend: number): number | null {
  if (!spend || spend <= 0 || revenue < 0) return null;
  return Number((revenue / spend).toFixed(2));
}

/** Format metric value with safe fallback for zero denominators */
export function formatMetricNumber(
  val: number | null | undefined,
  prefix: string = "",
  suffix: string = ""
): string {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
    return "N/A";
  }
  return `${prefix}${val.toLocaleString("en-IN")}${suffix}`;
}

export function formatMetricCurrency(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
    return "N/A";
  }
  return `₹${val.toLocaleString("en-IN")}`;
}

export function formatMetricPercent(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
    return "N/A";
  }
  return `${val.toFixed(1)}%`;
}
