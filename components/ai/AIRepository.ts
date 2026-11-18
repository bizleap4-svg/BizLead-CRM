/**
 * BizLead Revenue OS — AI Repository
 * Versioned persistence for assistant sessions, messages, and suggested prompts.
 */

import { AISession, AIMessage } from "./types";

export const STORAGE_KEY_AI_SESSIONS = "bizlead_ai_sessions_v1";
export const STORAGE_KEY_AI_MESSAGES_PREFIX = "bizlead_ai_msgs_v1_";

const INITIAL_DEFAULT_SESSION_ID = "session-priority-leads-001";

const INITIAL_SESSIONS: AISession[] = [
  {
    id: INITIAL_DEFAULT_SESSION_ID,
    title: "Priority Leads & Immediate Attention",
    createdAt: "2026-11-18T09:00:00Z",
    updatedAt: "2026-11-18T09:05:00Z",
    messageCount: 2,
  },
  {
    id: "session-pipeline-q4",
    title: "Q4 Pipeline & Revenue Forecast",
    createdAt: "2026-11-17T14:30:00Z",
    updatedAt: "2026-11-17T14:35:00Z",
    messageCount: 2,
  },
];

const INITIAL_MESSAGES: Record<string, AIMessage[]> = {
  [INITIAL_DEFAULT_SESSION_ID]: [
    {
      id: "msg-seed-1",
      sessionId: INITIAL_DEFAULT_SESSION_ID,
      role: "user",
      content: "Which leads need immediate attention?",
      timestamp: "2026-11-18T09:00:00Z",
    },
    {
      id: "msg-seed-2",
      sessionId: INITIAL_DEFAULT_SESSION_ID,
      role: "assistant",
      content: "Based on the live CRM records, these three leads require priority attention due to upcoming close dates, pending follow-ups, and high buying intent scores:",
      timestamp: "2026-11-18T09:00:02Z",
      cards: [
        {
          id: "card-seed-1",
          type: "lead",
          title: "Aarav Sharma",
          subtitle: "Layers Studio · Overdue follow-up",
          scoreOrValue: "96/100",
          badge: "OVERDUE",
          badgeColor: "rose",
          metrics: [
            { label: "Deal Value", value: "₹84,000" },
            { label: "Stage", value: "Qualified" },
          ],
          entityId: "lead-001",
          entityType: "lead",
          linkUrl: "/leads",
        },
        {
          id: "card-seed-2",
          type: "lead",
          title: "Ananya Patel",
          subtitle: "Orbit Technologies · Proposal awaiting response",
          scoreOrValue: "92/100",
          badge: "PROPOSAL",
          badgeColor: "amber",
          metrics: [
            { label: "Deal Value", value: "₹1,20,000" },
            { label: "Stage", value: "Proposal" },
          ],
          entityId: "lead-002",
          entityType: "lead",
          linkUrl: "/leads",
        },
        {
          id: "card-seed-3",
          type: "lead",
          title: "Neha Gupta",
          subtitle: "Forma Collective · Closing date approaching",
          scoreOrValue: "87/100",
          badge: "CLOSING",
          badgeColor: "emerald",
          metrics: [
            { label: "Deal Value", value: "₹92,000" },
            { label: "Stage", value: "Negotiation" },
          ],
          entityId: "lead-003",
          entityType: "lead",
          linkUrl: "/leads",
        },
      ],
      actionProposals: [
        {
          id: "prop-seed-tasks-1",
          actionType: "create_task",
          title: "Create 3 High-Priority Follow-up Tasks",
          description: "Schedule high-priority follow-up tasks in the Focus Center for Aarav Sharma, Ananya Patel, and Neha Gupta.",
          status: "pending",
          parameters: {
            title: "Immediate Priority Follow-up",
            priority: "high",
            dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          },
          diffPreview: [
            { field: "Aarav Sharma", newValue: "Schedule Strategy Call (High)" },
            { field: "Ananya Patel", newValue: "Send Commercial Proposal Review (High)" },
            { field: "Neha Gupta", newValue: "Confirm Final Contract Terms (High)" },
          ],
        },
      ],
      toolCalls: [
        { toolName: "search_leads", parameters: { minScore: 80 }, executionTimeMs: 12, success: true },
      ],
    },
  ],
};

export class AIRepository {
  static getSessions(): AISession[] {
    if (typeof window === "undefined") return INITIAL_SESSIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AI_SESSIONS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_AI_SESSIONS, JSON.stringify(INITIAL_SESSIONS));
        return INITIAL_SESSIONS;
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SESSIONS;
    } catch {
      return INITIAL_SESSIONS;
    }
  }

  static saveSessions(sessions: AISession[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY_AI_SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error("Failed to persist AI sessions", e);
    }
  }

  static getMessages(sessionId: string): AIMessage[] {
    if (typeof window === "undefined") return INITIAL_MESSAGES[sessionId] || [];
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_AI_MESSAGES_PREFIX}${sessionId}`);
      if (!stored) {
        const seed = INITIAL_MESSAGES[sessionId] || [];
        if (seed.length > 0) {
          localStorage.setItem(`${STORAGE_KEY_AI_MESSAGES_PREFIX}${sessionId}`, JSON.stringify(seed));
        }
        return seed;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_MESSAGES[sessionId] || [];
    }
  }

  static saveMessages(sessionId: string, messages: AIMessage[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`${STORAGE_KEY_AI_MESSAGES_PREFIX}${sessionId}`, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to persist AI messages", e);
    }
  }

  static createSession(title?: string, contextEntity?: any): AISession {
    const sessions = this.getSessions();
    const newSession: AISession = {
      id: `session-${Date.now()}`,
      title: title || "New Assistant Session",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      contextEntity,
      messageCount: 0,
    };
    const updated = [newSession, ...sessions];
    this.saveSessions(updated);
    return newSession;
  }

  static deleteSession(sessionId: string): void {
    const sessions = this.getSessions().filter((s) => s.id !== sessionId);
    this.saveSessions(sessions);
    if (typeof window !== "undefined") {
      localStorage.removeItem(`${STORAGE_KEY_AI_MESSAGES_PREFIX}${sessionId}`);
    }
  }

  static clearAllSessions(): void {
    if (typeof window !== "undefined") {
      const sessions = this.getSessions();
      sessions.forEach((s) => localStorage.removeItem(`${STORAGE_KEY_AI_MESSAGES_PREFIX}${s.id}`));
      localStorage.removeItem(STORAGE_KEY_AI_SESSIONS);
    }
  }
}
