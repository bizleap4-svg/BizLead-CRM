"use client";

import React, { useState, useEffect } from "react";
import { Plus, CheckCircle2, Circle, Calendar, Trash2, Check, Clock } from "lucide-react";
import { CRMTask } from "@/components/crm/types";
import { useCRM } from "@/components/crm/CRMProvider";

interface TasksManagerProps {
  entityType: "contact" | "company" | "lead" | "deal";
  entityId: string;
  entityName: string;
}

export function TasksManager({
  entityType,
  entityId,
  entityName,
}: TasksManagerProps) {
  const { getTasksFor, createTask, toggleTask, deleteTask } = useCRM();
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]
  );
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchTasks = async () => {
    const list = await getTasksFor(entityType, entityId);
    setTasks(list);
  };

  useEffect(() => {
    fetchTasks();
  }, [entityId, entityType]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await createTask({
      entityType,
      entityId,
      title: newTitle.trim(),
      dueDate: newDueDate,
      priority: newPriority,
      status: "pending",
      assignedTo: "Sales Executive A",
    });

    setNewTitle("");
    setShowAddForm(false);
    await fetchTasks();
  };

  const handleToggle = async (id: string) => {
    await toggleTask(id);
    await fetchTasks();
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    await fetchTasks();
  };

  return (
    <div className="bl-tasks-container">
      {/* Top Header */}
      <div className="bl-between" style={{ marginBottom: "14px" }}>
        <div>
          <strong style={{ fontSize: "13px" }}>Action Items & Follow-ups</strong>
          <span style={{ fontSize: "11px", color: "var(--muted)", display: "block" }}>
            Scheduled reminders for {entityName}
          </span>
        </div>

        <button
          type="button"
          className="bl-secondary bl-btn-sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={14} /> Add Task
        </button>
      </div>

      {/* Add Task Inline Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bl-task-form">
          <input
            required
            placeholder="e.g. Schedule follow-up call regarding commercial proposal..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <div className="bl-between" style={{ marginTop: "10px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                style={{ fontSize: "11px", padding: "5px 8px" }}
              />
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                style={{ fontSize: "11px", padding: "5px 8px" }}
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                className="bl-secondary bl-btn-sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="bl-primary bl-btn-sm">
                Save Task
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tasks List */}
      <div className="bl-tasks-list">
        {tasks.map((task) => {
          const isDone = task.status === "completed";
          return (
            <article
              key={task.id}
              className={`bl-task-item ${isDone ? "is-completed" : ""}`}
            >
              <button
                type="button"
                className="bl-task-checkbox"
                onClick={() => handleToggle(task.id)}
                aria-label={isDone ? "Mark pending" : "Mark complete"}
              >
                {isDone ? (
                  <CheckCircle2 size={16} style={{ color: "#16825B" }} />
                ) : (
                  <Circle size={16} opacity={0.5} />
                )}
              </button>

              <div className="bl-task-content">
                <span
                  className="bl-task-title"
                  style={{ textDecoration: isDone ? "line-through" : "none" }}
                >
                  {task.title}
                </span>
                <div className="bl-task-meta">
                  <span className="bl-task-date">
                    <Calendar size={11} /> {task.dueDate}
                  </span>
                  <span
                    className={`bl-priority-pill bl-p-${task.priority}`}
                    style={{ fontSize: "9px" }}
                  >
                    {task.priority}
                  </span>
                  <span>Assigned: {task.assignedTo}</span>
                </div>
              </div>

              <button
                type="button"
                className="bl-icon bl-icon-sm"
                onClick={() => handleDelete(task.id)}
                title="Delete task"
                aria-label="Delete task"
              >
                <Trash2 size={13} />
              </button>
            </article>
          );
        })}

        {tasks.length === 0 && !showAddForm && (
          <div className="bl-empty-stream">
            <Clock size={24} opacity={0.4} />
            <p>No open tasks for {entityName}. All caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TasksManager;
