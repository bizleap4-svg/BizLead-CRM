"use client";

import React from "react";
import {
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  Flame,
  User,
  Tag,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Lead, PipelineStage } from "@/components/crm/types";
import { formatINR } from "@/components/crm/selectors";

interface DealCardProps {
  deal: Lead;
  stages: PipelineStage[];
  onOpenDrawer: (id: string) => void;
  onMoveStage: (id: string, stageId: string) => void;
  isDragging?: boolean;
}

export function DealCard({
  deal,
  stages,
  onOpenDrawer,
  onMoveStage,
}: DealCardProps) {
  const currentStageIndex = stages.findIndex(
    (s) => s.id.toLowerCase() === deal.stage.toLowerCase()
  );

  const prevStage = currentStageIndex > 0 ? stages[currentStageIndex - 1] : null;
  const nextStage =
    currentStageIndex < stages.length - 1 ? stages[currentStageIndex + 1] : null;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", deal.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const priorityColor =
    deal.priority === "high"
      ? "var(--color-danger)"
      : deal.priority === "medium"
      ? "var(--color-warning)"
      : "var(--muted)";

  return (
    <article
      className="bl-deal-card"
      draggable
      onDragStart={handleDragStart}
      onClick={() => onOpenDrawer(deal.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDrawer(deal.id);
        }
      }}
      aria-label={`Deal: ${deal.company}, Value: ${formatINR(deal.value)}`}
    >
      {/* Top Header: Company & Value */}
      <div className="bl-deal-header">
        <div className="bl-deal-company-group">
          <div className="bl-deal-avatar">
            {deal.company.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h4 className="bl-deal-title">{deal.company}</h4>
            <span className="bl-deal-contact">{deal.name}</span>
          </div>
        </div>
        <div className="bl-deal-amount">{formatINR(deal.value)}</div>
      </div>

      {/* Probability & Forecast Badge */}
      <div className="bl-deal-meta-row">
        <span
          className="bl-deal-prob-pill"
          title={`Probability: ${deal.probability}%. Weighted: ${formatINR(
            deal.value * (deal.probability / 100)
          )}`}
        >
          {deal.probability}% win prob
        </span>

        <span className="bl-deal-score">
          {deal.score >= 80 && <Flame size={12} style={{ color: "var(--color-warning)" }} />}
          Score {deal.score}
        </span>

        {deal.priority === "high" && (
          <span
            className="bl-deal-priority-pill"
            style={{ color: priorityColor, borderColor: priorityColor }}
          >
            High Priority
          </span>
        )}
      </div>

      {/* Timing Info */}
      <div className="bl-deal-dates">
        {deal.expectedCloseDate && (
          <span className="bl-deal-date" title="Expected close date">
            <Calendar size={12} /> {deal.expectedCloseDate}
          </span>
        )}
        {deal.nextFollowUp && (
          <span className="bl-deal-followup" title="Next follow-up action">
            <Clock size={12} /> {deal.nextFollowUp}
          </span>
        )}
      </div>

      {/* Card Footer: Owner & Quick Move actions */}
      <div className="bl-deal-footer" onClick={(e) => e.stopPropagation()}>
        <span className="bl-deal-owner">
          <User size={12} /> {deal.owner || "Unassigned"}
        </span>

        {/* Keyboard / Click Stage Advance alternative */}
        <div className="bl-deal-actions">
          {prevStage && (
            <button
              type="button"
              className="bl-deal-move-btn"
              title={`Move back to ${prevStage.name}`}
              onClick={() => onMoveStage(deal.id, prevStage.id)}
            >
              <ArrowLeft size={11} />
            </button>
          )}

          {nextStage && (
            <button
              type="button"
              className="bl-deal-move-btn bl-deal-move-next"
              title={`Advance to ${nextStage.name}`}
              onClick={() => onMoveStage(deal.id, nextStage.id)}
            >
              <span>{nextStage.name.slice(0, 4)}</span>
              <ArrowRight size={11} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default DealCard;
