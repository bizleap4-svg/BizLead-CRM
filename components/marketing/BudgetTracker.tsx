"use client";

import React from "react";
import { CampaignPerformanceItem, formatINR, formatLakhs } from "../crm/selectors";
import { DollarSign, AlertTriangle, CheckCircle, TrendingUp, ShieldAlert } from "lucide-react";

interface BudgetTrackerProps {
  campaigns: CampaignPerformanceItem[];
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({ campaigns }) => {
  const totalPlannedBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalRemaining = Math.max(0, totalPlannedBudget - totalSpent);
  const overallUtilization = totalPlannedBudget > 0 ? (totalSpent / totalPlannedBudget) * 100 : 0;

  const overbudgetCampaigns = campaigns.filter((c) => c.budgetUtilization >= 90);
  const warningCampaigns = campaigns.filter((c) => c.budgetUtilization >= 75 && c.budgetUtilization < 90);

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-card text-card-foreground">
          <div className="text-xs text-muted-foreground uppercase font-medium">Total Planned Budget</div>
          <div className="text-2xl font-bold tracking-tight text-foreground mt-1">
            {formatLakhs(totalPlannedBudget)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Across all active & paused campaigns</div>
        </div>

        <div className="p-4 rounded-xl border bg-card text-card-foreground">
          <div className="text-xs text-muted-foreground uppercase font-medium">Total Ad Spend</div>
          <div className="text-2xl font-bold tracking-tight text-foreground mt-1">
            {formatLakhs(totalSpent)}
          </div>
          <div className="text-xs text-primary font-medium mt-1">
            {Math.round(overallUtilization)}% utilized
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-card text-card-foreground">
          <div className="text-xs text-muted-foreground uppercase font-medium">Remaining Runway</div>
          <div className="text-2xl font-bold tracking-tight text-emerald-500 mt-1">
            {formatLakhs(totalRemaining)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Available for remaining cycle</div>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="p-4 rounded-xl border bg-card text-card-foreground">
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="font-medium text-foreground">Monthly Budget Burn Pacing</span>
          <span className="text-muted-foreground">{Math.round(overallUtilization)}% of target</span>
        </div>
        <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              overallUtilization > 90
                ? "bg-rose-500"
                : overallUtilization > 75
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(100, overallUtilization)}%` }}
          />
        </div>
      </div>

      {/* Alerts */}
      {overbudgetCampaigns.length > 0 && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-foreground space-y-2">
          <div className="flex items-center gap-2 text-rose-500 font-semibold text-xs">
            <ShieldAlert className="w-4 h-4" />
            <span>Over-budget Warning ({overbudgetCampaigns.length} campaigns)</span>
          </div>
          <div className="text-xs text-muted-foreground">
            The following campaigns have exceeded 90% of their allocated budget:
          </div>
          <ul className="text-xs space-y-1 list-disc list-inside text-foreground font-medium">
            {overbudgetCampaigns.map((c) => (
              <li key={c.id}>
                {c.name}: {formatINR(c.spend)} spent of {formatINR(c.budget)} ({Math.round(c.budgetUtilization)}%)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
