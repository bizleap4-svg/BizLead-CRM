"use client";

import React, { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Download,
  LayoutGrid,
  Table as TableIcon,
  Plus,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import { PipelineStage, DealPriority } from "@/components/crm/types";

export interface FilterState {
  search: string;
  stage: string;
  owner: string;
  source: string;
  priority: string;
  sortBy: "value-desc" | "value-asc" | "date-asc" | "date-desc" | "score-desc";
}

interface PipelineFiltersProps {
  viewMode: "kanban" | "table";
  onChangeViewMode: (mode: "kanban" | "table") => void;
  filters: FilterState;
  onChangeFilters: (filters: FilterState) => void;
  stages: PipelineStage[];
  owners: string[];
  sources: string[];
  onOpenCreateModal: () => void;
  onExportCSV: () => void;
  filteredCount: number;
  totalCount: number;
}

export function PipelineFilters({
  viewMode,
  onChangeViewMode,
  filters,
  onChangeFilters,
  stages,
  owners,
  sources,
  onOpenCreateModal,
  onExportCSV,
  filteredCount,
  totalCount,
}: PipelineFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFieldChange = (field: keyof FilterState, value: string) => {
    onChangeFilters({
      ...filters,
      [field]: value,
    });
  };

  const handleResetFilters = () => {
    onChangeFilters({
      search: "",
      stage: "all",
      owner: "all",
      source: "all",
      priority: "all",
      sortBy: "value-desc",
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.stage !== "all" ||
    filters.owner !== "all" ||
    filters.source !== "all" ||
    filters.priority !== "all";

  return (
    <div className="bl-pipeline-toolbar-container">
      <div className="bl-toolbar" style={{ padding: "14px 0", gap: "10px" }}>
        {/* Search */}
        <div className="bl-search" style={{ minWidth: "220px" }}>
          <Search size={16} />
          <input
            placeholder="Search deals, companies, contacts..."
            value={filters.search}
            onChange={(e) => handleFieldChange("search", e.target.value)}
            aria-label="Search deals"
          />
        </div>

        {/* View Mode Toggle: Kanban vs Table */}
        <div className="bl-view-toggle-group">
          <button
            type="button"
            className={`bl-view-toggle-btn ${viewMode === "kanban" ? "active" : ""}`}
            onClick={() => onChangeViewMode("kanban")}
            title="Kanban Board View"
            aria-label="Kanban Board View"
          >
            <LayoutGrid size={15} />
            <span>Board</span>
          </button>
          <button
            type="button"
            className={`bl-view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
            onClick={() => onChangeViewMode("table")}
            title="Compact Table View"
            aria-label="Compact Table View"
          >
            <TableIcon size={15} />
            <span>Table</span>
          </button>
        </div>

        {/* Filter Toggle */}
        <button
          type="button"
          className={`bl-secondary ${showAdvanced || hasActiveFilters ? "bl-filter-active" : ""}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
          aria-expanded={showAdvanced}
        >
          <SlidersHorizontal size={15} />
          <span>Filters</span>
          {hasActiveFilters && <span className="bl-filter-dot" />}
        </button>

        {/* Sort selector */}
        <div className="bl-sort-select-wrapper">
          <select
            value={filters.sortBy}
            onChange={(e) => handleFieldChange("sortBy", e.target.value)}
            className="bl-sort-select"
            aria-label="Sort deals"
          >
            <option value="value-desc">Highest Deal Value</option>
            <option value="value-asc">Lowest Deal Value</option>
            <option value="date-asc">Close Date (Soonest)</option>
            <option value="date-desc">Close Date (Latest)</option>
            <option value="score-desc">Lead Score (Highest)</option>
          </select>
        </div>

        {/* Export CSV */}
        <button
          type="button"
          className="bl-secondary bl-export-btn"
          onClick={onExportCSV}
          title="Export CSV"
        >
          <Download size={15} />
          <span>Export</span>
        </button>

        {/* Add Deal Button */}
        <button
          type="button"
          className="bl-primary bl-new-deal-btn"
          onClick={onOpenCreateModal}
        >
          <Plus size={16} />
          <span>Add Deal</span>
        </button>
      </div>

      {/* Advanced Filters Expandable Row */}
      {showAdvanced && (
        <div className="bl-filter-row" style={{ padding: "10px 0 16px 0", borderBottom: "1px solid var(--border)" }}>
          {/* Stage Filter */}
          <select
            value={filters.stage}
            onChange={(e) => handleFieldChange("stage", e.target.value)}
            aria-label="Filter by stage"
          >
            <option value="all">All Stages</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                Stage: {s.name}
              </option>
            ))}
          </select>

          {/* Owner Filter */}
          <select
            value={filters.owner}
            onChange={(e) => handleFieldChange("owner", e.target.value)}
            aria-label="Filter by owner"
          >
            <option value="all">All Owners</option>
            {owners.map((o) => (
              <option key={o} value={o}>
                Owner: {o}
              </option>
            ))}
          </select>

          {/* Source Filter */}
          <select
            value={filters.source}
            onChange={(e) => handleFieldChange("source", e.target.value)}
            aria-label="Filter by source"
          >
            <option value="all">All Sources</option>
            {sources.map((src) => (
              <option key={src} value={src}>
                Source: {src}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => handleFieldChange("priority", e.target.value)}
            aria-label="Filter by priority"
          >
            <option value="all">All Priorities</option>
            <option value="high">Priority: High</option>
            <option value="medium">Priority: Medium</option>
            <option value="low">Priority: Low</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              className="bl-secondary"
              onClick={handleResetFilters}
              style={{ fontSize: "11px", padding: "6px 12px" }}
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}

          <div style={{ marginLeft: "auto", fontSize: "12px", color: "var(--muted)" }}>
            Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> opportunities
          </div>
        </div>
      )}
    </div>
  );
}

export default PipelineFilters;
