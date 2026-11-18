"use client";

import React, { useState } from "react";
import { useCRM } from "../crm/CRMProvider";
import {
  selectGrowthExecutiveMetrics,
  selectChannelBreakdown,
  selectConversionFunnel,
  formatINR,
  formatLakhs,
} from "../crm/selectors";
import {
  formatMetricCurrency,
  formatMetricPercent,
  formatMetricNumber,
} from "./metricCalculators";
import { CampaignMetrics } from "../marketing/CampaignMetrics";
import { PerformanceTrend } from "./PerformanceTrend";
import { ConversionFunnel } from "./ConversionFunnel";
import { LeadQualityPanel } from "./LeadQualityPanel";
import { CampaignInsightsBanner } from "./CampaignInsightsBanner";
import { CreativeLibrary } from "../marketing/CreativeLibrary";
import { Tabs } from "../ui/Tabs";
import {
  TrendingUp,
  Filter,
  Eye,
  EyeOff,
  Layers,
  Calendar,
  Share2,
  Download,
  Sparkles,
  BarChart2,
  Globe,
  ArrowUpRight,
} from "lucide-react";

export const GrowthOverview: React.FC = () => {
  const { campaigns, dailyMetrics, leads, deals, touchpoints } = useCRM();

  const [dateRange, setDateRange] = useState<number>(30); // 7, 30, 90, 365
  const [hideBudget, setHideBudget] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "channels" | "creatives">("overview");

  // Selectors
  const executiveMetrics = selectGrowthExecutiveMetrics(
    campaigns,
    dailyMetrics,
    leads,
    deals,
    touchpoints
  );

  const channels = selectChannelBreakdown(
    campaigns,
    dailyMetrics,
    leads,
    deals,
    touchpoints
  );

  const funnelStages = selectConversionFunnel(dailyMetrics, leads, deals);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Header matching approved BizLead Growth OS design */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Growth, decoded.
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Revenue OS
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            From the first impression to the final conversion. Closed-loop attribution bridging ad spend to closed deals.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Hide Budget / Agency Margin toggle */}
          <button
            onClick={() => setHideBudget(!hideBudget)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              hideBudget
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                : "bg-background border-border text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle financial spend visibility for client reporting"
          >
            {hideBudget ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{hideBudget ? "Spend Hidden (Client Mode)" : "Hide Spend"}</span>
          </button>

          {/* Date Range Selector */}
          <div className="flex items-center p-1 rounded-lg bg-muted border text-xs">
            <button
              onClick={() => setDateRange(7)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                dateRange === 7
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setDateRange(30)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                dateRange === 30
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setDateRange(90)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                dateRange === 90
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              90D
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Insights Banner */}
      <CampaignInsightsBanner />

      {/* KPI Cards */}
      <CampaignMetrics metrics={executiveMetrics} hideBudget={hideBudget} />

      {/* View Tabs */}
      <div style={{ marginBottom: "16px" }}>
        <Tabs
          items={[
            { id: "overview", label: "Executive Overview & Funnel" },
            { id: "channels", label: "Channel Attribution" },
            { id: "creatives", label: "Creative Performance" },
          ]}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as any)}
          variant="underline"
          size="md"
          ariaLabel="Growth Analytics Views"
        />
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Bento Grid: Performance Trend + Conversion Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PerformanceTrend dailyMetrics={dailyMetrics} days={dateRange} />
            </div>
            <div>
              <ConversionFunnel stages={funnelStages} />
            </div>
          </div>

          {/* Lead Quality Section */}
          <LeadQualityPanel leads={leads} campaigns={campaigns} />
        </div>
      )}

      {/* Tab 2: Channel Performance Table */}
      {activeTab === "channels" && (
        <div className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span>Cross-Channel Attribution Matrix</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Side-by-side performance comparison across advertising networks and organic sources.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4">Channel / Network</th>
                  {!hideBudget && <th className="py-3 px-3 text-right">Spend</th>}
                  <th className="py-3 px-3 text-right">Clicks</th>
                  <th className="py-3 px-3 text-right">CTR</th>
                  <th className="py-3 px-3 text-right">Leads (QL)</th>
                  {!hideBudget && <th className="py-3 px-3 text-right">CPL</th>}
                  {!hideBudget && <th className="py-3 px-3 text-right">CPQL</th>}
                  <th className="py-3 px-3 text-right">Attributed Won</th>
                  {!hideBudget && <th className="py-3 px-3 text-right">ROAS</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {channels.map((ch) => (
                  <tr key={ch.platform} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            ch.platform === "meta"
                              ? "bg-blue-500"
                              : ch.platform === "google"
                              ? "bg-red-500"
                              : ch.platform === "linkedin"
                              ? "bg-sky-500"
                              : "bg-emerald-500"
                          }`}
                        />
                        <span>{ch.label}</span>
                      </div>
                    </td>
                    {!hideBudget && (
                      <td className="py-3 px-3 text-right font-medium text-foreground">
                        {ch.spend > 0 ? formatINR(ch.spend) : "₹0 (Organic)"}
                      </td>
                    )}
                    <td className="py-3 px-3 text-right text-muted-foreground">
                      {formatMetricNumber(ch.clicks)}
                    </td>
                    <td className="py-3 px-3 text-right text-muted-foreground">
                      {formatMetricPercent(ch.ctr)}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-foreground">
                      <span>{ch.leads}</span>
                      <span className="text-xs text-emerald-500 ml-1">({ch.qualifiedLeads})</span>
                    </td>
                    {!hideBudget && (
                      <td className="py-3 px-3 text-right text-muted-foreground">
                        {formatMetricCurrency(ch.cpl)}
                      </td>
                    )}
                    {!hideBudget && (
                      <td className="py-3 px-3 text-right text-muted-foreground">
                        {formatMetricCurrency(ch.cpql)}
                      </td>
                    )}
                    <td className="py-3 px-3 text-right font-semibold text-emerald-500">
                      {formatLakhs(ch.wonValue)}
                    </td>
                    {!hideBudget && (
                      <td className="py-3 px-3 text-right font-bold text-foreground">
                        {ch.roas !== null ? `${ch.roas}x` : "N/A"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Creatives */}
      {activeTab === "creatives" && <CreativeLibrary />}
    </div>
  );
};
