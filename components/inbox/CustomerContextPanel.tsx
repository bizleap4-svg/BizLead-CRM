"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Building2,
  Mail,
  Phone,
  ArrowUpRight,
  Plus,
  Sparkles,
  Calendar,
  DollarSign,
  TrendingUp,
  UserPlus,
  Link2,
  CheckCircle2,
  X,
  Target,
} from "lucide-react";
import {
  Conversation,
  Contact,
  Company,
  Deal,
  Lead,
  PipelineStage,
} from "@/components/crm/types";
import {
  formatINR,
  selectContactWonValue,
  selectContactOpenDealsCount,
} from "@/components/crm/selectors";
import { useCRM } from "@/components/crm/CRMProvider";

interface CustomerContextPanelProps {
  conversation: Conversation;
  contacts: Contact[];
  companies: Company[];
  deals: Deal[];
  stages: PipelineStage[];
  onOpenCreateOpportunity?: () => void;
  onOpenScheduleTask?: () => void;
}

export function CustomerContextPanel({
  conversation,
  contacts,
  companies,
  deals,
  stages,
  onOpenCreateOpportunity,
  onOpenScheduleTask,
}: CustomerContextPanelProps) {
  const {
    createLeadFromConversation,
    associateConversationWithContact,
    createTask,
  } = useCRM();

  // Modals for Unlinked Conversations
  const [showCaptureLeadModal, setShowCaptureLeadModal] = useState(false);
  const [showAttachContactModal, setShowAttachContactModal] = useState(false);
  const [showQuickTaskModal, setShowQuickTaskModal] = useState(false);

  // Form states for Lead Capture
  const isEmail =
    conversation.participant.handleOrIdentifier.includes("@") &&
    conversation.participant.handleOrIdentifier.includes(".");
  const [leadName, setLeadName] = useState(conversation.participant.name);
  const [leadCompany, setLeadCompany] = useState("");
  const [leadEmail, setLeadEmail] = useState(
    isEmail ? conversation.participant.handleOrIdentifier : ""
  );
  const [leadPhone, setLeadPhone] = useState(
    !isEmail && !conversation.participant.handleOrIdentifier.startsWith("@")
      ? conversation.participant.handleOrIdentifier
      : "+91 "
  );
  const [leadValue, setLeadValue] = useState(50000);

  // Form state for Contact Association
  const [selectedContactToLink, setSelectedContactToLink] = useState("");

  // Form state for Task
  const [taskTitle, setTaskTitle] = useState(
    `Follow up on ${conversation.channel.toUpperCase()} inquiry with ${conversation.participant.name}`
  );
  const [taskDueDate, setTaskDueDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("high");

  // Linked CRM entities
  const linkedContact = conversation.contactId
    ? contacts.find((c) => c.id === conversation.contactId) || null
    : null;

  const linkedCompany = conversation.companyId
    ? companies.find((c) => c.id === conversation.companyId) || null
    : linkedContact?.companyId
    ? companies.find((c) => c.id === linkedContact.companyId) || null
    : null;

  const contactDeals = linkedContact
    ? deals.filter((d) => d.contactId === linkedContact.id)
    : [];

  const wonValue = linkedContact
    ? selectContactWonValue(linkedContact.id, deals, stages)
    : 0;

  const openDealsCount = linkedContact
    ? selectContactOpenDealsCount(linkedContact.id, deals, stages)
    : 0;

  const handleCaptureLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLeadFromConversation(conversation.id, {
      name: leadName.trim() || conversation.participant.name,
      company: leadCompany.trim() || "Independent Account",
      email: leadEmail.trim(),
      phone: leadPhone.trim(),
      value: Number(leadValue) || 50000,
      owner: conversation.assignedOwner || "Sales Executive A",
      source:
        conversation.channel === "whatsapp"
          ? "WhatsApp"
          : conversation.channel === "instagram"
          ? "Instagram"
          : "Website",
    });
    setShowCaptureLeadModal(false);
  };

  const handleAttachContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContactToLink) return;
    await associateConversationWithContact(
      conversation.id,
      selectedContactToLink
    );
    setShowAttachContactModal(false);
  };

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    await createTask({
      entityType: linkedContact ? "contact" : "lead",
      entityId: linkedContact?.id || conversation.leadId || conversation.id,
      title: taskTitle.trim(),
      dueDate: taskDueDate,
      priority: taskPriority,
      status: "pending",
      assignedTo: conversation.assignedOwner || "Sales Executive A",
    });
    setShowQuickTaskModal(false);
  };

  return (
    <aside
      className="bl-inbox-customer-panel"
      aria-label="Customer Intelligence Context"
    >
      {/* 1. Header */}
      <div className="bl-context-header">
        <span className="bl-eyebrow">CUSTOMER INTELLIGENCE</span>
        <h4>CRM Context & Attribution</h4>
      </div>

      {/* 2. IF LINKED CONTACT EXISTS */}
      {linkedContact ? (
        <div className="bl-context-content">
          {/* Dark Summary Hero Tile */}
          <div className="bl-context-hero-tile">
            <div className="bl-context-avatar">
              {linkedContact.avatar ||
                linkedContact.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="bl-context-hero-info">
              <strong>{linkedContact.name}</strong>
              <span className="bl-context-designation">
                {linkedContact.designation || "Customer Contact"}
              </span>
              <span className="bl-context-company-link">
                <Building2 size={12} />
                {linkedContact.companyName || "Independent"}
              </span>
            </div>
          </div>

          {/* Quick Communication Links */}
          <div className="bl-context-quick-links">
            {linkedContact.phone && (
              <a
                href={`tel:${linkedContact.phone.replace(/[^0-9+]/g, "")}`}
                className="bl-quick-link-btn"
                title="Direct Phone Call"
              >
                <Phone size={13} /> Call
              </a>
            )}
            {linkedContact.email && (
              <a
                href={`mailto:${linkedContact.email}`}
                className="bl-quick-link-btn"
                title="Send Corporate Email"
              >
                <Mail size={13} /> Email
              </a>
            )}
            <Link
              href="/contacts"
              className="bl-quick-link-btn bl-link-accent"
              title="Open full Contact 360° record"
            >
              <User size={13} /> 360° Profile
            </Link>
          </div>

          {/* Commercial Snapshot */}
          <div className="bl-context-stats-grid">
            <div className="bl-context-stat-box">
              <span className="bl-label-sub">Won Revenue</span>
              <strong>{formatINR(wonValue)}</strong>
            </div>
            <div className="bl-context-stat-box">
              <span className="bl-label-sub">Open Deals</span>
              <strong>{openDealsCount}</strong>
            </div>
          </div>

          {/* Account Details Box */}
          <div className="bl-info-card" style={{ marginTop: "14px" }}>
            <h5 className="bl-card-heading">Attribution & Metadata</h5>
            <div className="bl-field-list">
              <div className="bl-field-item">
                <span className="bl-field-label">Acquisition Channel</span>
                <span className="bl-field-value">{linkedContact.source}</span>
              </div>
              <div className="bl-field-item">
                <span className="bl-field-label">Relationship Score</span>
                <span className="bl-field-value">
                  {linkedContact.relationshipScore}/100
                </span>
              </div>
              <div className="bl-field-item">
                <span className="bl-field-label">Account Owner</span>
                <span className="bl-field-value">
                  {linkedContact.owner || conversation.assignedOwner}
                </span>
              </div>
            </div>
          </div>

          {/* Associated Opportunities (Deals) */}
          <div className="bl-info-card" style={{ marginTop: "14px" }}>
            <div className="bl-between" style={{ marginBottom: "10px" }}>
              <h5 className="bl-card-heading" style={{ margin: 0 }}>
                Associated Deals ({contactDeals.length})
              </h5>
              <Link
                href="/pipeline"
                className="bl-btn-link"
                style={{ fontSize: "11px" }}
              >
                Pipeline <ArrowUpRight size={12} />
              </Link>
            </div>

            {contactDeals.length > 0 ? (
              <div className="bl-context-deals-list">
                {contactDeals.map((deal) => (
                  <div key={deal.id} className="bl-context-deal-item">
                    <div className="bl-between">
                      <strong className="bl-deal-title">{deal.title}</strong>
                      <span className="bl-deal-value">
                        {formatINR(deal.value)}
                      </span>
                    </div>
                    <span className="bl-tag-pill" style={{ fontSize: "10px", marginTop: "4px" }}>
                      Stage: {deal.stage}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                No active pipeline deals associated yet.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bl-context-actions-stack" style={{ marginTop: "16px" }}>
            <button
              type="button"
              className="bl-secondary bl-btn-full"
              onClick={() => setShowQuickTaskModal(true)}
            >
              <Calendar size={14} /> Schedule Follow-up Task
            </button>
          </div>
        </div>
      ) : (
        /* 3. UNLINKED INBOUND PROSPECT FLOW */
        <div className="bl-unlinked-conversation-flow">
          <div className="bl-warning-banner" style={{ marginTop: "12px" }}>
            <Sparkles size={16} />
            <div>
              <strong>Unlinked Inbound Prospect</strong>
              <p style={{ margin: "2px 0 0", fontSize: "11px" }}>
                This discussion originated on {conversation.channel.toUpperCase()} and has not yet been linked to a CRM Contact or Lead.
              </p>
            </div>
          </div>

          <div className="bl-unlinked-cta-box">
            <h4>Capture Opportunity</h4>
            <p>
              Graduate this discussion into your revenue pipeline or associate with an existing account.
            </p>

            <div className="bl-unlinked-actions-stack">
              <button
                type="button"
                className="bl-primary bl-btn-full"
                onClick={() => setShowCaptureLeadModal(true)}
              >
                <UserPlus size={15} /> Capture as New Lead
              </button>

              <button
                type="button"
                className="bl-secondary bl-btn-full"
                onClick={() => setShowAttachContactModal(true)}
              >
                <Link2 size={15} /> Attach to Existing Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CAPTURE AS NEW LEAD */}
      {showCaptureLeadModal && (
        <div
          className="bl-modal-backdrop"
          onClick={() => setShowCaptureLeadModal(false)}
        >
          <div
            className="bl-modal-content"
            style={{ maxWidth: "520px" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Capture Lead from Conversation"
          >
            <div className="bl-between" style={{ marginBottom: "16px" }}>
              <div>
                <span className="bl-eyebrow">OMNICHANNEL LEAD CAPTURE</span>
                <h3>Capture Lead from {conversation.channel.toUpperCase()}</h3>
              </div>
              <button
                type="button"
                className="bl-icon"
                onClick={() => setShowCaptureLeadModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCaptureLeadSubmit} className="bl-form-grid">
              <label>
                Full Name *
                <input
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                />
              </label>

              <label>
                Company / Organization *
                <input
                  required
                  aria-label="Company or Organization"
                  placeholder="e.g. Acme Design Studio"
                  value={leadCompany}
                  onChange={(e) => setLeadCompany(e.target.value)}
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                />
              </label>

              <label>
                Phone Number
                <input
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                />
              </label>

              <label className="bl-full-field">
                Estimated Opportunity Value (INR)
                <input
                  type="number"
                  min="0"
                  value={leadValue}
                  onChange={(e) => setLeadValue(Number(e.target.value))}
                />
              </label>

              <div className="bl-form-actions bl-full-field" style={{ marginTop: "12px" }}>
                <button
                  type="button"
                  className="bl-secondary"
                  onClick={() => setShowCaptureLeadModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="bl-primary">
                  Create CRM Lead <ArrowUpRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ATTACH TO EXISTING CONTACT */}
      {showAttachContactModal && (
        <div
          className="bl-modal-backdrop"
          onClick={() => setShowAttachContactModal(false)}
        >
          <div
            className="bl-modal-content"
            style={{ maxWidth: "480px" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Attach to Existing Contact"
          >
            <div className="bl-between" style={{ marginBottom: "16px" }}>
              <div>
                <span className="bl-eyebrow">RELATIONSHIP LINKING</span>
                <h3>Attach to Existing Contact</h3>
              </div>
              <button
                type="button"
                className="bl-icon"
                onClick={() => setShowAttachContactModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAttachContactSubmit} className="bl-form-grid">
              <label className="bl-full-field">
                Select Contact
                <select
                  required
                  value={selectedContactToLink}
                  onChange={(e) => setSelectedContactToLink(e.target.value)}
                >
                  <option value="">Choose an existing contact...</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.companyName} ({c.email})
                    </option>
                  ))}
                </select>
              </label>

              <div className="bl-form-actions bl-full-field" style={{ marginTop: "14px" }}>
                <button
                  type="button"
                  className="bl-secondary"
                  onClick={() => setShowAttachContactModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bl-primary"
                  disabled={!selectedContactToLink}
                >
                  Confirm Link <CheckCircle2 size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SCHEDULE FOLLOW-UP TASK */}
      {showQuickTaskModal && (
        <div
          className="bl-modal-backdrop"
          onClick={() => setShowQuickTaskModal(false)}
        >
          <div
            className="bl-modal-content"
            style={{ maxWidth: "480px" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Schedule Follow-up Task"
          >
            <div className="bl-between" style={{ marginBottom: "16px" }}>
              <div>
                <span className="bl-eyebrow">FOCUS CENTER</span>
                <h3>Schedule Smart Follow-up</h3>
              </div>
              <button
                type="button"
                className="bl-icon"
                onClick={() => setShowQuickTaskModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="bl-form-grid">
              <label className="bl-full-field">
                Task Description *
                <input
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </label>

              <label>
                Target Due Date
                <input
                  type="date"
                  required
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </label>

              <label>
                Priority Level
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </label>

              <div className="bl-form-actions bl-full-field" style={{ marginTop: "14px" }}>
                <button
                  type="button"
                  className="bl-secondary"
                  onClick={() => setShowQuickTaskModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="bl-primary">
                  Save Task <ArrowUpRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
