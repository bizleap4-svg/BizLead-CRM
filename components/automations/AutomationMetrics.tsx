"use client";

import React from "react";
import { Workflow, WorkflowExecution } from "../crm/types";
import { Zap, Play, CheckCircle2, Activity, PauseCircle, ShieldAlert } from "lucide-react";

interface AutomationMetricsProps {
  workflows: Workflow[];
  executions: WorkflowExecution[];
  onEmergencyPauseAll: () => void;
}

export const AutomationMetrics: React.FC<AutomationMetricsProps> = ({
  workflows,
  executions,
  onEmergencyPauseAll,
}) => {
  const activeWorkflowsCount = workflows.filter((w) => w.status === "active").length;
  const totalExecutionsCount = workflows.reduce((sum, w) => sum + (w.executionCount || 0), 0) + executions.length;
  const totalSuccesses = workflows.reduce((sum, w) => sum + (w.successCount || 0), 0);
  const successRate = totalExecutionsCount > 0 ? Math.round((totalSuccesses / Math.max(1, totalExecutionsCount)) * 100) : 100;
  
  // Total actions executed
  const completedActions = workflows.reduce((sum, w) => {
    const actionNodes = w.nodes.filter((n) => n.type === "action").length;
    return sum + (w.successCount || 0) * Math.max(1, actionNodes);
  }, 0);

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Active Workflows */}
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Workflows</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Play className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {activeWorkflowsCount}
            <span className="text-xs font-normal text-muted-foreground ml-1.5">
              of {workflows.length} total
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Running locally on CRM events
          </div>
        </div>

        {/* 2. Total Executions */}
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Executions</span>
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {totalExecutionsCount.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Graph traversal runs
          </div>
        </div>

        {/* 3. Success Rate */}
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Success Rate</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-500">
            {successRate}%
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Zero unhandled run errors
          </div>
        </div>

        {/* 4. Automated Actions Completed */}
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Actions Completed</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {completedActions.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Tasks, tags, notes & owners
          </div>
        </div>
      </div>

      {/* Emergency Pause Bar if any active */}
      {activeWorkflowsCount > 0 && (
        <div className="p-3 rounded-lg border border-border bg-muted/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>
              <strong>Safe Local Execution:</strong> {activeWorkflowsCount} workflows listening for CRM events. Local delays execute when the workspace is open.
            </span>
          </div>
          <button
            onClick={onEmergencyPauseAll}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-medium transition-colors"
          >
            <PauseCircle className="w-3.5 h-3.5" />
            <span>Pause All Workflows</span>
          </button>
        </div>
      )}
    </div>
  );
};
