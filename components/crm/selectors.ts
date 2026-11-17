import { Lead, PipelineStage } from "./types";

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
