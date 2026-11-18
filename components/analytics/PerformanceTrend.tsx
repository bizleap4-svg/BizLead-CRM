"use client";

import React, { useState, useMemo } from "react";
import { CampaignDailyMetric } from "../crm/types";
import { formatINR } from "../crm/selectors";
import { TrendingUp, BarChart3 } from "lucide-react";

interface PerformanceTrendProps {
  dailyMetrics: CampaignDailyMetric[];
  days?: number;
}

export const PerformanceTrend: React.FC<PerformanceTrendProps> = ({
  dailyMetrics,
  days = 30,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [metricMode, setMetricMode] = useState<"spend" | "clicks" | "impressions">("spend");

  // Group metrics by date
  const aggregatedByDate = useMemo(() => {
    const map = new Map<string, { date: string; spend: number; clicks: number; impressions: number; providerLeads: number }>();

    for (const m of dailyMetrics) {
      const existing = map.get(m.date) || {
        date: m.date,
        spend: 0,
        clicks: 0,
        impressions: 0,
        providerLeads: 0,
      };
      existing.spend += m.spend || 0;
      existing.clicks += m.clicks || 0;
      existing.impressions += m.impressions || 0;
      existing.providerLeads += m.providerLeads || 0;
      map.set(m.date, existing);
    }

    const sorted = Array.from(map.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sorted.slice(-days);
  }, [dailyMetrics, days]);

  if (aggregatedByDate.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        No daily trend data available.
      </div>
    );
  }

  // Calculate SVG scales
  const maxSpend = Math.max(...aggregatedByDate.map((d) => d.spend), 1000);
  const maxClicks = Math.max(...aggregatedByDate.map((d) => d.clicks), 50);
  const maxImpressions = Math.max(...aggregatedByDate.map((d) => d.impressions), 500);

  const currentMax =
    metricMode === "spend" ? maxSpend : metricMode === "clicks" ? maxClicks : maxImpressions;

  const width = 800;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  const points = aggregatedByDate.map((d, i) => {
    const x = paddingX + (i / Math.max(1, aggregatedByDate.length - 1)) * (width - paddingX * 2);
    const val =
      metricMode === "spend" ? d.spend : metricMode === "clicks" ? d.clicks : d.impressions;
    const y = height - paddingY - (val / currentMax) * (height - paddingY * 2);
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1]?.x || 0} ${height - paddingY} L ${points[0]?.x || 0} ${height - paddingY} Z`;

  return (
    <div className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>Daily Performance Trajectory</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Aggregated cross-campaign daily trends over the last {days} days.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted border text-xs">
          <button
            onClick={() => setMetricMode("spend")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              metricMode === "spend"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Ad Spend
          </button>
          <button
            onClick={() => setMetricMode("clicks")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              metricMode === "clicks"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Clicks
          </button>
          <button
            onClick={() => setMetricMode("impressions")}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              metricMode === "impressions"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Impressions
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-56 overflow-visible select-none"
        >
          {/* Subtle Grid Lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="currentColor"
            strokeOpacity="0.15"
          />

          {/* Gradient Fill */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary, #eab308)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--primary, #eab308)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--primary, #eab308)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points */}
          {points.map((p, idx) => (
            <g key={p.data.date}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? 5 : 3}
                fill="var(--background, #000)"
                stroke="var(--primary, #eab308)"
                strokeWidth="2"
                className="transition-all cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div
            className="absolute top-2 pointer-events-none p-2.5 rounded-lg border bg-popover text-popover-foreground shadow-lg text-xs"
            style={{
              left: `${Math.min(
                Math.max(10, (points[hoveredIdx].x / width) * 100 - 15),
                70
              )}%`,
            }}
          >
            <div className="font-semibold text-foreground">
              {new Date(points[hoveredIdx].data.date).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="mt-1 space-y-0.5 text-muted-foreground">
              <div>
                Spend: <span className="text-foreground font-medium">{formatINR(points[hoveredIdx].data.spend)}</span>
              </div>
              <div>
                Clicks: <span className="text-foreground font-medium">{points[hoveredIdx].data.clicks.toLocaleString()}</span>
              </div>
              <div>
                Impressions: <span className="text-foreground font-medium">{points[hoveredIdx].data.impressions.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
