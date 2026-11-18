"use client";

import React, { useState } from "react";
import {
  Video,
  Clock,
  Calendar,
  Users,
  ExternalLink,
  FileCheck,
  CheckCircle,
  FileText,
  Building,
  DollarSign,
} from "lucide-react";
import { CRMMeeting } from "../crm/types";
import { formatTaskTime } from "../crm/selectors";
import { formatINR } from "../crm/selectors";
import { useCRM } from "../crm/CRMProvider";
import { MeetingBrief } from "./MeetingBrief";
import { MeetingOutcomeModal } from "./MeetingOutcomeModal";

interface MeetingHeroProps {
  meeting: CRMMeeting | null;
}

export function MeetingHero({ meeting }: MeetingHeroProps) {
  const { deals, contacts, openMeetingDrawer } = useCRM();
  const [showBrief, setShowBrief] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);

  if (!meeting) {
    return (
      <div className="bl-meeting-hero empty">
        <div className="bl-hero-empty-content">
          <div className="bl-hero-icon-wrap">
            <Video size={24} />
          </div>
          <div>
            <h3>No upcoming meetings scheduled</h3>
            <p>Schedule a client demo or discovery consultation to drive revenue growth.</p>
          </div>
          <button
            type="button"
            className="bl-accent bl-btn-sm bl-primary-btn"
            onClick={() => openMeetingDrawer()}
          >
            + Schedule Meeting
          </button>
        </div>
      </div>
    );
  }

  // Linked deal & contact
  const linkedDeal = meeting.dealId ? deals.find((d) => d.id === meeting.dealId) : null;
  const linkedContact = meeting.contactId ? contacts.find((c) => c.id === meeting.contactId) : null;

  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = meeting.date === todayStr;

  return (
    <>
      <div className="bl-meeting-hero">
        <div className="bl-hero-glow" />

        <div className="bl-hero-body">
          <div className="bl-hero-top bl-between">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="bl-hero-badge-pill">NEXT UPCOMING MEETING</span>
              <span className={`bl-meeting-badge-type ${meeting.meetingType}`}>
                {meeting.meetingType.toUpperCase()}
              </span>
              {isToday && <span className="bl-badge-yellow">Happening Today</span>}
            </div>

            <span className="bl-hero-time-tag">
              <Clock size={13} />
              <span>
                {formatTaskTime(meeting.startTime)} – {formatTaskTime(meeting.endTime)} (IST)
              </span>
            </span>
          </div>

          <div className="bl-hero-main">
            <h2 className="bl-hero-title">{meeting.title}</h2>
            {meeting.agenda && <p className="bl-hero-agenda">{meeting.agenda}</p>}
          </div>

          {/* Context Strip: Deal & Contact */}
          {(linkedDeal || linkedContact || meeting.relatedEntityName) && (
            <div className="bl-hero-context-strip">
              {linkedDeal && (
                <div className="bl-hero-context-chip deal">
                  <DollarSign size={13} />
                  <span>
                    Deal: <strong>{linkedDeal.title}</strong> ({formatINR(linkedDeal.value)})
                  </span>
                </div>
              )}

              {linkedContact && (
                <div className="bl-hero-context-chip contact">
                  <Users size={13} />
                  <span>
                    Contact: <strong>{linkedContact.name}</strong> ({linkedContact.companyName || "Client"})
                  </span>
                </div>
              )}

              {!linkedDeal && !linkedContact && meeting.relatedEntityName && (
                <div className="bl-hero-context-chip generic">
                  <Building size={13} />
                  <span>
                    Client: <strong>{meeting.relatedEntityName}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Attendees */}
          <div className="bl-hero-attendees bl-between">
            <div className="bl-attendees-group">
              <span className="bl-attendees-label">Attendees:</span>
              <span className="bl-attendee-chip host">Host: {meeting.host}</span>
              {meeting.participants.map((p, idx) => (
                <span key={idx} className="bl-attendee-chip">
                  {p.name} ({p.email})
                </span>
              ))}
            </div>

            {/* Quick Action Buttons */}
            <div className="bl-hero-actions">
              <button
                type="button"
                className="bl-secondary bl-btn-sm"
                onClick={() => setShowBrief(true)}
              >
                <FileText size={14} />
                <span>Prep Brief</span>
              </button>

              {meeting.status === "scheduled" && (
                <button
                  type="button"
                  className="bl-secondary bl-btn-sm bl-outcome-btn"
                  onClick={() => setShowOutcome(true)}
                >
                  <FileCheck size={14} />
                  <span>Log Outcome</span>
                </button>
              )}

              {meeting.meetingUrl && (
                <a
                  href={meeting.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bl-accent bl-btn-sm bl-primary-btn"
                >
                  <Video size={14} />
                  <span>Join Call</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBrief && (
        <MeetingBrief meeting={meeting} onClose={() => setShowBrief(false)} />
      )}

      {showOutcome && (
        <MeetingOutcomeModal
          meeting={meeting}
          onClose={() => setShowOutcome(false)}
        />
      )}
    </>
  );
}
