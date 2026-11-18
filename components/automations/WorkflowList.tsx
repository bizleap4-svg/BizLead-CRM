"use client";

import React, { useState, useMemo } from "react";
import { Workflow, WorkflowStatus } from "../crm/types";
import {
  Play,
  Pause,
  Edit2,
  Copy,
  Trash2,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Zap,
  LayoutGrid,
  List,
  Sparkles,
} from "lucide-react";

interface WorkflowListProps {
  workflows: Workflow[];
  onSelectWorkflow: (workflow: Workflow) => void;
  onToggleStatus: (workflowId: string) => void;
  onDuplicate: (workflowId: string) => void;
  onDelete: (workflowId: string) => void;
  onDryRun: (workflow: Workflow) => void;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({
  workflows,
  onSelectWorkflow,
  onToggleStatus,
  onDuplicate,
  onDelete,
  onDryRun,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredWorkflows = useMemo(() => {
    return workflows.filter((w) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = w.name.toLowerCase().includes(q);
        const matchesDesc = (w.description || "").toLowerCase().includes(q);
        const matchesTrigger = w.triggerType.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesTrigger) return false;
      }
      if (statusFilter !== "all" && w.status !== statusFilter) return false;
      if (categoryFilter !== "all" && w.category !== categoryFilter) return false;
      return true;
    });
  }, [workflows, searchQuery, statusFilter, categoryFilter]);

  const getStatusBadge = (status: WorkflowStatus) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "inactive":
        return "bg-muted text-muted-foreground border-border";
      case "draft":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflows, triggers, actions..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border bg-background text-foreground text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Drafts</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border bg-background text-foreground text-xs"
          >
            <option value="all">All Categories</option>
            <option value="lead_routing">Lead Routing</option>
            <option value="sales">Sales & Pipeline</option>
            <option value="follow_up">Follow-ups</option>
            <option value="operations">Operations & SLAs</option>
            <option value="marketing">Marketing Quality</option>
          </select>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-muted border text-xs self-end sm:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "table"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredWorkflows.length === 0 ? (
        <div className="p-12 text-center border rounded-2xl bg-card border-dashed space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-foreground text-base">No Workflows Found</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
              ? "No workflows match your active filter criteria."
              : "No active or draft automation workflows configured yet. Get started by selecting a prebuilt blueprint from the template library."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredWorkflows.map((wf) => (
            <div
              key={wf.id}
              className="rounded-xl border bg-card text-card-foreground p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Trigger Pill + Status Switch */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                    <Zap className="w-3 h-3" />
                    <span>{wf.triggerType.replace(/_/g, " ")}</span>
                  </span>

                  <button
                    onClick={() => onToggleStatus(wf.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${getStatusBadge(
                      wf.status
                    )}`}
                    title="Toggle Active / Inactive"
                  >
                    {wf.status === "active" ? (
                      <Play className="w-3 h-3 fill-emerald-500" />
                    ) : (
                      <Pause className="w-3 h-3" />
                    )}
                    <span className="capitalize">{wf.status}</span>
                  </button>
                </div>

                {/* Workflow Title */}
                <h3
                  onClick={() => onSelectWorkflow(wf)}
                  className="font-semibold text-foreground text-base tracking-tight hover:text-primary transition-colors cursor-pointer line-clamp-1"
                >
                  {wf.name}
                </h3>

                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {wf.description}
                </p>

                {/* Micro Stats Grid */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/40 text-center my-4 text-xs">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Steps</div>
                    <div className="font-semibold text-foreground mt-0.5">
                      {wf.nodes.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Runs</div>
                    <div className="font-semibold text-foreground mt-0.5">
                      {wf.executionCount || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Success</div>
                    <div className="font-semibold text-emerald-500 mt-0.5">
                      {wf.executionCount > 0
                        ? `${Math.round(((wf.successCount || 0) / wf.executionCount) * 100)}%`
                        : "100%"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDryRun(wf)}
                    title="Test Run (Dry Run)"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-muted"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDuplicate(wf.id)}
                    title="Duplicate Workflow"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(wf.id)}
                    title="Delete Workflow"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-muted"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => onSelectWorkflow(wf)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4">Workflow Name</th>
                  <th className="py-3 px-3">Trigger Event</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Nodes</th>
                  <th className="py-3 px-3 text-right">Executions</th>
                  <th className="py-3 px-3 text-right">Success Rate</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredWorkflows.map((wf) => (
                  <tr key={wf.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div
                        onClick={() => onSelectWorkflow(wf)}
                        className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {wf.name}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {wf.description}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono">
                        <Zap className="w-3 h-3 text-primary" />
                        {wf.triggerType}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => onToggleStatus(wf.id)}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                          wf.status
                        )}`}
                      >
                        {wf.status}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                      {wf.nodes.length}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-foreground">
                      {wf.executionCount || 0}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-emerald-500">
                      {wf.executionCount > 0
                        ? `${Math.round(((wf.successCount || 0) / wf.executionCount) * 100)}%`
                        : "100%"}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onDryRun(wf)}
                          title="Dry Run"
                          className="p-1 rounded text-muted-foreground hover:text-emerald-500"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDuplicate(wf.id)}
                          title="Duplicate"
                          className="p-1 rounded text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectWorkflow(wf)}
                          title="Configure"
                          className="p-1 rounded text-muted-foreground hover:text-primary"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
