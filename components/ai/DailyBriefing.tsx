"use client";

import React from "react";
import { Lead, Deal, CRMMeeting, CRMTask, Workflow } from "../crm/types";
import {
  X,
  Calendar,
  Clock,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Workflow as WorkflowIcon,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface DailyBriefingProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  deals: Deal[];
  meetings: CRMMeeting[];
  tasks: CRMTask[];
  workflows: Workflow[];
  onTriggerCopilotPrompt?: (prompt: string) => void;
}

export const DailyBriefing: React.FC<DailyBriefingProps> = ({
  isOpen,
  onClose,
  leads,
  deals,
  meetings,
  tasks,
  workflows,
  onTriggerCopilotPrompt,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayMeetings = meetings.filter((m) => m.date === todayStr && m.status !== "cancelled");
  const overdueTasks = tasks.filter((t) => t.status !== "completed" && t.dueDate < todayStr);
  const highIntentLeads = leads.filter((l) => l.score >= 85 && l.stage !== "lost");
  const activeWorkflows = workflows.filter((w) => w.status === "active");

  const totalPipeline = deals
    .filter((d) => d.stage !== "lost")
    .reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 fill-primary/20" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">
                Daily Business Briefing
              </h3>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Executive Briefing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1">
          {/* 1. Schedule & Meetings */}
          <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Today's Calendar</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">
                {todayMeetings.length} Meeting(s)
              </span>
            </div>
            {todayMeetings.length === 0 ? (
              <p className="text-xs text-muted-foreground pt-2">
                No meetings scheduled for today. Open calendar for proactive outreach.
              </p>
            ) : (
              <div className="space-y-2 pt-1">
                {todayMeetings.map((m) => (
                  <div key={m.id} className="p-2.5 rounded-lg bg-card border text-xs">
                    <div className="font-semibold text-foreground">{m.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {m.startTime} - {m.endTime}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Overdue Actions & Tasks */}
          <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Urgent Overdue Tasks</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px]">
                {overdueTasks.length} Overdue
              </span>
            </div>
            {overdueTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground pt-2">
                Great job! All scheduled CRM tasks and follow-ups are up to date.
              </p>
            ) : (
              <div className="space-y-2 pt-1">
                {overdueTasks.slice(0, 3).map((t) => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-card border text-xs">
                    <div className="font-semibold text-foreground line-clamp-1">{t.title}</div>
                    <div className="text-[11px] text-rose-500 mt-0.5 font-medium">
                      Due: {t.dueDate} · {t.entityName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. High-Intent Opportunities */}
          <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>High-Intent Leads</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px]">
                {highIntentLeads.length} Inflow
              </span>
            </div>
            <div className="space-y-2 pt-1">
              {highIntentLeads.slice(0, 3).map((l) => (
                <div key={l.id} className="p-2.5 rounded-lg bg-card border text-xs flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-foreground">{l.name}</div>
                    <div className="text-[11px] text-muted-foreground">{l.company}</div>
                  </div>
                  <span className="font-bold text-emerald-500 text-xs">
                    {l.score}/100
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Pipeline & Automation Health */}
          <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span className="flex items-center gap-1.5">
                <WorkflowIcon className="w-4 h-4 text-primary" />
                <span>Pipeline & Operations</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">
                Healthy
              </span>
            </div>
            <div className="pt-1 space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Active Pipeline Value:</span>
                <span className="font-bold text-foreground">₹{totalPipeline.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Active Workflows:</span>
                <span className="font-bold text-foreground">{activeWorkflows.length} listeners</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">System Engine:</span>
                <span className="font-bold text-emerald-500">100% Deterministic</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onTriggerCopilotPrompt?.("Which leads need immediate attention?");
            }}
            className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
          >
            <span>Ask Biz AI to prioritize immediate follow-ups</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
          >
            Dismiss Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
