"use client";

import React from "react";
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Flame,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useCRM } from "../crm/CRMProvider";
import { selectFocusMetrics } from "../crm/selectors";

interface DailyMomentumProps {
  onFilterSelect?: (filter: string) => void;
  activeFilter?: string;
}

export function DailyMomentum({ onFilterSelect, activeFilter }: DailyMomentumProps) {
  const { tasks, meetings } = useCRM();
  const metrics = selectFocusMetrics(tasks, meetings);

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Calculate dynamic motivation text
  let motivation = "Review today's schedule and prioritize high-value client opportunities.";
  if (metrics.overdueTasks > 0) {
    motivation = `${metrics.overdueTasks} follow-up${metrics.overdueTasks > 1 ? "s are" : " is"} overdue. Clear them first to maintain pipeline velocity!`;
  } else if (metrics.tasksDueToday > 0) {
    motivation = `${metrics.tasksDueToday} action item${metrics.tasksDueToday > 1 ? "s" : ""} scheduled for today. Complete them to maintain sales cadence!`;
  } else if (metrics.tasksCompletedToday > 0) {
    motivation = "All scheduled items for today completed! You are ahead of schedule.";
  }

  return (
    <div className="bl-momentum-card">
      <div className="bl-momentum-glow" />

      <div className="bl-momentum-content">
        <div className="bl-momentum-top">
          <div className="bl-momentum-date-badge">
            <Calendar size={13} />
            <span>{todayStr}</span>
          </div>

          <div className="bl-momentum-streak">
            <Flame size={14} className="bl-streak-icon" />
            <span>Daily Execution Cadence</span>
          </div>
        </div>

        <div className="bl-momentum-main">
          <div className="bl-momentum-left">
            <h1 className="bl-momentum-title">Daily Momentum</h1>
            <p className="bl-momentum-subtitle">{motivation}</p>

            <div className="bl-momentum-progress-container">
              <div className="bl-momentum-progress-label">
                <span>
                  <strong>{metrics.tasksCompletedToday}</strong> of{" "}
                  <strong>{metrics.totalTodayScheduled}</strong> items completed
                </span>
                <span className="bl-momentum-percent">{metrics.completionRate}%</span>
              </div>
              <div className="bl-momentum-progress-track">
                <div
                  className="bl-momentum-progress-fill"
                  style={{ width: `${Math.max(4, metrics.completionRate)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bl-momentum-stats-grid">
            <button
              type="button"
              className={`bl-momentum-stat-box ${activeFilter === "overdue" ? "active" : ""}`}
              onClick={() => onFilterSelect && onFilterSelect("overdue")}
            >
              <div className="bl-stat-box-icon overdue">
                <AlertCircle size={16} />
              </div>
              <div className="bl-stat-box-meta">
                <span className="bl-stat-box-val">{metrics.overdueTasks}</span>
                <span className="bl-stat-box-label">Overdue</span>
              </div>
            </button>

            <button
              type="button"
              className={`bl-momentum-stat-box ${activeFilter === "today" ? "active" : ""}`}
              onClick={() => onFilterSelect && onFilterSelect("today")}
            >
              <div className="bl-stat-box-icon today">
                <Zap size={16} />
              </div>
              <div className="bl-stat-box-meta">
                <span className="bl-stat-box-val">{metrics.tasksDueToday}</span>
                <span className="bl-stat-box-label">Due Today</span>
              </div>
            </button>

            <button
              type="button"
              className={`bl-momentum-stat-box ${activeFilter === "high" ? "active" : ""}`}
              onClick={() => onFilterSelect && onFilterSelect("high")}
            >
              <div className="bl-stat-box-icon high">
                <Flame size={16} />
              </div>
              <div className="bl-stat-box-meta">
                <span className="bl-stat-box-val">{metrics.highPriorityCount}</span>
                <span className="bl-stat-box-label">Priority</span>
              </div>
            </button>

            <button
              type="button"
              className={`bl-momentum-stat-box ${activeFilter === "completed" ? "active" : ""}`}
              onClick={() => onFilterSelect && onFilterSelect("completed")}
            >
              <div className="bl-stat-box-icon done">
                <CheckCircle2 size={16} />
              </div>
              <div className="bl-stat-box-meta">
                <span className="bl-stat-box-val">{metrics.tasksCompletedToday}</span>
                <span className="bl-stat-box-label">Done</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
