"use client";

import React, { useState } from "react";
import {
  Shield,
  UserCheck,
  ChevronDown,
  Search,
  Download,
  Sparkles,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { useControlCenter } from "./ControlCenterContext";
import { useTheme } from "../theme/ThemeProvider";

interface ControlCenterHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onLaunchOnboarding: () => void;
}

export function ControlCenterHeader({
  searchQuery,
  onSearchChange,
  onLaunchOnboarding,
}: ControlCenterHeaderProps) {
  const {
    organization,
    activeMember,
    activeRole,
    members,
    switchActiveMember,
    exportData,
  } = useControlCenter();
  const { openStudio } = useTheme();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const handleDownloadBackup = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bizlead_backup_v10_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Backup export failed", err);
    }
  };

  return (
    <div className="bl-settings-header-card">
      <div className="bl-settings-header-top">
        <div>
          <div className="bl-settings-eyebrow">
            <span>CONTROL CENTER</span>
            <span className="bl-dot-separator">•</span>
            <span>{organization.name}</span>
          </div>
          <h1 className="bl-settings-headline">Your business. Your rules.</h1>
          <p className="bl-settings-subtitle">
            Manage your people, permissions and workspace.
          </p>
        </div>

        <div className="bl-settings-header-actions">
          {/* Active Testing Role Switcher */}
          <div className="bl-role-switcher-container">
            <button
              type="button"
              className="bl-role-switcher-button"
              onClick={() => setSwitcherOpen(!switcherOpen)}
              title="Switch Active Testing Identity to test roles & permissions"
            >
              <div className="bl-role-switcher-avatar">{activeMember.avatar}</div>
              <div className="bl-role-switcher-info">
                <span className="bl-role-switcher-name">{activeMember.name}</span>
                <span
                  className="bl-role-switcher-badge"
                  style={{
                    backgroundColor: `${activeRole.color || "var(--accent)"}22`,
                    color: activeRole.color || "var(--accent)",
                  }}
                >
                  {activeRole.name}
                </span>
              </div>
              <ChevronDown size={14} className="bl-chevron-muted" />
            </button>

            {switcherOpen && (
              <div className="bl-role-switcher-dropdown">
                <div className="bl-role-dropdown-header">
                  <span>TEST IDENTITY & PERMISSIONS</span>
                  <p>Switch active role to verify CRM access scopes</p>
                </div>
                <div className="bl-role-dropdown-list">
                  {members.map((m) => {
                    const isSelected = m.id === activeMember.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        className={`bl-role-dropdown-item ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          switchActiveMember(m.id);
                          setSwitcherOpen(false);
                        }}
                      >
                        <div className="bl-dropdown-item-avatar">{m.avatar}</div>
                        <div className="bl-dropdown-item-details">
                          <span className="bl-dropdown-item-name">{m.name}</span>
                          <span className="bl-dropdown-item-role">
                            {m.roleId.replace(/_/g, " ").toUpperCase()} • {m.email}
                          </span>
                        </div>
                        {isSelected && <span className="bl-current-check">✓</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="bl-role-dropdown-footer">
                  <AlertCircle size={13} />
                  <span>Prototype authorization. Server tokens enforced in Phase 12.</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="bl-btn-secondary-sm"
            onClick={onLaunchOnboarding}
            title="Launch Setup Tour"
          >
            <HelpCircle size={15} /> Tour
          </button>

          <button
            type="button"
            className="bl-btn-secondary-sm"
            onClick={handleDownloadBackup}
            title="Export JSON Backup"
          >
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* Search & Sub-nav Bar */}
      <div className="bl-settings-search-bar">
        <div className="bl-settings-search-input-wrap">
          <Search size={16} className="bl-search-icon" />
          <input
            type="text"
            className="bl-settings-search-input"
            placeholder="Search all settings (e.g., currency, team, roles, webhooks, audit, billing)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="bl-search-clear"
              onClick={() => onSearchChange("")}
            >
              ×
            </button>
          )}
        </div>
        <div className="bl-settings-tagline-pill">
          <span>The Intelligence Behind Growth.</span>
        </div>
      </div>
    </div>
  );
}
