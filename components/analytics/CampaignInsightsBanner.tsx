"use client";

import React from "react";
import { useCRM } from "../crm/CRMProvider";
import { generateMarketingInsights, MarketingInsight } from "./InsightEngine";
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Zap,
  Info,
  CheckCircle,
  Plus,
  ArrowRight,
} from "lucide-react";

interface CampaignInsightsBannerProps {
  onSelectCampaign?: (campaignId: string) => void;
}

export const CampaignInsightsBanner: React.FC<CampaignInsightsBannerProps> = ({
  onSelectCampaign,
}) => {
  const { campaigns, dailyMetrics, leads, deals, touchpoints, createTask } = useCRM();

  const insights = React.useMemo(() => {
    return generateMarketingInsights(
      campaigns,
      dailyMetrics,
      leads,
      deals
    );
  }, [campaigns, dailyMetrics, leads, deals]);

  const [dismissedIds, setDismissedIds] = React.useState<Set<string>>(new Set());
  const [createdTaskIds, setCreatedTaskIds] = React.useState<Set<string>>(new Set());

  const activeInsights = insights.filter((i: MarketingInsight) => !dismissedIds.has(i.id));

  if (activeInsights.length === 0) return null;

  const handleCreateTask = (insight: MarketingInsight) => {
    createTask({
      title: `[Marketing Action] ${insight.title}`,
      description: `${insight.recommendedAction}\n\nReason: ${insight.reason}\nMetrics: ${insight.sourceMetrics}`,
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
      priority: insight.severity === "critical" ? "urgent" : "high",
      status: "pending",
      taskType: "follow_up",
      assignedTo: "Rahul Sharma",
      entityType: "campaign",
      entityId: insight.campaignId,
      entityName: insight.campaignName,
    });

    setCreatedTaskIds((prev) => new Set(prev).add(insight.id));
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-rose-500/30 bg-rose-500/5 text-rose-500";
      case "warning":
        return "border-amber-500/30 bg-amber-500/5 text-amber-500";
      case "opportunity":
        return "border-emerald-500/30 bg-emerald-500/5 text-emerald-500";
      default:
        return "border-primary/30 bg-primary/5 text-primary";
    }
  };

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-xs uppercase tracking-wider text-foreground">
            Deterministic Campaign Intelligence ({activeInsights.length})
          </h3>
        </div>
        <span className="text-[11px] text-muted-foreground">Rule-based optimization engine</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {activeInsights.slice(0, 4).map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${getSeverityStyle(
              insight.severity
            )}`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-xs tracking-tight text-foreground flex items-center gap-1.5">
                  {insight.severity === "critical" ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  ) : insight.severity === "opportunity" ? (
                    <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                  {insight.title}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-background/60">
                  {insight.severity}
                </span>
              </div>

              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {insight.reason}
              </p>

              <div className="text-xs font-medium text-foreground mt-2 p-2 rounded-lg bg-background/50 border border-border/40">
                Action: {insight.recommendedAction}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40">
              {createdTaskIds.has(insight.id) ? (
                <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Task Created in Focus Center
                </span>
              ) : (
                <button
                  onClick={() => handleCreateTask(insight)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  Create Task
                </button>
              )}

              {insight.campaignId && onSelectCampaign && (
                <button
                  onClick={() => onSelectCampaign(insight.campaignId!)}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <span>Review Campaign</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
