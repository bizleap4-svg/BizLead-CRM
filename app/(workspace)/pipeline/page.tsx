"use client";

import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useCRM } from "@/components/crm/CRMProvider";
import { PIPELINE_OWNERS, PIPELINE_SOURCES, Lead } from "@/components/crm/types";
import { useControlCenter } from "@/components/settings/ControlCenterContext";
import { PipelineMetrics } from "@/components/pipeline/PipelineMetrics";
import {
  PipelineFilters,
  FilterState,
} from "@/components/pipeline/PipelineFilters";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { PipelineTable } from "@/components/pipeline/PipelineTable";
import { DealDrawer } from "@/components/pipeline/DealDrawer";

export default function PipelinePage() {
  const {
    leads,
    stages,
    selectedDeal,
    createLead,
    updateLead,
    moveLead,
    openDealDrawer,
    closeDealDrawer,
  } = useCRM();
  const { canCreate, canEdit } = useControlCenter();

  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDealId, setActiveDealId] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    stage: "all",
    owner: "all",
    source: "all",
    priority: "all",
    sortBy: "value-desc",
  });

  // Filter & Sort pipeline deals
  const filteredDeals = useMemo(() => {
    return leads
      .filter((deal) => {
        // Search
        const searchMatches =
          !filters.search ||
          `${deal.company} ${deal.name} ${deal.notes || ""} ${deal.source}`
            .toLowerCase()
            .includes(filters.search.toLowerCase());

        // Stage
        const stageMatches =
          filters.stage === "all" ||
          deal.stage.toLowerCase() === filters.stage.toLowerCase();

        // Owner
        const ownerMatches =
          filters.owner === "all" || deal.owner === filters.owner;

        // Source
        const sourceMatches =
          filters.source === "all" || deal.source === filters.source;

        // Priority
        const priorityMatches =
          filters.priority === "all" || deal.priority === filters.priority;

        return (
          searchMatches &&
          stageMatches &&
          ownerMatches &&
          sourceMatches &&
          priorityMatches
        );
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "value-desc":
            return (b.value || 0) - (a.value || 0);
          case "value-asc":
            return (a.value || 0) - (b.value || 0);
          case "date-asc":
            return (a.expectedCloseDate || "").localeCompare(
              b.expectedCloseDate || ""
            );
          case "date-desc":
            return (b.expectedCloseDate || "").localeCompare(
              a.expectedCloseDate || ""
            );
          case "score-desc":
            return (b.score || 0) - (a.score || 0);
          default:
            return 0;
        }
      });
  }, [leads, filters]);

  const handleOpenDrawer = (id: string) => {
    setActiveDealId(id);
    setDrawerOpen(true);
  };

  const handleOpenCreateModal = (defaultStage?: string) => {
    setActiveDealId(null);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setActiveDealId(null);
  };

  const handleExportCSV = () => {
    function escapeCSV(val: unknown) {
      let str = String(val ?? "");
      // Formula injection defense
      if (/^\s*[=+\-@]/.test(str)) {
        str = "'" + str;
      }
      return `"${str.replaceAll('"', '""')}"`;
    }

    const headers = [
      "Company",
      "Contact",
      "Stage",
      "Value (INR)",
      "Win Probability (%)",
      "Expected Close Date",
      "Priority",
      "Lead Source",
      "Assigned Owner",
      "Next Action",
    ];

    const rows = filteredDeals.map((d) => [
      d.company,
      d.name,
      d.stage,
      d.value,
      d.probability,
      d.expectedCloseDate,
      d.priority,
      d.source,
      d.owner,
      d.nextFollowUp,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bizlead-pipeline-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentDeal =
    leads.find((l) => l.id === activeDealId) || null;

  return (
    <div className="bl-pipeline-studio">
      {/* Page Heading */}
      <section className="bl-page-heading">
        <div>
          <div className="bl-eyebrow">REVENUE OS / PIPELINE STUDIO</div>
          <h1>Make every deal count.</h1>
          <p>Turn conversations into opportunities.</p>
        </div>

        {canCreate("pipeline") && (
          <button
            type="button"
            className="bl-primary"
            onClick={() => handleOpenCreateModal()}
          >
            <Plus size={18} /> Add Deal
          </button>
        )}
      </section>

      {/* Revenue Intelligence Panel */}
      <PipelineMetrics />

      {/* Filters & View Toolbar */}
      <PipelineFilters
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        filters={filters}
        onChangeFilters={setFilters}
        stages={stages}
        owners={PIPELINE_OWNERS}
        sources={PIPELINE_SOURCES}
        onOpenCreateModal={() => handleOpenCreateModal()}
        onExportCSV={handleExportCSV}
        filteredCount={filteredDeals.length}
        totalCount={leads.length}
      />

      {/* Board or Table view */}
      {viewMode === "kanban" ? (
        <PipelineBoard
          stages={stages}
          deals={filteredDeals}
          onOpenDrawer={handleOpenDrawer}
          onMoveStage={moveLead}
          onQuickAddDeal={(stageId) => handleOpenCreateModal(stageId)}
        />
      ) : (
        <PipelineTable
          deals={filteredDeals}
          stages={stages}
          onOpenDrawer={handleOpenDrawer}
          onMoveStage={moveLead}
        />
      )}

      {/* Deal Detail Drawer */}
      <DealDrawer
        deal={currentDeal}
        stages={stages}
        owners={PIPELINE_OWNERS}
        sources={PIPELINE_SOURCES}
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        onSave={async (id, updates) => {
          await updateLead(id, updates);
        }}
        onCreateNew={async (data) => {
          await createLead(data);
        }}
      />
    </div>
  );
}
