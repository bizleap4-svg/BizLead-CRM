"use client";

import React from "react";
import { Plus, Video, CheckSquare, Clock, User, ExternalLink } from "lucide-react";
import { CRMMeeting, CRMTask } from "../crm/types";
import { formatTaskTime } from "../crm/selectors";
import { useCRM } from "../crm/CRMProvider";

interface DayViewProps {
  currentDate: Date;
  tasks: CRMTask[];
  meetings: CRMMeeting[];
}

export function DayView({ currentDate, tasks, meetings }: DayViewProps) {
  const { openTaskDrawer, openMeetingDrawer } = useCRM();

  const yyyy = currentDate.getFullYear();
  const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
  const dd = String(currentDate.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
  const dayMeetings = meetings.filter((m) => m.date === dateStr);

  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  const formatHour = (h: number) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:00 ${ampm}`;
  };

  const unscheduledTasks = dayTasks.filter((t) => !t.dueTime);

  return (
    <div className="bl-day-view">
      {/* Top Unscheduled / All Day Section */}
      {unscheduledTasks.length > 0 && (
        <div className="bl-day-allday-bar">
          <span className="bl-day-allday-label">All-Day / Tasks:</span>
          <div className="bl-day-allday-list">
            {unscheduledTasks.map((t) => (
              <div
                key={t.id}
                className={`bl-day-task-chip ${t.priority}`}
                onClick={() => openTaskDrawer(t.id)}
              >
                <CheckSquare size={12} />
                <span>{t.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hourly Timeline */}
      <div className="bl-day-timeline">
        {hours.map((hour) => {
          const hourPrefix = String(hour).padStart(2, "0");
          const slotMeetings = dayMeetings.filter((m) =>
            m.startTime.startsWith(hourPrefix)
          );
          const slotTasks = dayTasks.filter(
            (t) => t.dueTime && t.dueTime.startsWith(hourPrefix)
          );

          return (
            <div key={hour} className="bl-day-hour-row">
              <div className="bl-day-time-label">{formatHour(hour)}</div>

              <div
                className="bl-day-hour-slot"
                onClick={() =>
                  openTaskDrawer(undefined, {
                    dueDate: dateStr,
                    dueTime: `${hourPrefix}:00`,
                  })
                }
              >
                {slotMeetings.map((m) => (
                  <div
                    key={m.id}
                    className="bl-day-meeting-card"
                    onClick={(e) => {
                      e.stopPropagation();
                      openMeetingDrawer(m.id);
                    }}
                  >
                    <div className="bl-between">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="bl-meeting-badge-type">{m.meetingType}</span>
                        <h4 className="bl-day-event-title">{m.title}</h4>
                      </div>
                      <span className="bl-day-event-time">
                        {formatTaskTime(m.startTime)} – {formatTaskTime(m.endTime)}
                      </span>
                    </div>

                    {m.agenda && <p className="bl-day-event-agenda">{m.agenda}</p>}

                    <div className="bl-day-event-footer bl-between">
                      <div className="bl-day-participants">
                        <User size={12} />
                        <span>Host: {m.host}</span>
                        {m.participants.length > 0 && (
                          <span className="bl-participants-count">
                            +{m.participants.length} attendee(s)
                          </span>
                        )}
                      </div>

                      {m.meetingUrl && (
                        <a
                          href={m.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bl-join-link-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Video size={12} />
                          <span>Join Meeting</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}

                {slotTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`bl-day-task-card ${t.priority}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openTaskDrawer(t.id);
                    }}
                  >
                    <div className="bl-between">
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <CheckSquare size={13} />
                        <span className="bl-day-task-title">{t.title}</span>
                      </div>
                      <span className="bl-day-task-time">
                        {formatTaskTime(t.dueTime)}
                      </span>
                    </div>
                    {t.entityName && (
                      <span className="bl-day-task-entity">
                        {t.entityType}: {t.entityName}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
