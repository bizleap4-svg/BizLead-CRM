"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  User,
  Building,
  DollarSign,
  CheckSquare,
  Clock,
  Sparkles,
  Phone,
  Mail,
} from "lucide-react";
import { CRMMeeting } from "../crm/types";
import { useCRM } from "../crm/CRMProvider";
import { formatINR } from "../crm/selectors";

interface MeetingBriefProps {
  meeting: CRMMeeting;
  onClose: () => void;
}

export function MeetingBrief({ meeting, onClose }: MeetingBriefProps) {
  const { deals, contacts, companies } = useCRM();

  const linkedContact = meeting.contactId
    ? contacts.find((c) => c.id === meeting.contactId)
    : null;
  const linkedDeal = meeting.dealId
    ? deals.find((d) => d.id === meeting.dealId)
    : null;
  const linkedCompany = meeting.companyId
    ? companies.find((c) => c.id === meeting.companyId)
    : null;

  const [checklist, setChecklist] = useState([
    { id: "1", text: "Review client's recent communication history in Inbox", done: false },
    { id: "2", text: "Confirm deal scope & commercial expectations", done: false },
    { id: "3", text: "Prepare live product walkthrough / slides", done: false },
    { id: "4", text: "Align on next steps and closing timeline", done: false },
  ]);

  const toggleCheck = (id: string) => {
    setChecklist(
      checklist.map((c) => (c.id === id ? { ...c, done: !c.done } : c))
    );
  };

  return (
    <div className="bl-modal-backdrop" onClick={onClose}>
      <div
        className="bl-modal bl-brief-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="brief-title"
      >
        <div className="bl-modal-header bl-between">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="bl-icon-badge" style={{ background: "rgba(255, 225, 59, 0.15)", color: "var(--accent)" }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 id="brief-title" style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
                Meeting Preparation Brief
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
                {meeting.title} · {meeting.date} ({meeting.startTime} - {meeting.endTime})
              </p>
            </div>
          </div>
          <button type="button" className="bl-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="bl-modal-body" style={{ padding: "16px 20px" }}>
          {/* Agenda & Prep Notes */}
          <div className="bl-brief-section">
            <div className="bl-eyebrow">AGENDA & STRATEGY</div>
            <p className="bl-brief-text">{meeting.agenda || "No specific agenda stated."}</p>
            {meeting.prepNotes && (
              <div className="bl-prep-notes-box">
                <strong>Executive Prep Notes:</strong>
                <p>{meeting.prepNotes}</p>
              </div>
            )}
          </div>

          {/* CRM Intelligence Split (Contact 360 & Deal Context) */}
          <div className="bl-brief-grid">
            {/* Contact 360 */}
            <div className="bl-brief-card">
              <div className="bl-between" style={{ marginBottom: "8px" }}>
                <span className="bl-brief-card-title">
                  <User size={13} /> Contact 360°
                </span>
                {linkedContact && (
                  <span className="bl-status-chip">{linkedContact.lifecycleStatus}</span>
                )}
              </div>
              {linkedContact ? (
                <div className="bl-brief-contact-details">
                  <strong>{linkedContact.name}</strong>
                  <span className="title">{linkedContact.designation || "Stakeholder"}</span>
                  <div className="meta-row">
                    <Mail size={12} /> <span>{linkedContact.email}</span>
                  </div>
                  {linkedContact.phone && (
                    <div className="meta-row">
                      <Phone size={12} /> <span>{linkedContact.phone}</span>
                    </div>
                  )}
                  {linkedContact.notes && (
                    <p className="notes-snippet">"{linkedContact.notes}"</p>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: "12px", color: "var(--muted)" }}>
                  No individual contact linked. Host: {meeting.host}
                </p>
              )}
            </div>

            {/* Deal Context */}
            <div className="bl-brief-card">
              <div className="bl-between" style={{ marginBottom: "8px" }}>
                <span className="bl-brief-card-title">
                  <DollarSign size={13} /> Commercial Deal
                </span>
                {linkedDeal && (
                  <span className="bl-status-chip deal">{linkedDeal.stage}</span>
                )}
              </div>
              {linkedDeal ? (
                <div className="bl-brief-deal-details">
                  <strong>{linkedDeal.title}</strong>
                  <div className="deal-value">{formatINR(linkedDeal.value)}</div>
                  <span className="sub">
                    Expected Close: {linkedDeal.expectedCloseDate || "This Month"} · Stage:{" "}
                    {linkedDeal.stage}
                  </span>
                </div>
              ) : (
                <p style={{ fontSize: "12px", color: "var(--muted)" }}>
                  General consultation without linked pipeline opportunity.
                </p>
              )}
            </div>
          </div>

          {/* Pre-flight Checklist */}
          <div className="bl-brief-section" style={{ marginTop: "16px" }}>
            <div className="bl-eyebrow">PRE-FLIGHT CHECKLIST</div>
            <div className="bl-checklist-items">
              {checklist.map((item) => (
                <label key={item.id} className="bl-brief-check-item">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleCheck(item.id)}
                  />
                  <span style={{ textDecoration: item.done ? "line-through" : "none" }}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bl-modal-footer bl-between" style={{ padding: "12px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            Tip: Log outcome immediately after call to keep CRM pipeline up to date.
          </span>
          <button type="button" className="bl-secondary bl-btn-sm" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
