"use client";

import React, { useState } from "react";
import {
  X,
  Calendar,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useCRM } from "../crm/CRMProvider";
import { generateCalendarICS } from "../crm/repository";

interface ExternalSyncModalProps {
  onClose: () => void;
}

export function ExternalSyncModal({ onClose }: ExternalSyncModalProps) {
  const { tasks, meetings } = useCRM();
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportICS = () => {
    setExporting(true);
    try {
      const icsData = generateCalendarICS([...tasks, ...meetings]);
      const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `bizlead-calendar-${new Date().toISOString().split("T")[0]}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export ICS failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const handleCopyFeed = () => {
    const feedUrl = `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/api/calendar/feed.ics?token=demo_user_token`;
    navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bl-modal-backdrop" onClick={onClose}>
      <div
        className="bl-modal bl-sync-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="sync-modal-title"
      >
        <div className="bl-modal-header bl-between">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="bl-icon-badge" style={{ background: "rgba(255, 225, 59, 0.15)", color: "var(--accent)" }}>
              <Calendar size={20} />
            </div>
            <div>
              <h3 id="sync-modal-title" style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
                Calendar Sync & RFC 5545 Export
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
                Export your BizLead schedule or connect external calendar tools
              </p>
            </div>
          </div>
          <button type="button" className="bl-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="bl-modal-body" style={{ padding: "16px 20px" }}>
          {/* Quick RFC 5545 Export */}
          <div className="bl-sync-export-box">
            <div className="bl-between">
              <div>
                <strong style={{ fontSize: "14px", display: "block" }}>
                  Download Universal iCalendar (.ics)
                </strong>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Compatible with Apple Calendar, Google Calendar, Outlook, and Thunderbird ({tasks.length} tasks, {meetings.length} meetings).
                </span>
              </div>
              <button
                type="button"
                className="bl-accent bl-btn-sm bl-primary-btn"
                onClick={handleExportICS}
                disabled={exporting}
              >
                <Download size={14} />
                <span>{exporting ? "Generating..." : "Download .ics"}</span>
              </button>
            </div>
          </div>

          {/* Calendar Feed Subscription */}
          <div style={{ marginTop: "16px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "6px" }}>
              Universal WebCal Subscription Feed (Demo Mode)
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                readOnly
                value="webcal://bizlead.local/calendar/feed.ics?token=demo_sub_token"
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  fontSize: "12px",
                  borderRadius: "6px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              />
              <button
                type="button"
                className="bl-secondary bl-btn-sm"
                onClick={handleCopyFeed}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Connected Channels Grid */}
          <div style={{ marginTop: "20px" }}>
            <div className="bl-eyebrow" style={{ marginBottom: "10px" }}>
              EXTERNAL CALENDAR INTEGRATIONS
            </div>

            <div className="bl-sync-providers-grid">
              <div className="bl-sync-provider-card">
                <div className="bl-between">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="bl-provider-icon gcal">G</div>
                    <div>
                      <strong>Google Calendar</strong>
                      <span className="bl-status-chip pending">OAuth 2.0 Roadmap</span>
                    </div>
                  </div>
                  <button type="button" className="bl-secondary bl-btn-xs" disabled title="Cloud backend milestone">
                    Connect
                  </button>
                </div>
                <p style={{ fontSize: "11px", color: "var(--muted)", margin: "8px 0 0" }}>
                  Bidirectional 2-way sync with Google Workspace calendars.
                </p>
              </div>

              <div className="bl-sync-provider-card">
                <div className="bl-between">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="bl-provider-icon outlook">O</div>
                    <div>
                      <strong>Microsoft Outlook</strong>
                      <span className="bl-status-chip pending">Graph API Roadmap</span>
                    </div>
                  </div>
                  <button type="button" className="bl-secondary bl-btn-xs" disabled title="Cloud backend milestone">
                    Connect
                  </button>
                </div>
                <p style={{ fontSize: "11px", color: "var(--muted)", margin: "8px 0 0" }}>
                  Exchange 365 calendar event synchronizer with automated meeting links.
                </p>
              </div>

              <div className="bl-sync-provider-card">
                <div className="bl-between">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="bl-provider-icon zoom">Z</div>
                    <div>
                      <strong>Zoom Meetings</strong>
                      <span className="bl-status-chip pending">SDK Roadmap</span>
                    </div>
                  </div>
                  <button type="button" className="bl-secondary bl-btn-xs" disabled title="Cloud backend milestone">
                    Connect
                  </button>
                </div>
                <p style={{ fontSize: "11px", color: "var(--muted)", margin: "8px 0 0" }}>
                  Auto-generates unique join links for all client consultations and demos.
                </p>
              </div>
            </div>
          </div>

          {/* Transparency Callout */}
          <div className="bl-sync-disclaimer">
            <ShieldAlert size={14} />
            <span>
              <strong>Zero-Simulation Standard:</strong> Real offline .ics export is fully functional. Cloud OAuth credentials will be securely provisioned with the centralized backend in Phase 10.
            </span>
          </div>
        </div>

        <div className="bl-modal-footer bl-between" style={{ padding: "12px 20px" }}>
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            Timezone standard: Asia/Kolkata (IST)
          </span>
          <button type="button" className="bl-secondary bl-btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
