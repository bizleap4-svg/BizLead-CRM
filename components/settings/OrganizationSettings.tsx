"use client";

import React, { useState } from "react";
import { Building2, Save, CheckCircle2, AlertCircle, Globe, Mail, Phone, MapPin, Clock, DollarSign, Calendar } from "lucide-react";
import { useControlCenter } from "./ControlCenterContext";

export function OrganizationSettings() {
  const { organization, updateOrganization, canManageAdmin } = useControlCenter();
  const [formData, setFormData] = useState({ ...organization });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAllowedToManage = canManageAdmin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllowedToManage) {
      setErrorMsg("Permission Denied: Administrator role required to edit organization settings.");
      return;
    }

    if (!formData.name.trim()) {
      setErrorMsg("Business name is required.");
      return;
    }

    if (!formData.businessEmail.includes("@")) {
      setErrorMsg("Please enter a valid business email address.");
      return;
    }

    setErrorMsg(null);
    updateOrganization(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="bl-settings-section-card">
      <div className="bl-section-header">
        <div className="bl-section-title-wrap">
          <Building2 size={20} className="bl-accent-icon" />
          <div>
            <h2 className="bl-section-title">Organization Profile</h2>
            <p className="bl-section-desc">
              Global business identity, operating currency, tax year preferences and regional formatting.
            </p>
          </div>
        </div>
        {!isAllowedToManage && (
          <div className="bl-readonly-badge">
            <AlertCircle size={14} /> Read-only for current role
          </div>
        )}
      </div>

      {saveSuccess && (
        <div className="bl-alert-success">
          <CheckCircle2 size={16} />
          <span>Organization settings saved successfully and synced across workspace modules.</span>
        </div>
      )}

      {errorMsg && (
        <div className="bl-alert-error">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bl-settings-form">
        <div className="bl-form-grid-2">
          {/* Business Name */}
          <div className="bl-form-group">
            <label className="bl-form-label">Business / Legal Entity Name *</label>
            <input
              type="text"
              className="bl-form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isAllowedToManage}
              required
            />
          </div>

          {/* Industry */}
          <div className="bl-form-group">
            <label className="bl-form-label">Primary Industry</label>
            <select
              className="bl-form-select"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              disabled={!isAllowedToManage}
            >
              <option value="SaaS & Cloud Services">SaaS & Cloud Services</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Digital Marketing Agency">Digital Marketing Agency</option>
              <option value="Financial Services & Fintech">Financial Services & Fintech</option>
              <option value="Manufacturing & Logistics">Manufacturing & Logistics</option>
              <option value="Consulting & Professional Services">Consulting & Professional Services</option>
              <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
              <option value="Real Estate & Infrastructure">Real Estate & Infrastructure</option>
            </select>
          </div>

          {/* Company Size */}
          <div className="bl-form-group">
            <label className="bl-form-label">Company Size</label>
            <select
              className="bl-form-select"
              value={formData.companySize}
              onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
              disabled={!isAllowedToManage}
            >
              <option value="1-10 Employees">1-10 Employees (Seed / Boutique)</option>
              <option value="11-50 Employees">11-50 Employees (Growth)</option>
              <option value="50-250 Employees">50-250 Employees (Mid-Market)</option>
              <option value="250-1000 Employees">250-1000 Employees (Scale-up)</option>
              <option value="1000+ Employees">1000+ Employees (Enterprise)</option>
            </select>
          </div>

          {/* Business Email */}
          <div className="bl-form-group">
            <label className="bl-form-label">Primary Business Email *</label>
            <div className="bl-input-with-icon">
              <Mail size={16} className="bl-field-icon" />
              <input
                type="email"
                className="bl-form-input"
                value={formData.businessEmail}
                onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                disabled={!isAllowedToManage}
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="bl-form-group">
            <label className="bl-form-label">HQ Phone Number</label>
            <div className="bl-input-with-icon">
              <Phone size={16} className="bl-field-icon" />
              <input
                type="tel"
                className="bl-form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isAllowedToManage}
              />
            </div>
          </div>

          {/* Website */}
          <div className="bl-form-group">
            <label className="bl-form-label">Company Website</label>
            <div className="bl-input-with-icon">
              <Globe size={16} className="bl-field-icon" />
              <input
                type="url"
                className="bl-form-input"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                disabled={!isAllowedToManage}
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bl-form-grid-3">
          <div className="bl-form-group" style={{ gridColumn: "span 2" }}>
            <label className="bl-form-label">HQ Registered Street Address</label>
            <div className="bl-input-with-icon">
              <MapPin size={16} className="bl-field-icon" />
              <input
                type="text"
                className="bl-form-input"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!isAllowedToManage}
              />
            </div>
          </div>

          <div className="bl-form-group">
            <label className="bl-form-label">City</label>
            <input
              type="text"
              className="bl-form-input"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              disabled={!isAllowedToManage}
            />
          </div>

          <div className="bl-form-group">
            <label className="bl-form-label">Country</label>
            <input
              type="text"
              className="bl-form-input"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              disabled={!isAllowedToManage}
            />
          </div>

          {/* Default Timezone (default Asia/Kolkata) */}
          <div className="bl-form-group">
            <label className="bl-form-label">Workspace Timezone *</label>
            <div className="bl-input-with-icon">
              <Clock size={16} className="bl-field-icon" />
              <select
                className="bl-form-select"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                disabled={!isAllowedToManage}
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST — UTC+05:30) [Default]</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (EST — UTC-05:00)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST — UTC-08:00)</option>
                <option value="Europe/London">Europe/London (GMT/BST — UTC+00:00)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST — UTC+04:00)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT — UTC+08:00)</option>
              </select>
            </div>
          </div>

          {/* Default Currency (default INR) */}
          <div className="bl-form-group">
            <label className="bl-form-label">Reporting Currency *</label>
            <div className="bl-input-with-icon">
              <DollarSign size={16} className="bl-field-icon" />
              <select
                className="bl-form-select"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                disabled={!isAllowedToManage}
              >
                <option value="INR">INR (₹ — Indian Rupee) [Default]</option>
                <option value="USD">USD ($ — US Dollar)</option>
                <option value="EUR">EUR (€ — Euro)</option>
                <option value="GBP">GBP (£ — British Pound)</option>
                <option value="AED">AED (د.إ — UAE Dirham)</option>
                <option value="SGD">SGD (S$ — Singapore Dollar)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date and Format Settings */}
        <div className="bl-form-grid-3">
          <div className="bl-form-group">
            <label className="bl-form-label">Date Format</label>
            <div className="bl-input-with-icon">
              <Calendar size={16} className="bl-field-icon" />
              <select
                className="bl-form-select"
                value={formData.dateFormat}
                onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                disabled={!isAllowedToManage}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 18/11/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 11/18/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
              </select>
            </div>
          </div>

          <div className="bl-form-group">
            <label className="bl-form-label">Time Format</label>
            <select
              className="bl-form-select"
              value={formData.timeFormat}
              onChange={(e) => setFormData({ ...formData, timeFormat: e.target.value as "12h" | "24h" })}
              disabled={!isAllowedToManage}
            >
              <option value="12h">12-hour (e.g. 03:30 PM)</option>
              <option value="24h">24-hour (e.g. 15:30)</option>
            </select>
          </div>

          <div className="bl-form-group">
            <label className="bl-form-label">Financial Year Cycle</label>
            <select
              className="bl-form-select"
              value={formData.financialYearStart}
              onChange={(e) => setFormData({ ...formData, financialYearStart: e.target.value })}
              disabled={!isAllowedToManage}
            >
              <option value="April">April 1 — March 31 (Indian Standard)</option>
              <option value="January">January 1 — December 31 (Calendar Year)</option>
              <option value="July">July 1 — June 30</option>
              <option value="October">October 1 — September 30</option>
            </select>
          </div>
        </div>

        {isAllowedToManage && (
          <div className="bl-form-actions">
            <button type="submit" className="bl-btn-primary">
              <Save size={16} /> Save Organization Profile
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
