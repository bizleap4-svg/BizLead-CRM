"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  Briefcase,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle2,
  X,
  Edit2,
  UserX,
  UserCheck,
  RefreshCw,
  Trash2,
  ArrowRightLeft,
} from "lucide-react";
import { useControlCenter } from "./ControlCenterContext";
import { WorkspaceMember } from "./types";

export function TeamManagement() {
  const {
    members,
    roles,
    departments,
    activeMember,
    createMember,
    updateMember,
    deactivateMember,
    deleteMember,
    reassignRecords,
    canManageAdmin,
  } = useControlCenter();

  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<WorkspaceMember | null>(null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignTargetMember, setReassignTargetMember] = useState<WorkspaceMember | null>(null);

  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isAllowedToManage = canManageAdmin();

  // New member form state
  const [newMemberForm, setNewMemberForm] = useState({
    name: "",
    email: "",
    phone: "",
    roleId: "sales_executive",
    departmentId: "dept-sales",
    reportingManagerId: "mem-3",
  });

  // Reassignment form state
  const [reassignForm, setReassignForm] = useState({
    fromName: "",
    toName: "",
  });

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter members
  const filteredMembers = members.filter((m) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchEmail = m.email.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }
    if (departmentFilter !== "all" && m.departmentId !== departmentFilter) return false;
    if (roleFilter !== "all" && m.roleId !== roleFilter) return false;
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    return true;
  });

  // Check last owner count
  const activeOwners = members.filter((m) => m.roleId === "owner" && m.status === "active");

  const handleCreateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.name.trim() || !newMemberForm.email.trim()) {
      showNotification("error", "Name and email are required.");
      return;
    }

    try {
      const initials = newMemberForm.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      createMember({
        userId: `usr-${Date.now()}`,
        name: newMemberForm.name,
        email: newMemberForm.email,
        phone: newMemberForm.phone || "+91 98200 00000",
        avatar: initials,
        roleId: newMemberForm.roleId,
        departmentId: newMemberForm.departmentId,
        reportingManagerId: newMemberForm.reportingManagerId,
        status: "active",
      });

      setIsAddModalOpen(false);
      setNewMemberForm({
        name: "",
        email: "",
        phone: "",
        roleId: "sales_executive",
        departmentId: "dept-sales",
        reportingManagerId: "mem-3",
      });
      showNotification(
        "success",
        `Member ${newMemberForm.name} added. Local invitation record generated (email delivery pending backend in Phase 12).`
      );
    } catch (err: any) {
      showNotification("error", err.message || "Failed to create member");
    }
  };

  const handleEditMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      updateMember(editingMember.id, {
        name: editingMember.name,
        email: editingMember.email,
        phone: editingMember.phone,
        roleId: editingMember.roleId,
        departmentId: editingMember.departmentId,
        reportingManagerId: editingMember.reportingManagerId,
      });
      setEditingMember(null);
      showNotification("success", `Updated details for ${editingMember.name}.`);
    } catch (err: any) {
      showNotification("error", err.message || "Failed to update member");
    }
  };

  const handleToggleDeactivate = (m: WorkspaceMember) => {
    try {
      if (m.status === "active") {
        if (m.roleId === "owner" && activeOwners.length <= 1) {
          showNotification(
            "error",
            "Last Owner Protection: Cannot deactivate the last active Workspace Owner. Designate another active Owner first."
          );
          return;
        }
        deactivateMember(m.id);
        showNotification("success", `${m.name} has been deactivated.`);
      } else {
        updateMember(m.id, { status: "active" });
        showNotification("success", `${m.name} has been reactivated.`);
      }
    } catch (err: any) {
      showNotification("error", err.message || "Failed to toggle status");
    }
  };

  const handleDeleteMember = (m: WorkspaceMember) => {
    if (m.roleId === "owner" && activeOwners.length <= 1) {
      showNotification(
        "error",
        "Last Owner Protection: Cannot delete the last active Workspace Owner. Designate another active Owner first."
      );
      return;
    }
    if (confirm(`Are you sure you want to remove ${m.name} from the workspace?`)) {
      try {
        deleteMember(m.id);
        showNotification("success", `${m.name} removed from workspace.`);
      } catch (err: any) {
        showNotification("error", err.message || "Failed to remove member");
      }
    }
  };

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignForm.fromName || !reassignForm.toName) {
      showNotification("error", "Both source and target members must be selected.");
      return;
    }
    if (reassignForm.fromName === reassignForm.toName) {
      showNotification("error", "Source and target member cannot be identical.");
      return;
    }

    try {
      const stats = await reassignRecords(reassignForm.fromName, reassignForm.toName);
      setReassignModalOpen(false);
      showNotification(
        "success",
        `Successfully reassigned ${stats.leads} leads, ${stats.deals} deals, ${stats.tasks} tasks, and ${stats.contacts} contacts from ${reassignForm.fromName} to ${reassignForm.toName}.`
      );
    } catch (err: any) {
      showNotification("error", err.message || "Reassignment failed");
    }
  };

  return (
    <div className="bl-settings-section-card">
      <div className="bl-section-header">
        <div className="bl-section-title-wrap">
          <Users size={20} className="bl-accent-icon" />
          <div>
            <h2 className="bl-section-title">Team Directory & Workload</h2>
            <p className="bl-section-desc">
              Manage organization members, assign reporting lines, distribute records, and enforce last-owner safety.
            </p>
          </div>
        </div>
        <div className="bl-header-actions-group">
          {isAllowedToManage && (
            <>
              <button
                type="button"
                className="bl-btn-secondary"
                onClick={() => {
                  setReassignForm({ fromName: members[0]?.name || "", toName: members[1]?.name || "" });
                  setReassignModalOpen(true);
                }}
              >
                <ArrowRightLeft size={16} /> Reassign Records
              </button>
              <button
                type="button"
                className="bl-btn-primary"
                onClick={() => setIsAddModalOpen(true)}
              >
                <UserPlus size={16} /> Add Member
              </button>
            </>
          )}
        </div>
      </div>

      {notification && (
        <div className={`bl-alert-${notification.type}`}>
          {notification.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bl-directory-controls">
        <div className="bl-search-input-wrap">
          <Search size={15} className="bl-search-icon" />
          <input
            type="text"
            className="bl-input-sm"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bl-filters-wrap">
          <select
            className="bl-select-sm"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments ({departments.length})</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            className="bl-select-sm"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles ({roles.length})</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            className="bl-select-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Members Directory Table */}
      <div className="bl-table-container">
        <table className="bl-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Department</th>
              <th>Role</th>
              <th>Reporting Manager</th>
              <th>Workload (Leads / Deals / Tasks)</th>
              <th>Status</th>
              {isAllowedToManage && <th style={{ textAlign: "right" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((m) => {
              const dept = departments.find((d) => d.id === m.departmentId);
              const role = roles.find((r) => r.id === m.roleId);
              const manager = members.find((mgr) => mgr.id === m.reportingManagerId);
              const isOnlyOwner = m.roleId === "owner" && activeOwners.length <= 1;

              return (
                <tr key={m.id} className={m.status === "inactive" ? "bl-row-inactive" : ""}>
                  <td>
                    <div className="bl-member-cell">
                      <div className="bl-member-avatar" style={{ border: `2px solid ${role?.color || "var(--accent)"}` }}>
                        {m.avatar}
                      </div>
                      <div className="bl-member-info">
                        <span className="bl-member-name">{m.name}</span>
                        <span className="bl-member-email">{m.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className="bl-dept-pill"
                      style={{
                        backgroundColor: `${dept?.color || "#888"}22`,
                        color: dept?.color || "var(--text)",
                      }}
                    >
                      {dept?.name || "General"}
                    </span>
                  </td>
                  <td>
                    <span
                      className="bl-role-pill"
                      style={{
                        backgroundColor: `${role?.color || "#888"}22`,
                        color: role?.color || "var(--text)",
                      }}
                    >
                      {role?.name || m.roleId}
                    </span>
                  </td>
                  <td>
                    <span className="bl-manager-text">
                      {manager ? manager.name : "—"}
                    </span>
                  </td>
                  <td>
                    <div className="bl-workload-chips">
                      <span className="bl-chip" title="Assigned Leads">
                        🎯 {m.workloadStats.assignedLeads} leads
                      </span>
                      <span className="bl-chip" title="Assigned Deals">
                        💼 {m.workloadStats.assignedDeals} deals
                      </span>
                      <span className="bl-chip" title="Pending Tasks">
                        ✅ {m.workloadStats.assignedTasks} tasks
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`bl-status-pill ${
                        m.status === "active" ? "status-active" : "status-inactive"
                      }`}
                    >
                      {m.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  {isAllowedToManage && (
                    <td style={{ textAlign: "right" }}>
                      <div className="bl-actions-cell">
                        <button
                          type="button"
                          className="bl-btn-icon-sm"
                          onClick={() => setEditingMember({ ...m })}
                          title="Edit Member Details"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className={`bl-btn-icon-sm ${m.status === "active" ? "bl-btn-warn" : ""}`}
                          onClick={() => handleToggleDeactivate(m)}
                          disabled={isOnlyOwner && m.status === "active"}
                          title={
                            isOnlyOwner && m.status === "active"
                              ? "Last Owner Protection: Cannot deactivate last owner"
                              : m.status === "active"
                              ? "Deactivate Account"
                              : "Reactivate Account"
                          }
                        >
                          {m.status === "active" ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button
                          type="button"
                          className="bl-btn-icon-sm bl-btn-danger"
                          onClick={() => handleDeleteMember(m)}
                          disabled={isOnlyOwner}
                          title={
                            isOnlyOwner
                              ? "Last Owner Protection: Cannot remove last owner"
                              : "Remove Member"
                          }
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="bl-modal-backdrop">
          <div className="bl-modal-content">
            <div className="bl-modal-header">
              <h3 className="bl-modal-title">Add Workspace Member</h3>
              <button
                type="button"
                className="bl-btn-close"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateMemberSubmit} className="bl-modal-form">
              <div className="bl-alert-info">
                <span>
                  <strong>Prototype Notice:</strong> Local member record will be created. Email invitation delivery will be handled by the Phase 12 cloud authentication service.
                </span>
              </div>

              <div className="bl-form-group">
                <label className="bl-form-label">Full Name *</label>
                <input
                  type="text"
                  className="bl-form-input"
                  placeholder="e.g. Siddharth Verma"
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="bl-form-group">
                <label className="bl-form-label">Corporate Email Address *</label>
                <input
                  type="email"
                  className="bl-form-input"
                  placeholder="e.g. siddharth@bizlead.io"
                  value={newMemberForm.email}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="bl-form-group">
                <label className="bl-form-label">Phone Number</label>
                <input
                  type="tel"
                  className="bl-form-input"
                  placeholder="+91 98200 12345"
                  value={newMemberForm.phone}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                />
              </div>

              <div className="bl-form-grid-2">
                <div className="bl-form-group">
                  <label className="bl-form-label">Department *</label>
                  <select
                    className="bl-form-select"
                    value={newMemberForm.departmentId}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, departmentId: e.target.value })}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bl-form-group">
                  <label className="bl-form-label">Assigned Role *</label>
                  <select
                    className="bl-form-select"
                    value={newMemberForm.roleId}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, roleId: e.target.value })}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bl-form-group">
                <label className="bl-form-label">Reporting Manager</label>
                <select
                  className="bl-form-select"
                  value={newMemberForm.reportingManagerId}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, reportingManagerId: e.target.value })}
                >
                  <option value="">None (Reports to Founder / Board)</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.roleId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bl-modal-footer">
                <button
                  type="button"
                  className="bl-btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="bl-btn-primary">
                  <UserPlus size={16} /> Confirm Member Addition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="bl-modal-backdrop">
          <div className="bl-modal-content">
            <div className="bl-modal-header">
              <h3 className="bl-modal-title">Edit Member: {editingMember.name}</h3>
              <button
                type="button"
                className="bl-btn-close"
                onClick={() => setEditingMember(null)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditMemberSubmit} className="bl-modal-form">
              <div className="bl-form-group">
                <label className="bl-form-label">Full Name</label>
                <input
                  type="text"
                  className="bl-form-input"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  required
                />
              </div>

              <div className="bl-form-group">
                <label className="bl-form-label">Email</label>
                <input
                  type="email"
                  className="bl-form-input"
                  value={editingMember.email}
                  onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                  required
                />
              </div>

              <div className="bl-form-grid-2">
                <div className="bl-form-group">
                  <label className="bl-form-label">Department</label>
                  <select
                    className="bl-form-select"
                    value={editingMember.departmentId}
                    onChange={(e) => setEditingMember({ ...editingMember, departmentId: e.target.value })}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bl-form-group">
                  <label className="bl-form-label">Role</label>
                  <select
                    className="bl-form-select"
                    value={editingMember.roleId}
                    onChange={(e) => setEditingMember({ ...editingMember, roleId: e.target.value })}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bl-form-group">
                <label className="bl-form-label">Reporting Manager</label>
                <select
                  className="bl-form-select"
                  value={editingMember.reportingManagerId || ""}
                  onChange={(e) => setEditingMember({ ...editingMember, reportingManagerId: e.target.value })}
                >
                  <option value="">None (Reports to Founder / Board)</option>
                  {members
                    .filter((m) => m.id !== editingMember.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.roleId})
                      </option>
                    ))}
                </select>
              </div>

              <div className="bl-modal-footer">
                <button
                  type="button"
                  className="bl-btn-secondary"
                  onClick={() => setEditingMember(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="bl-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Reassignment Modal */}
      {reassignModalOpen && (
        <div className="bl-modal-backdrop">
          <div className="bl-modal-content">
            <div className="bl-modal-header">
              <h3 className="bl-modal-title">Reassign CRM Record Ownership</h3>
              <button
                type="button"
                className="bl-btn-close"
                onClick={() => setReassignModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleReassignSubmit} className="bl-modal-form">
              <div className="bl-alert-info">
                <span>
                  Synchronize record ownership across Leads, Pipeline Deals, Tasks, and Contacts when team members shift roles or depart.
                </span>
              </div>

              <div className="bl-form-group">
                <label className="bl-form-label">Reassign records from member (Current Owner):</label>
                <select
                  className="bl-form-select"
                  value={reassignForm.fromName}
                  onChange={(e) => setReassignForm({ ...reassignForm, fromName: e.target.value })}
                  required
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.roleId} • {m.workloadStats.assignedLeads} leads, {m.workloadStats.assignedDeals} deals)
                    </option>
                  ))}
                </select>
              </div>

              <div className="bl-form-group">
                <label className="bl-form-label">Transfer ownership to (New Active Owner):</label>
                <select
                  className="bl-form-select"
                  value={reassignForm.toName}
                  onChange={(e) => setReassignForm({ ...reassignForm, toName: e.target.value })}
                  required
                >
                  {members
                    .filter((m) => m.name !== reassignForm.fromName && m.status === "active")
                    .map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.roleId})
                      </option>
                    ))}
                </select>
              </div>

              <div className="bl-modal-footer">
                <button
                  type="button"
                  className="bl-btn-secondary"
                  onClick={() => setReassignModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="bl-btn-primary">
                  <ArrowRightLeft size={16} /> Execute Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
