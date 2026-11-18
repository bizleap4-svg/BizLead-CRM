"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowUpRight, AlertCircle, Building2 } from "lucide-react";
import {
  Company,
  CompanyLifecycle,
  COMPANY_INDUSTRIES,
  PIPELINE_OWNERS,
} from "@/components/crm/types";

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null; // null if creating new
  existingCompanies: Company[];
  onSave: (data: Partial<Company>) => Promise<void>;
}

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

export function CompanyModal({
  isOpen,
  onClose,
  company,
  existingCompanies,
  onSave,
}: CompanyModalProps) {
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  useEffect(() => {
    if (company) {
      setFormData({ ...company });
      setTagInput((company.tags || []).join(", "));
    } else {
      setFormData({
        name: "",
        industry: COMPANY_INDUSTRIES[0],
        website: "",
        companySize: "11-50",
        businessEmail: "",
        businessPhone: "+91 ",
        address: "",
        city: "Mumbai",
        country: "India",
        owner: PIPELINE_OWNERS[0],
        lifecycleStatus: "prospect",
        annualRevenue: 0,
        accountNotes: "",
        tags: ["Key Account"],
        contactIds: [],
        dealIds: [],
      });
      setTagInput("Key Account");
    }
    setDuplicateWarning(null);
  }, [company, isOpen]);

  if (!isOpen) return null;

  const isEditing = Boolean(company);

  const handleFieldChange = (field: keyof Company, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Duplicate name detection
    if (field === "name" && typeof value === "string") {
      const nameTrim = value.trim().toLowerCase();
      const duplicate = existingCompanies.find(
        (c) => c.name.toLowerCase() === nameTrim && c.id !== company?.id
      );
      if (duplicate) {
        setDuplicateWarning(
          `Notice: An organization named "${duplicate.name}" is already tracked (${duplicate.industry} • Owner: ${duplicate.owner}).`
        );
      } else {
        setDuplicateWarning(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    setIsSaving(true);
    try {
      const tagsArray = tagInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave({
        ...formData,
        tags: tagsArray,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bl-modal-backdrop" onClick={onClose}>
      <div
        className="bl-modal-content bl-company-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={isEditing ? "Edit Company" : "Create New Company"}
      >
        <div className="bl-between" style={{ marginBottom: "18px" }}>
          <div>
            <span className="bl-eyebrow">COMPANY INTELLIGENCE</span>
            <h3>{isEditing ? `Edit ${company?.name}` : "Create New Company"}</h3>
            <p style={{ fontSize: "12px", color: "var(--muted)" }}>
              Manage corporate accounts, organizational hierarchy and deal relationships
            </p>
          </div>
          <button
            type="button"
            className="bl-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {duplicateWarning && (
          <div className="bl-warning-banner">
            <AlertCircle size={15} /> {duplicateWarning}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bl-form-grid">
          <label className="bl-full-field">
            Company Name *
            <input
              required
              placeholder="e.g. Layers Studio / Orbit Technologies"
              value={formData.name || ""}
              onChange={(e) => handleFieldChange("name", e.target.value)}
            />
          </label>

          <label>
            Industry
            <select
              value={formData.industry || COMPANY_INDUSTRIES[0]}
              onChange={(e) => handleFieldChange("industry", e.target.value)}
            >
              {COMPANY_INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </label>

          <label>
            Company Size
            <select
              value={formData.companySize || "11-50"}
              onChange={(e) => handleFieldChange("companySize", e.target.value)}
            >
              {COMPANY_SIZES.map((sz) => (
                <option key={sz} value={sz}>
                  {sz} employees
                </option>
              ))}
            </select>
          </label>

          <label>
            Website
            <input
              type="text"
              placeholder="e.g. https://company.com"
              value={formData.website || ""}
              onChange={(e) => handleFieldChange("website", e.target.value)}
            />
          </label>

          <label>
            Lifecycle Status
            <select
              value={formData.lifecycleStatus || "prospect"}
              onChange={(e) =>
                handleFieldChange("lifecycleStatus", e.target.value as CompanyLifecycle)
              }
            >
              <option value="prospect">Prospect</option>
              <option value="active">Active Customer</option>
              <option value="enterprise">Enterprise Tier</option>
              <option value="inactive">Inactive / Past</option>
            </select>
          </label>

          <label>
            Business Email
            <input
              type="email"
              placeholder="e.g. hello@company.com"
              value={formData.businessEmail || ""}
              onChange={(e) => handleFieldChange("businessEmail", e.target.value)}
            />
          </label>

          <label>
            Business Phone
            <input
              type="text"
              placeholder="+91 22 2490 1100"
              value={formData.businessPhone || ""}
              onChange={(e) => handleFieldChange("businessPhone", e.target.value)}
            />
          </label>

          <label>
            City
            <input
              placeholder="e.g. Mumbai, Bengaluru"
              value={formData.city || ""}
              onChange={(e) => handleFieldChange("city", e.target.value)}
            />
          </label>

          <label>
            Country
            <input
              placeholder="e.g. India"
              value={formData.country || ""}
              onChange={(e) => handleFieldChange("country", e.target.value)}
            />
          </label>

          <label>
            Account Owner
            <select
              value={formData.owner || PIPELINE_OWNERS[0]}
              onChange={(e) => handleFieldChange("owner", e.target.value)}
            >
              {PIPELINE_OWNERS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>

          <label>
            Est. Annual Revenue (INR)
            <input
              type="number"
              min="0"
              placeholder="0"
              value={formData.annualRevenue || 0}
              onChange={(e) =>
                handleFieldChange("annualRevenue", Math.max(0, Number(e.target.value)))
              }
            />
          </label>

          <label className="bl-full-field">
            Street Address / HQ
            <input
              placeholder="e.g. 402, High Street Phoenix, Senapati Bapat Marg, Lower Parel"
              value={formData.address || ""}
              onChange={(e) => handleFieldChange("address", e.target.value)}
            />
          </label>

          <label className="bl-full-field">
            Tags (comma separated)
            <input
              placeholder="Key Account, High LTV, Strategic"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
            />
          </label>

          <label className="bl-full-field">
            Account Notes & Strategic Goals
            <textarea
              rows={4}
              placeholder="Enter strategic context, commercial history, key stakeholders..."
              value={formData.accountNotes || ""}
              onChange={(e) => handleFieldChange("accountNotes", e.target.value)}
            />
          </label>

          <div className="bl-form-actions bl-full-field">
            <button
              type="button"
              className="bl-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button type="submit" className="bl-primary" disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create Company"}{" "}
              <ArrowUpRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
