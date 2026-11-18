"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Video,
  User,
  Users,
  Plus,
  Trash2,
  Building,
  DollarSign,
  Link as LinkIcon,
} from "lucide-react";
import { CRMMeeting, MeetingType, MeetingParticipant } from "../crm/types";
import { useCRM } from "../crm/CRMProvider";

export function MeetingDrawer() {
  const {
    isMeetingDrawerOpen,
    meetingDrawerMeetingId,
    meetingDrawerPrefill,
    closeMeetingDrawer,
    meetings,
    leads,
    contacts,
    companies,
    deals,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    cancelMeeting,
  } = useCRM();

  const [title, setTitle] = useState("");
  const [meetingType, setMeetingType] = useState<MeetingType>("demo");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("14:45");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [host, setHost] = useState("Sales Executive A");
  const [location, setLocation] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("https://meet.google.com/biz-lead-demo");
  const [agenda, setAgenda] = useState("");
  const [prepNotes, setPrepNotes] = useState("");

  // CRM Entity Relation
  const [entityType, setEntityType] = useState<"lead" | "contact" | "company" | "deal" | "none">("deal");
  const [entityId, setEntityId] = useState("");
  const [relatedEntityName, setRelatedEntityName] = useState("");

  // Participants
  const [participants, setParticipants] = useState<MeetingParticipant[]>([
    { name: "Client Lead", email: "client@example.com", role: "Decision Maker" },
  ]);
  const [newPartName, setNewPartName] = useState("");
  const [newPartEmail, setNewPartEmail] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isMeetingDrawerOpen) return;

    if (meetingDrawerMeetingId) {
      const existing = meetings.find((m) => m.id === meetingDrawerMeetingId);
      if (existing) {
        setTitle(existing.title || "");
        setMeetingType(existing.meetingType || "demo");
        setDate(existing.date || new Date().toISOString().split("T")[0]);
        setStartTime(existing.startTime || "14:00");
        setEndTime(existing.endTime || "14:45");
        setTimezone(existing.timezone || "Asia/Kolkata");
        setHost(existing.host || "Sales Executive A");
        setLocation(existing.location || "");
        setMeetingUrl(existing.meetingUrl || "");
        setAgenda(existing.agenda || "");
        setPrepNotes(existing.prepNotes || "");
        setParticipants(existing.participants ? [...existing.participants] : []);

        if (existing.dealId) {
          setEntityType("deal");
          setEntityId(existing.dealId);
        } else if (existing.contactId) {
          setEntityType("contact");
          setEntityId(existing.contactId);
        } else if (existing.companyId) {
          setEntityType("company");
          setEntityId(existing.companyId);
        } else if (existing.leadId) {
          setEntityType("lead");
          setEntityId(existing.leadId);
        } else {
          setEntityType("none");
          setEntityId("");
        }
        setRelatedEntityName(existing.relatedEntityName || "");
        return;
      }
    }

    // New meeting with prefill
    setTitle(meetingDrawerPrefill?.title || "");
    setMeetingType(meetingDrawerPrefill?.meetingType || "demo");
    setDate(meetingDrawerPrefill?.date || new Date().toISOString().split("T")[0]);
    setStartTime(meetingDrawerPrefill?.startTime || "14:00");
    setEndTime(meetingDrawerPrefill?.endTime || "14:45");
    setTimezone(meetingDrawerPrefill?.timezone || "Asia/Kolkata");
    setHost(meetingDrawerPrefill?.host || "Sales Executive A");
    setLocation(meetingDrawerPrefill?.location || "");
    setMeetingUrl(meetingDrawerPrefill?.meetingUrl || "https://meet.google.com/biz-lead-demo");
    setAgenda(meetingDrawerPrefill?.agenda || "");
    setPrepNotes(meetingDrawerPrefill?.prepNotes || "");
    setParticipants(
      meetingDrawerPrefill?.participants
        ? [...meetingDrawerPrefill.participants]
        : [{ name: "Client Lead", email: "client@example.com", role: "Decision Maker" }]
    );

    if (deals.length > 0) {
      setEntityType("deal");
      setEntityId(deals[0].id);
      setRelatedEntityName(deals[0].title);
    } else {
      setEntityType("none");
      setEntityId("");
      setRelatedEntityName("");
    }
  }, [isMeetingDrawerOpen, meetingDrawerMeetingId, meetingDrawerPrefill, meetings, deals]);

  if (!isMeetingDrawerOpen) return null;

  const handleEntitySelection = (id: string) => {
    setEntityId(id);
    if (entityType === "deal") {
      const match = deals.find((d) => d.id === id);
      if (match) setRelatedEntityName(match.title);
    } else if (entityType === "contact") {
      const match = contacts.find((c) => c.id === id);
      if (match) setRelatedEntityName(match.name);
    } else if (entityType === "lead") {
      const match = leads.find((l) => l.id === id);
      if (match) setRelatedEntityName(match.name);
    } else if (entityType === "company") {
      const match = companies.find((c) => c.id === id);
      if (match) setRelatedEntityName(match.name);
    }
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName.trim()) return;
    setParticipants([
      ...participants,
      {
        name: newPartName.trim(),
        email: newPartEmail.trim() || `${newPartName.toLowerCase().replace(/\s+/g, "")}@example.com`,
      },
    ]);
    setNewPartName("");
    setNewPartEmail("");
  };

  const handleRemoveParticipant = (idx: number) => {
    setParticipants(participants.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const payload: Partial<CRMMeeting> & {
        title: string;
        date: string;
        startTime: string;
        endTime: string;
      } = {
        title: title.trim(),
        meetingType,
        date,
        startTime,
        endTime,
        timezone,
        host,
        location: location.trim() || undefined,
        meetingUrl: meetingUrl.trim() || undefined,
        agenda: agenda.trim(),
        prepNotes: prepNotes.trim() || undefined,
        participants,
        relatedEntityName,
        dealId: entityType === "deal" ? entityId : undefined,
        contactId: entityType === "contact" ? entityId : undefined,
        leadId: entityType === "lead" ? entityId : undefined,
        companyId: entityType === "company" ? entityId : undefined,
      };

      if (meetingDrawerMeetingId) {
        await updateMeeting(meetingDrawerMeetingId, payload);
      } else {
        await createMeeting(payload);
      }
      closeMeetingDrawer();
    } catch (err) {
      console.error("Save meeting failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!meetingDrawerMeetingId) return;
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      await deleteMeeting(meetingDrawerMeetingId);
      closeMeetingDrawer();
    }
  };

  return (
    <div className="bl-drawer-backdrop" onClick={closeMeetingDrawer}>
      <aside
        className="bl-drawer bl-meeting-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="meeting-drawer-title"
      >
        <div className="bl-drawer-header bl-between">
          <div>
            <div className="bl-eyebrow">
              {meetingDrawerMeetingId ? "EDIT MEETING" : "SCHEDULE MEETING"}
            </div>
            <h2 id="meeting-drawer-title">
              {meetingDrawerMeetingId ? "Meeting Details" : "New Client Session"}
            </h2>
          </div>

          <button
            type="button"
            className="bl-icon"
            onClick={closeMeetingDrawer}
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="bl-drawer-form">
          {/* Title */}
          <div className="bl-field-group">
            <label htmlFor="meeting-title">
              Meeting Title <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              id="meeting-title"
              type="text"
              required
              placeholder="e.g. Product Demo & Commercial Alignment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bl-input"
            />
          </div>

          {/* Row: Type & Host */}
          <div className="bl-fields-row">
            <div className="bl-field-group" style={{ flex: 1 }}>
              <label htmlFor="meeting-type">Session Type</label>
              <select
                id="meeting-type"
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value as MeetingType)}
                className="bl-select"
              >
                <option value="discovery">Discovery Consultation</option>
                <option value="demo">Product Demonstration</option>
                <option value="proposal">Proposal Review</option>
                <option value="negotiation">Contract Negotiation</option>
                <option value="onboarding">Client Onboarding</option>
                <option value="internal">Internal Strategy</option>
              </select>
            </div>

            <div className="bl-field-group" style={{ flex: 1 }}>
              <label htmlFor="meeting-host">Host / Organizer</label>
              <select
                id="meeting-host"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="bl-select"
              >
                <option value="Sales Executive A">Sales Executive A</option>
                <option value="Sales Executive B">Sales Executive B</option>
                <option value="Sales Executive C">Sales Executive C</option>
              </select>
            </div>
          </div>

          {/* Row: Date, Start Time, End Time */}
          <div className="bl-fields-row">
            <div className="bl-field-group" style={{ flex: 1 }}>
              <label htmlFor="meeting-date">Date</label>
              <input
                id="meeting-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bl-input"
              />
            </div>

            <div className="bl-field-group" style={{ flex: 1 }}>
              <label htmlFor="meeting-start">Start Time</label>
              <input
                id="meeting-start"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bl-input"
              />
            </div>

            <div className="bl-field-group" style={{ flex: 1 }}>
              <label htmlFor="meeting-end">End Time</label>
              <input
                id="meeting-end"
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bl-input"
              />
            </div>
          </div>

          {/* Video URL */}
          <div className="bl-field-group">
            <label htmlFor="meeting-url">Meeting URL (Google Meet / Zoom)</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                id="meeting-url"
                type="url"
                placeholder="https://meet.google.com/xyz-abc-def"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="bl-input"
                style={{ flex: 1 }}
              />
            </div>
          </div>

          {/* CRM Linking */}
          <div className="bl-field-group">
            <label>Link Opportunity or Client Record</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <select
                value={entityType}
                onChange={(e) => {
                  const newType = e.target.value as any;
                  setEntityType(newType);
                  if (newType === "deal" && deals[0]) {
                    setEntityId(deals[0].id);
                    setRelatedEntityName(deals[0].title);
                  } else if (newType === "contact" && contacts[0]) {
                    setEntityId(contacts[0].id);
                    setRelatedEntityName(contacts[0].name);
                  } else if (newType === "lead" && leads[0]) {
                    setEntityId(leads[0].id);
                    setRelatedEntityName(leads[0].name);
                  } else if (newType === "company" && companies[0]) {
                    setEntityId(companies[0].id);
                    setRelatedEntityName(companies[0].name);
                  } else {
                    setEntityId("");
                    setRelatedEntityName("");
                  }
                }}
                className="bl-select"
                style={{ width: "120px" }}
              >
                <option value="none">None</option>
                <option value="deal">Deal</option>
                <option value="contact">Contact</option>
                <option value="lead">Lead</option>
                <option value="company">Company</option>
              </select>

              {entityType !== "none" && (
                <select
                  value={entityId}
                  onChange={(e) => handleEntitySelection(e.target.value)}
                  className="bl-select"
                  style={{ flex: 1 }}
                >
                  {entityType === "deal" &&
                    deals.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title} (₹{d.value?.toLocaleString("en-IN")})
                      </option>
                    ))}
                  {entityType === "contact" &&
                    contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.companyName || "Contact"})
                      </option>
                    ))}
                  {entityType === "lead" &&
                    leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} — {l.company || "Individual"}
                      </option>
                    ))}
                  {entityType === "company" &&
                    companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="bl-field-group">
            <label>Meeting Participants</label>
            <div className="bl-participants-list">
              {participants.map((p, idx) => (
                <div key={idx} className="bl-participant-item bl-between">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <User size={13} />
                    <span style={{ fontSize: "13px" }}>
                      <strong>{p.name}</strong> ({p.email})
                    </span>
                  </div>
                  <button
                    type="button"
                    className="bl-icon-xs"
                    onClick={() => handleRemoveParticipant(idx)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
              <input
                type="text"
                placeholder="Attendee name..."
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                className="bl-input bl-input-sm"
                style={{ flex: 1 }}
              />
              <input
                type="email"
                placeholder="Email..."
                value={newPartEmail}
                onChange={(e) => setNewPartEmail(e.target.value)}
                className="bl-input bl-input-sm"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="bl-secondary bl-btn-xs"
                onClick={handleAddParticipant}
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          {/* Agenda */}
          <div className="bl-field-group">
            <label htmlFor="meeting-agenda">Agenda & Objectives</label>
            <textarea
              id="meeting-agenda"
              rows={3}
              placeholder="Key topics to discuss, goals for the call..."
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="bl-textarea"
            />
          </div>

          {/* Prep Notes */}
          <div className="bl-field-group">
            <label htmlFor="meeting-prep">Internal Preparation Notes</label>
            <textarea
              id="meeting-prep"
              rows={2}
              placeholder="Internal reminders, discount thresholds, sensitive topics..."
              value={prepNotes}
              onChange={(e) => setPrepNotes(e.target.value)}
              className="bl-textarea"
            />
          </div>

          {/* Drawer Actions */}
          <div className="bl-drawer-actions bl-between" style={{ marginTop: "24px" }}>
            {meetingDrawerMeetingId ? (
              <button
                type="button"
                className="bl-danger-btn bl-btn-sm"
                onClick={handleDelete}
              >
                <Trash2 size={14} /> Delete
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className="bl-secondary bl-btn-sm"
                onClick={closeMeetingDrawer}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bl-accent bl-btn-sm bl-primary-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : meetingDrawerMeetingId ? "Save Changes" : "Schedule Meeting"}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
}
