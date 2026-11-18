"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Phone,
  MessageSquare,
  Mail,
  FileText,
  Calendar,
  Clock,
  User,
  MoreVertical,
  Repeat,
  CheckSquare,
  Trash2,
  Edit2,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import { CRMTask } from "../crm/types";
import { formatTaskTime, isTaskOverdue } from "../crm/selectors";
import { useCRM } from "../crm/CRMProvider";

interface TaskCardProps {
  task: CRMTask;
  onEdit?: (task: CRMTask) => void;
  compact?: boolean;
}

export function TaskCard({ task, onEdit, compact = false }: TaskCardProps) {
  const { toggleTask, rescheduleTask, deleteTask, openTaskDrawer } = useCRM();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  const isCompleted = task.status === "completed";
  const overdue = isTaskOverdue(task);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (toggling) return;
    setToggling(true);
    try {
      await toggleTask(task.id);
    } finally {
      setToggling(false);
    }
  };

  const handleReschedule = async (days: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    const date = new Date();
    date.setDate(date.getDate() + days);
    const newDateStr = date.toISOString().split("T")[0];
    await rescheduleTask(task.id, newDateStr, task.dueTime);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (window.confirm(`Delete task "${task.title}"?`)) {
      await deleteTask(task.id);
    }
  };

  const getTypeIcon = () => {
    switch (task.taskType) {
      case "call":
        return <Phone size={13} />;
      case "whatsapp":
        return <MessageSquare size={13} />;
      case "email":
        return <Mail size={13} />;
      case "proposal":
        return <FileText size={13} />;
      case "meeting_prep":
        return <CalendarDays size={13} />;
      default:
        return <CheckSquare size={13} />;
    }
  };

  // Format date display
  const today = new Date().toISOString().split("T")[0];
  let dateLabel = task.dueDate;
  if (task.dueDate === today) {
    dateLabel = "Today";
  } else if (
    task.dueDate ===
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  ) {
    dateLabel = "Tomorrow";
  }

  const checklistTotal = task.checklist ? task.checklist.length : 0;
  const checklistDone = task.checklist
    ? task.checklist.filter((i) => i.completed).length
    : 0;

  return (
    <div
      className={`bl-task-card ${isCompleted ? "completed" : ""} ${
        overdue ? "overdue" : ""
      } ${compact ? "compact" : ""}`}
      onClick={() => (onEdit ? onEdit(task) : openTaskDrawer(task.id))}
    >
      <div className="bl-task-card-inner">
        {/* Toggle Checkbox */}
        <button
          type="button"
          className="bl-task-checkbox"
          onClick={handleToggle}
          title={isCompleted ? "Mark incomplete" : "Mark completed"}
          aria-label={isCompleted ? "Mark incomplete" : "Mark completed"}
        >
          {isCompleted ? (
            <CheckCircle2 size={18} className="bl-task-checked-icon" />
          ) : (
            <Circle size={18} className="bl-task-unchecked-icon" />
          )}
        </button>

        {/* Content Body */}
        <div className="bl-task-content">
          <div className="bl-task-header-row">
            <div className="bl-task-badges-row">
              <span className={`bl-task-type-badge ${task.taskType || "follow_up"}`}>
                {getTypeIcon()}
                <span>{task.taskType ? task.taskType.replace("_", " ") : "task"}</span>
              </span>

              <span className={`bl-task-priority-pill ${task.priority}`}>
                {task.priority}
              </span>

              {task.recurrenceRule && (
                <span className="bl-task-badge recurrence" title="Recurring task">
                  <Repeat size={11} />
                  <span>{task.recurrenceRule.frequency}</span>
                </span>
              )}
            </div>

            {/* Quick Menu */}
            <div className="bl-task-menu-container" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="bl-icon bl-task-more-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Task options"
              >
                <MoreVertical size={15} />
              </button>

              {menuOpen && (
                <div className="bl-task-dropdown-menu">
                  <button
                    type="button"
                    onClick={(e) => {
                      setMenuOpen(false);
                      openTaskDrawer(task.id);
                    }}
                  >
                    <Edit2 size={13} /> Edit Details
                  </button>
                  <button type="button" onClick={(e) => handleReschedule(1, e)}>
                    <Clock size={13} /> Postpone to Tomorrow
                  </button>
                  <button type="button" onClick={(e) => handleReschedule(7, e)}>
                    <Calendar size={13} /> Postpone +1 Week
                  </button>
                  <hr style={{ margin: "4px 0", borderColor: "var(--border)" }} />
                  <button
                    type="button"
                    className="danger"
                    onClick={handleDelete}
                  >
                    <Trash2 size={13} /> Delete Task
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bl-task-title-row">
            <span className="bl-task-title">{task.title}</span>
          </div>

          {task.description && !compact && (
            <p className="bl-task-desc">{task.description}</p>
          )}

          {/* Footer Metadata */}
          <div className="bl-task-meta-row">
            <div className="bl-task-meta-left">
              <span className={`bl-task-due ${overdue ? "overdue" : ""}`}>
                {overdue && <AlertTriangle size={12} />}
                <Calendar size={12} />
                <span>{dateLabel}</span>
                {task.dueTime && <span>at {formatTaskTime(task.dueTime)}</span>}
              </span>

              {task.entityName && (
                <span className="bl-task-entity-tag">
                  <span className="type">{task.entityType || "crm"}:</span>
                  <span className="name">{task.entityName}</span>
                </span>
              )}

              {checklistTotal > 0 && (
                <span className="bl-task-checklist-tag">
                  <CheckSquare size={11} />
                  <span>
                    {checklistDone}/{checklistTotal}
                  </span>
                </span>
              )}
            </div>

            <div className="bl-task-meta-right">
              <span className="bl-task-assignee">
                <User size={11} />
                <span>{task.assignedTo || "Sales Exec"}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
