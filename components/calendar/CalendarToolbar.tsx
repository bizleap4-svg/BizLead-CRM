"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CalendarDays,
  Clock,
  List,
  Plus,
  Video,
  Download,
} from "lucide-react";
import { useCRM } from "../crm/CRMProvider";

export type CalendarViewType = "month" | "week" | "day" | "agenda";

interface CalendarToolbarProps {
  currentDate: Date;
  viewType: CalendarViewType;
  onViewTypeChange: (view: CalendarViewType) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  filterType: "all" | "tasks" | "meetings";
  onFilterTypeChange: (val: "all" | "tasks" | "meetings") => void;
}

export function CalendarToolbar({
  currentDate,
  viewType,
  onViewTypeChange,
  onPrev,
  onNext,
  onToday,
  filterType,
  onFilterTypeChange,
}: CalendarToolbarProps) {
  const { openTaskDrawer, openMeetingDrawer } = useCRM();

  // Format header title based on viewType
  const getHeaderTitle = () => {
    const month = currentDate.toLocaleDateString("en-US", { month: "long" });
    const year = currentDate.getFullYear();

    if (viewType === "month") {
      return `${month} ${year}`;
    }

    if (viewType === "day") {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    if (viewType === "week") {
      const curr = new Date(currentDate);
      const firstDay = new Date(curr.setDate(curr.getDate() - curr.getDay()));
      const lastDay = new Date(curr.setDate(curr.getDate() + 6));
      return `${firstDay.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} – ${lastDay.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }

    return `Schedule & Agenda · ${month} ${year}`;
  };

  return (
    <div className="bl-calendar-toolbar bl-between">
      {/* Left: Navigation and Date */}
      <div className="bl-cal-nav-group">
        <button
          type="button"
          className="bl-secondary bl-btn-xs"
          onClick={onToday}
        >
          Today
        </button>

        <div className="bl-cal-arrows">
          <button
            type="button"
            className="bl-icon-xs"
            onClick={onPrev}
            aria-label="Previous period"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="bl-icon-xs"
            onClick={onNext}
            aria-label="Next period"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <h2 className="bl-cal-title">{getHeaderTitle()}</h2>
      </div>

      {/* Center: Filter by Events / Tasks / Meetings */}
      <div className="bl-cal-filters">
        <select
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value as any)}
          className="bl-filter-select bl-select-sm"
          aria-label="Filter calendar events"
        >
          <option value="all">All Events & Tasks</option>
          <option value="meetings">Meetings Only</option>
          <option value="tasks">Tasks Only</option>
        </select>
      </div>

      {/* Right: View Type Switcher */}
      <div className="bl-cal-view-group" role="radiogroup" aria-label="Calendar view">
        <button
          type="button"
          className={`bl-view-tab ${viewType === "month" ? "active" : ""}`}
          onClick={() => onViewTypeChange("month")}
          role="radio"
          aria-checked={viewType === "month"}
        >
          <CalendarDays size={13} />
          <span>Month</span>
        </button>

        <button
          type="button"
          className={`bl-view-tab ${viewType === "week" ? "active" : ""}`}
          onClick={() => onViewTypeChange("week")}
          role="radio"
          aria-checked={viewType === "week"}
        >
          <Calendar size={13} />
          <span>Week</span>
        </button>

        <button
          type="button"
          className={`bl-view-tab ${viewType === "day" ? "active" : ""}`}
          onClick={() => onViewTypeChange("day")}
          role="radio"
          aria-checked={viewType === "day"}
        >
          <Clock size={13} />
          <span>Day</span>
        </button>

        <button
          type="button"
          className={`bl-view-tab ${viewType === "agenda" ? "active" : ""}`}
          onClick={() => onViewTypeChange("agenda")}
          role="radio"
          aria-checked={viewType === "agenda"}
        >
          <List size={13} />
          <span>Agenda</span>
        </button>
      </div>
    </div>
  );
}
