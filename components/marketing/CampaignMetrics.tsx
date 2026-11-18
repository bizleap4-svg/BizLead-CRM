"use client";

import React from "react";
import { formatINR, formatLakhs } from "../crm/selectors";
import { formatMetricCurrency, formatMetricPercent } from "../analytics/metricCalculators";
import { TrendingUp, DollarSign, Users, Award, Target, Zap, BarChart2 } from "lucide-react";

interface CampaignMetricsProps {
  metrics: {
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
    activeCampaignsCount: number;
  };
  hideBudget?: boolean;
}

export const CampaignMetrics: React.FC<CampaignMetricsProps> = ({
  metrics,
  hideBudget = false,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* 1. Attributed Won Deal Value */}
      <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:border-primary/40 transition-colors">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Attributed Won Value</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {formatLakhs(metrics.attributedWonDealValue)}
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-500 font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{metrics.wonCustomers} won {metrics.wonCustomers === 1 ? "customer" : "customers"}</span>
        </div>
      </div>

      {/* 2. Total Ad Spend (hidden if hideBudget is true) */}
      {!hideBudget ? (
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Ad Spend</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {formatLakhs(metrics.totalSpend)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <span>Across {metrics.activeCampaignsCount} active campaigns</span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border bg-card/60 text-card-foreground shadow-sm border-dashed">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Financial Visibility</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium">Agency Hidden</span>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Spend figures hidden for client-safe reporting.
          </div>
        </div>
      )}

      {/* 3. CRM Captured Leads & Qualified Leads */}
      <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:border-primary/40 transition-colors">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">CRM Leads (QL)</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground">{metrics.crmLeads}</span>
          <span className="text-sm font-semibold text-emerald-500">({metrics.qualifiedLeads} QL)</span>
        </div>
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <span>{metrics.crmLeads > 0 ? Math.round((metrics.qualifiedLeads / metrics.crmLeads) * 100) : 0}% qualification rate</span>
        </div>
      </div>

      {/* 4. Value-to-Spend Ratio / ROAS (or Conversion Rate if budget hidden) */}
      {!hideBudget ? (
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Value-to-Spend</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {metrics.valueToSpendRatio !== null ? `${metrics.valueToSpendRatio}x` : "N/A"}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <span>CPL: {formatMetricCurrency(metrics.cpl)} · CPQL: {formatMetricCurrency(metrics.cpql)}</span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Conversion Rate</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {formatMetricPercent(metrics.conversionRate)}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-emerald-500">
            <span>{metrics.wonCustomers} deals closed</span>
          </div>
        </div>
      )}
    </div>
  );
};
