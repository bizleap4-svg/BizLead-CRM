"use client";

import React from "react";
import Link from "next/link";
import { AIMessage } from "./types";
import { AIActionApproval } from "./AIActionApproval";
import { ExecutionContext } from "./ActionExecutor";
import {
  Sparkles,
  User,
  Wrench,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Table,
} from "lucide-react";

interface AIMessageCardProps {
  message: AIMessage;
  executionContext: ExecutionContext;
  onActionStatusChange?: () => void;
}

export const AIMessageCard: React.FC<AIMessageCardProps> = ({
  message,
  executionContext,
  onActionStatusChange,
}) => {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end my-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
        <div className="max-w-xl rounded-2xl rounded-tr-xs bg-primary text-primary-foreground px-4 py-2.5 shadow-sm text-sm font-medium leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3.5 my-5 animate-in fade-in slide-in-from-bottom-2 duration-150">
      {/* Assistant Avatar */}
      <div className="w-8 h-8 rounded-xl bg-card border border-primary/30 flex items-center justify-center shrink-0 shadow-xs text-primary mt-0.5">
        <Sparkles className="w-4 h-4 text-primary fill-primary/20" />
      </div>

      <div className="flex-1 space-y-3.5 max-w-3xl overflow-hidden">
        {/* Tool Call Badges */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            {message.toolCalls.map((tc, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 border border-border text-foreground font-mono text-[10px]"
              >
                <Wrench className="w-2.5 h-2.5 text-primary" />
                <span>tool: {tc.toolName}</span>
                <span className="text-muted-foreground">({tc.executionTimeMs}ms)</span>
              </span>
            ))}
          </div>
        )}

        {/* Message Prose */}
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Unsupported Query Notice */}
        {message.isUnsupportedQuery && (
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Deterministic rule-based mode active. Open-ended reasoning and general question answering are planned for Phase 10 via secure server gateway.
            </span>
          </div>
        )}

        {/* Rich Entity Cards Grid (e.g. Priority Leads) */}
        {message.cards && message.cards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-3">
            {message.cards.map((card) => (
              <div
                key={card.id}
                className="p-3.5 rounded-xl border bg-card text-card-foreground shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        card.badgeColor === "emerald"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : card.badgeColor === "amber"
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      }`}
                    >
                      {card.badge || card.type}
                    </span>
                    <span className="font-bold text-sm text-foreground">
                      {card.scoreOrValue}
                    </span>
                  </div>

                  <h5 className="font-bold text-xs text-foreground line-clamp-1">
                    {card.title}
                  </h5>
                  {card.subtitle && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                      {card.subtitle}
                    </p>
                  )}

                  {card.metrics && (
                    <div className="mt-2.5 pt-2 border-t border-border/40 space-y-1 text-[11px]">
                      {card.metrics.map((m, i) => (
                        <div key={i} className="flex justify-between text-muted-foreground">
                          <span>{m.label}:</span>
                          <span className="font-semibold text-foreground">{m.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {card.linkUrl && (
                  <Link
                    href={card.linkUrl}
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                  >
                    <span>View Record</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Inline Data Table */}
        {message.dataTable && (
          <div className="rounded-xl border bg-card overflow-hidden my-3 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50 text-[11px] font-bold uppercase text-muted-foreground">
                    {message.dataTable.headers.map((h, i) => (
                      <th key={i} className="py-2.5 px-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {message.dataTable.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-muted/20">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2 px-3 font-medium text-foreground">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Proposals */}
        {message.actionProposals && message.actionProposals.length > 0 && (
          <div className="space-y-2">
            {message.actionProposals.map((prop) => (
              <AIActionApproval
                key={prop.id}
                proposal={prop}
                executionContext={executionContext}
                onStatusChange={() => onActionStatusChange?.()}
              />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-[10px] text-muted-foreground pt-1">
          {new Date(message.timestamp).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};
