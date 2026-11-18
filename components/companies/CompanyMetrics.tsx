"use client";

import React from "react";
import { Building2, ShieldCheck, Target, TrendingUp } from "lucide-react";
import { Company, Deal, PipelineStage } from "@/components/crm/types";
import { formatLakhs, selectCompanyDashboardMetrics } from "@/components/crm/selectors";

interface CompanyMetricsProps {
  companies: Company[];
  deals: Deal[];
  stages: PipelineStage[];
}

export function CompanyMetrics({ companies, deals, stages }: CompanyMetricsProps) {
  const metrics = selectCompanyDashboardMetrics(companies, deals, stages);

  return (
    <section className="bl-pipeline-metrics" aria-label="Company Intelligence Summary">
      {/* Total Accounts */}
      <article className="bl-metric-tile">
        <div className="bl-metric-top">
          <span className="bl-metric-label">Tracked Accounts</span>
          <Building2 size={15} className="bl-metric-icon" />
        </div>
        <div className="bl-metric-value">{metrics.totalCompanies}</div>
        <div className="bl-metric-sub">Commercial organizations in database</div>
      </article>

      {/* Active Accounts */}
      <article className="bl-metric-tile bl-metric-highlight">
        <div className="bl-metric-top">
          <span className="bl-metric-label">Active & Enterprise</span>
          <ShieldCheck size={15} className="bl-metric-icon" />
        </div>
        <div className="bl-metric-value">{metrics.activeAccounts}</div>
        <div className="bl-metric-sub">Retained client relationships</div>
      </article>

      {/* Open Account Pipeline */}
      <article className="bl-metric-tile">
        <div className="bl-metric-top">
          <span className="bl-metric-label">Account Pipeline</span>
          <Target size={15} className="bl-metric-icon" />
        </div>
        <div className="bl-metric-value">{formatLakhs(metrics.openAccountPipeline)}</div>
        <div className="bl-metric-sub">Active deals across accounts</div>
      </article>

      {/* Total Won Deal Value */}
      <article className="bl-metric-tile">
        <div className="bl-metric-top">
          <span className="bl-metric-label">Total Won Revenue</span>
          <TrendingUp size={15} className="bl-metric-icon" style={{ color: "#16825B" }} />
        </div>
        <div className="bl-metric-value" style={{ color: "#16825B" }}>
          {formatLakhs(metrics.totalWonValue)}
        </div>
        <div className="bl-metric-sub">Booked lifetime customer revenue</div>
      </article>
    </section>
  );
}

export default CompanyMetrics;
