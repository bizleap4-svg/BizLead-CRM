"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Plus,
  Trash2,
  CheckSquare,
  Repeat,
  Bell,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";
import { useCRM } from "../crm/CRMProvider";
import { CRMTask, TaskPriority, TaskStatus, TaskType } from "../crm/types";

export function TaskDrawer() {
  const {
    isTaskDrawerOpen,
    taskDrawerTaskId,
    taskDrawerPrefill,
    closeTaskDrawer,
    tasks,
    leads,
    contacts,
    companies,
    deals,
    createTask,
    updateTask,
    deleteTask,
  } = useCRM();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("follow_up");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueTime, setDueTime] = useState("10:00");
  const [assignedTo, setAssignedTo] = useState("Sales Executive A");

  // CRM Entity Relation
  const [entityType, setEntityType] = useState<
    "lead" | "contact" | "company" | "deal" | "none"
  >("lead");
  const [entityId, setEntityId] = useState("");
  const [entityName, setEntityName] = useState("");

  // Checklist
  const [checklist, setChecklist] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newChecklistText, setNewChecklistText] = useState("");

  // Recurrence
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFreq, setRecurrenceFreq] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [reminderMinutes, setReminderMinutes] = useState<number>(30);

  const [saving, setSaving] = useState(false);

  // Load existing task or prefill when opened
  useEffect(() => {
    if (!isTaskDrawerOpen) return;

    if (taskDrawerTaskId) {
      const existing = tasks.find((t) => t.id === taskDrawerTaskId);
      if (existing) {
        setTitle(existing.title || "");
        setDescription(existing.description || "");
        setTaskType(existing.taskType || "follow_up");
        setPriority(existing.priority || "medium");
        setStatus(existing.status || "todo");
        setDueDate(existing.dueDate || new Date().toISOString().split("T")[0]);
        setDueTime(existing.dueTime || "10:00");
        setAssignedTo(existing.assignedTo || "Sales Executive A");
        setEntityType((existing.entityType as any) || "none");
        setEntityId(existing.entityId || "");
        setEntityName(existing.entityName || "");
        setChecklist(existing.checklist ? [...existing.checklist] : []);
        setIsRecurring(!!existing.recurrenceRule);
        if (existing.recurrenceRule) {
          setRecurrenceFreq((existing.recurrenceRule.frequency as any) || "weekly");
        }
        setReminderMinutes(existing.reminderMinutesBefore ?? 30);
        return;
      }
    }

    // New task with prefill
    setTitle(taskDrawerPrefill?.title || "");
    setDescription(taskDrawerPrefill?.description || "");
    setTaskType(taskDrawerPrefill?.taskType || "follow_up");
    setPriority(taskDrawerPrefill?.priority || "medium");
    setStatus(taskDrawerPrefill?.status || "todo");
    setDueDate(taskDrawerPrefill?.dueDate || new Date().toISOString().split("T")[0]);
    setDueTime(taskDrawerPrefill?.dueTime || "10:00");
    setAssignedTo(taskDrawerPrefill?.assignedTo || "Sales Executive A");
    setEntityType((taskDrawerPrefill?.entityType as any) || (leads.length > 0 ? "lead" : "none"));
    setEntityId(taskDrawerPrefill?.entityId || (leads[0]?.id || ""));
    setEntityName(taskDrawerPrefill?.entityName || (leads[0]?.name || ""));
    setChecklist([]);
    setIsRecurring(false);
    setReminderMinutes(30);
  }, [isTaskDrawerOpen, taskDrawerTaskId, taskDrawerPrefill, tasks, leads]);

  if (!isTaskDrawerOpen) return null;

  const handleEntitySelection = (id: string) => {
    setEntityId(id);
    if (entityType === "lead") {
      const match = leads.find((l) => l.id === id);
      if (match) setEntityName(match.name);
    } else if (entityType === "contact") {
      const match = contacts.find((c) => c.id === id);
      if (match) setEntityName(match.name);
    } else if (entityType === "company") {
      const match = companies.find((c) => c.id === id);
      if (match) setEntityName(match.name);
    } else if (entityType === "deal") {
      const match = deals.find((d) => d.id === id);
      if (match) setEntityName(match.title);
    }
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    setChecklist([
      ...checklist,
      {
        id: `chk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: newChecklistText.trim(),
        completed: false,
      },
    ]);
    setNewChecklistText("");
  };

  const handleToggleChecklist = (id: string) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDeleteChecklist = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const payload: Partial<CRMTask> & { title: string } = {
        title: title.trim(),
        description: description.trim() || undefined,
        taskType,
        priority,
        status,
        dueDate,
        dueTime,
        assignedTo,
        entityType: entityType !== "none" ? entityType : undefined,
        entityId: entityType !== "none" ? entityId : undefined,
        entityName: entityType !== "none" ? entityName : undefined,
        checklist,
        reminderMinutesBefore: reminderMinutes,
        recurrenceRule: isRecurring
          ? {
              frequency: recurrenceFreq,
              interval: 1,
            }
          : undefined,
      };

      if (taskDrawerTaskId) {
        await updateTask(taskDrawerTaskId, payload);
      } else {
        await createTask(payload);
      }
      closeTaskDrawer();
    } catch (err) {
      console.error("Save task failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!taskDrawerTaskId) return;
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTask(taskDrawerTaskId);
      closeTaskDrawer();
    }
  };

  return (
    <div className="bl-drawer-backdrop" onClick={closeTaskDrawer}>
      <aside
        className="bl-drawer bl-task-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-drawer-title"
      >
        <div className="bl-drawer-header bl-between">
          <div>
            <div className="bl-eyebrow">
              {taskDrawerTaskId ? "EDIT TASK" : "CREATE TASK"}
            </div>
            <h2 id="task-drawer-title">
              {taskDrawerTaskId ? "Task Details" : "New Action Item"}
            </h2>
          </div>

          <button
            type="button"
            className="bl-icon"
            onClick={closeTaskDrawer}
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="bl-drawer-form">
          {/* Title */}
          <div className="bl-field-group">
            <label htmlFor="task-title">
              Task Title <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              id="task-title"
              type="text"
              required
              placeholder="e.g. Follow up on enterprise proposal revisions..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bl-input"
            />
          </div>

          {/* Row: Type & Priority */}
          <div className="bl-fields-row">
            <div className="bl-field-group" style={{ flex: 1 }}>
              <label htmlFor="task-type">Task Type</label>
              <select
                id="task-type"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="bl-select"
              >
                <option value="follow_up">Follow-up</option>
                <option value="call">Phone Call</option>
                <option value="whatsapp">WhatsApp Message</option>
                <option value="email">Email</option>
                <option value="meeting_prep">Meeting Preparation</option>
                <option value="proposal">Commercial Proposal</option>
                <option value="payment_reminder">Payment Reminder</option>
                <option value="internal">Internal Note</option>
              </select>
            </div>

            <div className="bl-field-group" style={{ flex: 1 }}>
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="bl-select"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Row: Due Date & Time */}
          <div className="bl-fields-row">
            <div className="bl-field-group" style={{ flex: 1 }}>
              <label htmlFor="task-due-date">Due Date</label>
              <input
                id="task-due-date"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bl-input"
              />
            </div>

            <div className="bl-field-group" style={{ flex: 1 }}>
              <label htmlFor="task-due-time">Due Time</label>
              <input
                id="task-due-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="bl-input"
              />
            </div>
          </div>

          {/* Row: Status & Assignee */}
          <div className="bl-fields-row">
            <div className="bl-field-group" style={{ flex: 1 }}>
              <label htmlFor="task-status">Status</label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="bl-select"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting">Waiting</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="bl-field-group" style={{ flex: 1 }}>
              <label htmlFor="task-assignee">Assigned To</label>
              <select
                id="task-assignee"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="bl-select"
              >
                <option value="Sales Executive A">Sales Executive A</option>
                <option value="Sales Executive B">Sales Executive B</option>
                <option value="Sales Executive C">Sales Executive C</option>
              </select>
            </div>
          </div>

          {/* CRM Entity Linking */}
          <div className="bl-field-group">
            <label>Link to CRM Record</label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <select
                value={entityType}
                onChange={(e) => {
                  const newType = e.target.value as any;
                  setEntityType(newType);
                  if (newType === "lead" && leads[0]) {
                    setEntityId(leads[0].id);
                    setEntityName(leads[0].name);
                  } else if (newType === "contact" && contacts[0]) {
                    setEntityId(contacts[0].id);
                    setEntityName(contacts[0].name);
                  } else if (newType === "company" && companies[0]) {
                    setEntityId(companies[0].id);
                    setEntityName(companies[0].name);
                  } else if (newType === "deal" && deals[0]) {
                    setEntityId(deals[0].id);
                    setEntityName(deals[0].title);
                  } else {
                    setEntityId("");
                    setEntityName("");
                  }
                }}
                className="bl-select"
                style={{ width: "120px" }}
              >
                <option value="none">None</option>
                <option value="lead">Lead</option>
                <option value="contact">Contact</option>
                <option value="company">Company</option>
                <option value="deal">Deal</option>
              </select>

              {entityType !== "none" && (
                <select
                  value={entityId}
                  onChange={(e) => handleEntitySelection(e.target.value)}
                  className="bl-select"
                  style={{ flex: 1 }}
                >
                  {entityType === "lead" &&
                    leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} — {l.company || "Individual"}
                      </option>
                    ))}
                  {entityType === "contact" &&
                    contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.email || c.phone}
                      </option>
                    ))}
                  {entityType === "company" &&
                    companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.industry || "General"})
                      </option>
                    ))}
                  {entityType === "deal" &&
                    deals.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title} (₹{d.value?.toLocaleString("en-IN")})
                      </option>
                    ))}
                </select>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bl-field-group">
            <label htmlFor="task-description">Notes & Instructions</label>
            <textarea
              id="task-description"
              rows={3}
              placeholder="Add key context, call notes, or follow-up instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bl-textarea"
            />
          </div>

          {/* Checklist Items */}
          <div className="bl-field-group">
            <label>Sub-tasks & Checklist</label>
            <div className="bl-checklist-items">
              {checklist.map((item) => (
                <div key={item.id} className="bl-checklist-item-row">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleChecklist(item.id)}
                  />
                  <span
                    style={{
                      flex: 1,
                      textDecoration: item.completed ? "line-through" : "none",
                      color: item.completed ? "var(--muted)" : "var(--text)",
                      fontSize: "13px",
                    }}
                  >
                    {item.title}
                  </span>
                  <button
                    type="button"
                    className="bl-icon-xs"
                    onClick={() => handleDeleteChecklist(item.id)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
              <input
                type="text"
                placeholder="Add a checklist item..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChecklistItem(e);
                  }
                }}
                className="bl-input bl-input-sm"
              />
              <button
                type="button"
                className="bl-secondary bl-btn-xs"
                onClick={handleAddChecklistItem}
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          {/* Recurrence & Reminders */}
          <div className="bl-fields-row" style={{ marginTop: "12px" }}>
            <div className="bl-field-group" style={{ flex: 1 }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                />
                <Repeat size={13} />
                <span>Repeat Task</span>
              </label>
              {isRecurring && (
                <select
                  value={recurrenceFreq}
                  onChange={(e) => setRecurrenceFreq(e.target.value as any)}
                  className="bl-select bl-select-sm"
                  style={{ marginTop: "6px" }}
                >
                  <option value="daily">Every Day</option>
                  <option value="weekly">Every Week</option>
                  <option value="monthly">Every Month</option>
                </select>
              )}
            </div>

            <div className="bl-field-group" style={{ flex: 1 }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Bell size={13} />
                <span>Reminder Alert</span>
              </label>
              <select
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(parseInt(e.target.value, 10))}
                className="bl-select bl-select-sm"
                style={{ marginTop: "6px" }}
              >
                <option value={0}>At time of event</option>
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
                <option value={1440}>1 day before</option>
              </select>
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="bl-drawer-actions bl-between" style={{ marginTop: "24px" }}>
            {taskDrawerTaskId ? (
              <button
                type="button"
                className="bl-danger-btn bl-btn-sm"
                onClick={handleDelete}
              >
                <Trash2 size={14} /> Delete
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className="bl-secondary bl-btn-sm"
                onClick={closeTaskDrawer}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bl-accent bl-btn-sm bl-primary-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : taskDrawerTaskId ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}
