"use client";

import React from "react";
import { BizAIWorkspace } from "../../../components/ai/BizAIWorkspace";
import { Sparkles, ShieldCheck } from "lucide-react";

export default function AIPage() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Intelligence, unlocked.
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Biz AI
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your entire business ecosystem. One conversation. Actionable intelligence backed by live CRM records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl border bg-card text-foreground text-xs font-medium flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Local CRM Assistant</span>
            <span className="text-muted-foreground">· Rule-Based Mode</span>
          </div>
        </div>
      </div>

      {/* Main Biz AI Workspace */}
      <BizAIWorkspace />
    </div>
  );
}
