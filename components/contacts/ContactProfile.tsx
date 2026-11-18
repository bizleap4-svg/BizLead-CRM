"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Tag,
  User,
  DollarSign,
  Plus,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { Contact, Deal, PipelineStage } from "@/components/crm/types";
import { formatINR } from "@/components/crm/selectors";
import { ContactHero } from "./ContactHero";
import { ActivityTimeline } from "./ActivityTimeline";
import { NotesManager } from "./NotesManager";
import { FilesManager } from "./FilesManager";
import { TasksManager } from "./TasksManager";

interface ContactProfileProps {
  contact: Contact;
  deals: Deal[];
  stages: PipelineStage[];
  onEditContact: () => void;
  onAddDeal: () => void;
  onToggleFavorite: (id: string) => void;
}

export function ContactProfile({
  contact,
  deals,
  stages,
  onEditContact,
  onAddDeal,
  onToggleFavorite,
}: ContactProfileProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "activity" | "deals" | "notes" | "files" | "tasks"
  >("overview");

  const contactDeals = deals.filter(
    (d) => d.contactId === contact.id || (contact.dealIds || []).includes(d.id)
  );

  return (
    <div className="bl-contact-profile-pane">
      {/* Dark Hero Section */}
      <ContactHero
        contact={contact}
        deals={deals}
        stages={stages}
        onEdit={onEditContact}
        onAddDeal={onAddDeal}
        onToggleFavorite={onToggleFavorite}
        onOpenLogModal={() => setActiveTab("activity")}
      />

      {/* Profile Navigation Tabs */}
      <div className="bl-tabs bl-profile-tabs">
        {[
          { id: "overview", label: "Overview" },
          { id: "activity", label: "Activity Stream" },
          { id: "deals", label: `Opportunities (${contactDeals.length})` },
          { id: "notes", label: "Notes" },
          { id: "files", label: "Files & Documents" },
          { id: "tasks", label: "Tasks" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bl-tab-content" style={{ marginTop: "20px" }}>
        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="bl-overview-grid">
            {/* Primary Details Box */}
            <div className="bl-info-card">
              <h4 className="bl-card-heading">Contact Information</h4>
              <div className="bl-field-list">
                <div className="bl-field-item">
                  <span className="bl-field-label">Email Address</span>
                  <a
                    href={`mailto:${contact.email}`}
                    className="bl-field-value bl-link"
                  >
                    <Mail size={13} /> {contact.email}
                  </a>
                </div>

                <div className="bl-field-item">
                  <span className="bl-field-label">Phone Number</span>
                  <span className="bl-field-value">
                    <Phone size={13} /> {contact.phone || "-"}
                  </span>
                </div>

                <div className="bl-field-item">
                  <span className="bl-field-label">WhatsApp</span>
                  <span className="bl-field-value">
                    {contact.whatsapp || contact.phone || "-"}
                  </span>
                </div>

                <div className="bl-field-item">
                  <span className="bl-field-label">Location / City</span>
                  <span className="bl-field-value">
                    <MapPin size={13} /> {contact.location || "India"}
                  </span>
                </div>

                {contact.linkedin && (
                  <div className="bl-field-item">
                    <span className="bl-field-label">LinkedIn Profile</span>
                    <a
                      href={contact.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bl-field-value bl-link"
                    >
                      <Globe size={13} /> View LinkedIn
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Account & Source Details Box */}
            <div className="bl-info-card">
              <h4 className="bl-card-heading">Account & Attribution</h4>
              <div className="bl-field-list">
                <div className="bl-field-item">
                  <span className="bl-field-label">Organization</span>
                  <strong className="bl-field-value">
                    {contact.companyName || "None"}
                  </strong>
                </div>

                <div className="bl-field-item">
                  <span className="bl-field-label">Assigned Account Owner</span>
                  <span className="bl-field-value">
                    <User size={13} /> {contact.owner || "Unassigned"}
                  </span>
                </div>

                <div className="bl-field-item">
                  <span className="bl-field-label">Acquisition Channel</span>
                  <span className="bl-field-value">{contact.source}</span>
                </div>

                <div className="bl-field-item">
                  <span className="bl-field-label">Created In CRM</span>
                  <span className="bl-field-value">
                    <Calendar size={13} /> {contact.createdAt}
                  </span>
                </div>

                <div className="bl-field-item">
                  <span className="bl-field-label">Last Updated</span>
                  <span className="bl-field-value">{contact.updatedAt}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Activity Timeline */}
        {activeTab === "activity" && (
          <ActivityTimeline
            entityType="contact"
            entityId={contact.id}
            entityName={contact.name}
          />
        )}

        {/* Tab 3: Deals */}
        {activeTab === "deals" && (
          <div className="bl-deals-tab-container">
            <div className="bl-between" style={{ marginBottom: "14px" }}>
              <div>
                <strong>Opportunities ({contactDeals.length})</strong>
                <p style={{ fontSize: "11px", color: "var(--muted)", margin: "2px 0 0" }}>
                  Deals associated with {contact.name} and {contact.companyName}
                </p>
              </div>

              <button
                type="button"
                className="bl-primary bl-btn-sm"
                onClick={onAddDeal}
              >
                <Plus size={14} /> Add Opportunity
              </button>
            </div>

            <div className="bl-deals-cards-grid">
              {contactDeals.map((deal) => {
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
                      <span className="bl-deal-close">
                        Close: {deal.expectedCloseDate}
                      </span>
                    </div>
                  </article>
                );
              })}

              {contactDeals.length === 0 && (
                <div className="bl-empty-stream">
                  <DollarSign size={24} opacity={0.4} />
                  <p>No sales deals created yet for this contact.</p>
                  <button
                    type="button"
                    className="bl-secondary bl-btn-sm"
                    onClick={onAddDeal}
                    style={{ marginTop: "10px" }}
                  >
                    <Plus size={14} /> Create First Deal
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Notes */}
        {activeTab === "notes" && (
          <NotesManager
            entityType="contact"
            entityId={contact.id}
            entityName={contact.name}
          />
        )}

        {/* Tab 5: Files */}
        {activeTab === "files" && (
          <FilesManager
            entityType="contact"
            entityId={contact.id}
            entityName={contact.name}
          />
        )}

        {/* Tab 6: Tasks */}
        {activeTab === "tasks" && (
          <TasksManager
            entityType="contact"
            entityId={contact.id}
            entityName={contact.name}
          />
        )}
      </div>
    </div>
  );
}

export default ContactProfile;

