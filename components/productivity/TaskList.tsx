"use client";

import React from "react";
import { AlertCircle, Calendar, CheckCircle2, Inbox } from "lucide-react";
import { CRMTask } from "../crm/types";
import { TaskCard } from "./TaskCard";
import { isTaskOverdue } from "../crm/selectors";

interface TaskListProps {
  tasks: CRMTask[];
  onEditTask?: (task: CRMTask) => void;
  filterMode?: string;
}

export function TaskList({ tasks, onEditTask, filterMode }: TaskListProps) {
  const today = new Date().toISOString().split("T")[0];

  // Partition tasks into sections
  const overdueTasks = tasks.filter((t) => isTaskOverdue(t, today));
  const todayTasks = tasks.filter(
    (t) => t.dueDate === today && t.status !== "completed" && t.status !== "cancelled"
  );
  const upcomingTasks = tasks.filter(
    (t) => t.dueDate > today && t.status !== "completed" && t.status !== "cancelled"
  );
  const completedTasks = tasks.filter(
    (t) => t.status === "completed" || t.status === "cancelled"
  );

  if (tasks.length === 0) {
    return (
      <div className="bl-empty-tasks-state">
        <div className="bl-empty-icon-wrap">
          <Inbox size={32} />
        </div>
        <h3>No tasks found</h3>
        <p>No action items match your current filter or search criteria.</p>
      </div>
    );
  }

  // If user selected a specific filter (like "overdue" or "completed"), render just that group
  if (filterMode === "overdue" || filterMode === "today" || filterMode === "completed") {
    return (
      <div className="bl-task-list-simple">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEditTask} />
        ))}
      </div>
    );
  }

  return (
    <div className="bl-task-groups-container">
      {/* 1. Overdue Section */}
      {overdueTasks.length > 0 && (
        <section className="bl-task-section overdue">
          <div className="bl-task-section-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={16} className="text-red-500" />
              <h3 className="bl-task-section-title">Overdue Action Items</h3>
            </div>
            <span className="bl-task-section-count danger">
              {overdueTasks.length}
            </span>
          </div>
          <div className="bl-task-section-list">
            {overdueTasks.map((t) => (
              <TaskCard key={t.id} task={t} onEdit={onEditTask} />
            ))}
          </div>
        </section>
      )}

      {/* 2. Today's Section */}
      {todayTasks.length > 0 && (
        <section className="bl-task-section today">
          <div className="bl-task-section-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={16} style={{ color: "var(--accent)" }} />
              <h3 className="bl-task-section-title">Today's Priorities</h3>
            </div>
            <span className="bl-task-section-count accent">
              {todayTasks.length}
            </span>
          </div>
          <div className="bl-task-section-list">
            {todayTasks.map((t) => (
              <TaskCard key={t.id} task={t} onEdit={onEditTask} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Upcoming Section */}
      {upcomingTasks.length > 0 && (
        <section className="bl-task-section upcoming">
          <div className="bl-task-section-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={16} className="text-blue-500" />
              <h3 className="bl-task-section-title">Upcoming</h3>
            </div>
            <span className="bl-task-section-count muted">
              {upcomingTasks.length}
            </span>
          </div>
          <div className="bl-task-section-list">
            {upcomingTasks.map((t) => (
              <TaskCard key={t.id} task={t} onEdit={onEditTask} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Completed Section */}
      {completedTasks.length > 0 && (
        <section className="bl-task-section completed">
          <div className="bl-task-section-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={16} className="text-emerald-500" />
              <h3 className="bl-task-section-title">Completed</h3>
            </div>
            <span className="bl-task-section-count success">
              {completedTasks.length}
            </span>
          </div>
          <div className="bl-task-section-list">
            {completedTasks.map((t) => (
              <TaskCard key={t.id} task={t} onEdit={onEditTask} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
