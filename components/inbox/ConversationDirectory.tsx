"use client";

import React, { useMemo } from "react";
import {
  Search,
  MessageSquare,
  Users,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Conversation, Channel } from "@/components/crm/types";

interface ConversationDirectoryProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function getChannelBadge(channel: Channel) {
  switch (channel) {
    case "whatsapp":
      return { label: "WhatsApp", icon: "💬", color: "#25D366", bg: "rgba(37, 211, 102, 0.15)" };
    case "instagram":
      return { label: "Instagram", icon: "📸", color: "#E1306C", bg: "rgba(225, 48, 108, 0.15)" };
    case "messenger":
      return { label: "Messenger", icon: "⚡", color: "#0084FF", bg: "rgba(0, 132, 255, 0.15)" };
    case "email":
      return { label: "Email", icon: "✉️", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)" };
    case "website":
      return { label: "Web Chat", icon: "🌐", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)" };
    default:
      return { label: "Chat", icon: "💬", color: "var(--text)", bg: "rgba(0,0,0,0.05)" };
  }
}

export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Recently";
    const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "Just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h`;
    if (diffSeconds < 172800) return "Yesterday";
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

export function ConversationDirectory({
  conversations,
  selectedConversationId,
  onSelectConversation,
  searchQuery,
  onSearchChange,
}: ConversationDirectoryProps) {
  return (
    <aside className="bl-inbox-directory" aria-label="Conversation Directory">
      {/* Search Header */}
      <div className="bl-inbox-directory-search">
        <div className="bl-search-input-wrap" style={{ width: "100%" }}>
          <Search size={15} />
          <input
            type="text"
            placeholder="Search conversations, names, snippets..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search conversations"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="bl-inbox-conversation-list" role="list">
        {conversations.map((conv) => {
          const isSelected = conv.id === selectedConversationId;
          const badge = getChannelBadge(conv.channel);
          const time = formatRelativeTime(conv.updatedAt || conv.createdAt);

          return (
            <article
              key={conv.id}
              role="listitem"
              tabIndex={0}
              className={`bl-conversation-item ${isSelected ? "selected" : ""} ${
                conv.unreadCount > 0 ? "has-unread" : ""
              }`}
              onClick={() => onSelectConversation(conv.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectConversation(conv.id);
                }
              }}
            >
              {/* Avatar + Channel Overlay Badge */}
              <div className="bl-conv-avatar-box">
                <div className="bl-conv-avatar">
                  {conv.participant.avatar ||
                    conv.participant.name.slice(0, 2).toUpperCase()}
                </div>
                <span
                  className="bl-channel-icon-pill"
                  title={`${badge.label} conversation`}
                  style={{ background: badge.bg, borderColor: badge.color }}
                >
                  {badge.icon}
                </span>
              </div>

              {/* Conversation Meta & Snippet */}
              <div className="bl-conv-body">
                <div className="bl-conv-top-row">
                  <div className="bl-conv-name-wrap">
                    <strong className="bl-conv-name">
                      {conv.participant.name}
                    </strong>
                    {!conv.contactId && (
                      <span
                        className="bl-tag-pill bl-unlinked-pill"
                        title="New Inbound Prospect (Unlinked to CRM Contact)"
                      >
                        New Lead
                      </span>
                    )}
                  </div>
                  <span className="bl-conv-time">{time}</span>
                </div>

                <div className="bl-conv-snippet-row">
                  <p className="bl-conv-snippet">
                    {conv.lastMessage?.isInternalNote && (
                      <span className="bl-note-snippet-prefix">🔒 [Internal Note] </span>
                    )}
                    {conv.lastMessage?.content || "No messages yet"}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="bl-unread-bubble">{conv.unreadCount}</span>
                  )}
                </div>

                {/* Bottom Badges: Channel + Priority + Owner */}
                <div className="bl-conv-footer-row">
                  <span
                    className="bl-tag-pill"
                    style={{
                      fontSize: "10px",
                      background: badge.bg,
                      borderColor: badge.color,
                      color: "var(--text)",
                    }}
                  >
                    {badge.label}
                  </span>

                  {conv.priority === "urgent" && (
                    <span className="bl-priority-dot urgent" title="Priority: Urgent" />
                  )}
                  {conv.priority === "high" && (
                    <span className="bl-priority-dot high" title="Priority: High" />
                  )}

                  <span className="bl-conv-owner-sub">
                    {conv.assignedOwner ? conv.assignedOwner.replace("Sales Executive ", "SE-") : "Unassigned"}
                  </span>
                </div>
              </div>
            </article>
          );
        })}

        {conversations.length === 0 && (
          <div className="bl-empty-stream" style={{ padding: "40px 16px" }}>
            <MessageSquare size={32} opacity={0.3} />
            <h4 style={{ margin: "8px 0 4px", fontSize: "14px" }}>
              No conversations found
            </h4>
            <p style={{ fontSize: "12px", color: "var(--muted)" }}>
              Try adjusting your channel filter or search keywords.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
