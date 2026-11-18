"use client";

import React, { useState } from "react";
import { FocusHeader } from "@/components/productivity/FocusHeader";
import { DailyMomentum } from "@/components/productivity/DailyMomentum";
import { FocusMetrics } from "@/components/productivity/FocusMetrics";
import { FollowUpIntelligence } from "@/components/productivity/FollowUpIntelligence";
import { TaskFilters, ViewMode } from "@/components/productivity/TaskFilters";
import { TaskList } from "@/components/productivity/TaskList";
import { TaskBoard } from "@/components/productivity/TaskBoard";
import { TaskDrawer } from "@/components/productivity/TaskDrawer";
import { MeetingDrawer } from "@/components/meetings/MeetingDrawer";
import { useCRM } from "@/components/crm/CRMProvider";
import { isTaskOverdue } from "@/components/crm/selectors";

export default function TasksPage() {
  const { tasks } = useCRM();

  const [viewMode, setViewMode] = useState<ViewMode>("focus");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedOwner, setSelectedOwner] = useState("all");

  const todayStr = new Date().toISOString().split("T")[0];

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchEntity = t.entityName?.toLowerCase().includes(q);
      const matchTag = t.tags?.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchEntity && !matchTag) return false;
    }

    // Type filter
    if (selectedType !== "all" && (t.taskType || "follow_up") !== selectedType) {
      return false;
    }

    // Owner filter
    if (selectedOwner !== "all" && t.assignedTo !== selectedOwner) {
      return false;
    }

    // Active pill filter
    if (activeFilter === "today") {
      return t.dueDate === todayStr;
    }
    if (activeFilter === "tomorrow") {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
      return t.dueDate === tomorrow;
    }
    if (activeFilter === "this_week") {
      const nextWeek = new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0];
      return t.dueDate >= todayStr && t.dueDate <= nextWeek;
    }
    if (activeFilter === "overdue") {
      return isTaskOverdue(t, todayStr);
    }
    if (activeFilter === "high") {
      return t.priority === "high" || t.priority === "urgent";
    }
    if (activeFilter === "completed") {
      return t.status === "completed";
    }

    return true;
  });

  return (
    <div className="bl-workspace-page bl-tasks-page">
      {/* Module Sub-Header */}
      <FocusHeader />

      <div className="bl-tasks-main-content">
        {/* Smart Follow-up Recommendation Banner */}
        <FollowUpIntelligence />

        {/* View Mode Content */}
        {viewMode === "focus" && (
          <>
            <div className="bl-focus-top-bento">
              <DailyMomentum
                onFilterSelect={(f) => setActiveFilter(f)}
                activeFilter={activeFilter}
              />
            </div>

            <FocusMetrics />

            <TaskFilters
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              search={search}
              onSearchChange={setSearch}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              selectedOwner={selectedOwner}
              onOwnerChange={setSelectedOwner}
              totalCount={filteredTasks.length}
            />

            <TaskList tasks={filteredTasks} filterMode={activeFilter} />
          </>
        )}

        {viewMode === "list" && (
          <>
            <FocusMetrics />

            <TaskFilters
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              search={search}
              onSearchChange={setSearch}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              selectedOwner={selectedOwner}
              onOwnerChange={setSelectedOwner}
              totalCount={filteredTasks.length}
            />

            <TaskList tasks={filteredTasks} filterMode={activeFilter} />
          </>
        )}

        {viewMode === "board" && (
          <>
            <TaskFilters
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              search={search}
              onSearchChange={setSearch}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              selectedOwner={selectedOwner}
              onOwnerChange={setSelectedOwner}
              totalCount={filteredTasks.length}
            />

            <TaskBoard tasks={filteredTasks} />
          </>
        )}
      </div>

      {/* Contextual Drawers */}
      <TaskDrawer />
      <MeetingDrawer />
    </div>
  );
}
