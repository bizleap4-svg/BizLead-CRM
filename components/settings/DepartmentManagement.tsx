"use client";

import React, { useState } from "react";
import {
  Building,
  Plus,
  Users,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import { useControlCenter } from "./ControlCenterContext";
import { Department } from "./types";

export function DepartmentManagement() {
  const {
    departments,
    members,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    canManageAdmin,
  } = useControlCenter();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isAllowedToManage = canManageAdmin();

  const [newDeptForm, setNewDeptForm] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    headMemberId: "",
  });

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptForm.name.trim()) {
      showNotification("error", "Department name is required.");
      return;
    }

    try {
      createDepartment({
        name: newDeptForm.name,
        description: newDeptForm.description || "Operational department.",
        color: newDeptForm.color,
        headMemberId: newDeptForm.headMemberId || undefined,
        isSystem: false,
      });

      setIsAddModalOpen(false);
      setNewDeptForm({ name: "", description: "", color: "#3B82F6", headMemberId: "" });
      showNotification("success", `Department "${newDeptForm.name}" created successfully.`);
    } catch (err: any) {
      showNotification("error", err.message || "Failed to create department");
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;

    try {
      updateDepartment(editingDept.id, {
        name: editingDept.name,
        description: editingDept.description,
        color: editingDept.color,
        headMemberId: editingDept.headMemberId || undefined,
      });
      setEditingDept(null);
      showNotification("success", `Department "${editingDept.name}" updated.`);
    } catch (err: any) {
      showNotification("error", err.message || "Failed to update department");
    }
  };

  const handleDelete = (dept: Department) => {
    if (dept.isSystem) {
      showNotification("error", "Cannot delete a protected system department.");
      return;
    }

    const assignedCount = members.filter((m) => m.departmentId === dept.id).length;
    if (assignedCount > 0) {
      showNotification(
        "error",
        `Cannot delete department "${dept.name}" because ${assignedCount} active members belong to it. Reassign members first.`
      );
      return;
    }

    if (confirm(`Are you sure you want to delete department "${dept.name}"?`)) {
      try {
        deleteDepartment(dept.id);
        showNotification("success", `Department "${dept.name}" deleted.`);
      } catch (err: any) {
        showNotification("error", err.message || "Failed to delete department");
      }
    }
  };

  return (
    <div className="bl-settings-section-card">
      <div className="bl-section-header">
        <div className="bl-section-title-wrap">
          <Building size={20} className="bl-accent-icon" />
          <div>
            <h2 className="bl-section-title">Department Architecture</h2>
            <p className="bl-section-desc">
              Organize functional teams, assign department leadership, and coordinate division workloads.
            </p>
          </div>
        </div>
        {isAllowedToManage && (
          <button
            type="button"
            className="bl-btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} /> New Department
          </button>
        )}
      </div>

      {notification && (
        <div className={`bl-alert-${notification.type}`}>
          {notification.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{notification.text}</span>
        </div>
      )}

      <div className="bl-dept-grid">
        {departments.map((dept) => {
          const deptMembers = members.filter((m) => m.departmentId === dept.id);
          const head = members.find((m) => m.id === dept.headMemberId);

          return (
            <div key={dept.id} className="bl-dept-card">
              <div className="bl-dept-card-header">
                <div className="bl-dept-title-row">
                  <div
                    className="bl-dept-indicator-pill"
                    style={{ backgroundColor: dept.color }}
                  />
                  <h3 className="bl-dept-name">{dept.name}</h3>
                  {dept.isSystem && <span className="bl-system-tag">System</span>}
                </div>

                {isAllowedToManage && (
                  <div className="bl-dept-card-actions">
                    <button
                      type="button"
                      className="bl-btn-icon-xs"
                      onClick={() => setEditingDept({ ...dept })}
                      title="Edit Department"
                    >
                      <Edit2 size={13} />
                    </button>
                    {!dept.isSystem && (
                      <button
                        type="button"
                        className="bl-btn-icon-xs bl-btn-danger"
                        onClick={() => handleDelete(dept)}
                        title="Delete Department"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <p className="bl-dept-desc">{dept.description}</p>

              <div className="bl-dept-card-footer">
                <div className="bl-dept-head-info">
                  <span className="bl-label-xs">Department Lead</span>
                  <span className="bl-head-name">
                    {head ? `${head.name} (${head.roleId.replace(/_/g, " ")})` : "Unassigned"}
                  </span>
                </div>

                <div className="bl-dept-member-counter">
                  <Users size={14} />
                  <span>{deptMembers.length} members</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Department Modal */}
      {isAddModalOpen && (
        <div className="bl-modal-backdrop">
          <div className="bl-modal-content">
            <div className="bl-modal-header">
              <h3 className="bl-modal-title">Create Department</h3>
              <button
                type="button"
                className="bl-btn-close"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="bl-modal-form">
              <div className="bl-form-group">
                <label className="bl-form-label">Department Name *</label>
                <input
                  type="text"
                  className="bl-form-input"
                  placeholder="e.g. Strategic Partnerships"
                  value={newDeptForm.name}
                  onChange={(e) => setNewDeptForm({ ...newDeptForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="bl-form-group">
                <label className="bl-form-label">Description</label>
                <textarea
                  className="bl-form-textarea"
                  rows={2}
                  placeholder="Outline the scope and responsibilities of this department..."
                  value={newDeptForm.description}
                  onChange={(e) => setNewDeptForm({ ...newDeptForm, description: e.target.value })}
                />
              </div>

              <div className="bl-form-grid-2">
                <div className="bl-form-group">
                  <label className="bl-form-label">Department Lead</label>
                  <select
                    className="bl-form-select"
                    value={newDeptForm.headMemberId}
                    onChange={(e) => setNewDeptForm({ ...newDeptForm, headMemberId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.roleId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bl-form-group">
                  <label className="bl-form-label">Theme Color</label>
                  <input
                    type="color"
                    className="bl-form-color"
                    value={newDeptForm.color}
                    onChange={(e) => setNewDeptForm({ ...newDeptForm, color: e.target.value })}
                  />
                </div>
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
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {editingDept && (
        <div className="bl-modal-backdrop">
          <div className="bl-modal-content">
            <div className="bl-modal-header">
              <h3 className="bl-modal-title">Edit Department: {editingDept.name}</h3>
              <button
                type="button"
                className="bl-btn-close"
                onClick={() => setEditingDept(null)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="bl-modal-form">
              <div className="bl-form-group">
                <label className="bl-form-label">Department Name</label>
                <input
                  type="text"
                  className="bl-form-input"
                  value={editingDept.name}
                  onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                  disabled={editingDept.isSystem}
                  required
                />
              </div>

              <div className="bl-form-group">
                <label className="bl-form-label">Description</label>
                <textarea
                  className="bl-form-textarea"
                  rows={2}
                  value={editingDept.description}
                  onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })}
                />
              </div>

              <div className="bl-form-grid-2">
                <div className="bl-form-group">
                  <label className="bl-form-label">Department Lead</label>
                  <select
                    className="bl-form-select"
                    value={editingDept.headMemberId || ""}
                    onChange={(e) => setEditingDept({ ...editingDept, headMemberId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.roleId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bl-form-group">
                  <label className="bl-form-label">Theme Color</label>
                  <input
                    type="color"
                    className="bl-form-color"
                    value={editingDept.color}
                    onChange={(e) => setEditingDept({ ...editingDept, color: e.target.value })}
                  />
                </div>
              </div>

              <div className="bl-modal-footer">
                <button
                  type="button"
                  className="bl-btn-secondary"
                  onClick={() => setEditingDept(null)}
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
    </div>
  );
}
