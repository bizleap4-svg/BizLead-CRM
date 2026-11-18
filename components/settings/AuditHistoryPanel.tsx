"use client";

import React, { useState } from "react";
import {
  History,
  Search,
  Filter,
  ShieldAlert,
  Clock,
  User,
  Activity,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { useControlCenter } from "./ControlCenterContext";

export function AuditHistoryPanel() {
  const { auditLog, members } = useControlCenter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [actorFilter, setActorFilter] = useState("all");

  const filtered = auditLog.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchAction = item.action.toLowerCase().includes(q);
      const matchDetails = item.details.toLowerCase().includes(q);
      const matchEntity = item.targetEntity.toLowerCase().includes(q);
      const matchActor = item.actorName.toLowerCase().includes(q);
      if (!matchAction && !matchDetails && !matchEntity && !matchActor) return false;
    }

    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (actorFilter !== "all" && item.actorId !== actorFilter) return false;

    return true;
  });

  const handleExportAuditCSV = () => {
    const headers = ["Timestamp", "Actor", "Email", "Category", "Action", "Target Entity", "Details", "IP"];
    const rows = filtered.map((e) => [
      e.timestamp,
      `"${e.actorName.replace(/"/g, '""')}"`,
      e.actorEmail,
      e.category,
      e.action,
      `"${e.targetEntity.replace(/"/g, '""')}"`,
      `"${e.details.replace(/"/g, '""')}"`,
      e.ipAddress || "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bizlead_audit_log_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case "member":
        return "badge-member";
      case "role":
      case "permission":
        return "badge-security";
      case "crm_record":
        return "badge-crm";
      case "automation":
        return "badge-auto";
      case "ai":
        return "badge-ai";
      case "export":
        return "badge-export";
      default:
        return "badge-default";
    }
  };

  return (
    <div className="bl-settings-section-card">
      <div className="bl-section-header">
        <div className="bl-section-title-wrap">
          <History size={20} className="bl-accent-icon" />
          <div>
            <h2 className="bl-section-title">Audit History & Activity Log</h2>
            <p className="bl-section-desc">
              Chronological log of workspace configurations, permission modifications, AI approvals, and data mutations.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="bl-btn-secondary"
          onClick={handleExportAuditCSV}
          title="Download Audit Log as CSV"
        >
          <Download size={15} /> Export Audit Log
        </button>
      </div>

      <div className="bl-alert-warning">
        <ShieldAlert size={16} />
        <div>
          <strong>Tamper-Proof Disclosure:</strong>
          <p>
            Local client-side audit entries are stored in browser state for demonstration purposes and are not tamper-proof.
            Phase 11 cloud architecture will stream immutable, append-only audit events to write-once object storage.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bl-directory-controls">
        <div className="bl-search-input-wrap">
          <Search size={15} className="bl-search-icon" />
          <input
            type="text"
            className="bl-input-sm"
            placeholder="Search action, target entity, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bl-filters-wrap">
          <select
            className="bl-select-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="member">Members</option>
            <option value="role">Roles & Permissions</option>
            <option value="crm_record">CRM Records</option>
            <option value="automation">Automations</option>
            <option value="ai">Biz AI Actions</option>
            <option value="settings">Settings & Config</option>
            <option value="export">Data Exports</option>
          </select>

          <select
            className="bl-select-sm"
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
          >
            <option value="all">All Actors</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.roleId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bl-table-container">
        <table className="bl-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Category</th>
              <th>Action</th>
              <th>Target Entity</th>
              <th>Change Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--muted)" }}>
                  No audit events found matching the selected filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const dateStr = new Date(item.timestamp).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                });

                return (
                  <tr key={item.id}>
                    <td>
                      <span className="bl-timestamp-text">{dateStr}</span>
                    </td>
                    <td>
                      <div className="bl-actor-cell">
                        <span className="bl-actor-avatar">
                          {item.actorName.split(" ").map((s) => s[0]).join("")}
                        </span>
                        <div className="bl-actor-info">
                          <span className="bl-actor-name">{item.actorName}</span>
                          <span className="bl-actor-email">{item.actorEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`bl-audit-badge ${getCategoryBadgeClass(item.category)}`}>
                        {item.category.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <code className="bl-action-code">{item.action}</code>
                    </td>
                    <td>
                      <span className="bl-entity-target">{item.targetEntity}</span>
                    </td>
                    <td>
                      <span className="bl-audit-details">{item.details}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
