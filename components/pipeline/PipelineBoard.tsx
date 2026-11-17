"use client";

import React from "react";
import { Lead, PipelineStage } from "@/components/crm/types";
import { PipelineColumn } from "./PipelineColumn";

interface PipelineBoardProps {
  stages: PipelineStage[];
  deals: Lead[];
  onOpenDrawer: (id: string) => void;
  onMoveStage: (id: string, stageId: string) => void;
  onQuickAddDeal?: (stageId: string) => void;
}

export function PipelineBoard({
  stages,
  deals,
  onOpenDrawer,
  onMoveStage,
  onQuickAddDeal,
}: PipelineBoardProps) {
  return (
    <div className="bl-pipeline-board-container">
      <div className="bl-pipeline-board">
        {stages.map((stage) => {
          const stageDeals = deals.filter(
            (d) => d.stage.toLowerCase() === stage.id.toLowerCase()
          );

          return (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              deals={stageDeals}
              allStages={stages}
              onOpenDrawer={onOpenDrawer}
              onMoveStage={onMoveStage}
              onQuickAddDeal={onQuickAddDeal}
            />
          );
        })}
      </div>
    </div>
  );
}

export default PipelineBoard;
