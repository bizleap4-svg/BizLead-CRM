"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useCRM } from "../crm/CRMProvider";
import { AIComposer } from "./AIComposer";
import { AIMessageCard } from "./AIMessageCard";
import { LocalAssistant } from "./LocalAssistant";
import { AIMessage, AIContext } from "./types";
import { Sparkles, X, Maximize2, Minimize2, ExternalLink } from "lucide-react";
import Link from "next/link";

export const GlobalAssistant: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "msg-global-seed",
      sessionId: "global-floating-session",
      role: "assistant",
      content: "Hi, I am your **Biz AI Assistant**. Ask me about active deals, follow-up actions, or marketing performance from anywhere in the CRM.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

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

  // If already on /ai, do not render floating drawer
  if (pathname === "/ai") return null;

  const handleSend = async (content: string, context?: AIContext) => {
    const userMsg: AIMessage = {
      id: `msg-user-${Date.now()}`,
      sessionId: "global-floating-session",
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setIsLoading(true);

    try {
      const reply = await LocalAssistant.processMessage(
        content,
        "global-floating-session",
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
      setMessages([...nextMsgs, reply]);
    } catch (err: any) {
      setMessages([
        ...nextMsgs,
        {
          id: `msg-err-${Date.now()}`,
          sessionId: "global-floating-session",
          role: "assistant",
          content: `Failed to process: ${err.message}`,
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
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
    <>
      {/* Floating Launcher Trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="btn-global-ai-launcher"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            borderRadius: "9999px",
            backgroundColor: "var(--accent, #FFD028)",
            color: "#0d0d0d",
            fontWeight: 700,
            fontSize: "13px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            border: "none",
            cursor: "pointer",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          className="hover:scale-105"
        >
          <Sparkles className="w-4 h-4" style={{ fill: "rgba(0,0,0,0.2)" }} />
          <span>Ask Biz AI</span>
        </button>
      )}

      {/* Floating Contextual Assistant Slide-over Drawer */}
      {isOpen && (
        <div
          id="global-ai-slideover-drawer"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            width: "420px",
            maxWidth: "calc(100vw - 48px)",
            height: "560px",
            maxHeight: "calc(100vh - 48px)",
            backgroundColor: "var(--card-bg, #1e1e1e)",
            color: "var(--text, #ffffff)",
            border: "1px solid var(--border, rgba(255,255,255,0.1))",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border, rgba(255,255,255,0.1))",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(255,255,255,0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255,208,40,0.15)",
                  color: "var(--accent, #FFD028)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles style={{ width: "16px", height: "16px" }} />
              </div>
              <div>
                <h4
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>Biz AI Assistant</span>
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#10b981",
                    }}
                  />
                </h4>
                <span style={{ fontSize: "11px", color: "var(--muted, #888888)" }}>
                  Contextual Copilot · Rule-Based Mode
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Link
                href="/ai"
                onClick={() => setIsOpen(false)}
                style={{
                  padding: "4px",
                  borderRadius: "6px",
                  color: "var(--muted, #888888)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Expand to Full AI Workspace"
              >
                <Maximize2 style={{ width: "16px", height: "16px" }} />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "6px",
                  color: "var(--muted, #888888)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {messages.map((msg) => (
              <AIMessageCard
                key={msg.id}
                message={msg}
                executionContext={executionContext}
                onActionStatusChange={() => {}}
              />
            ))}
            {isLoading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12px",
                  color: "var(--muted, #888888)",
                  padding: "8px 0",
                }}
              >
                <Sparkles style={{ width: "14px", height: "14px", color: "var(--accent)" }} />
                <span>Formulating response...</span>
              </div>
            )}
          </div>

          {/* Quick Composer */}
          <div
            style={{
              padding: "12px",
              borderTop: "1px solid var(--border, rgba(255,255,255,0.1))",
              backgroundColor: "var(--card-bg, #1e1e1e)",
            }}
          >
            <AIComposer
              onSendMessage={handleSend}
              isLoading={isLoading}
              activeContext={null}
              onSelectContext={() => {}}
              leads={leads}
              deals={deals}
              companies={companies}
              campaigns={campaigns}
              contacts={contacts}
            />
          </div>
        </div>
      )}
    </>
  );
};
