"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Paperclip,
  Smile,
  BookOpen,
  Sparkles,
  Lock,
  MessageSquare,
  AlertCircle,
  X,
} from "lucide-react";
import { Conversation, Attachment } from "@/components/crm/types";

interface MessageComposerProps {
  conversation: Conversation;
  onSendMessage: (params: {
    content: string;
    isInternalNote: boolean;
    attachments?: Attachment[];
  }) => Promise<void>;
  onOpenTemplates: () => void;
  onOpenAI: () => void;
  onSaveDraft: (draft: string) => void;
}

const QUICK_EMOJIS = ["👍", "🤝", "📅", "📄", "🚀", "✅", "🙏"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function MessageComposer({
  conversation,
  onSendMessage,
  onOpenTemplates,
  onOpenAI,
  onSaveDraft,
}: MessageComposerProps) {
  const [mode, setMode] = useState<"reply" | "note">("reply");
  const [content, setContent] = useState(conversation.draftMessage || "");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync draft when switching conversations or when draftMessage updates externally (e.g. template inserted or Biz AI)
  useEffect(() => {
    setContent(conversation.draftMessage || "");
  }, [conversation.draftMessage, conversation.id]);

  useEffect(() => {
    setAttachments([]);
    setFileError(null);
    setMode("reply");
  }, [conversation.id]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    onSaveDraft(val);
  };

  const handleEmojiClick = (emoji: string) => {
    const next = content + emoji;
    setContent(next);
    onSaveDraft(next);
    setShowEmojiBar(false);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setFileError("File exceeds 10 MB limit.");
      return;
    }

    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      isDemoPrototype: true,
    };

    setAttachments((prev) => [...prev, newAtt]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() && attachments.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSendMessage({
        content: content.trim(),
        isInternalNote: mode === "note",
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      setContent("");
      setAttachments([]);
      onSaveDraft("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={`bl-inbox-composer-card ${
        mode === "note" ? "internal-note-mode" : ""
      }`}
    >
      {/* Top Mode Selector Tabs */}
      <div className="bl-composer-mode-bar">
        <button
          type="button"
          className={`bl-composer-mode-btn ${mode === "reply" ? "active" : ""}`}
          onClick={() => setMode("reply")}
        >
          <MessageSquare size={13} />
          <span>Customer Reply ({conversation.channel.toUpperCase()})</span>
        </button>

        <button
          type="button"
          className={`bl-composer-mode-btn ${mode === "note" ? "active note-active" : ""}`}
          onClick={() => setMode("note")}
        >
          <Lock size={13} />
          <span>Internal Team Note (Private)</span>
        </button>
      </div>

      {/* Internal Note Banner Warning */}
      {mode === "note" && (
        <div className="bl-composer-note-warning">
          <Lock size={13} />
          <span>
            <strong>Private Team Note:</strong> This note will be recorded in the CRM activity stream and will NEVER be transmitted to the customer.
          </span>
        </div>
      )}

      {/* File Error Notification */}
      {fileError && (
        <div className="bl-warning-banner" style={{ margin: "8px 12px 0" }}>
          <AlertCircle size={14} /> {fileError}
        </div>
      )}

      {/* Attached Files Chips */}
      {attachments.length > 0 && (
        <div className="bl-composer-attachments-bar">
          {attachments.map((att) => (
            <span key={att.id} className="bl-composer-att-chip">
              <Paperclip size={12} />
              <span className="bl-att-chip-name">{att.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(att.id)}
                title="Remove attachment"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Textarea */}
      <div className="bl-composer-input-wrap">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === "note"
              ? "Write a private internal note for your team (e.g. Budget discussed, follow-up notes)..."
              : `Type a response to ${conversation.participant.name} on ${conversation.channel.toUpperCase()} (Cmd+Enter to send)...`
          }
          rows={3}
          aria-label="Message composition input"
        />
      </div>

      {/* Emoji Picker Popover Bar */}
      {showEmojiBar && (
        <div className="bl-quick-emoji-bar">
          {QUICK_EMOJIS.map((em) => (
            <button
              key={em}
              type="button"
              className="bl-emoji-btn"
              onClick={() => handleEmojiClick(em)}
            >
              {em}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Action Tools & Send Button */}
      <div className="bl-composer-footer">
        <div className="bl-composer-tools-left">
          {/* File attachment */}
          <button
            type="button"
            className="bl-icon bl-icon-sm"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file (PDF, DOCX, XLSX, PNG, JPG - max 10MB)"
            aria-label="Attach file"
          >
            <Paperclip size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={handleFileSelect}
            accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg"
          />

          {/* Emoji */}
          <button
            type="button"
            className="bl-icon bl-icon-sm"
            onClick={() => setShowEmojiBar(!showEmojiBar)}
            title="Insert quick emoji"
            aria-label="Quick emoji"
          >
            <Smile size={16} />
          </button>

          {/* Templates Trigger */}
          <button
            type="button"
            className="bl-tool-pill-btn"
            onClick={onOpenTemplates}
            title="Open saved reply templates"
          >
            <BookOpen size={13} />
            <span>Templates</span>
          </button>

          {/* Biz AI Assistant Trigger */}
          <button
            type="button"
            className="bl-tool-pill-btn bl-ai-pill-btn"
            onClick={onOpenAI}
            title="Open Biz AI reply & intent assistant"
          >
            <Sparkles size={13} />
            <span>Biz AI</span>
          </button>
        </div>

        {/* Send Action */}
        <div className="bl-composer-tools-right">
          <span className="bl-keyboard-hint">⌘ + Enter</span>
          <button
            type="button"
            disabled={isSubmitting || (!content.trim() && attachments.length === 0)}
            className={`bl-primary bl-send-btn ${mode === "note" ? "note-btn" : ""}`}
            onClick={() => handleSubmit()}
          >
            <span>{mode === "note" ? "Save Note" : "Send Reply"}</span>
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
