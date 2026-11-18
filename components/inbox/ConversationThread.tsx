"use client";

import React, { useEffect, useRef } from "react";
import { Message, Conversation, Attachment, ConversationStatus, ConversationPriority } from "@/components/crm/types";
import { ConversationActions } from "./ConversationActions";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";

interface ConversationThreadProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (params: {
    content: string;
    isInternalNote: boolean;
    attachments?: Attachment[];
  }) => Promise<void>;
  onStatusChange: (status: ConversationStatus) => void;
  onPriorityChange: (priority: ConversationPriority) => void;
  onAssignChange: (owner: string) => void;
  onMarkUnread: () => void;
  onSaveDraft: (draft: string) => void;
  onOpenTemplates: () => void;
  onOpenAI: () => void;
  showContextPanel: boolean;
  onToggleContextPanel: () => void;
}

function formatDateSeparator(timestamp: string): string {
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return "Recent Messages";
    const today = new Date();
    if (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    }
    const yesterday = new Date(Date.now() - 86400000);
    if (
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday";
    }
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recent Messages";
  }
}

export function ConversationThread({
  conversation,
  messages,
  onSendMessage,
  onStatusChange,
  onPriorityChange,
  onAssignChange,
  onMarkUnread,
  onSaveDraft,
  onOpenTemplates,
  onOpenAI,
  showContextPanel,
  onToggleContextPanel,
}: ConversationThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, conversation.id]);

  // Group messages with date separators
  let lastDate = "";

  return (
    <div className="bl-inbox-center-thread">
      {/* 1. Header with Controls */}
      <ConversationActions
        conversation={conversation}
        onStatusChange={onStatusChange}
        onPriorityChange={onPriorityChange}
        onAssignChange={onAssignChange}
        onMarkUnread={onMarkUnread}
        showContextPanel={showContextPanel}
        onToggleContextPanel={onToggleContextPanel}
      />

      {/* 2. Message History Stream */}
      <div className="bl-inbox-messages-stream" role="log" aria-label="Message Stream">
        {messages.map((msg, idx) => {
          const sep = formatDateSeparator(msg.timestamp);
          const showSeparator = sep !== lastDate;
          if (showSeparator) lastDate = sep;

          const quoted = msg.replyToReferenceId
            ? messages.find((m) => m.id === msg.replyToReferenceId) || null
            : null;

          return (
            <React.Fragment key={msg.id}>
              {showSeparator && (
                <div className="bl-date-separator">
                  <span>{sep}</span>
                </div>
              )}
              <MessageBubble message={msg} quotedMessage={quoted} />
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Composer */}
      <MessageComposer
        conversation={conversation}
        onSendMessage={onSendMessage}
        onOpenTemplates={onOpenTemplates}
        onOpenAI={onOpenAI}
        onSaveDraft={onSaveDraft}
      />
    </div>
  );
}
