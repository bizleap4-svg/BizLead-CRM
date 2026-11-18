"use client";

import React, { useState } from "react";
import { CalendarToolbar, CalendarViewType } from "./CalendarToolbar";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { AgendaView } from "./AgendaView";
import { useCRM } from "../crm/CRMProvider";

export function CalendarWorkspace() {
  const { tasks, meetings } = useCRM();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>("month");
  const [filterType, setFilterType] = useState<"all" | "tasks" | "meetings">("all");

  const filteredTasks = tasks.filter((t) => {
    if (filterType === "meetings") return false;
    return true;
  });

  const filteredMeetings = meetings.filter((m) => {
    if (filterType === "tasks") return false;
    return true;
  });

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewType === "month") {
      d.setMonth(d.getMonth() - 1);
    } else if (viewType === "week") {
      d.setDate(d.getDate() - 7);
    } else if (viewType === "day") {
      d.setDate(d.getDate() - 1);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewType === "month") {
      d.setMonth(d.getMonth() + 1);
    } else if (viewType === "week") {
      d.setDate(d.getDate() + 7);
    } else if (viewType === "day") {
      d.setDate(d.getDate() + 1);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="bl-calendar-workspace">
      <CalendarToolbar
        currentDate={currentDate}
        viewType={viewType}
        onViewTypeChange={setViewType}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
      />

      <div className="bl-calendar-view-container">
        {viewType === "month" && (
          <MonthView
            currentDate={currentDate}
            tasks={filteredTasks}
            meetings={filteredMeetings}
          />
        )}

        {viewType === "week" && (
          <WeekView
            currentDate={currentDate}
            tasks={filteredTasks}
            meetings={filteredMeetings}
          />
        )}

        {viewType === "day" && (
          <DayView
            currentDate={currentDate}
            tasks={filteredTasks}
            meetings={filteredMeetings}
          />
        )}

        {viewType === "agenda" && (
          <AgendaView
            tasks={filteredTasks}
            meetings={filteredMeetings}
          />
        )}
      </div>
    </div>
  );
}
