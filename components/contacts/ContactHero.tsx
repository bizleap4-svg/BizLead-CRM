"use client";

import React from "react";
import {
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  DollarSign,
  TrendingUp,
  Target,
  Edit2,
  Plus,
  Building2,
  Star,
} from "lucide-react";
import { Contact, Deal, PipelineStage } from "@/components/crm/types";
import {
  formatINR,
  formatLakhs,
  selectContactWonValue,
  selectContactOpenDealsCount,
} from "@/components/crm/selectors";

interface ContactHeroProps {
  contact: Contact;
  deals: Deal[];
  stages: PipelineStage[];
  onEdit: () => void;
  onAddDeal: () => void;
  onToggleFavorite: (id: string) => void;
  onOpenLogModal: () => void;
}

export function ContactHero({
  contact,
  deals,
  stages,
  onEdit,
  onAddDeal,
  onToggleFavorite,
  onOpenLogModal,
}: ContactHeroProps) {
  const wonValue = selectContactWonValue(contact.id, deals, stages);
  const openDealsCount = selectContactOpenDealsCount(contact.id, deals, stages);

  const cleanPhone = (contact.phone || "").replace(/[^\d+]/g, "");
  const cleanWhatsapp = (contact.whatsapp || contact.phone || "").replace(
    /[^\d]/g,
    ""
  );

  return (
    <section className="bl-contact-hero" aria-label="Customer Profile Summary">
      <div className="bl-hero-top-row">
        {/* Left: Avatar & Identity */}
        <div className="bl-hero-identity">
          <div className="bl-hero-avatar">
            {contact.avatar || contact.name.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <div className="bl-hero-name-row">
              <h2 className="bl-hero-name">{contact.name}</h2>
              <button
                type="button"
                className={`bl-star-btn ${contact.isFavorite ? "active" : ""}`}
                onClick={() => onToggleFavorite(contact.id)}
                title={contact.isFavorite ? "Remove favorite" : "Star favorite"}
                aria-label="Star contact"
              >
                <Star size={16} fill={contact.isFavorite ? "var(--accent)" : "none"} />
              </button>
            </div>

            <p className="bl-hero-role">
              {contact.designation || "Executive"} ·{" "}
              <span className="bl-hero-company">
                <Building2 size={13} style={{ display: "inline", verticalAlign: "-2px" }} />{" "}
                {contact.companyName || "Independent"}
              </span>
            </p>

            <div className="bl-hero-tags">
              <span className={`bl-lifecycle-pill bl-status-${contact.lifecycleStatus}`}>
                {contact.lifecycleStatus.toUpperCase()}
              </span>
              {(contact.tags || []).map((tag) => (
                <span key={tag} className="bl-hero-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="bl-hero-actions">
          {contact.phone && (
            <a
              href={`tel:${cleanPhone}`}
              className="bl-hero-btn bl-call-btn"
              title={`Call ${contact.name}`}
            >
              <Phone size={14} /> Call
            </a>
          )}

          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="bl-hero-btn bl-email-btn"
              title={`Email ${contact.name}`}
            >
              <Mail size={14} /> Email
            </a>
          )}

          {cleanWhatsapp && (
            <a
              href={`https://wa.me/${cleanWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bl-hero-btn bl-wa-btn"
              title={`Open WhatsApp chat with ${contact.name}`}
            >
              <MessageSquare size={14} /> WhatsApp
            </a>
          )}

          <button
            type="button"
            className="bl-hero-btn bl-log-btn"
            onClick={onOpenLogModal}
            title="Log an interaction"
          >
            <Sparkles size={14} /> Log Action
          </button>

          <button
            type="button"
            className="bl-hero-btn bl-edit-btn"
            onClick={onEdit}
            title="Edit Contact profile"
          >
            <Edit2 size={14} /> Edit
          </button>
        </div>
      </div>

      {/* Hero Metrics Strip */}
      <div className="bl-hero-metrics-strip">
        <div className="bl-hero-metric">
          <span className="bl-metric-title">Customer Lifetime Value</span>
          <strong className="bl-metric-stat" style={{ color: "var(--accent)" }}>
            {formatLakhs(wonValue)}
          </strong>
          <small className="bl-metric-hint">Closed revenue booked</small>
        </div>

        <div className="bl-hero-metric">
          <span className="bl-metric-title">Open Opportunities</span>
          <strong className="bl-metric-stat">{openDealsCount}</strong>
          <small className="bl-metric-hint">Active deals in pipeline</small>
        </div>

        <div className="bl-hero-metric">
          <span className="bl-metric-title">Relationship Score</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <strong
              className="bl-metric-stat"
              style={{
                color:
                  contact.relationshipScore >= 80
                    ? "#16825B"
                    : contact.relationshipScore >= 60
                    ? "#fb8c00"
                    : "var(--text)",
              }}
            >
              {contact.relationshipScore}
            </strong>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>/ 100</span>
          </div>
          <small className="bl-metric-hint">Based on recency & touchpoints</small>
        </div>

        <div className="bl-hero-metric bl-metric-cta" onClick={onAddDeal}>
          <div className="bl-cta-content">
            <Plus size={16} />
            <span>Create Opportunity</span>
          </div>
          <small style={{ color: "var(--muted)" }}>Directly linked to contact</small>
        </div>
      </div>
    </section>
  );
}

export default ContactHero;
