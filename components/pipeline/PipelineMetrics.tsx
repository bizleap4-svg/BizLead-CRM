"use client";

import React from "react";
import { ArrowUpRight, TrendingUp, Sparkles, DollarSign, Target, CheckCircle2 } from "lucide-react";
import { useCRM } from "@/components/crm/CRMProvider";
import {
  selectTotalOpenPipelineValue,
  selectWeightedRevenueForecast,
  selectWonDealValue,
  selectWinRate,
  selectAverageDealValue,
  formatINR,
  formatLakhs,
} from "@/components/crm/selectors";

export function PipelineMetrics() {
  const { leads, stages } = useCRM();

  const totalOpen = selectTotalOpenPipelineValue(leads, stages);
  const weightedForecast = selectWeightedRevenueForecast(leads, stages);
  const wonValue = selectWonDealValue(leads, stages);
  const winRate = selectWinRate(leads, stages);
  const avgDeal = selectAverageDealValue(leads);

  return (
    <section className="bl-pipeline-metrics" aria-label="Revenue Intelligence Summary">
      {/* Total Open Pipeline */}
      <article className="bl-metric-tile">
        <div className="bl-metric-top">
          <span className="bl-metric-label">Open Pipeline Value</span>
          <Target size={15} className="bl-metric-icon" />
        </div>
        <div className="bl-metric-value">{formatLakhs(totalOpen)}</div>
        <div className="bl-metric-sub">
          Active opportunities in negotiation & proposals
        </div>
      </article>

      {/* Weighted Revenue Forecast */}
      <article className="bl-metric-tile bl-metric-highlight">
        <div className="bl-metric-top">
          <span className="bl-metric-label">Weighted Forecast</span>
          <Sparkles size={15} className="bl-metric-icon" />
        </div>
        <div className="bl-metric-value">{formatLakhs(weightedForecast)}</div>
        <div className="bl-metric-sub">
          Probability-adjusted expected revenue
        </div>
      </article>

      {/* Won Deal Value */}
      <article className="bl-metric-tile">
        <div className="bl-metric-top">
          <span className="bl-metric-label">Closed Won Value</span>
          <CheckCircle2 size={15} className="bl-metric-icon" style={{ color: "#16825B" }} />
        </div>
        <div className="bl-metric-value" style={{ color: "#16825B" }}>
          {formatLakhs(wonValue)}
        </div>
        <div className="bl-metric-sub">
          Revenue locked in current cycle
        </div>
      </article>

      {/* Win Rate */}
      <article className="bl-metric-tile">
        <div className="bl-metric-top">
          <span className="bl-metric-label">Win Rate</span>
          <TrendingUp size={15} className="bl-metric-icon" />
        </div>
        <div className="bl-metric-value">{winRate}%</div>
        <div className="bl-metric-sub">
          Conversion ratio of closed opportunities
        </div>
      </article>

      {/* Average Deal Value */}
      <article className="bl-metric-tile">
        <div className="bl-metric-top">
          <span className="bl-metric-label">Average Deal Size</span>
          <DollarSign size={15} className="bl-metric-icon" />
        </div>
        <div className="bl-metric-value">{formatINR(avgDeal)}</div>
        <div className="bl-metric-sub">
          Across all pipeline opportunities
        </div>
      </article>
    </section>
  );
}

export default PipelineMetrics;
