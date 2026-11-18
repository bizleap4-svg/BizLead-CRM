"use client";

import React, { useMemo } from "react";
import { Plus } from "lucide-react";
import { CRMMeeting, CRMTask } from "../crm/types";
import { CalendarEventCard } from "./CalendarEventCard";
import { useCRM } from "../crm/CRMProvider";

interface WeekViewProps {
  currentDate: Date;
  tasks: CRMTask[];
  meetings: CRMMeeting[];
}

export function WeekView({ currentDate, tasks, meetings }: WeekViewProps) {
  const { openTaskDrawer, openMeetingDrawer } = useCRM();

  const todayStr = new Date().toISOString().split("T")[0];

  // Calculate days of the week starting Sunday
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const sunday = new Date(curr.setDate(curr.getDate() - curr.getDay()));
    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      result.push({
        dateObj: d,
        dateStr: `${yyyy}-${mm}-${dd}`,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: d.getDate(),
        isToday: `${yyyy}-${mm}-${dd}` === todayStr,
      });
    }
    return result;
  }, [currentDate, todayStr]);

  // Hourly slots from 08:00 to 20:00
  const hours = [
    8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
  ];

  const formatHour = (h: number) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:00 ${ampm}`;
  };

  return (
    <div className="bl-week-view">
      {/* Header Row with Day Names & Numbers */}
      <div className="bl-week-header-row">
        <div className="bl-week-time-gutter-header" />
        {weekDays.map((day) => (
          <div
            key={day.dateStr}
            className={`bl-week-day-header ${day.isToday ? "today" : ""}`}
          >
            <span className="bl-week-day-name">{day.dayName}</span>
            <span className={`bl-week-day-number ${day.isToday ? "today-badge" : ""}`}>
              {day.dayNumber}
            </span>
          </div>
        ))}
      </div>

      {/* Week Grid Body */}
      <div className="bl-week-body">
        {hours.map((hour) => {
          const hourPrefix = String(hour).padStart(2, "0");

          return (
            <div key={hour} className="bl-week-hour-row">
              <div className="bl-week-time-gutter">
                <span>{formatHour(hour)}</span>
              </div>

              {weekDays.map((day) => {
                // Find meetings at this hour
                const hourMeetings = meetings.filter(
                  (m) =>
                    m.date === day.dateStr &&
                    m.startTime.startsWith(hourPrefix)
                );

                // Find tasks at this hour
                const hourTasks = tasks.filter(
                  (t) =>
                    t.dueDate === day.dateStr &&
                    t.dueTime &&
                    t.dueTime.startsWith(hourPrefix)
                );

                return (
                  <div
                    key={`${day.dateStr}-${hour}`}
                    className={`bl-week-cell ${day.isToday ? "today" : ""}`}
                    onClick={() =>
                      openTaskDrawer(undefined, {
                        dueDate: day.dateStr,
                        dueTime: `${hourPrefix}:00`,
                      })
                    }
                  >
                    {hourMeetings.map((m) => (
                      <CalendarEventCard key={m.id} item={m} type="meeting" />
                    ))}
                    {hourTasks.map((t) => (
                      <CalendarEventCard key={t.id} item={t} type="task" />
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
