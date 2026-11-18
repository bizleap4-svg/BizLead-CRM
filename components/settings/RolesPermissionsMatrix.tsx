"use client";

import React, { useState } from "react";
import {
  Shield,
  ShieldCheck,
  Plus,
  Info,
  Check,
  X,
  AlertTriangle,
  Lock,
  Unlock,
  Settings,
} from "lucide-react";
import { useControlCenter } from "./ControlCenterContext";
import { CRMResource, Operation, AccessScope, Role, Permission } from "./types";

const ALL_RESOURCES: { id: CRMResource; label: string; desc: string }[] = [
  { id: "dashboard", label: "Dashboard", desc: "Executive KPI overview & performance metrics" },
  { id: "leads", label: "Leads Intelligence", desc: "Lead capture, scoring, verification, and conversion" },
  { id: "pipeline", label: "Pipeline Studio", desc: "Kanban deal stages, probabilities, and revenue forecasting" },
  { id: "contacts", label: "Contact 360°", desc: "Master contact profiles and lifecycle tags" },
  { id: "companies", label: "Company Intel", desc: "Account profiles, domains, and hierarchy" },
  { id: "inbox", label: "Unified Inbox", desc: "Omnichannel conversations across WhatsApp, Email & Social" },
  { id: "tasks", label: "Tasks & Focus", desc: "Task momentum, deadlines, and smart follow-ups" },
  { id: "calendar", label: "Calendar Studio", desc: "Scheduling grid, availability sync, and agendas" },
  { id: "meetings", label: "Meetings", desc: "Client meetings, prep briefs, and outcome logs" },
  { id: "campaigns", label: "Campaigns", desc: "Ad platforms, planned budgets, and attribution" },
  { id: "analytics", label: "Growth Analytics", desc: "Revenue velocity, funnels, and ROI models" },
  { id: "reports", label: "Report Studio", desc: "Custom executive reporting and A4 PDF export" },
  { id: "automations", label: "Automation Studio", desc: "Visual workflow builder, triggers, and execution rules" },
  { id: "ai", label: "Biz AI Copilot", desc: "Assistant reasoning, CRM tools, and action approvals" },
  { id: "administration", label: "Administration", desc: "Team directories, role editing, and configurations" },
  { id: "billing", label: "Plans & Billing", desc: "Subscription tiers, usage quotas, and payment methods" },
];

export function RolesPermissionsMatrix() {
  const { roles, createRole, canManageAdmin } = useControlCenter();
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState<Role>(roles[0] || {} as Role);
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  const isAllowedToManage = canManageAdmin();

  const handleCreateRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    // Clone base permissions with custom role ID
    const clonedPermissions = selectedRoleForDetail.permissions
      ? JSON.parse(JSON.stringify(selectedRoleForDetail.permissions))
      : [];

    createRole({
      name: newRoleName,
      description: newRoleDesc || "Custom configured workspace role.",
      color: "#8B5CF6",
      permissions: clonedPermissions,
    });

    setIsCreateRoleModalOpen(false);
    setNewRoleName("");
    setNewRoleDesc("");
  };

  return (
    <div className="bl-settings-section-card">
      <div className="bl-section-header">
        <div className="bl-section-title-wrap">
          <Shield size={20} className="bl-accent-icon" />
          <div>
            <h2 className="bl-section-title">Roles & Permission Matrix</h2>
            <p className="bl-section-desc">
              Granular role presets, operation authorizations, access scopes, and prototype access control.
            </p>
          </div>
        </div>
        {isAllowedToManage && (
          <button
            type="button"
            className="bl-btn-primary"
            onClick={() => setIsCreateRoleModalOpen(true)}
          >
            <Plus size={16} /> Create Custom Role
          </button>
        )}
      </div>

      <div className="bl-alert-warning">
        <AlertTriangle size={16} />
        <div>
          <strong>Prototype Authorization Notice:</strong>
          <p>
            Frontend capability checks and localStorage are simulated controls for rapid workflow validation.
            Production multi-tenancy and cryptographic permission enforcement will be managed on server backends in Phase 12.
          </p>
        </div>
      </div>

      {/* Role Selection Tabs */}
      <div className="bl-role-tabs">
        {roles.map((r) => {
          const isSelected = selectedRoleForDetail.id === r.id;
          return (
            <button
              key={r.id}
              type="button"
              className={`bl-role-tab ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedRoleForDetail(r)}
            >
              <div
                className="bl-role-indicator-dot"
                style={{ backgroundColor: r.color || "var(--accent)" }}
              />
              <span className="bl-role-tab-name">{r.name}</span>
              {r.isSystem && <span className="bl-system-tag">Preset</span>}
            </button>
          );
        })}
      </div>

      {/* Role Summary Card */}
      <div className="bl-role-summary-banner">
        <div className="bl-role-summary-info">
          <h3 className="bl-role-summary-title">
            <span style={{ color: selectedRoleForDetail.color || "var(--accent)" }}>
              {selectedRoleForDetail.name}
            </span>{" "}
            {selectedRoleForDetail.isSystem ? "(Default System Role)" : "(Custom Role)"}
          </h3>
          <p className="bl-role-summary-desc">{selectedRoleForDetail.description}</p>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bl-table-container">
        <table className="bl-table bl-matrix-table">
          <thead>
            <tr>
              <th>CRM Module / Resource</th>
              {roles.map((r) => (
                <th key={r.id} style={{ textAlign: "center" }}>
                  <span style={{ color: r.color || "var(--text)" }}>{r.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_RESOURCES.map((res) => {
              return (
                <tr key={res.id}>
                  <td>
                    <div className="bl-resource-title-cell">
                      <strong>{res.label}</strong>
                      <span className="bl-resource-desc">{res.desc}</span>
                    </div>
                  </td>
                  {roles.map((r) => {
                    const perm = r.permissions.find((p) => p.resource === res.id);
                    let scopeBadge = "None";
                    let badgeClass = "scope-none";

                    if (perm && perm.scope !== "none") {
                      if (perm.scope === "organization") {
                        scopeBadge = "Full / Org";
                        badgeClass = "scope-org";
                      } else if (perm.scope === "department") {
                        scopeBadge = "Dept";
                        badgeClass = "scope-dept";
                      } else if (perm.scope === "team") {
                        scopeBadge = "Team";
                        badgeClass = "scope-team";
                      } else if (perm.scope === "assigned" || perm.scope === "own") {
                        scopeBadge = "Assigned";
                        badgeClass = "scope-assigned";
                      }

                      if (perm.operations.length === 1 && perm.operations[0] === "view") {
                        scopeBadge = "View Only";
                        badgeClass = "scope-view";
                      }
                    }

                    return (
                      <td key={r.id} style={{ textAlign: "center" }}>
                        <span
                          className={`bl-scope-badge ${badgeClass}`}
                          title={`Operations: ${
                            perm && perm.operations.length > 0
                              ? perm.operations.join(", ")
                              : "No operations allowed"
                          }`}
                        >
                          {scopeBadge}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Operations Legend */}
      <div className="bl-matrix-legend">
        <div className="bl-legend-item">
          <span className="bl-scope-badge scope-org">Full / Org</span>
          <span>Full organization access (View, Create, Edit, Delete, Export)</span>
        </div>
        <div className="bl-legend-item">
          <span className="bl-scope-badge scope-team">Team</span>
          <span>Department / Team records only</span>
        </div>
        <div className="bl-legend-item">
          <span className="bl-scope-badge scope-assigned">Assigned</span>
          <span>Only records assigned directly to the member</span>
        </div>
        <div className="bl-legend-item">
          <span className="bl-scope-badge scope-view">View Only</span>
          <span>Read-only inspection; mutations blocked</span>
        </div>
        <div className="bl-legend-item">
          <span className="bl-scope-badge scope-none">None</span>
          <span>No access / Route hidden</span>
        </div>
      </div>

      {/* Create Custom Role Modal */}
      {isCreateRoleModalOpen && (
        <div className="bl-modal-backdrop">
          <div className="bl-modal-content">
            <div className="bl-modal-header">
              <h3 className="bl-modal-title">Create Custom Organization Role</h3>
              <button
                type="button"
                className="bl-btn-close"
                onClick={() => setIsCreateRoleModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateRoleSubmit} className="bl-modal-form">
              <div className="bl-form-group">
                <label className="bl-form-label">Role Name *</label>
                <input
                  type="text"
                  className="bl-form-input"
                  placeholder="e.g. Regional Sales Lead"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  required
                />
              </div>

              <div className="bl-form-group">
                <label className="bl-form-label">Role Description</label>
                <textarea
                  className="bl-form-textarea"
                  rows={3}
                  placeholder="Describe the responsibilities and scope of this role..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                />
              </div>

              <div className="bl-alert-info">
                <span>
                  Initial permissions will be cloned from <strong>{selectedRoleForDetail.name}</strong> and can be modified.
                </span>
              </div>

              <div className="bl-modal-footer">
                <button
                  type="button"
                  className="bl-btn-secondary"
                  onClick={() => setIsCreateRoleModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="bl-btn-primary">
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
