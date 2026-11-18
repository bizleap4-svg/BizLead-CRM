"use client";

import React from "react";
import {
  User,
  SlidersHorizontal,
  MailCheck,
  PanelRightClose,
  PanelRightOpen,
  ArrowUpRight,
  Shield,
  Tag,
} from "lucide-react";
import {
  Conversation,
  ConversationStatus,
  ConversationPriority,
  PIPELINE_OWNERS,
} from "@/components/crm/types";
import { getChannelBadge } from "./ConversationDirectory";

interface ConversationActionsProps {
  conversation: Conversation;
  onStatusChange: (status: ConversationStatus) => void;
  onPriorityChange: (priority: ConversationPriority) => void;
  onAssignChange: (owner: string) => void;
  onMarkUnread: () => void;
  showContextPanel: boolean;
  onToggleContextPanel: () => void;
}

export function ConversationActions({
  conversation,
  onStatusChange,
  onPriorityChange,
  onAssignChange,
  onMarkUnread,
  showContextPanel,
  onToggleContextPanel,
}: ConversationActionsProps) {
  const badge = getChannelBadge(conversation.channel);

  return (
    <div className="bl-inbox-header-actions-bar">
      {/* Customer Title & Identifier */}
      <div className="bl-inbox-conv-title-wrap">
        <div className="bl-inbox-title-top">
          <h3>{conversation.participant.name}</h3>
          <span
            className="bl-tag-pill"
            style={{
              background: badge.bg,
              borderColor: badge.color,
              color: "var(--text)",
              fontSize: "11px",
            }}
          >
            {badge.icon} {badge.label}
          </span>
          {conversation.tags.map((t) => (
            <span key={t} className="bl-tag-pill" style={{ fontSize: "10px" }}>
              {t}
            </span>
          ))}
        </div>
        <span className="bl-inbox-identifier-sub">
          {conversation.participant.handleOrIdentifier}
        </span>
      </div>

      {/* Control Dropdowns */}
      <div className="bl-inbox-controls-group">
        {/* Status Dropdown */}
        <div className="bl-control-item">
          <label>Status:</label>
          <select
            value={conversation.status}
            onChange={(e) => onStatusChange(e.target.value as ConversationStatus)}
            className="bl-select-compact bl-status-select"
            aria-label="Conversation Status"
          >
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Priority Dropdown */}
        <div className="bl-control-item">
          <label>Priority:</label>
          <select
            value={conversation.priority}
            onChange={(e) =>
              onPriorityChange(e.target.value as ConversationPriority)
            }
            className="bl-select-compact"
            aria-label="Conversation Priority"
          >
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Assigned Owner Dropdown */}
        <div className="bl-control-item">
          <label>Assigned:</label>
          <select
            value={conversation.assignedOwner || ""}
            onChange={(e) => onAssignChange(e.target.value)}
            className="bl-select-compact"
            aria-label="Assigned Executive"
          >
            <option value="">Unassigned</option>
            {PIPELINE_OWNERS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* Mark as Unread */}
        <button
          type="button"
          className="bl-icon bl-icon-sm"
          onClick={onMarkUnread}
          title="Mark conversation as unread"
          aria-label="Mark as unread"
        >
          <MailCheck size={16} />
        </button>

        {/* Toggle Right Panel */}
        <button
          type="button"
          className={`bl-icon bl-icon-sm ${showContextPanel ? "active" : ""}`}
          onClick={onToggleContextPanel}
          title={showContextPanel ? "Collapse CRM context" : "Expand CRM context"}
          aria-label="Toggle CRM Context Panel"
        >
          {showContextPanel ? (
            <PanelRightClose size={16} />
          ) : (
            <PanelRightOpen size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
