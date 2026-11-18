"use client";

import React from "react";
import {
  Search,
  Filter,
  LayoutList,
  Columns,
  Sparkles,
  CheckCircle,
  Clock,
  Flame,
  Calendar,
} from "lucide-react";

export type ViewMode = "focus" | "list" | "board";

interface TaskFiltersProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  search: string;
  onSearchChange: (val: string) => void;
  activeFilter: string;
  onFilterChange: (val: string) => void;
  selectedType: string;
  onTypeChange: (val: string) => void;
  selectedOwner: string;
  onOwnerChange: (val: string) => void;
  totalCount: number;
}

export function TaskFilters({
  viewMode,
  onViewModeChange,
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
  selectedType,
  onTypeChange,
  selectedOwner,
  onOwnerChange,
  totalCount,
}: TaskFiltersProps) {
  const filterPills = [
    { id: "all", label: "All Items" },
    { id: "today", label: "Today" },
    { id: "tomorrow", label: "Tomorrow" },
    { id: "this_week", label: "This Week" },
    { id: "overdue", label: "Overdue" },
    { id: "high", label: "High Priority" },
    { id: "completed", label: "Completed" },
  ];

  const taskTypes = [
    { id: "all", label: "All Types" },
    { id: "follow_up", label: "Follow-up" },
    { id: "call", label: "Call" },
    { id: "whatsapp", label: "WhatsApp" },
    { id: "email", label: "Email" },
    { id: "meeting_prep", label: "Meeting Prep" },
    { id: "proposal", label: "Proposal" },
    { id: "payment_reminder", label: "Payment Reminder" },
  ];

  const owners = [
    { id: "all", label: "All Executives" },
    { id: "Sales Executive A", label: "Sales Executive A" },
    { id: "Sales Executive B", label: "Sales Executive B" },
    { id: "Sales Executive C", label: "Sales Executive C" },
  ];

  return (
    <div className="bl-task-filters-bar">
      <div className="bl-task-filters-top bl-between">
        {/* Search */}
        <div className="bl-task-search-wrap">
          <Search size={15} className="bl-search-icon" />
          <input
            type="text"
            placeholder="Search tasks by title, contact, deal or tags..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bl-task-search-input"
          />
          {search && (
            <button
              type="button"
              className="bl-clear-search-btn"
              onClick={() => onSearchChange("")}
            >
              Clear
            </button>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="bl-view-switcher" role="radiogroup" aria-label="Task view mode">
          <button
            type="button"
            className={`bl-view-tab ${viewMode === "focus" ? "active" : ""}`}
            onClick={() => onViewModeChange("focus")}
            title="Focus Mode (Bento + Priorities)"
            aria-checked={viewMode === "focus"}
            role="radio"
          >
            <Sparkles size={14} />
            <span>Focus</span>
          </button>
          <button
            type="button"
            className={`bl-view-tab ${viewMode === "list" ? "active" : ""}`}
            onClick={() => onViewModeChange("list")}
            title="List View (Detailed table)"
            aria-checked={viewMode === "list"}
            role="radio"
          >
            <LayoutList size={14} />
            <span>List</span>
          </button>
          <button
            type="button"
            className={`bl-view-tab ${viewMode === "board" ? "active" : ""}`}
            onClick={() => onViewModeChange("board")}
            title="Kanban Board View"
            aria-checked={viewMode === "board"}
            role="radio"
          >
            <Columns size={14} />
            <span>Board</span>
          </button>
        </div>
      </div>

      <div className="bl-task-filters-bottom bl-between">
        {/* Quick Filter Pills */}
        <div className="bl-filter-pills-row">
          {filterPills.map((pill) => (
            <button
              key={pill.id}
              type="button"
              className={`bl-filter-pill ${activeFilter === pill.id ? "active" : ""}`}
              onClick={() => onFilterChange(pill.id)}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div className="bl-filter-dropdowns">
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="bl-filter-select"
            aria-label="Filter by task type"
          >
            {taskTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

          <select
            value={selectedOwner}
            onChange={(e) => onOwnerChange(e.target.value)}
            className="bl-filter-select"
            aria-label="Filter by executive"
          >
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
