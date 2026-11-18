"use client";

import React from "react";
import { CampaignPerformanceItem, formatINR, formatLakhs } from "../crm/selectors";
import { formatMetricCurrency, formatMetricPercent } from "../analytics/metricCalculators";
import {
  Globe,
  Share2,
  TrendingUp,
  ExternalLink,
  Edit2,
  MoreVertical,
  CheckCircle2,
  PauseCircle,
  Archive,
  BarChart,
  Target,
  Sparkles,
} from "lucide-react";

interface CampaignGridProps {
  campaigns: CampaignPerformanceItem[];
  onSelectCampaign: (campaignId: string) => void;
  onEditCampaign: (campaignId: string) => void;
  onOpenUTMBuilder: (campaign: CampaignPerformanceItem) => void;
  hideBudget?: boolean;
}

export const CampaignGrid: React.FC<CampaignGridProps> = ({
  campaigns,
  onSelectCampaign,
  onEditCampaign,
  onOpenUTMBuilder,
  hideBudget = false,
}) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "meta":
        return <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />;
      case "google":
        return <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />;
      case "linkedin":
        return <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />;
      default:
        return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />;
    }
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case "meta":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "google":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "linkedin":
        return "bg-sky-500/10 text-sky-500 border-sky-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "paused":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "draft":
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      case "completed":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (campaigns.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl border bg-card text-card-foreground">
        <Target className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold">No campaigns match filters</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Adjust your search query or create a new campaign to begin tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {campaigns.map((camp) => (
        <div
          key={camp.id}
          className="group relative rounded-xl border bg-card text-card-foreground p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
        >
          <div>
            {/* Header: Platform & Status */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider ${getPlatformBadge(
                    camp.platform
                  )}`}
                >
                  {getPlatformIcon(camp.platform)}
                  {camp.platform}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusBadge(
                    camp.status
                  )}`}
                >
                  {camp.status}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onOpenUTMBuilder(camp)}
                  title="Open UTM Builder"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onEditCampaign(camp.id)}
                  title="Edit Campaign"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Campaign Name */}
            <h3
              onClick={() => onSelectCampaign(camp.id)}
              className="font-semibold text-foreground text-base tracking-tight hover:text-primary transition-colors cursor-pointer line-clamp-1"
            >
              {camp.name}
            </h3>

            <p className="text-xs text-muted-foreground mt-0.5 mb-4 line-clamp-1">
              Account: {camp.accountName || "Primary Business"} · Objective: {camp.objective.replace("_", " ")}
            </p>

            {/* Budget / Spend Progress */}
            {!hideBudget && (
              <div className="mb-4">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-muted-foreground">Budget Utilization</span>
                  <span className="font-medium text-foreground">
                    {formatINR(camp.spend)} / {formatINR(camp.budget)} ({Math.round(camp.budgetUtilization)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      camp.budgetUtilization > 90
                        ? "bg-rose-500"
                        : camp.budgetUtilization > 70
                        ? "bg-amber-500"
                        : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(100, camp.budgetUtilization)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Performance Stats Grid */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/40 border border-border/50 text-center mb-4">
              <div>
                <div className="text-[11px] text-muted-foreground">CRM Leads</div>
                <div className="text-sm font-semibold text-foreground mt-0.5">
                  {camp.crmLeads}{" "}
                  <span className="text-[10px] text-emerald-500 font-normal">
                    ({camp.qualifiedLeads} QL)
                  </span>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-muted-foreground">CTR</div>
                <div className="text-sm font-semibold text-foreground mt-0.5">
                  {formatMetricPercent(camp.ctr)}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-muted-foreground">
                  {hideBudget ? "Conv Rate" : "CPL"}
                </div>
                <div className="text-sm font-semibold text-foreground mt-0.5">
                  {hideBudget
                    ? formatMetricPercent(camp.conversionRate)
                    : formatMetricCurrency(camp.cpl)}
                </div>
              </div>
            </div>
          </div>

          {/* Footer: Attributed Won Value & Quick View */}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <div>
              <div className="text-[11px] text-muted-foreground">Attributed Won Value</div>
              <div className="text-sm font-bold text-emerald-500">
                {formatLakhs(camp.wonValue)}
                {camp.wonCustomers > 0 && (
                  <span className="text-[11px] text-muted-foreground font-normal ml-1">
                    ({camp.wonCustomers} {camp.wonCustomers === 1 ? "deal" : "deals"})
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => onSelectCampaign(camp.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <span>Analytics</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
