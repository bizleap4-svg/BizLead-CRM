"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Lead, PipelineStage } from "@/components/crm/types";
import { formatLakhs } from "@/components/crm/selectors";
import { DealCard } from "./DealCard";

interface PipelineColumnProps {
  stage: PipelineStage;
  deals: Lead[];
  allStages: PipelineStage[];
  onOpenDrawer: (id: string) => void;
  onMoveStage: (id: string, stageId: string) => void;
  onQuickAddDeal?: (stageId: string) => void;
}

export function PipelineColumn({
  stage,
  deals,
  allStages,
  onOpenDrawer,
  onMoveStage,
  onQuickAddDeal,
}: PipelineColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const stageTotal = deals.reduce((sum, d) => sum + (d.value || 0), 0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dealId = e.dataTransfer.getData("text/plain");
    if (dealId) {
      onMoveStage(dealId, stage.id);
    }
  };

  const stageKindPill =
    stage.kind === "won" ? (
      <span className="bl-stage-kind-won">Won</span>
    ) : stage.kind === "lost" ? (
      <span className="bl-stage-kind-lost">Lost</span>
    ) : null;

  return (
    <section
      className={`bl-kanban-column ${isDragOver ? "drag-over" : ""} ${
        collapsed ? "collapsed" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label={`${stage.name} Stage with ${deals.length} deals`}
    >
      {/* Column Header */}
      <div className="bl-column-header">
        <div className="bl-column-title-row">
          <button
            type="button"
            className="bl-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand column" : "Collapse column"}
            title={collapsed ? "Expand column" : "Collapse column"}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </button>

          <h3 className="bl-column-name">
            {stage.name}
            {stageKindPill}
          </h3>

          <span className="bl-column-count">{deals.length}</span>
        </div>

        {!collapsed && (
          <div className="bl-column-sub-row">
            <span className="bl-column-total">{formatLakhs(stageTotal)}</span>
            {onQuickAddDeal && (
              <button
                type="button"
                className="bl-col-add-btn"
                onClick={() => onQuickAddDeal(stage.id)}
                title={`Add opportunity to ${stage.name}`}
              >
                <Plus size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cards List or Empty State */}
      {!collapsed && (
        <div className="bl-cards-list">
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              stages={allStages}
              onOpenDrawer={onOpenDrawer}
              onMoveStage={onMoveStage}
            />
          ))}

          {deals.length === 0 && (
            <div className="bl-column-empty">
              <span>Drop deal here</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default PipelineColumn;
