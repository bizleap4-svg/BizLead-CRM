"use client";

import React from "react";
import {
  Calendar,
  Clock,
  Video,
  CheckSquare,
  User,
  AlertTriangle,
  Inbox,
  ArrowRight,
} from "lucide-react";
import { CRMMeeting, CRMTask } from "../crm/types";
import { formatTaskTime, isTaskOverdue } from "../crm/selectors";
import { useCRM } from "../crm/CRMProvider";

interface AgendaViewProps {
  tasks: CRMTask[];
  meetings: CRMMeeting[];
}

export function AgendaView({ tasks, meetings }: AgendaViewProps) {
  const { openTaskDrawer, openMeetingDrawer, toggleTask } = useCRM();
  const todayStr = new Date().toISOString().split("T")[0];

  // Group events by date
  type AgendaItem = {
    id: string;
    type: "meeting" | "task";
    title: string;
    date: string;
    time?: string;
    entityName?: string;
    entityType?: string;
    priority?: string;
    status: string;
    raw: CRMMeeting | CRMTask;
  };

  const allItems: AgendaItem[] = [
    ...meetings.map((m) => ({
      id: m.id,
      type: "meeting" as const,
      title: m.title,
      date: m.date,
      time: m.startTime,
      entityName: m.relatedEntityName,
      entityType: m.contactId ? "Contact" : m.dealId ? "Deal" : "Meeting",
      status: m.status,
      raw: m,
    })),
    ...tasks.map((t) => ({
      id: t.id,
      type: "task" as const,
      title: t.title,
      date: t.dueDate,
      time: t.dueTime,
      entityName: t.entityName,
      entityType: t.entityType,
      priority: t.priority,
      status: t.status,
      raw: t,
    })),
  ];

  // Sort ascending by date, then time
  allItems.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.time || "23:59").localeCompare(b.time || "23:59");
  });

  // Group by date
  const grouped: Record<string, AgendaItem[]> = {};
  for (const item of allItems) {
    if (!grouped[item.date]) grouped[item.date] = [];
    grouped[item.date].push(item);
  }

  const dateKeys = Object.keys(grouped).sort();

  if (dateKeys.length === 0) {
    return (
      <div className="bl-empty-tasks-state">
        <Inbox size={32} />
        <h3>No agenda items</h3>
        <p>Your calendar is completely clear.</p>
      </div>
    );
  }

  return (
    <div className="bl-agenda-view">
      {dateKeys.map((dateKey) => {
        const items = grouped[dateKey];
        const isToday = dateKey === todayStr;
        const isPast = dateKey < todayStr;

        const dateObj = new Date(`${dateKey}T00:00:00`);
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        return (
          <div
            key={dateKey}
            className={`bl-agenda-date-group ${isToday ? "today" : ""} ${
              isPast ? "past" : ""
            }`}
          >
            <div className="bl-agenda-date-header bl-between">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={15} />
                <span className="bl-agenda-date-title">{formattedDate}</span>
                {isToday && <span className="bl-badge-yellow">Today</span>}
                {isPast && <span className="bl-badge-muted">Past</span>}
              </div>
              <span className="bl-agenda-count-badge">
                {items.length} item{items.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="bl-agenda-items-list">
              {items.map((item) => {
                const isMeeting = item.type === "meeting";
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={`bl-agenda-item-card ${item.type} ${
                      item.status === "completed" ? "completed" : ""
                    }`}
                    onClick={() => {
                      if (isMeeting) {
                        openMeetingDrawer(item.id);
                      } else {
                        openTaskDrawer(item.id);
                      }
                    }}
                  >
                    <div className="bl-agenda-item-left">
                      <div className={`bl-agenda-icon-wrap ${item.type}`}>
                        {isMeeting ? <Video size={15} /> : <CheckSquare size={15} />}
                      </div>

                      <div className="bl-agenda-item-details">
                        <div className="bl-agenda-item-top">
                          <span className="bl-agenda-item-time">
                            <Clock size={11} />
                            <span>
                              {item.time ? formatTaskTime(item.time) : "All Day"}
                            </span>
                          </span>

                          <span className={`bl-task-type-badge ${isMeeting ? "meeting" : (item.raw as CRMTask).taskType || "follow_up"}`}>
                            {isMeeting ? "Meeting" : (item.raw as CRMTask).taskType || "Task"}
                          </span>

                          {item.priority && (
                            <span className={`bl-task-priority-pill ${item.priority}`}>
                              {item.priority}
                            </span>
                          )}
                        </div>

                        <h4 className="bl-agenda-item-title">{item.title}</h4>

                        {item.entityName && (
                          <div className="bl-agenda-entity-chip">
                            <span>{item.entityType}: </span>
                            <strong>{item.entityName}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bl-agenda-item-right">
                      {!isMeeting && (
                        <button
                          type="button"
                          className="bl-secondary bl-btn-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTask(item.id);
                          }}
                        >
                          {item.status === "completed" ? "Completed" : "Mark Done"}
                        </button>
                      )}
                      <ArrowRight size={14} className="bl-agenda-arrow" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
