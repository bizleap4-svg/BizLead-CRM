"use client";

import React, { useState } from "react";
import { Plus, ArrowRight, ArrowLeft } from "lucide-react";
import { CRMTask, TaskStatus } from "../crm/types";
import { TaskCard } from "./TaskCard";
import { useCRM } from "../crm/CRMProvider";

interface TaskBoardProps {
  tasks: CRMTask[];
  onEditTask?: (task: CRMTask) => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "#64748b" },
  { id: "in_progress", label: "In Progress", color: "#3b82f6" },
  { id: "waiting", label: "Waiting / Blocked", color: "#f59e0b" },
  { id: "completed", label: "Completed", color: "#10b981" },
];

export function TaskBoard({ tasks, onEditTask }: TaskBoardProps) {
  const { updateTask, openTaskDrawer } = useCRM();
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggingTaskId;
    if (!taskId) return;
    setDraggingTaskId(null);

    await updateTask(taskId, {
      status: targetStatus,
      completedAt: targetStatus === "completed" ? new Date().toISOString() : undefined,
    });
  };

  const moveTask = async (taskId: string, targetStatus: TaskStatus) => {
    await updateTask(taskId, {
      status: targetStatus,
      completedAt: targetStatus === "completed" ? new Date().toISOString() : undefined,
    });
  };

  return (
    <div className="bl-task-board">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => {
          if (col.id === "todo") {
            return t.status === "todo" || t.status === "pending" || !t.status;
          }
          return t.status === col.id;
        });

        return (
          <div
            key={col.id}
            className="bl-task-board-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="bl-task-column-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  className="bl-column-indicator"
                  style={{ background: col.color }}
                />
                <h4 className="bl-column-title">{col.label}</h4>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="bl-column-count">{columnTasks.length}</span>
                <button
                  type="button"
                  className="bl-icon-btn-xs"
                  onClick={() => openTaskDrawer(undefined, { status: col.id })}
                  title={`Add task to ${col.label}`}
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            <div className="bl-task-column-body">
              {columnTasks.length === 0 ? (
                <div className="bl-task-column-empty">
                  <span>No tasks in {col.label}</span>
                </div>
              ) : (
                columnTasks.map((t) => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, t.id)}
                    className="bl-board-card-wrapper"
                  >
                    <TaskCard task={t} onEdit={onEditTask} compact />
                    <div className="bl-board-card-moves">
                      {col.id !== "todo" && (
                        <button
                          type="button"
                          className="bl-board-move-btn"
                          title="Move left"
                          onClick={() => {
                            const prevStatus: Record<string, TaskStatus> = {
                              completed: "waiting",
                              waiting: "in_progress",
                              in_progress: "todo",
                            };
                            if (prevStatus[col.id]) moveTask(t.id, prevStatus[col.id]);
                          }}
                        >
                          <ArrowLeft size={11} />
                        </button>
                      )}
                      {col.id !== "completed" && (
                        <button
                          type="button"
                          className="bl-board-move-btn"
                          title="Move right"
                          onClick={() => {
                            const nextStatus: Record<string, TaskStatus> = {
                              todo: "in_progress",
                              in_progress: "waiting",
                              waiting: "completed",
                            };
                            if (nextStatus[col.id]) moveTask(t.id, nextStatus[col.id]);
                          }}
                        >
                          <ArrowRight size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
