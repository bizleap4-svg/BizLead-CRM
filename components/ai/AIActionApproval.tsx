"use client";

import React, { useState } from "react";
import { AIActionProposal } from "./types";
import { ActionExecutor, ExecutionContext } from "./ActionExecutor";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Play,
  ArrowRight,
  Clock,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface AIActionApprovalProps {
  proposal: AIActionProposal;
  executionContext: ExecutionContext;
  onStatusChange?: (updatedProposal: AIActionProposal) => void;
}

export const AIActionApproval: React.FC<AIActionApprovalProps> = ({
  proposal: initialProposal,
  executionContext,
  onStatusChange,
}) => {
  const [proposal, setProposal] = useState<AIActionProposal>(initialProposal);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleApprove = async () => {
    if (proposal.status === "executed" || isProcessing) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const executed = await ActionExecutor.executeAction(proposal, executionContext);
      setProposal(executed);
      onStatusChange?.(executed);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to execute action");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = () => {
    if (proposal.status === "executed") return;
    const rejected: AIActionProposal = {
      ...proposal,
      status: "rejected",
    };
    setProposal(rejected);
    onStatusChange?.(rejected);
  };

  return (
    <div
      className={`rounded-xl border p-4 my-3 text-xs transition-all ${
        proposal.status === "executed"
          ? "border-emerald-500/30 bg-emerald-500/5 shadow-xs"
          : proposal.status === "rejected"
          ? "border-muted bg-muted/20 opacity-70"
          : "border-primary/30 bg-primary/5 shadow-sm"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg ${
              proposal.status === "executed"
                ? "bg-emerald-500/10 text-emerald-500"
                : proposal.status === "rejected"
                ? "bg-muted text-muted-foreground"
                : "bg-primary/10 text-primary"
            }`}
          >
            {proposal.status === "executed" ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : proposal.status === "rejected" ? (
              <XCircle className="w-3.5 h-3.5" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-foreground text-xs leading-none">
              {proposal.title}
            </h4>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              Proposed CRM Action
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            proposal.status === "executed"
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              : proposal.status === "rejected"
              ? "bg-muted text-muted-foreground border border-border"
              : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
          }`}
        >
          {proposal.status === "executed"
            ? "Approved & Executed"
            : proposal.status === "rejected"
            ? "Rejected"
            : "Requires Approval"}
        </span>
      </div>

      {/* Description */}
      <p className="mt-2.5 text-muted-foreground leading-relaxed">
        {proposal.description}
      </p>

      {/* Diff Preview / Parameters */}
      {proposal.diffPreview && proposal.diffPreview.length > 0 && (
        <div className="mt-3 p-2.5 rounded-lg bg-background/60 border border-border/40 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Proposed CRM Modifications:
          </div>
          {proposal.diffPreview.map((diff, idx) => (
            <div key={idx} className="flex items-center justify-between text-[11px]">
              <span className="text-foreground font-medium">{diff.field}:</span>
              <span className="text-emerald-500 font-semibold">{diff.newValue}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error alert if any */}
      {errorMsg && (
        <div className="mt-2 text-rose-500 text-[11px] font-semibold flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-3 pt-2.5 border-t border-border/30 flex items-center justify-between">
        {proposal.status === "executed" ? (
          <div className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              Executed at {new Date(proposal.executedAt || Date.now()).toLocaleTimeString("en-IN")}
            </span>
          </div>
        ) : proposal.status === "rejected" ? (
          <span className="text-[11px] text-muted-foreground italic">
            Action rejected. CRM records were left untouched.
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground">
            No mutation executes without your explicit confirmation.
          </span>
        )}

        {proposal.status === "pending" && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg border text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors"
            >
              Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              id="btn-approve-action"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isProcessing ? "Executing..." : "Approve & Execute"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
