"use client";

import React, { useMemo } from "react";
import { FocusHeader } from "@/components/productivity/FocusHeader";
import { MeetingHero } from "@/components/meetings/MeetingHero";
import { MeetingList } from "@/components/meetings/MeetingList";
import { TaskDrawer } from "@/components/productivity/TaskDrawer";
import { MeetingDrawer } from "@/components/meetings/MeetingDrawer";
import { useCRM } from "@/components/crm/CRMProvider";

export default function MeetingsPage() {
  const { meetings } = useCRM();

  const todayStr = new Date().toISOString().split("T")[0];

  // Find the next upcoming scheduled meeting
  const nextMeeting = useMemo(() => {
    const scheduled = meetings
      .filter((m) => m.status === "scheduled" && m.date >= todayStr)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });
    return scheduled[0] || null;
  }, [meetings, todayStr]);

  return (
    <div className="bl-workspace-page bl-meetings-page">
      {/* Module Sub-Header */}
      <FocusHeader />

      <div className="bl-meetings-main-content">
        {/* Next Meeting Hero */}
        <MeetingHero meeting={nextMeeting} />

        {/* All Meetings List */}
        <div style={{ marginTop: "24px" }}>
          <div className="bl-eyebrow" style={{ marginBottom: "12px" }}>
            ALL CLIENT SESSIONS & CONSULTATIONS
          </div>
          <MeetingList meetings={meetings} />
        </div>
      </div>

      {/* Drawers */}
      <TaskDrawer />
      <MeetingDrawer />
    </div>
  );
}
