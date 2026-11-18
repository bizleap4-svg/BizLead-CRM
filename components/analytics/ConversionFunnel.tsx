"use client";

import React from "react";
import { FunnelStage } from "../crm/selectors";
import { formatMetricNumber, formatMetricPercent } from "./metricCalculators";
import { Filter, ChevronDown, ArrowDownRight } from "lucide-react";

interface ConversionFunnelProps {
  stages: FunnelStage[];
}

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ stages }) => {
  return (
    <div className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span>Full-Funnel Growth Journey</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Impression-to-revenue conversion rate with stage-by-stage drop-off diagnostics.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {stages.map((stage, idx) => {
          // Calculate proportional width (relative to top stage, min 25% for visibility)
          const maxCount = stages[0]?.count || 1;
          const ratio = Math.max(0.15, stage.count / maxCount);
          const barWidth = Math.round(ratio * 100);

          return (
            <div key={stage.name} className="relative group">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="font-medium text-foreground">{stage.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-foreground">
                    {formatMetricNumber(stage.count)}
                  </span>
                  {idx > 0 && (
                    <span className="text-[11px] text-rose-500 font-medium">
                      -{stage.dropOffRate}% drop
                    </span>
                  )}
                  <span className="text-[11px] text-muted-foreground">
                    ({stage.conversionFromTop}% of top)
                  </span>
                </div>
              </div>

              {/* Progress Bar with Funnel Shape */}
              <div className="w-full h-4 rounded-md bg-muted/60 overflow-hidden flex">
                <div
                  className="h-full rounded-md transition-all duration-500 opacity-90 group-hover:opacity-100"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: stage.color,
                  }}
                />
              </div>

              {/* Connector arrow between stages */}
              {idx < stages.length - 1 && (
                <div className="flex justify-center -my-1 text-muted-foreground/40">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
