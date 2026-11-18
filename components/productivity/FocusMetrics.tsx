"use client";

import React from "react";
import {
  Zap,
  Clock,
  Video,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useCRM } from "../crm/CRMProvider";
import { selectFocusMetrics } from "../crm/selectors";

export function FocusMetrics() {
  const { tasks, meetings } = useCRM();
  const metrics = selectFocusMetrics(tasks, meetings);

  const kpis = [
    {
      label: "Today's Priorities",
      value: metrics.tasksDueToday,
      sub: `${metrics.highPriorityCount} marked high/urgent`,
      icon: Zap,
      color: "var(--accent)",
      bg: "rgba(255, 225, 59, 0.12)",
    },
    {
      label: "Overdue Items",
      value: metrics.overdueTasks,
      sub: metrics.overdueTasks > 0 ? "Requires immediate outreach" : "All cleared",
      icon: AlertTriangle,
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.12)",
    },
    {
      label: "Upcoming Meetings",
      value: metrics.upcomingMeetingsCount,
      sub: "Demos & client strategy calls",
      icon: Video,
      color: "#3b82f6",
      bg: "rgba(59, 130, 246, 0.12)",
    },
    {
      label: "Today's Completion",
      value: `${metrics.completionRate}%`,
      sub: `${metrics.tasksCompletedToday} of ${metrics.totalTodayScheduled} tasks closed`,
      icon: CheckCircle2,
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.12)",
    },
  ];

  return (
    <div className="bl-focus-metrics-row">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <div key={i} className="bl-focus-kpi-card">
            <div className="bl-kpi-top">
              <span className="bl-kpi-label">{kpi.label}</span>
              <div
                className="bl-kpi-icon-wrap"
                style={{ color: kpi.color, background: kpi.bg }}
              >
                <Icon size={16} />
              </div>
            </div>
            <div className="bl-kpi-val">{kpi.value}</div>
            <div className="bl-kpi-sub">{kpi.sub}</div>
          </div>
        );
      })}
    </div>
  );
}
