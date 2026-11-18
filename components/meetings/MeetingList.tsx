"use client";

import React, { useState } from "react";
import {
  Video,
  Clock,
  Calendar,
  Users,
  Search,
  ExternalLink,
  FileCheck,
  FileText,
  MoreVertical,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Smile,
  Meh,
  Frown,
} from "lucide-react";
import { CRMMeeting, MeetingStatus } from "../crm/types";
import { formatTaskTime } from "../crm/selectors";
import { useCRM } from "../crm/CRMProvider";
import { MeetingBrief } from "./MeetingBrief";
import { MeetingOutcomeModal } from "./MeetingOutcomeModal";
import { Tabs } from "../ui/Tabs";

interface MeetingListProps {
  meetings: CRMMeeting[];
}

export function MeetingList({ meetings }: MeetingListProps) {
  const { openMeetingDrawer, cancelMeeting, deleteMeeting } = useCRM();

  const [activeFilter, setActiveFilter] = useState<"all" | "scheduled" | "completed" | "cancelled">("all");
  const [search, setSearch] = useState("");
  const [selectedBriefMeeting, setSelectedBriefMeeting] = useState<CRMMeeting | null>(null);
  const [selectedOutcomeMeeting, setSelectedOutcomeMeeting] = useState<CRMMeeting | null>(null);

  const filtered = meetings.filter((m) => {
    if (activeFilter !== "all" && m.status !== activeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        (m.agenda && m.agenda.toLowerCase().includes(q)) ||
        (m.relatedEntityName && m.relatedEntityName.toLowerCase().includes(q)) ||
        m.host.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return <Smile size={13} color="#10b981" />;
      case "cautious":
        return <Frown size={13} color="#ef4444" />;
      default:
        return <Meh size={13} color="#f59e0b" />;
    }
  };

  return (
    <div className="bl-meeting-list-container">
      {/* Top Filter and Search Bar */}
      <div className="bl-meeting-filters-bar bl-between" style={{ gap: "12px", flexWrap: "wrap" }}>
        <Tabs
          items={[
            { id: "all", label: "All Sessions", count: meetings.length },
            { id: "scheduled", label: "Scheduled", count: meetings.filter((m) => m.status === "scheduled").length },
            { id: "completed", label: "Completed", count: meetings.filter((m) => m.status === "completed").length },
            { id: "cancelled", label: "Cancelled", count: meetings.filter((m) => m.status === "cancelled").length },
          ]}
          activeTab={activeFilter}
          onChange={(f) => setActiveFilter(f as any)}
          variant="pills"
          size="sm"
          style={{ width: "auto" }}
        />

        <div className="bl-task-search-wrap" style={{ maxWidth: "260px" }}>
          <Search size={14} className="bl-search-icon" />
          <input
            type="text"
            placeholder="Search meetings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bl-task-search-input"
          />
        </div>
      </div>

      {/* List */}
      <div className="bl-meeting-cards-grid">
        {filtered.length === 0 ? (
          <div className="bl-empty-tasks-state">
            <Video size={32} />
            <h3>No meetings found</h3>
            <p>No client sessions match your filter criteria.</p>
          </div>
        ) : (
          filtered.map((m) => (
            <div key={m.id} className={`bl-meeting-row-card ${m.status}`}>
              <div className="bl-meeting-card-left">
                <div className={`bl-meeting-icon-box ${m.status}`}>
                  <Video size={18} />
                </div>

                <div className="bl-meeting-card-main">
                  <div className="bl-meeting-badges-strip">
                    <span className={`bl-meeting-badge-type ${m.meetingType}`}>
                      {m.meetingType}
                    </span>
                    <span className={`bl-status-chip ${m.status}`}>
                      {m.status}
                    </span>
                    <span className="bl-meeting-date-pill">
                      <Calendar size={11} />
                      <span>{m.date}</span>
                    </span>
                    <span className="bl-meeting-time-pill">
                      <Clock size={11} />
                      <span>
                        {formatTaskTime(m.startTime)} – {formatTaskTime(m.endTime)}
                      </span>
                    </span>
                  </div>

                  <h3 className="bl-meeting-card-title">{m.title}</h3>
                  {m.agenda && <p className="bl-meeting-card-agenda">{m.agenda}</p>}

                  {/* Outcome summary if completed */}
                  {m.outcome && (
                    <div className="bl-meeting-outcome-preview">
                      <div className="bl-outcome-preview-top">
                        <FileCheck size={13} color="#10b981" />
                        <strong>Logged Outcome:</strong>
                        <span className="bl-outcome-sentiment">
                          {getSentimentIcon(m.outcome.sentiment)}
                          <span>{m.outcome.sentiment}</span>
                        </span>
                      </div>
                      <p className="bl-outcome-summary-text">"{m.outcome.summary}"</p>
                      {m.outcome.nextSteps && m.outcome.nextSteps.length > 0 && (
                        <div className="bl-outcome-steps-row">
                          <span>Next: </span>
                          <strong>{m.outcome.nextSteps.join("; ")}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bl-meeting-footer-meta">
                    <span className="bl-host-tag">Host: {m.host}</span>
                    {m.relatedEntityName && (
                      <span className="bl-entity-tag">
                        Client / Deal: <strong>{m.relatedEntityName}</strong>
                      </span>
                    )}
                    {m.participants.length > 0 && (
                      <span className="bl-attendees-tag">
                        <Users size={12} />
                        <span>{m.participants.map((p) => p.name).join(", ")}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Right */}
              <div className="bl-meeting-card-actions">
                {m.status === "scheduled" && (
                  <>
                    <button
                      type="button"
                      className="bl-secondary bl-btn-xs"
                      onClick={() => setSelectedBriefMeeting(m)}
                    >
                      <FileText size={12} />
                      <span>Prep Brief</span>
                    </button>

                    <button
                      type="button"
                      className="bl-accent bl-btn-xs"
                      onClick={() => setSelectedOutcomeMeeting(m)}
                    >
                      <FileCheck size={12} />
                      <span>Log Outcome</span>
                    </button>
                  </>
                )}

                {m.status === "completed" && (
                  <button
                    type="button"
                    className="bl-secondary bl-btn-xs"
                    onClick={() => setSelectedOutcomeMeeting(m)}
                  >
                    <FileCheck size={12} />
                    <span>View Outcome</span>
                  </button>
                )}

                <button
                  type="button"
                  className="bl-secondary bl-btn-xs"
                  onClick={() => openMeetingDrawer(m.id)}
                  title="Edit session details"
                >
                  <Edit2 size={12} />
                </button>

                {m.status === "scheduled" && (
                  <button
                    type="button"
                    className="bl-icon-xs"
                    onClick={() => {
                      if (window.confirm("Cancel this meeting?")) {
                        cancelMeeting(m.id);
                      }
                    }}
                    title="Cancel meeting"
                  >
                    <XCircle size={14} color="#ef4444" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedBriefMeeting && (
        <MeetingBrief
          meeting={selectedBriefMeeting}
          onClose={() => setSelectedBriefMeeting(null)}
        />
      )}

      {selectedOutcomeMeeting && (
        <MeetingOutcomeModal
          meeting={selectedOutcomeMeeting}
          onClose={() => setSelectedOutcomeMeeting(null)}
        />
      )}
    </div>
  );
}
