"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  MessageSquare,
  Sparkles,
  Radio,
  SlidersHorizontal,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useCRM } from "@/components/crm/CRMProvider";
import {
  Conversation,
  Message,
  ConversationStatus,
  ConversationPriority,
  Attachment,
} from "@/components/crm/types";
import { InboxMetrics } from "@/components/inbox/InboxMetrics";
import { ConversationFilters } from "@/components/inbox/ConversationFilters";
import { ConversationDirectory } from "@/components/inbox/ConversationDirectory";
import { ConversationThread } from "@/components/inbox/ConversationThread";
import { CustomerContextPanel } from "@/components/inbox/CustomerContextPanel";
import { ReplyTemplates } from "@/components/inbox/ReplyTemplates";
import { ChannelConnectionCenter } from "@/components/inbox/ChannelConnectionCenter";
import { BizAIAssistant } from "@/components/inbox/BizAIAssistant";

export default function InboxPage() {
  const {
    conversations,
    contacts,
    companies,
    deals,
    stages,
    activeConversationId,
    activeConversation,
    setActiveConversationId,
    getMessagesForConversation,
    sendConversationMessage,
    updateConversationStatus,
    updateConversationPriority,
    assignConversation,
    markConversationRead,
    saveConversationDraft,
    refreshAll,
  } = useCRM();

  // Active Messages State
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "unread" | "priority">("recent");

  // Panel Collapsible State
  const [showRightContext, setShowRightContext] = useState(true);

  // Modals
  const [channelsModalOpen, setChannelsModalOpen] = useState(false);
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  // Load messages for currently active conversation
  useEffect(() => {
    if (activeConversationId) {
      getMessagesForConversation(activeConversationId).then((res) => {
        setMessages(res);
      });
      // Automatically clear unread counter when viewing active conversation
      const current = conversations.find((c) => c.id === activeConversationId);
      if (current && current.unreadCount > 0) {
        markConversationRead(activeConversationId);
      }
    } else {
      setMessages([]);
    }
  }, [activeConversationId, conversations]);

  // Filtering & Sorting of Conversations
  const filteredConversations = useMemo(() => {
    return conversations
      .filter((conv) => {
        // Status / Scope Filter
        if (statusFilter === "unread" && conv.unreadCount === 0) return false;
        if (statusFilter === "unassigned" && conv.assignedOwner) return false;
        if (
          statusFilter === "assigned_to_me" &&
          conv.assignedOwner !== "Sales Executive A"
        )
          return false;
        if (
          ["open", "pending", "resolved", "archived"].includes(statusFilter) &&
          conv.status !== statusFilter
        ) {
          return false;
        }

        // Channel Filter
        if (channelFilter !== "all" && conv.channel !== channelFilter) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = conv.participant.name.toLowerCase().includes(q);
          const matchesIdentifier = conv.participant.handleOrIdentifier
            .toLowerCase()
            .includes(q);
          const matchesSnippet = (conv.lastMessage?.content || "")
            .toLowerCase()
            .includes(q);
          const matchesTag = conv.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchesName && !matchesIdentifier && !matchesSnippet && !matchesTag) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "unread") {
          return b.unreadCount - a.unreadCount;
        }
        if (sortBy === "priority") {
          const weights: Record<string, number> = {
            urgent: 4,
            high: 3,
            medium: 2,
            low: 1,
          };
          return (weights[b.priority] || 1) - (weights[a.priority] || 1);
        }
        // recent
        return (
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
        );
      });
  }, [conversations, statusFilter, channelFilter, searchQuery, sortBy]);

  // Message Sending
  const handleSendMessage = async (params: {
    content: string;
    isInternalNote: boolean;
    attachments?: Attachment[];
  }) => {
    if (!activeConversationId) return;
    const sent = await sendConversationMessage({
      conversationId: activeConversationId,
      content: params.content,
      isInternalNote: params.isInternalNote,
      attachments: params.attachments,
    });
    setMessages((prev) => [...prev, sent]);
  };

  const handleSelectTemplateText = (resolvedText: string) => {
    if (activeConversationId) {
      saveConversationDraft(activeConversationId, resolvedText);
    }
  };

  return (
    <section className="bl-inbox-module-page" aria-label="BizLead Unified Inbox">
      {/* 1. Page Heading */}
      <div className="bl-page-heading">
        <div>
          <div className="bl-eyebrow">OMNICHANNEL / UNIFIED INBOX</div>
          <h1>Every conversation. One place.</h1>
          <p>Connect faster. Respond smarter. Close better.</p>
        </div>

        <div className="bl-header-actions">
          <button
            type="button"
            className="bl-secondary bl-btn-compact"
            onClick={() => setChannelsModalOpen(true)}
          >
            <Radio size={15} />
            <span>Channels</span>
          </button>
          <button
            type="button"
            className="bl-icon"
            onClick={() => refreshAll()}
            title="Refresh All Streams"
            aria-label="Refresh streams"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <InboxMetrics
        conversations={conversations}
        messages={messages}
        onFilterStatus={(st) => setStatusFilter(st)}
      />

      {/* 3. Filters & Scope Toolbar */}
      <ConversationFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        channelFilter={channelFilter}
        onChannelFilterChange={setChannelFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onOpenChannelsModal={() => setChannelsModalOpen(true)}
        onOpenTemplatesModal={() => setTemplatesModalOpen(true)}
      />

      {/* 4. Three-Column Workspace Layout */}
      <div
        className={`bl-inbox-three-column-workspace ${
          !showRightContext ? "right-collapsed" : ""
        }`}
      >
        {/* Left Column: Conversation Directory */}
        <ConversationDirectory
          conversations={filteredConversations}
          selectedConversationId={activeConversationId}
          onSelectConversation={(id) => setActiveConversationId(id)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Center Column: Active Conversation Stream & Composer */}
        {activeConversation ? (
          <ConversationThread
            conversation={activeConversation}
            messages={messages}
            onSendMessage={handleSendMessage}
            onStatusChange={(st) =>
              updateConversationStatus(activeConversation.id, st)
            }
            onPriorityChange={(pr) =>
              updateConversationPriority(activeConversation.id, pr)
            }
            onAssignChange={(owner) =>
              assignConversation(activeConversation.id, owner)
            }
            onMarkUnread={() =>
              markConversationRead(activeConversation.id)
            }
            onSaveDraft={(draft) =>
              saveConversationDraft(activeConversation.id, draft)
            }
            onOpenTemplates={() => setTemplatesModalOpen(true)}
            onOpenAI={() => setAiAssistantOpen(true)}
            showContextPanel={showRightContext}
            onToggleContextPanel={() => setShowRightContext(!showRightContext)}
          />
        ) : (
          <div className="bl-inbox-empty-thread-placeholder">
            <MessageSquare size={48} opacity={0.3} />
            <h3>Select a Conversation</h3>
            <p>
              Choose an active discussion from the left directory to start
              communicating across WhatsApp, Instagram, or Email.
            </p>
          </div>
        )}

        {/* Right Column: Customer Intelligence & CRM Context */}
        {showRightContext && activeConversation && (
          <CustomerContextPanel
            key={activeConversation.id}
            conversation={activeConversation}
            contacts={contacts}
            companies={companies}
            deals={deals}
            stages={stages}
          />
        )}
      </div>

      {/* MODAL 1: Smart Reply Templates */}
      <ReplyTemplates
        isOpen={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        activeConversation={activeConversation}
        onSelectTemplate={handleSelectTemplateText}
      />

      {/* MODAL 2: Channel Connection Center */}
      <ChannelConnectionCenter
        isOpen={channelsModalOpen}
        onClose={() => setChannelsModalOpen(false)}
      />

      {/* MODAL 3: Biz AI Assistant */}
      {activeConversation && (
        <BizAIAssistant
          isOpen={aiAssistantOpen}
          onClose={() => setAiAssistantOpen(false)}
          conversation={activeConversation}
          messages={messages}
          onInsertSuggestion={(text) => {
            saveConversationDraft(activeConversation.id, text);
          }}
        />
      )}
    </section>
  );
}
