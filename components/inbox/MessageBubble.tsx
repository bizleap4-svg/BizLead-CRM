"use client";

import React, { useState } from "react";
import {
  Check,
  CheckCheck,
  Lock,
  FileText,
  Clock,
  AlertCircle,
  Paperclip,
  Info,
  X,
} from "lucide-react";
import { Message, Attachment } from "@/components/crm/types";
import { getChannelBadge } from "./ConversationDirectory";

interface MessageBubbleProps {
  message: Message;
  quotedMessage?: Message | null;
}

export function MessageBubble({ message, quotedMessage }: MessageBubbleProps) {
  const [inspectedAttachment, setInspectedAttachment] = useState<Attachment | null>(null);

  const isInternal = Boolean(message.isInternalNote);
  const isOutgoing = message.senderType === "executive";
  const isCustomer = message.senderType === "customer";
  const badge = getChannelBadge(message.channel);

  const formattedTime = (() => {
    try {
      const d = new Date(message.timestamp);
      if (isNaN(d.getTime())) return "Today";
      return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Today";
    }
  })();

  // 1. RENDER INTERNAL NOTE
  if (isInternal) {
    return (
      <div className="bl-message-row internal-note-row" role="article">
        <div className="bl-internal-note-card">
          <div className="bl-internal-note-header">
            <div className="bl-internal-note-badge">
              <Lock size={13} />
              <span>Internal Team Note</span>
            </div>
            <span className="bl-note-confidential-tag">
              Private · Never transmitted to customer
            </span>
          </div>

          <div className="bl-internal-note-content">
            <p>{message.content.replace(/^Internal Note:\s*/i, "")}</p>
          </div>

          <div className="bl-internal-note-footer">
            <span>
              Author: <strong>{message.senderName}</strong>
            </span>
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. RENDER STANDARD MESSAGE (Customer or Outgoing Executive)
  return (
    <div
      className={`bl-message-row ${isOutgoing ? "outgoing-row" : "incoming-row"}`}
      role="article"
    >
      <div
        className={`bl-message-bubble ${
          isOutgoing ? "outgoing-bubble" : "incoming-bubble"
        }`}
      >
        {/* Header: Sender Name & Channel */}
        <div className="bl-message-sender-row">
          <span className="bl-message-sender-name">{message.senderName}</span>
          <span
            className="bl-message-channel-pill"
            style={{ color: badge.color }}
          >
            {badge.icon} {badge.label}
          </span>
        </div>

        {/* Quoted Reply Preview */}
        {quotedMessage && (
          <div className="bl-quoted-message-preview">
            <strong>{quotedMessage.senderName}</strong>
            <p>{quotedMessage.content.slice(0, 80)}...</p>
          </div>
        )}

        {/* Message Content */}
        <div className="bl-message-text">
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{message.content}</p>
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="bl-message-attachments-list">
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className="bl-attachment-chip"
                onClick={() => setInspectedAttachment(att)}
                role="button"
                tabIndex={0}
                title="Inspect attachment metadata"
              >
                <Paperclip size={13} />
                <span className="bl-att-name">{att.name}</span>
                <span className="bl-att-size">
                  ({(att.size / (1024 * 1024)).toFixed(1)} MB)
                </span>
                <Info size={12} className="bl-att-info-icon" />
              </div>
            ))}
          </div>
        )}

        {/* Footer: Time + Delivery Status + Demo Badge */}
        <div className="bl-message-footer">
          <span className="bl-message-time">{formattedTime}</span>

          {isOutgoing && (
            <div className="bl-delivery-status-indicator" title={`Delivery: ${message.deliveryStatus || "sent"}`}>
              {message.deliveryStatus === "read" && (
                <span className="bl-status-read">
                  <CheckCheck size={14} color="var(--color-info)" />
                </span>
              )}
              {message.deliveryStatus === "delivered" && (
                <span className="bl-status-delivered">
                  <CheckCheck size={14} opacity={0.6} />
                </span>
              )}
              {(message.deliveryStatus === "sent" || !message.deliveryStatus) && (
                <span className="bl-status-sent">
                  <Check size={14} opacity={0.6} />
                </span>
              )}
            </div>
          )}

          {message.isSimulatedDemo && (
            <span
              className="bl-demo-marker"
              title="Locally simulated delivery (Phase 05 Prototype Engine)"
            >
              Demo
            </span>
          )}
        </div>
      </div>

      {/* Attachment Metadata Inspection Modal */}
      {inspectedAttachment && (
        <div
          className="bl-modal-backdrop"
          onClick={() => setInspectedAttachment(null)}
        >
          <div
            className="bl-modal-content"
            style={{ maxWidth: "460px" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Attachment Metadata"
          >
            <div className="bl-between" style={{ marginBottom: "14px" }}>
              <div>
                <span className="bl-eyebrow">OMNICHANNEL ATTACHMENT</span>
                <h3>{inspectedAttachment.name}</h3>
              </div>
              <button
                type="button"
                className="bl-icon"
                onClick={() => setInspectedAttachment(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="bl-warning-banner" style={{ background: "var(--color-info-soft)", borderColor: "color-mix(in srgb, var(--color-info) 30%, transparent)", color: "var(--text)" }}>
              <Info size={15} color="var(--color-info)" />
              <span style={{ fontSize: "11px" }}>
                <strong>Client-Side Verified Attachment:</strong> File type and size are validated. Production binary storage & cloud delivery via WhatsApp / SendGrid / Meta Graph requires backend bucket integration.
              </span>
            </div>

            <div className="bl-field-list" style={{ marginTop: "12px" }}>
              <div className="bl-field-item">
                <span className="bl-field-label">File Name</span>
                <span className="bl-field-value">{inspectedAttachment.name}</span>
              </div>
              <div className="bl-field-item">
                <span className="bl-field-label">File Type</span>
                <span className="bl-field-value">{inspectedAttachment.type}</span>
              </div>
              <div className="bl-field-item">
                <span className="bl-field-label">File Size</span>
                <span className="bl-field-value">
                  {(inspectedAttachment.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <div className="bl-field-item">
                <span className="bl-field-label">Transmission Channel</span>
                <span className="bl-field-value">{badge.label}</span>
              </div>
            </div>

            <div className="bl-form-actions" style={{ marginTop: "18px" }}>
              <button
                type="button"
                className="bl-secondary"
                onClick={() => setInspectedAttachment(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
