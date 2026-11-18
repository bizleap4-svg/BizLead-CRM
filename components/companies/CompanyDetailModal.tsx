"use client";

import React, { useState } from "react";
import {
  X,
  Building2,
  Globe,
  MapPin,
  Mail,
  Phone,
  Users,
  DollarSign,
  Plus,
  ArrowUpRight,
  Edit2,
  Calendar,
  Tag,
} from "lucide-react";
import { Company, Contact, Deal, PipelineStage } from "@/components/crm/types";
import { formatINR, selectCompanySummary } from "@/components/crm/selectors";
import { ActivityTimeline } from "@/components/contacts/ActivityTimeline";
import { NotesManager } from "@/components/contacts/NotesManager";
import { FilesManager } from "@/components/contacts/FilesManager";

interface CompanyDetailModalProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  deals: Deal[];
  stages: PipelineStage[];
  onEditCompany: (company: Company) => void;
  onAddContactToCompany: (company: Company) => void;
  onAddDealToCompany: (company: Company) => void;
}

export function CompanyDetailModal({
  company,
  isOpen,
  onClose,
  contacts,
  deals,
  stages,
  onEditCompany,
  onAddContactToCompany,
  onAddDealToCompany,
}: CompanyDetailModalProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "contacts" | "deals" | "activity" | "notes" | "files"
  >("overview");

  if (!isOpen || !company) return null;

  const summary = selectCompanySummary(company.id, contacts, deals, stages);
  const companyContacts = contacts.filter((c) => c.companyId === company.id);
  const companyDeals = deals.filter((d) => d.companyId === company.id);

  return (
    <div className="bl-modal-backdrop" onClick={onClose}>
      <div
        className="bl-modal-content bl-company-detail-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Company Workspace - ${company.name}`}
      >
        {/* Header Hero */}
        <div className="bl-between" style={{ alignItems: "flex-start", marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <div className="bl-company-large-avatar">
              {company.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ fontSize: "22px", margin: 0, fontWeight: 800 }}>
                  {company.name}
                </h2>
                <span className={`bl-lifecycle-pill bl-status-${company.lifecycleStatus}`}>
                  {company.lifecycleStatus}
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--muted)", margin: "4px 0 0" }}>
                {company.industry} · {company.city}, {company.country} · {company.companySize} employees
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="bl-secondary bl-btn-sm"
              onClick={() => onEditCompany(company)}
            >
              <Edit2 size={13} /> Edit Account
            </button>
            <button type="button" className="bl-icon" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Revenue Summary Strip */}
        <div className="bl-hero-metrics-strip" style={{ marginBottom: "20px" }}>
          <div className="bl-hero-metric">
            <span className="bl-metric-title">Closed Won Value</span>
            <strong className="bl-metric-stat" style={{ color: "#16825B" }}>
              {formatINR(summary.wonValue)}
            </strong>
            <small className="bl-metric-hint">Historical booked revenue</small>
          </div>

          <div className="bl-hero-metric">
            <span className="bl-metric-title">Open Pipeline</span>
            <strong className="bl-metric-stat" style={{ color: "var(--accent)" }}>
              {formatINR(summary.openPipeline)}
            </strong>
            <small className="bl-metric-hint">Active deals in negotiation</small>
          </div>

          <div className="bl-hero-metric">
            <span className="bl-metric-title">Associated Contacts</span>
            <strong className="bl-metric-stat">{summary.contactsCount}</strong>
            <small className="bl-metric-hint">Connected stakeholders</small>
          </div>

          <div className="bl-hero-metric">
            <span className="bl-metric-title">Total Deals</span>
            <strong className="bl-metric-stat">{summary.dealsCount}</strong>
            <small className="bl-metric-hint">Closed & active opportunities</small>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bl-tabs">
          {[
            { id: "overview", label: "Account Overview" },
            { id: "contacts", label: `Contacts (${companyContacts.length})` },
            { id: "deals", label: `Deals (${companyDeals.length})` },
            { id: "activity", label: "Activity Timeline" },
            { id: "notes", label: "Account Notes" },
            { id: "files", label: "Attachments" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              className={activeTab === t.id ? "active" : ""}
              onClick={() => setActiveTab(t.id as any)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ marginTop: "18px" }}>
          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className="bl-overview-grid">
              <div className="bl-info-card">
                <h4 className="bl-card-heading">Organization Details</h4>
                <div className="bl-field-list">
                  <div className="bl-field-item">
                    <span className="bl-field-label">Official Website</span>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bl-field-value bl-link"
                    >
                      <Globe size={13} /> {company.website || "No website"}
                    </a>
                  </div>

                  <div className="bl-field-item">
                    <span className="bl-field-label">Business Phone</span>
                    <span className="bl-field-value">
                      <Phone size={13} /> {company.businessPhone || "-"}
                    </span>
                  </div>

                  <div className="bl-field-item">
                    <span className="bl-field-label">Business Email</span>
                    <a
                      href={`mailto:${company.businessEmail}`}
                      className="bl-field-value bl-link"
                    >
                      <Mail size={13} /> {company.businessEmail || "-"}
                    </a>
                  </div>

                  <div className="bl-field-item">
                    <span className="bl-field-label">Office Address</span>
                    <span className="bl-field-value">
                      <MapPin size={13} /> {company.address || `${company.city}, ${company.country}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bl-info-card">
                <h4 className="bl-card-heading">Commercial Profile</h4>
                <div className="bl-field-list">
                  <div className="bl-field-item">
                    <span className="bl-field-label">Account Owner</span>
                    <strong className="bl-field-value">
                      {company.owner || "Unassigned"}
                    </strong>
                  </div>

                  <div className="bl-field-item">
                    <span className="bl-field-label">Industry Classification</span>
                    <span className="bl-field-value">{company.industry}</span>
                  </div>

                  <div className="bl-field-item">
                    <span className="bl-field-label">Company Size</span>
                    <span className="bl-field-value">{company.companySize} employees</span>
                  </div>

                  <div className="bl-field-item">
                    <span className="bl-field-label">Account Added</span>
                    <span className="bl-field-value">{company.createdAt}</span>
                  </div>
                </div>
              </div>

              {company.accountNotes && (
                <div className="bl-info-card" style={{ gridColumn: "1 / -1" }}>
                  <h4 className="bl-card-heading">Executive Account Notes</h4>
                  <p style={{ fontSize: "12px", color: "var(--text)", lineHeight: 1.5, margin: 0 }}>
                    {company.accountNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Contacts */}
          {activeTab === "contacts" && (
            <div>
              <div className="bl-between" style={{ marginBottom: "12px" }}>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Showing all contacts affiliated with {company.name}
                </span>
                <button
                  type="button"
                  className="bl-primary bl-btn-sm"
                  onClick={() => onAddContactToCompany(company)}
                >
                  <Plus size={14} /> Add Contact to Account
                </button>
              </div>

              <div className="bl-associated-contacts-list">
                {companyContacts.map((contact) => (
                  <article key={contact.id} className="bl-contact-card-item">
                    <div className="bl-contact-card-avatar">
                      {contact.avatar || contact.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="bl-contact-card-info">
                      <div className="bl-between">
                        <h4 className="bl-contact-card-name">{contact.name}</h4>
                        <span className={`bl-lifecycle-mini bl-status-${contact.lifecycleStatus}`}>
                          {contact.lifecycleStatus}
                        </span>
                      </div>
                      <span className="bl-contact-card-company">
                        {contact.designation || "Executive"} · {contact.email} · {contact.phone}
                      </span>
                    </div>
                  </article>
                ))}

                {companyContacts.length === 0 && (
                  <div className="bl-empty-stream">
                    <Users size={24} opacity={0.4} />
                    <p>No contacts linked to this organization yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Deals */}
          {activeTab === "deals" && (
            <div>
              <div className="bl-between" style={{ marginBottom: "12px" }}>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Commercial pipeline deals for {company.name}
                </span>
                <button
                  type="button"
                  className="bl-primary bl-btn-sm"
                  onClick={() => onAddDealToCompany(company)}
                >
                  <Plus size={14} /> Add Deal
                </button>
              </div>

              <div className="bl-deals-cards-grid">
                {companyDeals.map((deal) => {
                  const stageObj = stages.find((s) => s.id === deal.stage);
                  return (
                    <article key={deal.id} className="bl-contact-deal-card">
                      <div className="bl-between">
                        <h4 className="bl-deal-name">{deal.title}</h4>
                        <strong className="bl-deal-val">{formatINR(deal.value)}</strong>
                      </div>
                      <div className="bl-deal-details-row">
                        <span className="bl-deal-stage-badge">
                          Stage: {stageObj?.name || deal.stage}
                        </span>
                        <span className="bl-deal-prob">
                          {deal.probability}% probability
                        </span>
                        <span>Contact: {deal.contactName || "Direct"}</span>
                      </div>
                    </article>
                  );
                })}

                {companyDeals.length === 0 && (
                  <div className="bl-empty-stream">
                    <DollarSign size={24} opacity={0.4} />
                    <p>No active deals recorded for this account.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Activity Timeline */}
          {activeTab === "activity" && (
            <ActivityTimeline
              entityType="company"
              entityId={company.id}
              entityName={company.name}
            />
          )}

          {/* Tab 5: Notes */}
          {activeTab === "notes" && (
            <NotesManager
              entityType="company"
              entityId={company.id}
              entityName={company.name}
            />
          )}

          {/* Tab 6: Files */}
          {activeTab === "files" && (
            <FilesManager
              entityType="company"
              entityId={company.id}
              entityName={company.name}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CompanyDetailModal;
