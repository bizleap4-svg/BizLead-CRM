"use client";

import React, { useState } from "react";
import { WorkflowExecution } from "../crm/types";
import { X, CheckCircle2, AlertCircle, Clock, Eye, Layers } from "lucide-react";

interface ExecutionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  executions: WorkflowExecution[];
}

export const ExecutionHistoryModal: React.FC<ExecutionHistoryModalProps> = ({
  isOpen,
  onClose,
  executions,
}) => {
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(
    executions[0] || null
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 overflow-hidden backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: "var(--z-modal)", backgroundColor: "var(--color-overlay)" }}
    >
      <div className="w-full max-w-4xl bg-card border border-border rounded-xl shadow-2xl p-6 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-bold text-foreground text-lg">Automation Execution Audit Log</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Historical record of triggered workflows, evaluated paths, and executed actions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Two columns (List on Left, Detail on Right) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {/* Execution List */}
          <div className="border rounded-xl overflow-y-auto divide-y divide-border">
            {executions.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No automation executions recorded yet.
              </div>
            ) : (
              executions.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => setSelectedExecution(ex)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    selectedExecution?.id === ex.id
                      ? "bg-primary/10 border-l-2 border-primary"
                      : "hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-foreground line-clamp-1">
                      {ex.workflowName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ex.status === "success"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : ex.status === "dry_run"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-rose-500/10 text-rose-500"
                      }`}
                    >
                      {ex.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Trigger: {ex.triggerEvent.eventType}</span>
                    <span>
                      {new Date(ex.startedAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Execution Detail */}
          <div className="border rounded-xl p-4 overflow-y-auto bg-muted/10 space-y-4">
            {selectedExecution ? (
              <>
                <div className="border-b pb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-foreground">
                      {selectedExecution.workflowName}
                    </h4>
                    <span className="text-xs text-muted-foreground">v{selectedExecution.workflowVersion}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Execution ID: <span className="font-mono text-[11px]">{selectedExecution.id}</span>
                  </div>
                </div>

                {/* Event Payload */}
                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Trigger Event Payload
                  </h5>
                  <div className="p-2.5 rounded-lg bg-background border font-mono text-[11px] text-foreground space-y-1">
                    <div>Type: {selectedExecution.triggerEvent.eventType}</div>
                    <div>Entity: {selectedExecution.triggerEvent.entityType} ({selectedExecution.triggerEvent.entityId})</div>
                    <div>Timestamp: {selectedExecution.triggerEvent.timestamp}</div>
                  </div>
                </div>

                {/* Steps Log */}
                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Action Execution Steps ({selectedExecution.steps.length})
                  </h5>
                  <div className="space-y-2">
                    {selectedExecution.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border bg-background text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">{step.nodeTitle}</span>
                          <span className="text-[10px] font-mono uppercase text-muted-foreground">
                            {step.nodeType}
                          </span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{step.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Select an execution to view details.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
