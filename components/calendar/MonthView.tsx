"use client";

import React from "react";
import { Plus } from "lucide-react";
import { CRMMeeting, CRMTask } from "../crm/types";
import { CalendarEventCard } from "./CalendarEventCard";
import { useCRM } from "../crm/CRMProvider";

interface MonthViewProps {
  currentDate: Date;
  tasks: CRMTask[];
  meetings: CRMMeeting[];
}

export function MonthView({ currentDate, tasks, meetings }: MonthViewProps) {
  const { openTaskDrawer } = useCRM();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDay = firstDayOfMonth.getDay(); // 0 = Sun
  const totalDays = lastDayOfMonth.getDate();

  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const todayStr = new Date().toISOString().split("T")[0];

  const days: {
    dayNumber: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
  }[] = [];

  // Previous month padding days
  for (let i = startDay - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const dateObj = new Date(year, month - 1, d);
    const dateStr = dateObj.toISOString().split("T")[0];
    days.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month, d);
    // Make sure date string format is YYYY-MM-DD local
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    days.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month padding days to complete grid (multiples of 7)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const dateObj = new Date(year, month + 1, d);
    const dateStr = dateObj.toISOString().split("T")[0];
    days.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bl-month-view">
      {/* Weekday headers */}
      <div className="bl-month-weekday-row">
        {weekdays.map((w) => (
          <div key={w} className="bl-month-weekday-cell">
            {w}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="bl-month-grid">
        {days.map((day, idx) => {
          const dayTasks = tasks.filter((t) => t.dueDate === day.dateStr);
          const dayMeetings = meetings.filter((m) => m.date === day.dateStr);
          const totalEvents = dayTasks.length + dayMeetings.length;

          return (
            <div
              key={`${day.dateStr}-${idx}`}
              className={`bl-month-day-cell ${
                !day.isCurrentMonth ? "other-month" : ""
              } ${day.isToday ? "today" : ""}`}
              onClick={() => openTaskDrawer(undefined, { dueDate: day.dateStr })}
            >
              <div className="bl-month-cell-header bl-between">
                <span className={`bl-month-day-num ${day.isToday ? "today-badge" : ""}`}>
                  {day.dayNumber}
                </span>

                <button
                  type="button"
                  className="bl-cell-add-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openTaskDrawer(undefined, { dueDate: day.dateStr });
                  }}
                  title="Add task on this day"
                >
                  <Plus size={11} />
                </button>
              </div>

              <div className="bl-month-cell-events">
                {dayMeetings.slice(0, 2).map((m) => (
                  <CalendarEventCard key={m.id} item={m} type="meeting" />
                ))}

                {dayTasks.slice(0, 3 - dayMeetings.slice(0, 2).length).map((t) => (
                  <CalendarEventCard key={t.id} item={t} type="task" />
                ))}

                {totalEvents > 3 && (
                  <div className="bl-cal-more-chip">
                    +{totalEvents - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
