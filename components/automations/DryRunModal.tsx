"use client";

import React from "react";
import { DryRunResult } from "./WorkflowEngine";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Zap,
  Play,
  Sparkles,
  Info,
} from "lucide-react";

interface DryRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DryRunResult | null;
  onActivateWorkflow?: () => void;
}

export const DryRunModal: React.FC<DryRunModalProps> = ({
  isOpen,
  onClose,
  result,
  onActivateWorkflow,
}) => {
  if (!isOpen || !result) return null;

  return (
    <div
      className="fixed inset-0 overflow-hidden backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: "var(--z-modal)", backgroundColor: "var(--color-overlay)" }}
    >
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground text-lg">Workflow Test Run (Dry Run)</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                Zero Mutation Simulation
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Simulating: <span className="font-semibold text-foreground">{result.workflowName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Disclaimer */}
        <div className="p-3.5 rounded-lg border border-primary/20 bg-primary/5 text-xs text-foreground flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span className="text-muted-foreground leading-relaxed">
            <strong>Dry Run Mode:</strong> Evaluates condition branches and generates proposed action logs without modifying actual CRM contacts, deals, tasks, or pipeline states.
          </span>
        </div>

        {/* 1. Trigger Status */}
        <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span>Trigger Evaluation</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                result.matchedTrigger
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-rose-500/10 text-rose-500"
              }`}
            >
              {result.matchedTrigger ? "Matched Event" : "No Match"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {result.matchedTrigger
              ? "Inbound CRM event matches workflow trigger definition. Graph execution proceeded."
              : "Event payload does not fulfill the trigger requirements. Graph traversal halted."}
          </p>
        </div>

        {/* 2. Condition Decisions */}
        {result.conditionDecisions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Condition Decisions ({result.conditionDecisions.length})
            </h4>
            <div className="space-y-2">
              {result.conditionDecisions.map((cond) => (
                <div
                  key={cond.nodeId}
                  className="p-3 rounded-lg border bg-background/60 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{cond.nodeTitle}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        cond.passed
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      Branch: {cond.branchTaken}
                    </span>
                  </div>
                  <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                    {cond.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Proposed Actions */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Proposed Actions ({result.proposedActions.length})
          </h4>
          {result.proposedActions.length === 0 ? (
            <div className="p-4 text-center rounded-lg border bg-muted/20 text-xs text-muted-foreground">
              No actions proposed (conditions routed to terminal or empty branch).
            </div>
          ) : (
            <div className="space-y-2">
              {result.proposedActions.map((act, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20 text-xs flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold text-foreground flex items-center justify-between">
                      <span>{act.nodeTitle}</span>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">
                        {act.actionType}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{act.description}</p>
                    <div className="text-[11px] font-mono text-primary bg-background/50 p-1.5 rounded-md border border-border/40">
                      Target: {act.targetEntity.type} ID {act.targetEntity.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Traversed {result.traversedPath.length} graph node(s) successfully.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
            {onActivateWorkflow && (
              <button
                onClick={() => {
                  onActivateWorkflow();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Activate Workflow</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
