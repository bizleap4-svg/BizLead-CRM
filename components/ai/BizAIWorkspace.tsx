"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCRM } from "../crm/CRMProvider";
import { AISession, AIMessage, AIContext } from "./types";
import { AIRepository } from "./AIRepository";
import { LocalAssistant } from "./LocalAssistant";
import { AIConversationSidebar } from "./AIConversationSidebar";
import { AIMessageCard } from "./AIMessageCard";
import { AIComposer } from "./AIComposer";
import { DailyBriefing } from "./DailyBriefing";
import { AIProviderSettings } from "./AIProviderSettings";
import { Sparkles, Calendar, Settings, ShieldCheck } from "lucide-react";

export const BizAIWorkspace: React.FC = () => {
  const {
    leads,
    deals,
    stages,
    contacts,
    companies,
    tasks,
    meetings,
    campaigns,
    dailyMetrics,
    conversations,
    workflows,
    executions,
    createTask,
    updateLead,
    updateDeal,
    createMeeting,
    createWorkflow,
    refreshAll,
  } = useCRM();

  // Sessions & Messages State
  const [sessions, setSessions] = useState<AISession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [activeContext, setActiveContext] = useState<AIContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Load
  useEffect(() => {
    const loadedSessions = AIRepository.getSessions();
    setSessions(loadedSessions);
    if (loadedSessions.length > 0) {
      const firstId = loadedSessions[0].id;
      setActiveSessionId(firstId);
      setMessages(AIRepository.getMessages(firstId));
    }
  }, []);

  // When active session changes
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setMessages(AIRepository.getMessages(sessionId));
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle Send Message
  const handleSendMessage = async (content: string, context?: AIContext) => {
    let currentSessionId = activeSessionId;

    // Create session if none exists
    if (!currentSessionId) {
      const newSess = AIRepository.createSession(content.slice(0, 36) + "...");
      setSessions(AIRepository.getSessions());
      currentSessionId = newSess.id;
      setActiveSessionId(currentSessionId);
    }

    const userMsg: AIMessage = {
      id: `msg-user-${Date.now()}`,
      sessionId: currentSessionId,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
      contextEntity: context?.selectedEntityType
        ? {
            type: context.selectedEntityType,
            id: context.selectedEntityId || "",
            name: context.selectedEntityName || "",
          }
        : undefined,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    AIRepository.saveMessages(currentSessionId, nextMessages);

    setIsLoading(true);

    try {
      const assistantMsg = await LocalAssistant.processMessage(
        content,
        currentSessionId,
        {
          leads,
          deals,
          stages,
          contacts,
          companies,
          tasks,
          meetings,
          campaigns,
          dailyMetrics,
          conversations,
          workflows,
          executions,
        },
        context
      );

      const updatedWithReply = [...nextMessages, assistantMsg];
      setMessages(updatedWithReply);
      AIRepository.saveMessages(currentSessionId, updatedWithReply);

      // Update session title if first exchange
      if (nextMessages.length <= 2) {
        const titleSnippet = content.length > 32 ? content.slice(0, 32) + "..." : content;
        AIRepository.saveSessions(
          sessions.map((s) => (s.id === currentSessionId ? { ...s, title: titleSnippet } : s))
        );
        setSessions(AIRepository.getSessions());
      }
    } catch (err: any) {
      const errorReply: AIMessage = {
        id: `msg-err-${Date.now()}`,
        sessionId: currentSessionId,
        role: "assistant",
        content: `Encountered an operational error: ${err.message || "Failed to process query."}`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages([...nextMessages, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  // New Chat
  const handleNewSession = () => {
    const newSession = AIRepository.createSession("New Conversation");
    const updated = AIRepository.getSessions();
    setSessions(updated);
    setActiveSessionId(newSession.id);
    setMessages([]);
    setActiveContext(null);
  };

  // Rename Session
  const handleRenameSession = (id: string, newTitle: string) => {
    const updated = sessions.map((s) => (s.id === id ? { ...s, title: newTitle } : s));
    AIRepository.saveSessions(updated);
    setSessions(updated);
  };

  // Delete Session
  const handleDeleteSession = (id: string) => {
    AIRepository.deleteSession(id);
    const updated = AIRepository.getSessions();
    setSessions(updated);
    if (activeSessionId === id) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id);
        setMessages(AIRepository.getMessages(updated[0].id));
      } else {
        handleNewSession();
      }
    }
  };

  // Clear All
  const handleClearAll = () => {
    AIRepository.clearAllSessions();
    setSessions([]);
    handleNewSession();
  };

  const executionContext = {
    leads,
    deals,
    tasks,
    meetings,
    workflows,
    createTask,
    updateLead,
    updateDeal,
    createMeeting,
    createWorkflow,
    refreshAll,
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* 1. Left Sidebar: Sessions */}
      <AIConversationSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
        onClearAll={handleClearAll}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 2. Main Assistant Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background/50">
        {/* Workspace Sub-header */}
        <div className="px-6 py-3 border-b border-border flex items-center justify-between bg-card/60 backdrop-blur-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 fill-primary/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-foreground text-sm">Biz AI Workspace</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Local CRM Assistant — Rule-Based Mode
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                In-browser deterministic execution · Zero external cloud latency · Real CRM mutations with user approval
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBriefingOpen(true)}
              id="btn-daily-briefing"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card text-foreground hover:bg-muted text-xs font-semibold transition-colors shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Daily Briefing</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card text-foreground hover:bg-muted text-xs font-semibold transition-colors shadow-xs"
              title="Provider Architecture & Readiness"
            >
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Providers</span>
            </button>
          </div>
        </div>

        {/* Message Thread Feed */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                <Sparkles className="w-7 h-7 fill-primary/20" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base">
                  What can Biz AI help you with?
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Ask questions about pipeline value, high-intent leads, upcoming meetings, or request an automation workflow draft.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <AIMessageCard
                key={msg.id}
                message={msg}
                executionContext={executionContext}
                onActionStatusChange={() => {
                  // Reload active messages to reflect executed status
                  if (activeSessionId) {
                    setMessages(AIRepository.getMessages(activeSessionId));
                  }
                }}
              />
            ))
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 items-center py-2 text-xs text-muted-foreground animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-card border flex items-center justify-center text-primary">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span>Querying live CRM records & formulating decision analysis...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Composer Section */}
        <div className="p-4 border-t border-border bg-card/60 backdrop-blur-xs">
          <AIComposer
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            activeContext={activeContext}
            onSelectContext={setActiveContext}
            leads={leads}
            deals={deals}
            companies={companies}
            campaigns={campaigns}
            contacts={contacts}
          />
        </div>
      </div>

      {/* Modals */}
      <DailyBriefing
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
        leads={leads}
        deals={deals}
        meetings={meetings}
        tasks={tasks}
        workflows={workflows}
        onTriggerCopilotPrompt={(prompt) => handleSendMessage(prompt)}
      />

      <AIProviderSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
