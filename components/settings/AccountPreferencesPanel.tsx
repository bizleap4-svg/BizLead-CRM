"use client";

import React, { useState } from "react";
import {
  User,
  Palette,
  Bell,
  Globe,
  Sliders,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";
import { useControlCenter } from "./ControlCenterContext";
import { useTheme, palettes } from "../theme/ThemeProvider";

export function AccountPreferencesPanel() {
  const { activeMember, updateMember, organization } = useControlCenter();
  const { theme: currentPalette, setDraft, apply, openStudio } = useTheme();

  const [name, setName] = useState(activeMember.name);
  const [email, setEmail] = useState(activeMember.email);
  const [phone, setPhone] = useState(activeMember.phone || "");
  const [defaultView, setDefaultView] = useState("/dashboard");
  const [language, setLanguage] = useState("en-IN");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [browserNotifs, setBrowserNotifs] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMember(activeMember.id, {
      name,
      email,
      phone,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="bl-settings-section-card">
      <div className="bl-section-header">
        <div className="bl-section-title-wrap">
          <User size={20} className="bl-accent-icon" />
          <div>
            <h2 className="bl-section-title">Personal Profile & Appearance</h2>
            <p className="bl-section-desc">
              Manage personal display name, communication preferences, theme palette, and default landing views.
            </p>
          </div>
        </div>
      </div>

      <div className="bl-alert-warning">
        <Lock size={16} />
        <div>
          <strong>Authentication Notice:</strong>
          <p>
            Secure password reset, multi-factor authentication (MFA), and encrypted session tokens are scheduled for Phase 12 Authentication & Multi-Tenancy.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="bl-alert-success">
          <CheckCircle2 size={16} />
          <span>Profile and appearance preferences saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bl-settings-form">
        {/* User Card */}
        <div className="bl-profile-card">
          <div className="bl-profile-avatar-wrap">
            <div className="bl-profile-large-avatar">{activeMember.avatar}</div>
          </div>
          <div className="bl-profile-details">
            <h3 className="bl-profile-name">{activeMember.name}</h3>
            <span className="bl-profile-role-badge">{activeMember.roleId.replace(/_/g, " ").toUpperCase()}</span>
            <p className="bl-profile-email">{activeMember.email}</p>
          </div>
        </div>

        <div className="bl-form-grid-3">
          <div className="bl-form-group">
            <label className="bl-form-label">Full Display Name</label>
            <input
              type="text"
              className="bl-form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="bl-form-group">
            <label className="bl-form-label">Contact Email</label>
            <input
              type="email"
              className="bl-form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="bl-form-group">
            <label className="bl-form-label">Phone Number</label>
            <input
              type="tel"
              className="bl-form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Theme Studio Quick Selector */}
        <div className="bl-theme-quick-section">
          <div className="bl-theme-quick-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Palette size={16} className="bl-accent-icon" />
              <strong>Theme Studio Palette Quick Select</strong>
            </div>
            <button
              type="button"
              className="bl-btn-secondary-sm"
              onClick={openStudio}
            >
              Open Full Theme Studio
            </button>
          </div>

          <div className="bl-theme-palettes-grid">
            {palettes.map((p) => {
              const isSelected = currentPalette.name === p.name;
              return (
                <button
                  key={p.name}
                  type="button"
                  className={`bl-theme-palette-chip ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    setDraft(p);
                    apply();
                  }}
                >
                  <div
                    className="bl-palette-dot"
                    style={{ backgroundColor: p.accent }}
                  />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferences Grid */}
        <div className="bl-form-grid-2">
          <div className="bl-form-group">
            <label className="bl-form-label">Default Workspace Landing View</label>
            <select
              className="bl-form-select"
              value={defaultView}
              onChange={(e) => setDefaultView(e.target.value)}
            >
              <option value="/dashboard">Executive Overview (/dashboard)</option>
              <option value="/leads">Lead Intelligence Table (/leads)</option>
              <option value="/pipeline">Pipeline Studio Kanban (/pipeline)</option>
              <option value="/inbox">Unified Communications Inbox (/inbox)</option>
              <option value="/tasks">Focus Center & Tasks (/tasks)</option>
              <option value="/ai">Biz AI Workspace (/ai)</option>
            </select>
          </div>

          <div className="bl-form-group">
            <label className="bl-form-label">Locale & Language</label>
            <select
              className="bl-form-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en-IN">English (India — Indian Lakhs/Crores)</option>
              <option value="en-US">English (United States — Millions/Billions)</option>
              <option value="en-GB">English (United Kingdom)</option>
            </select>
          </div>
        </div>

        {/* Notifications Toggles */}
        <div className="bl-notifications-box">
          <h4 className="bl-form-heading">Notification & Alert Preferences</h4>
          <div className="bl-toggle-row">
            <div>
              <strong>Email Digest & High Intent Alerts</strong>
              <p>Receive notifications when a lead score crosses 90 or high-value deal closes.</p>
            </div>
            <label className="bl-toggle-switch">
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
              />
              <span className="bl-toggle-slider" />
            </label>
          </div>

          <div className="bl-toggle-row">
            <div>
              <strong>In-App Task & Meeting Reminders</strong>
              <p>Show floating bell reminders 15 minutes before scheduled meetings.</p>
            </div>
            <label className="bl-toggle-switch">
              <input
                type="checkbox"
                checked={browserNotifs}
                onChange={(e) => setBrowserNotifs(e.target.checked)}
              />
              <span className="bl-toggle-slider" />
            </label>
          </div>
        </div>

        <div className="bl-form-actions">
          <button type="submit" className="bl-btn-primary">
            Save Account Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
