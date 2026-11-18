"use client";

import React from "react";
import { Video, CheckSquare, Clock, AlertTriangle } from "lucide-react";
import { CRMMeeting, CRMTask } from "../crm/types";
import { formatTaskTime } from "../crm/selectors";
import { useCRM } from "../crm/CRMProvider";

interface CalendarEventCardProps {
  item: CRMTask | CRMMeeting;
  type: "task" | "meeting";
  compact?: boolean;
}

export function CalendarEventCard({ item, type, compact = true }: CalendarEventCardProps) {
  const { openTaskDrawer, openMeetingDrawer } = useCRM();

  const isMeeting = type === "meeting";
  const meeting = isMeeting ? (item as CRMMeeting) : null;
  const task = !isMeeting ? (item as CRMTask) : null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMeeting) {
      openMeetingDrawer(item.id);
    } else {
      openTaskDrawer(item.id);
    }
  };

  if (isMeeting && meeting) {
    return (
      <div
        className={`bl-cal-event-chip meeting ${meeting.status}`}
        onClick={handleClick}
        title={`${meeting.title} (${meeting.startTime} - ${meeting.endTime})`}
      >
        <Video size={11} className="bl-cal-event-icon" />
        <span className="bl-cal-event-time">{formatTaskTime(meeting.startTime)}</span>
        <span className="bl-cal-event-title">{meeting.title}</span>
      </div>
    );
  }

  if (task) {
    const isCompleted = task.status === "completed";
    return (
      <div
        className={`bl-cal-event-chip task ${task.priority} ${isCompleted ? "completed" : ""}`}
        onClick={handleClick}
        title={`${task.title}${task.dueTime ? ` (${formatTaskTime(task.dueTime)})` : ""}`}
      >
        <CheckSquare size={11} className="bl-cal-event-icon" />
        {task.dueTime && (
          <span className="bl-cal-event-time">{formatTaskTime(task.dueTime)}</span>
        )}
        <span className="bl-cal-event-title">{task.title}</span>
      </div>
    );
  }

  return null;
}
