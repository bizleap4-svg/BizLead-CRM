"use client";

import React from "react";
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Radio,
} from "lucide-react";
import { Conversation, Message } from "@/components/crm/types";
import { selectInboxMetrics } from "@/components/crm/selectors";

interface InboxMetricsProps {
  conversations: Conversation[];
  messages: Message[];
  onFilterStatus?: (status: string) => void;
}

export function InboxMetrics({
  conversations,
  messages,
  onFilterStatus,
}: InboxMetricsProps) {
  const metrics = selectInboxMetrics(conversations, messages);

  return (
    <section
      className="bl-pipeline-metrics bl-inbox-metrics"
      aria-label="Unified Inbox Key Metrics"
    >
      {/* 1. Open Conversations */}
      <article
        className="bl-metric-tile"
        onClick={() => onFilterStatus?.("open")}
        style={{ cursor: "pointer" }}
        title="Filter Open Inquiries"
      >
        <div className="bl-metric-top">
          <span className="bl-metric-label">Open Conversations</span>
          <MessageSquare size={15} className="bl-metric-icon" />
        </div>
        <div className="bl-metric-value">{metrics.totalOpen}</div>
        <div className="bl-metric-sub">
          Active customer & lead dialogs across all channels
        </div>
      </article>

      {/* 2. Unread Messages */}
      <article
        className="bl-metric-tile bl-metric-highlight"
        onClick={() => onFilterStatus?.("unread")}
        style={{ cursor: "pointer" }}
        title="Filter Unread Inquiries"
      >
        <div className="bl-metric-top">
          <span className="bl-metric-label">Unread Messages</span>
          <span className="bl-inbox-live-dot" />
        </div>
        <div className="bl-metric-value">{metrics.unreadCount}</div>
        <div className="bl-metric-sub">
          Awaiting response · Real-time customer inquiries
        </div>
      </article>

      {/* 3. Pending Escalations */}
      <article
        className="bl-metric-tile"
        onClick={() => onFilterStatus?.("pending")}
        style={{ cursor: "pointer" }}
        title="Filter Pending Conversations"
      >
        <div className="bl-metric-top">
          <span className="bl-metric-label">Pending Reviews</span>
          <AlertCircle size={15} className="bl-metric-icon" />
        </div>
        <div className="bl-metric-value">{metrics.pendingCount}</div>
        <div className="bl-metric-sub">
          Waiting for technical or procurement approvals
        </div>
      </article>

      {/* 4. Average First Response Time */}
      <article className="bl-metric-tile">
        <div className="bl-metric-top">
          <span className="bl-metric-label">Avg First Response</span>
          <Clock size={15} className="bl-metric-icon" />
        </div>
        <div className="bl-metric-value">{metrics.avgFirstResponse}</div>
        <div className="bl-metric-sub">
          Calculated from verified customer-executive response pairs
        </div>
      </article>

      {/* 5. Resolved Dialogs */}
      <article
        className="bl-metric-tile"
        onClick={() => onFilterStatus?.("resolved")}
        style={{ cursor: "pointer" }}
        title="Filter Resolved Conversations"
      >
        <div className="bl-metric-top">
          <span className="bl-metric-label">Resolved Discussions</span>
          <CheckCircle2 size={15} className="bl-metric-icon" />
        </div>
        <div className="bl-metric-value">{metrics.resolvedCount}</div>
        <div className="bl-metric-sub">Successfully graduated or closed</div>
      </article>
    </section>
  );
}
