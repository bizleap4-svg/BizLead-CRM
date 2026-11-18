"use client";

import React, { useState } from "react";
import { useCRM } from "../../../components/crm/CRMProvider";
import { Workflow, WorkflowExecution } from "../../../components/crm/types";
import { AutomationMetrics } from "../../../components/automations/AutomationMetrics";
import { WorkflowList } from "../../../components/automations/WorkflowList";
import { WorkflowBuilder } from "../../../components/automations/WorkflowBuilder";
import { ExecutionHistoryModal } from "../../../components/automations/ExecutionHistoryModal";
import { TemplateGalleryModal } from "../../../components/automations/TemplateGalleryModal";
import { DryRunModal } from "../../../components/automations/DryRunModal";
import { WorkflowEngine, DryRunResult } from "../../../components/automations/WorkflowEngine";
import {
  Plus,
  Sparkles,
  History,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function AutomationsPage() {
  const {
    workflows,
    executions,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
    toggleWorkflowStatus,
    emergencyPauseAllWorkflows,
  } = useCRM();

  // Active builder workflow state
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isDryRunOpen, setIsDryRunOpen] = useState(false);
  const [activeDryRunResult, setActiveDryRunResult] = useState<DryRunResult | null>(null);

  // Handle Create New Workflow
  const handleCreateNew = async () => {
    const newWf = await createWorkflow({
      name: "Untitled CRM Workflow",
      description: "Triggered on CRM milestone to execute automated actions.",
      status: "draft",
      version: 1,
      triggerType: "lead_created",
      triggerConfig: {},
      nodes: [
        {
          id: `node-trig-${Date.now()}`,
          type: "trigger",
          title: "New Lead Ingested",
          position: { x: 300, y: 60 },
          data: { triggerType: "lead_created" },
        },
        {
          id: `node-act-${Date.now()}`,
          type: "action",
          title: "Create Initial Outreach Task",
          position: { x: 300, y: 200 },
          data: {
            actionType: "create_task",
            actionConfig: {
              title: "Initial Outreach Call",
              priority: "high",
              dueDays: 1,
            },
          },
        },
      ],
      edges: [
        {
          id: `e-${Date.now()}`,
          source: `node-trig-${Date.now()}`,
          target: `node-act-${Date.now()}`,
        },
      ],
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
    });

    setEditingWorkflow(newWf);
  };

  // Handle Using a Template
  const handleUseTemplate = async (template: Workflow) => {
    const clonedWf = await createWorkflow({
      ...template,
      name: `${template.name} (Draft)`,
      status: "draft",
      isTemplate: false,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      lastExecutedAt: undefined,
    });
    setEditingWorkflow(clonedWf);
  };

  // Handle Dry Run from list
  const handleDryRunFromList = (wf: Workflow) => {
    const sampleEvent = {
      id: `evt-sample-${Date.now()}`,
      eventType: wf.triggerType,
      entityId: "lead-001",
      entityType: "lead" as const,
      payload: {
        id: "lead-001",
        name: "Vikram Malhotra",
        company: "Paytm Payments",
        score: 85,
        source: "Google Ads",
        value: 250000,
        stage: "proposal",
        priority: "high",
        tags: ["enterprise", "fintech"],
      },
      timestamp: new Date().toISOString(),
    };

    const res = WorkflowEngine.dryRun(wf, sampleEvent);
    setActiveDryRunResult(res);
    setIsDryRunOpen(true);
  };

  // If in builder mode, display the visual canvas editor
  if (editingWorkflow) {
    return (
      <WorkflowBuilder
        workflow={editingWorkflow}
        onSave={async (savedWf) => {
          await updateWorkflow(savedWf.id, savedWf);
          setEditingWorkflow(null);
        }}
        onBack={() => setEditingWorkflow(null)}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Workflows that work for you.
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Automation Studio
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Build once. Automate intelligently. Event-driven CRM orchestration with deterministic visual logic.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-card text-foreground hover:bg-muted text-xs font-semibold transition-colors shadow-xs"
          >
            <History className="w-3.5 h-3.5 text-primary" />
            <span>Execution Logs</span>
          </button>

          <button
            onClick={() => setIsTemplatesOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-card text-foreground hover:bg-muted text-xs font-semibold transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Template Library</span>
          </button>

          <button
            onClick={handleCreateNew}
            id="btn-new-workflow"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Workflow</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <AutomationMetrics
        workflows={workflows}
        executions={executions}
        onEmergencyPauseAll={emergencyPauseAllWorkflows}
      />

      {/* Workflows List */}
      <WorkflowList
        workflows={workflows}
        onSelectWorkflow={(wf) => setEditingWorkflow(wf)}
        onToggleStatus={toggleWorkflowStatus}
        onDuplicate={duplicateWorkflow}
        onDelete={deleteWorkflow}
        onDryRun={handleDryRunFromList}
      />

      {/* Modals */}
      <ExecutionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        executions={executions}
      />

      <TemplateGalleryModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onUseTemplate={handleUseTemplate}
      />

      <DryRunModal
        isOpen={isDryRunOpen}
        onClose={() => setIsDryRunOpen(false)}
        result={activeDryRunResult}
      />
    </div>
  );
}
