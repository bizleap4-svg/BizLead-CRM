"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Bot,
  Check,
  ArrowRight,
  ListFilter,
  FileText,
  Calendar,
  MessageSquare,
  Shield,
  Send,
} from "lucide-react";
import { Conversation, Message } from "@/components/crm/types";

interface BizAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  messages: Message[];
  onInsertSuggestion: (text: string) => void;
  onScheduleTask?: (title: string) => void;
}

export function BizAIAssistant({
  isOpen,
  onClose,
  conversation,
  messages,
  onInsertSuggestion,
  onScheduleTask,
}: BizAIAssistantProps) {
  const [selectedTone, setSelectedTone] = useState<
    "professional" | "friendly" | "urgent" | "concise"
  >("professional");
  const [summaryGenerated, setSummaryGenerated] = useState(false);

  if (!isOpen) return null;

  // Contextual rule-based suggestions depending on channel & content
  const customerMessages = messages.filter((m) => m.senderType === "customer");
  const lastCustomerText =
    customerMessages[customerMessages.length - 1]?.content || "";

  // Intent detection
  const intent = (() => {
    const text = lastCustomerText.toLowerCase();
    if (text.includes("pricing") || text.includes("tier") || text.includes("seats")) {
      return {
        label: "Commercial Inquiry — High Intent",
        badgeColor: "#10B981",
        description: "Customer is asking about seat tiers and pricing structures.",
      };
    }
    if (text.includes("security") || text.includes("iso") || text.includes("compliance")) {
      return {
        label: "Enterprise Security Qualification",
        badgeColor: "#F59E0B",
        description: "Customer is conducting technical and compliance due diligence.",
      };
    }
    if (text.includes("track") || text.includes("staging") || text.includes("milestone")) {
      return {
        label: "Sprint Delivery & Milestone Tracking",
        badgeColor: "#3B82F6",
        description: "Active customer checking on milestone status and deliverables.",
      };
    }
    return {
      label: "General Business Inquiry",
      badgeColor: "var(--accent)",
      description: "General product exploration and workflow discussion.",
    };
  })();

  // Tone-specific suggestions
  const getSuggestions = () => {
    const name = conversation.participant.name.split(" ")[0];
    if (selectedTone === "professional") {
      return [
        `Hello ${name}, thank you for following up. We have verified the timeline and our technical team is currently completing this milestone. Would you like me to share the preview link?`,
        `Dear ${name}, regarding your question on commercial tiers, our Revenue OS includes unified omnichannel routing across WhatsApp and Instagram. I would be glad to arrange a 15-minute briefing call with our architect.`,
        `Thank you for confirming, ${name}. All deliverables have been documented in your account and our team is proceeding with the next phase.`,
      ];
    }
    if (selectedTone === "friendly") {
      return [
        `Hey ${name}! Great to hear from you. Everything is moving along right on schedule and we are super excited to share the staging preview with you tomorrow!`,
        `Hi ${name}! Yes absolutely, BizLead handles multi-agent routing smoothly across both WhatsApp and Instagram. Let's hop on a quick call whenever you are free!`,
        `Thanks so much, ${name}! We've got everything recorded. Feel free to ping me here whenever you need anything else!`,
      ];
    }
    if (selectedTone === "urgent") {
      return [
        `Hi ${name}, prioritizing this right away for you. Our team is already resolving the review points and I will update you by 3:00 PM today.`,
        `Hello ${name}, given your Thursday deadline, I have attached our compliance sheets and can arrange an expedited review call with our security lead today.`,
      ];
    }
    // concise
    return [
      `Hi ${name}, milestone is confirmed for delivery by next month. Preview link will be sent tomorrow.`,
      `Hi ${name}, our enterprise tier covers 45 seats with full WhatsApp API integration. Available for a quick sync tomorrow at 3 PM?`,
      `Confirmed. Records updated and team assigned.`,
    ];
  };

  const suggestions = getSuggestions();

  return (
    <div className="bl-modal-backdrop" onClick={onClose}>
      <div
        className="bl-modal-content bl-ai-assistant-modal"
        style={{ maxWidth: "680px" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Biz AI Assistant"
      >
        {/* Header */}
        <div className="bl-between" style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="bl-ai-icon-box">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="bl-eyebrow">REVENUE INTELLIGENCE</span>
              <h3>Biz AI Conversation Assistant</h3>
            </div>
          </div>

          <button
            type="button"
            className="bl-icon"
            onClick={onClose}
            aria-label="Close Biz AI assistant"
          >
            <X size={18} />
          </button>
        </div>

        {/* Honest Architecture Disclaimer */}
        <div className="bl-warning-banner" style={{ background: "rgba(255, 225, 59, 0.12)", borderColor: "rgba(255, 225, 59, 0.4)", color: "var(--text)" }}>
          <Bot size={15} color="#d97706" />
          <span style={{ fontSize: "11px" }}>
            <strong>Biz AI Rule-Based Assistant (Phase 05 Prototype):</strong> All suggestions require executive review before transmission. BizLead will never autonomously message customers without user confirmation.
          </span>
        </div>

        {/* 1. Intent Classification */}
        <div className="bl-ai-section-card">
          <div className="bl-between">
            <span className="bl-label-sub">Detected Customer Intent</span>
            <span
              className="bl-tag-pill"
              style={{
                background: "rgba(0,0,0,0.04)",
                borderColor: intent.badgeColor,
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              {intent.label}
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--muted)", margin: "6px 0 0" }}>
            {intent.description}
          </p>
        </div>

        {/* 2. One-Click Conversation Summary */}
        <div className="bl-ai-section-card" style={{ marginTop: "12px" }}>
          <div className="bl-between" style={{ marginBottom: "6px" }}>
            <span className="bl-label-sub">Discussion Synopsis</span>
            {!summaryGenerated ? (
              <button
                type="button"
                className="bl-btn-link"
                style={{ fontSize: "11px" }}
                onClick={() => setSummaryGenerated(true)}
              >
                Generate Summary
              </button>
            ) : (
              <span className="bl-tag-pill" style={{ fontSize: "10px" }}>
                AI Generated
              </span>
            )}
          </div>

          {summaryGenerated ? (
            <div className="bl-ai-summary-box">
              <p>
                <strong>Customer:</strong> {conversation.participant.name} ({conversation.channel.toUpperCase()})<br />
                <strong>Latest Ask:</strong> "{lastCustomerText}"<br />
                <strong>Recommended Next Step:</strong> Respond with milestone confirmation and propose a follow-up walkthrough call.
              </p>
            </div>
          ) : (
            <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
              Click 'Generate Summary' to synthesize this {messages.length}-message conversation into key action items.
            </p>
          )}
        </div>

        {/* 3. Tone Selector & Suggested Replies */}
        <div className="bl-ai-section-card" style={{ marginTop: "12px" }}>
          <div className="bl-between" style={{ marginBottom: "12px" }}>
            <span className="bl-label-sub">Suggested Replies</span>
            <div className="bl-tone-toggle-bar">
              {(
                [
                  ["professional", "Professional"],
                  ["friendly", "Friendly"],
                  ["urgent", "Urgent"],
                  ["concise", "Concise"],
                ] as const
              ).map(([tone, label]) => (
                <button
                  key={tone}
                  type="button"
                  className={`bl-tone-btn ${selectedTone === tone ? "active" : ""}`}
                  onClick={() => setSelectedTone(tone)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="bl-ai-suggestions-list">
            {suggestions.map((text, idx) => (
              <div key={idx} className="bl-ai-suggestion-item">
                <p>{text}</p>
                <button
                  type="button"
                  className="bl-primary bl-btn-compact"
                  onClick={() => {
                    onInsertSuggestion(text);
                    onClose();
                  }}
                >
                  <span>Review & Insert</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bl-form-actions" style={{ marginTop: "18px" }}>
          <button type="button" className="bl-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
