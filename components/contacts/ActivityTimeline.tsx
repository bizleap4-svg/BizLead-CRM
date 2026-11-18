"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle2,
  Paperclip,
  Sparkles,
  Plus,
  Send,
  X,
} from "lucide-react";
import { CRMActivity, CRMActivityType } from "@/components/crm/types";
import { useCRM } from "@/components/crm/CRMProvider";

interface ActivityTimelineProps {
  entityType: "contact" | "company" | "lead" | "deal";
  entityId: string;
  entityName: string;
}

export function ActivityTimeline({
  entityType,
  entityId,
  entityName,
}: ActivityTimelineProps) {
  const { getActivitiesFor, logActivity } = useCRM();
  const [activities, setActivities] = useState<CRMActivity[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [showLogModal, setShowLogModal] = useState(false);
  const [logType, setLogType] = useState<CRMActivityType>("call");
  const [logTitle, setLogTitle] = useState("");
  const [logDesc, setLogDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchActivities = async () => {
    const list = await getActivitiesFor(entityType, entityId);
    setActivities(list);
  };

  useEffect(() => {
    fetchActivities();
  }, [entityId, entityType]);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logDesc.trim()) return;

    setIsSubmitting(true);
    try {
      await logActivity({
        type: logType,
        title:
          logTitle.trim() ||
          (logType === "call"
            ? "Outbound Call"
            : logType === "email"
            ? "Email Sent"
            : logType === "meeting"
            ? "Meeting Conducted"
            : "Activity Logged"),
        description: logDesc.trim(),
        author: "Current User",
        entityType,
        entityId,
      });

      setLogTitle("");
      setLogDesc("");
      setShowLogModal(false);
      await fetchActivities();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActivityIcon = (type: CRMActivityType) => {
    switch (type) {
      case "call":
        return <Phone size={14} className="bl-act-icon-call" />;
      case "email":
        return <Mail size={14} className="bl-act-icon-email" />;
      case "meeting":
        return <Calendar size={14} className="bl-act-icon-meeting" />;
      case "note_added":
        return <FileText size={14} className="bl-act-icon-note" />;
      case "lead_converted":
        return <Sparkles size={14} className="bl-act-icon-sparkle" />;
      case "deal_created":
      case "stage_change":
        return <CheckCircle2 size={14} className="bl-act-icon-stage" />;
      case "file_attached":
        return <Paperclip size={14} className="bl-act-icon-file" />;
      default:
        return <Clock size={14} />;
    }
  };

  const filtered = activities.filter((a) => {
    if (filterType === "all") return true;
    return a.type === filterType;
  });

  return (
    <div className="bl-timeline-container">
      {/* Top Header & Filter Controls */}
      <div className="bl-between" style={{ marginBottom: "18px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "all", label: "All Activity" },
            { id: "call", label: "Calls" },
            { id: "email", label: "Emails" },
            { id: "meeting", label: "Meetings" },
            { id: "stage_change", label: "Pipeline" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              className={`bl-chip-filter ${filterType === f.id ? "active" : ""}`}
              onClick={() => setFilterType(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="bl-secondary bl-btn-sm"
          onClick={() => setShowLogModal(true)}
        >
          <Plus size={14} /> Log Activity
        </button>
      </div>

      {/* Timeline Stream */}
      <div className="bl-activity-stream">
        {filtered.map((act) => (
          <article key={act.id} className="bl-activity-card">
            <div className="bl-activity-icon-bubble">
              {getActivityIcon(act.type)}
            </div>

            <div className="bl-activity-body">
              <div className="bl-between" style={{ alignItems: "flex-start" }}>
                <div>
                  <h4 className="bl-activity-title">{act.title}</h4>
                  <span className="bl-activity-meta">
                    by <strong>{act.author || "System"}</strong> · {act.timestamp}
                  </span>
                </div>

                <span className="bl-activity-badge">
                  {act.type.replace("_", " ")}
                </span>
              </div>

              <p className="bl-activity-desc">{act.description}</p>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="bl-empty-stream">
            <Clock size={28} opacity={0.4} />
            <p>No activity records logged yet for {entityName}.</p>
          </div>
        )}
      </div>

      {/* Log Activity Modal */}
      {showLogModal && (
        <div className="bl-modal-backdrop" onClick={() => setShowLogModal(false)}>
          <div
            className="bl-modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Log Interaction"
          >
            <div className="bl-between" style={{ marginBottom: "16px" }}>
              <div>
                <span className="bl-eyebrow">RELATIONSHIP LOG</span>
                <h3>Log Interaction</h3>
                <p style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Record a call, meeting, or communication with {entityName}
                </p>
              </div>
              <button
                type="button"
                className="bl-icon"
                onClick={() => setShowLogModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="bl-form-grid">
              <label>
                Interaction Type
                <select
                  value={logType}
                  onChange={(e) => setLogType(e.target.value as CRMActivityType)}
                >
                  <option value="call">Phone Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting / Demo</option>
                  <option value="follow_up">Follow-up Action</option>
                  <option value="note_added">Internal Note</option>
                </select>
              </label>

              <label>
                Subject / Heading
                <input
                  placeholder="e.g. Discovery call regarding enterprise rollout"
                  value={logTitle}
                  onChange={(e) => setLogTitle(e.target.value)}
                />
              </label>

              <label className="bl-full-field">
                Notes & Discussion Summary *
                <textarea
                  required
                  rows={4}
                  placeholder="Summarize key points discussed, objections, and next steps..."
                  value={logDesc}
                  onChange={(e) => setLogDesc(e.target.value)}
                />
              </label>

              <div
                className="bl-form-actions bl-full-field"
                style={{ marginTop: "12px" }}
              >
                <button
                  type="button"
                  className="bl-secondary"
                  onClick={() => setShowLogModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bl-primary"
                  disabled={isSubmitting}
                >
                  <Send size={14} /> {isSubmitting ? "Logging..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityTimeline;
