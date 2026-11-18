"use client";

import React, { useState, useRef, useEffect } from "react";
import { AIContextPicker } from "./AIContextPicker";
import { AIContext } from "./types";
import { Lead, Deal, Company, MarketingCampaign, Contact } from "../crm/types";
import { Send, Sparkles, X, CornerDownLeft } from "lucide-react";

interface AIComposerProps {
  onSendMessage: (content: string, context?: AIContext) => void;
  isLoading: boolean;
  activeContext: AIContext | null;
  onSelectContext: (ctx: AIContext | null) => void;
  leads: Lead[];
  deals: Deal[];
  companies: Company[];
  campaigns: MarketingCampaign[];
  contacts: Contact[];
}

const SUGGESTED_PROMPTS = [
  "Which leads need immediate attention?",
  "What is our current pipeline value?",
  "Summarize my pending tasks",
  "Which campaign generates the most qualified leads?",
  "Daily business briefing",
  "When a new lead has a score above 80, assign it to Rahul Sharma",
];

export const AIComposer: React.FC<AIComposerProps> = ({
  onSendMessage,
  isLoading,
  activeContext,
  onSelectContext,
  leads,
  deals,
  companies,
  campaigns,
  contacts,
}) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim(), activeContext || undefined);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectSuggested = (promptText: string) => {
    setInput(promptText);
    textareaRef.current?.focus();
  };

  return (
    <div className="space-y-2.5 pt-2">
      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <span className="text-[11px] font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" />
          <span>Suggestions:</span>
        </span>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSuggested(prompt)}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted/50 border border-border/60 hover:border-primary/40 text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Main Composer Box */}
      <div className="rounded-2xl border border-border bg-card shadow-sm focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all p-2 sm:p-3">
        {/* Active Context Banner if any */}
        {activeContext && (
          <div className="mb-2 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-semibold w-fit">
            <span className="capitalize">{activeContext.selectedEntityType}:</span>
            <span className="font-bold text-foreground">{activeContext.selectedEntityName}</span>
            <button
              onClick={() => onSelectContext(null)}
              className="p-0.5 hover:text-foreground text-primary/70"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Biz AI anything about leads, pipeline, campaigns, or request an automation..."
          rows={2}
          disabled={isLoading}
          className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none leading-relaxed"
        />

        {/* Toolbar Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-1">
          <div className="flex items-center gap-1">
            <AIContextPicker
              context={activeContext}
              onSelectContext={onSelectContext}
              leads={leads}
              deals={deals}
              companies={companies}
              campaigns={campaigns}
              contacts={contacts}
            />
            <span className="text-[10px] text-muted-foreground hidden sm:inline pl-1">
              Deterministic CRM Assistant (Rule-Based)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground hidden md:inline">
              Press Enter to send
            </span>
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              id="btn-send-message"
              className="inline-flex items-center justify-center p-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-40 transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
