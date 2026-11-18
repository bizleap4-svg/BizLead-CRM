"use client";

import React, { useState } from "react";
import { AISession } from "./types";
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Settings,
} from "lucide-react";

interface AIConversationSidebarProps {
  sessions: AISession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
  onOpenSettings: () => void;
}

export const AIConversationSidebar: React.FC<AIConversationSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onRenameSession,
  onDeleteSession,
  onClearAll,
  onOpenSettings,
}) => {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase().trim())
  );

  const handleStartRename = (s: AISession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditingTitle(s.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameSession(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSession(id);
  };

  return (
    <aside className="w-72 bg-card border-r border-border flex flex-col h-full select-none">
      {/* Top Header: New Chat Button */}
      <div className="p-3.5 border-b border-border space-y-2.5">
        <button
          onClick={onNewSession}
          id="btn-new-chat"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Session History List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredSessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No conversations found.
          </div>
        ) : (
          filteredSessions.map((s) => {
            const isActive = s.id === activeSessionId;
            const isEditing = editingId === s.id;

            return (
              <div
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                className={`group p-2.5 rounded-xl cursor-pointer text-xs flex items-center justify-between transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                    : "hover:bg-muted/50 text-foreground"
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1 mr-1">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-background border rounded px-1.5 py-0.5 text-xs text-foreground focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className="truncate">{s.title}</span>
                  )}
                </div>

                {/* Inline Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isEditing ? (
                    <button
                      onClick={(e) => handleSaveRename(s.id, e)}
                      className="p-1 hover:text-emerald-500"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleStartRename(s, e)}
                      className="p-1 text-muted-foreground hover:text-foreground"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(s.id, e)}
                    className="p-1 text-muted-foreground hover:text-rose-500"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Controls: Provider Status & Clear History */}
      <div className="p-3 border-t border-border space-y-2 bg-muted/10">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-card border border-border/60 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-foreground text-[11px]">Rule-Based Mode</span>
          </div>
          <Settings className="w-3.5 h-3.5" />
        </button>

        {showClearConfirm ? (
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs space-y-2">
            <span className="block text-rose-500 text-[11px] font-semibold">
              Delete all conversation sessions?
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-1 rounded bg-rose-500 text-white font-bold text-[11px]"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-1 rounded border text-muted-foreground text-[11px]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full text-center text-[10px] text-muted-foreground hover:text-rose-500 transition-colors py-1"
          >
            Clear conversation history
          </button>
        )}
      </div>
    </aside>
  );
};
