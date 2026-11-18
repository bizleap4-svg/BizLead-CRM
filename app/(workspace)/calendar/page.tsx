"use client";

import React from "react";
import { FocusHeader } from "@/components/productivity/FocusHeader";
import { CalendarWorkspace } from "@/components/calendar/CalendarWorkspace";
import { TaskDrawer } from "@/components/productivity/TaskDrawer";
import { MeetingDrawer } from "@/components/meetings/MeetingDrawer";

export default function CalendarPage() {
  return (
    <div className="bl-workspace-page bl-calendar-page">
      {/* Module Sub-Header */}
      <FocusHeader />

      <div className="bl-calendar-main-content">
        <CalendarWorkspace />
      </div>

      {/* Drawers */}
      <TaskDrawer />
      <MeetingDrawer />
    </div>
  );
}
