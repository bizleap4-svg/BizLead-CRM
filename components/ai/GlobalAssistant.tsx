"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCRM } from "../crm/CRMProvider";
import { AIComposer } from "./AIComposer";
import { AIMessageCard } from "./AIMessageCard";
import { LocalAssistant } from "./LocalAssistant";
import { AIMessage, AIContext } from "./types";
import { Sparkles, X, Maximize2, Minimize2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useGlobalAI } from "./GlobalAIContext";

export const GlobalAssistant: React.FC = () => {
  const pathname = usePathname();
  const { isAIOpen, openAI, closeAI } = useGlobalAI();
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

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAIOpen) {
        closeAI();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAIOpen, closeAI]);

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
      {!isAIOpen && (
        <button
          onClick={openAI}
          id="btn-global-ai-launcher"
          aria-label="Open Biz AI Assistant"
          className="bl-global-ai-launcher"
        >
          <Sparkles className="w-4 h-4" style={{ fill: "rgba(0,0,0,0.2)" }} />
          <span>Ask Biz AI</span>
        </button>
      )}

      {/* Floating Contextual Assistant Slide-over / Docked Drawer */}
      {isAIOpen && (
        <>
          {/* Backdrop for screens < 1280px */}
          <div
            className="bl-ai-backdrop"
            onClick={closeAI}
            aria-hidden="true"
          />

          <aside
            id="global-ai-slideover-drawer"
            role="dialog"
            aria-label="Biz AI Contextual Assistant"
            className="bl-ai-docked-panel"
            style={{
              position: "fixed",
              top: "12px",
              bottom: "12px",
              right: "12px",
              zIndex: "var(--z-ai-panel, 40)",
              width: "380px",
              maxWidth: "calc(100vw - 24px)",
              backgroundColor: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "20px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "var(--soft-neutral)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    backgroundColor: "color-mix(in srgb, var(--accent) 15%, transparent)",
                    color: "var(--accent)",
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
                        backgroundColor: "var(--color-success, #10b981)",
                      }}
                    />
                  </h4>
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                    Contextual Copilot · Rule-Based Mode
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Link
                  href="/ai"
                  onClick={closeAI}
                  style={{
                    padding: "4px",
                    borderRadius: "6px",
                    color: "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Expand to Full AI Workspace"
                  aria-label="Expand to Full AI Workspace"
                >
                  <Maximize2 style={{ width: "16px", height: "16px" }} />
                </Link>
                <button
                  onClick={closeAI}
                  aria-label="Close Biz AI Assistant"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "6px",
                    color: "var(--muted)",
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
                    color: "var(--muted)",
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
                borderTop: "1px solid var(--border)",
                backgroundColor: "var(--surface)",
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
          </aside>
        </>
      )}
    </>
  );
};
