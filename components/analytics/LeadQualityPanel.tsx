"use client";

import React from "react";
import { Lead, MarketingCampaign } from "../crm/types";
import { formatMetricPercent } from "./metricCalculators";
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, Sparkles } from "lucide-react";

interface LeadQualityPanelProps {
  leads: Lead[];
  campaigns: MarketingCampaign[];
}

export const LeadQualityPanel: React.FC<LeadQualityPanelProps> = ({
  leads,
  campaigns,
}) => {
  // Aggregate quality by source
  const sourceGroups = React.useMemo(() => {
    const groups: Record<
      string,
      { total: number; qualified: number; lost: number; won: number }
    > = {};

    for (const lead of leads) {
      const src = lead.source || "Direct / Website";
      if (!groups[src]) {
        groups[src] = { total: 0, qualified: 0, lost: 0, won: 0 };
      }
      groups[src].total += 1;
      const isQualified =
        lead.status === "qualified" ||
        (lead.stage && !["new", "lead", "contacted"].includes(lead.stage.toLowerCase()));
      if (isQualified) groups[src].qualified += 1;
      if (lead.stage?.toLowerCase() === "won" || lead.stage?.toLowerCase() === "closed_won") {
        groups[src].won += 1;
      }
      if (lead.stage?.toLowerCase() === "lost" || lead.stage?.toLowerCase() === "closed_lost") {
        groups[src].lost += 1;
      }
    }

    return Object.entries(groups)
      .map(([name, data]) => {
        const qualRate =
          data.total > 0 ? Number(((data.qualified / data.total) * 100).toFixed(1)) : 0;
        return {
          name,
          ...data,
          qualRate,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [leads]);

  return (
    <div className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Lead Quality & Qualification Intelligence</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Conversion disposition and sales qualification rates segmented by acquisition source.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sourceGroups.map((src) => (
          <div
            key={src.name}
            className="p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-medium text-xs text-foreground">{src.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {src.qualified} / {src.total} Qualified
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    src.qualRate >= 50
                      ? "bg-emerald-500/10 text-emerald-500"
                      : src.qualRate >= 25
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-rose-500/10 text-rose-500"
                  }`}
                >
                  {src.qualRate}%
                </span>
              </div>
            </div>

            {/* Micro bar showing qualified vs other */}
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${src.qualRate}%` }}
              />
              <div
                className="bg-rose-500/60 h-full"
                style={{
                  width: `${src.total > 0 ? (src.lost / src.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
