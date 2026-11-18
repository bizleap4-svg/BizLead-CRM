"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  UserCheck,
  Building2,
  DollarSign,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import {
  Lead,
  Contact,
  Company,
  PipelineStage,
  COMPANY_INDUSTRIES,
} from "@/components/crm/types";
import { formatINR } from "@/components/crm/selectors";

interface LeadConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  contacts: Contact[];
  companies: Company[];
  stages: PipelineStage[];
  onConvert: (params: {
    leadId: string;
    createContact: boolean;
    contactId?: string;
    contactData?: {
      name: string;
      email: string;
      phone: string;
      designation?: string;
    };
    createCompany: boolean;
    companyId?: string;
    companyData?: {
      name: string;
      industry: string;
      website?: string;
      city?: string;
    };
    createDeal: boolean;
    dealData?: {
      title: string;
      value: number;
      stage: string;
      expectedCloseDate?: string;
    };
  }) => Promise<void>;
}

export function LeadConvertModal({
  isOpen,
  onClose,
  lead,
  contacts,
  companies,
  stages,
  onConvert,
}: LeadConvertModalProps) {
  // Conversion Form State
  const [contactMode, setContactMode] = useState<"new" | "existing">("new");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactDesignation, setContactDesignation] = useState("Director / Key Contact");

  const [companyMode, setCompanyMode] = useState<"new" | "existing">("new");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState(COMPANY_INDUSTRIES[0]);
  const [companyCity, setCompanyCity] = useState("Mumbai");
  const [companyWebsite, setCompanyWebsite] = useState("");

  const [createDeal, setCreateDeal] = useState(true);
  const [dealTitle, setDealTitle] = useState("");
  const [dealValue, setDealValue] = useState(0);
  const [dealStage, setDealStage] = useState("qualified");
  const [dealCloseDate, setDealCloseDate] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactDuplicate, setContactDuplicate] = useState<Contact | null>(null);
  const [companyDuplicate, setCompanyDuplicate] = useState<Company | null>(null);

  // Initialize from lead
  useEffect(() => {
    if (lead) {
      setContactName(lead.name || "");
      setContactEmail(lead.email || "");
      setContactPhone(lead.phone || "");
      setContactDesignation("Director / Decision Maker");

      setCompanyName(lead.company || lead.name || "");
      setCompanyIndustry(COMPANY_INDUSTRIES[0]);
      setCompanyCity("Mumbai");
      setCompanyWebsite(
        lead.company
          ? `https://${lead.company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`
          : ""
      );

      setCreateDeal(true);
      setDealTitle(`${lead.company || lead.name} — Commercial Deal`);
      setDealValue(lead.value || 50000);
      setDealStage(lead.stage || "qualified");
      setDealCloseDate(
        lead.expectedCloseDate ||
          new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
      );

      // Duplicate pre-detection
      const foundContact = contacts.find(
        (c) => c.email.toLowerCase() === (lead.email || "").toLowerCase()
      );
      if (foundContact) {
        setContactDuplicate(foundContact);
        setContactMode("existing");
        setSelectedContactId(foundContact.id);
      } else {
        setContactDuplicate(null);
        setContactMode("new");
      }

      const foundCompany = companies.find(
        (c) => c.name.toLowerCase() === (lead.company || "").toLowerCase()
      );
      if (foundCompany) {
        setCompanyDuplicate(foundCompany);
        setCompanyMode("existing");
        setSelectedCompanyId(foundCompany.id);
      } else {
        setCompanyDuplicate(null);
        setCompanyMode("new");
      }
    }
  }, [lead, contacts, companies, isOpen]);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onConvert({
        leadId: lead.id,
        createContact: contactMode === "new",
        contactId: contactMode === "existing" ? selectedContactId : undefined,
        contactData:
          contactMode === "new"
            ? {
                name: contactName.trim(),
                email: contactEmail.trim(),
                phone: contactPhone.trim(),
                designation: contactDesignation.trim(),
              }
            : undefined,
        createCompany: companyMode === "new",
        companyId: companyMode === "existing" ? selectedCompanyId : undefined,
        companyData:
          companyMode === "new"
            ? {
                name: companyName.trim(),
                industry: companyIndustry,
                city: companyCity.trim(),
                website: companyWebsite.trim(),
              }
            : undefined,
        createDeal,
        dealData: createDeal
          ? {
              title: dealTitle.trim(),
              value: Number(dealValue) || 0,
              stage: dealStage,
              expectedCloseDate: dealCloseDate,
            }
          : undefined,
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bl-modal-backdrop" onClick={onClose}>
      <div
        className="bl-modal-content bl-convert-lead-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Convert Lead"
      >
        {/* Modal Header */}
        <div className="bl-between" style={{ marginBottom: "16px" }}>
          <div>
            <span className="bl-eyebrow">LEAD QUALIFICATION WORKFLOW</span>
            <h3>Convert Lead: {lead.name}</h3>
            <p style={{ fontSize: "12px", color: "var(--muted)" }}>
              Graduate this qualified prospect into a verified Contact, Company Account and Pipeline Deal.
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

        {/* Lead Snapshot Pill */}
        <div className="bl-lead-convert-snapshot">
          <div className="bl-snapshot-item">
            <span className="bl-label-sub">Lead Name</span>
            <strong>{lead.name}</strong>
          </div>
          <div className="bl-snapshot-item">
            <span className="bl-label-sub">Company</span>
            <strong>{lead.company || "N/A"}</strong>
          </div>
          <div className="bl-snapshot-item">
            <span className="bl-label-sub">Est. Value</span>
            <strong>{formatINR(lead.value)}</strong>
          </div>
          <div className="bl-snapshot-item">
            <span className="bl-label-sub">Score / Intent</span>
            <span className="bl-tag-pill">{lead.score}/100</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1: Contact 360° */}
          <div className="bl-convert-section">
            <div className="bl-convert-section-header">
              <div className="bl-convert-section-title">
                <UserCheck size={16} />
                <strong>1. Contact 360° Record</strong>
              </div>
              <div className="bl-mode-toggle">
                <label className={contactMode === "new" ? "active" : ""}>
                  <input
                    type="radio"
                    name="contactMode"
                    checked={contactMode === "new"}
                    onChange={() => setContactMode("new")}
                  />
                  Create New Contact
                </label>
                <label className={contactMode === "existing" ? "active" : ""}>
                  <input
                    type="radio"
                    name="contactMode"
                    checked={contactMode === "existing"}
                    onChange={() => setContactMode("existing")}
                  />
                  Attach to Existing
                </label>
              </div>
            </div>

            {contactDuplicate && contactMode === "new" && (
              <div className="bl-warning-banner">
                <AlertCircle size={14} />
                <span>
                  Existing contact found for <strong>{lead.email}</strong>:{" "}
                  {contactDuplicate.name} ({contactDuplicate.companyName}).
                </span>
                <button
                  type="button"
                  className="bl-text-btn"
                  onClick={() => {
                    setContactMode("existing");
                    setSelectedContactId(contactDuplicate.id);
                  }}
                >
                  Use Existing
                </button>
              </div>
            )}

            {contactMode === "new" ? (
              <div className="bl-form-grid bl-grid-2">
                <label>
                  Full Name *
                  <input
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </label>
                <label>
                  Designation / Role
                  <input
                    value={contactDesignation}
                    onChange={(e) => setContactDesignation(e.target.value)}
                  />
                </label>
                <label>
                  Work Email *
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </label>
                <label>
                  Phone / WhatsApp
                  <input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </label>
              </div>
            ) : (
              <div className="bl-form-grid">
                <label className="bl-full-field">
                  Select Existing Contact
                  <select
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    required
                  >
                    <option value="">Select a contact...</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.companyName} ({c.email})
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </div>

          {/* Section 2: Company Intelligence */}
          <div className="bl-convert-section">
            <div className="bl-convert-section-header">
              <div className="bl-convert-section-title">
                <Building2 size={16} />
                <strong>2. Company Intelligence Record</strong>
              </div>
              <div className="bl-mode-toggle">
                <label className={companyMode === "new" ? "active" : ""}>
                  <input
                    type="radio"
                    name="companyMode"
                    checked={companyMode === "new"}
                    onChange={() => setCompanyMode("new")}
                  />
                  Create New Account
                </label>
                <label className={companyMode === "existing" ? "active" : ""}>
                  <input
                    type="radio"
                    name="companyMode"
                    checked={companyMode === "existing"}
                    onChange={() => setCompanyMode("existing")}
                  />
                  Attach to Existing
                </label>
              </div>
            </div>

            {companyDuplicate && companyMode === "new" && (
              <div className="bl-warning-banner">
                <AlertCircle size={14} />
                <span>
                  Existing company found matching <strong>{lead.company}</strong> (
                  {companyDuplicate.name}).
                </span>
                <button
                  type="button"
                  className="bl-text-btn"
                  onClick={() => {
                    setCompanyMode("existing");
                    setSelectedCompanyId(companyDuplicate.id);
                  }}
                >
                  Use Existing
                </button>
              </div>
            )}

            {companyMode === "new" ? (
              <div className="bl-form-grid bl-grid-2">
                <label>
                  Company Name *
                  <input
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </label>
                <label>
                  Industry
                  <select
                    value={companyIndustry}
                    onChange={(e) => setCompanyIndustry(e.target.value)}
                  >
                    {COMPANY_INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  HQ City
                  <input
                    value={companyCity}
                    onChange={(e) => setCompanyCity(e.target.value)}
                  />
                </label>
                <label>
                  Website
                  <input
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                  />
                </label>
              </div>
            ) : (
              <div className="bl-form-grid">
                <label className="bl-full-field">
                  Select Existing Organization
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    required
                  >
                    <option value="">Select an organization...</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.industry} ({c.city})
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </div>

          {/* Section 3: Commercial Opportunity (Deal) */}
          <div className="bl-convert-section">
            <div className="bl-convert-section-header">
              <label className="bl-checkbox-label">
                <input
                  type="checkbox"
                  checked={createDeal}
                  onChange={(e) => setCreateDeal(e.target.checked)}
                />
                <DollarSign size={16} />
                <strong>3. Create Pipeline Opportunity (Deal)</strong>
              </label>
            </div>

            {createDeal && (
              <div className="bl-form-grid bl-grid-2">
                <label className="bl-full-field">
                  Deal Title *
                  <input
                    required
                    value={dealTitle}
                    onChange={(e) => setDealTitle(e.target.value)}
                  />
                </label>
                <label>
                  Deal Value (INR) *
                  <input
                    type="number"
                    min="0"
                    required
                    value={dealValue}
                    onChange={(e) => setDealValue(Number(e.target.value))}
                  />
                </label>
                <label>
                  Pipeline Stage
                  <select
                    value={dealStage}
                    onChange={(e) => setDealStage(e.target.value)}
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Target Closing Date
                  <input
                    type="date"
                    value={dealCloseDate}
                    onChange={(e) => setDealCloseDate(e.target.value)}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Reassurance Callout */}
          <div className="bl-insight" style={{ marginTop: "14px" }}>
            <CheckCircle2 size={18} />
            <div>
              <strong>Complete Audit Preservation</strong>
              <p>
                Converting this lead marks it as converted and attaches all historical
                records to the new Contact and Company. Original lead data is never deleted.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="bl-form-actions" style={{ marginTop: "18px" }}>
            <button
              type="button"
              className="bl-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bl-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Converting..." : "Complete Conversion"}{" "}
              <ArrowUpRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
