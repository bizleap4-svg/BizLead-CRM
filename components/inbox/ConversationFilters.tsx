"use client";

import React from "react";
import {
  MessageSquare,
  Radio,
  SlidersHorizontal,
  Layers,
  ArrowUpDown,
  BookOpen,
} from "lucide-react";
import { Channel } from "@/components/crm/types";
import { Tabs } from "../ui/Tabs";

interface ConversationFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  channelFilter: string;
  onChannelFilterChange: (channel: string) => void;
  sortBy: "recent" | "unread" | "priority";
  onSortByChange: (sortBy: "recent" | "unread" | "priority") => void;
  onOpenChannelsModal: () => void;
  onOpenTemplatesModal: () => void;
}

const STATUS_CHIPS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "assigned_to_me", label: "Assigned to me" },
  { id: "unassigned", label: "Unassigned" },
  { id: "open", label: "Open" },
  { id: "pending", label: "Pending" },
  { id: "resolved", label: "Resolved" },
  { id: "archived", label: "Archived" },
];

const CHANNELS: { id: string; label: string; iconLabel: string }[] = [
  { id: "all", label: "All Channels", iconLabel: "🌐" },
  { id: "whatsapp", label: "WhatsApp", iconLabel: "💬" },
  { id: "instagram", label: "Instagram", iconLabel: "📸" },
  { id: "messenger", label: "Messenger", iconLabel: "⚡" },
  { id: "email", label: "Email", iconLabel: "✉️" },
  { id: "website", label: "Website Chat", iconLabel: "🌐" },
];

export function ConversationFilters({
  statusFilter,
  onStatusFilterChange,
  channelFilter,
  onChannelFilterChange,
  sortBy,
  onSortByChange,
  onOpenChannelsModal,
  onOpenTemplatesModal,
}: ConversationFiltersProps) {
  return (
    <div className="bl-inbox-filters-card">
      <div className="bl-inbox-filters-row">
        {/* Status / Scope Chips */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Tabs
            items={STATUS_CHIPS}
            activeTab={statusFilter}
            onChange={onStatusFilterChange}
            variant="pills"
            size="sm"
            ariaLabel="Conversation Scope"
          />
        </div>

        {/* Right Action Tools: Sort + Templates + Channels Setup */}
        <div className="bl-inbox-tools-group">
          {/* Sort Selector */}
          <div className="bl-sort-wrap">
            <span className="bl-label-sub">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="bl-select-compact"
              aria-label="Sort conversations by"
            >
              <option value="recent">Latest Activity</option>
              <option value="unread">Unread First</option>
              <option value="priority">Priority First</option>
            </select>
          </div>

          {/* Templates Trigger */}
          <button
            type="button"
            className="bl-secondary bl-btn-compact"
            onClick={onOpenTemplatesModal}
            title="Saved Reply Templates"
          >
            <BookOpen size={14} />
            <span>Templates</span>
          </button>

          {/* Channel Connection Center Trigger */}
          <button
            type="button"
            className="bl-secondary bl-btn-compact"
            onClick={onOpenChannelsModal}
            title="Channel Integrations & Status"
          >
            <Radio size={14} />
            <span>Channels</span>
          </button>
        </div>
      </div>

      {/* Channel Pills Bar */}
      <div className="bl-channel-pills-bar">
        {CHANNELS.map((ch) => (
          <button
            key={ch.id}
            type="button"
            className={`bl-channel-pill ${channelFilter === ch.id ? "active" : ""}`}
            onClick={() => onChannelFilterChange(ch.id)}
          >
            <span style={{ fontSize: "12px" }}>{ch.iconLabel}</span>
            <span>{ch.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
