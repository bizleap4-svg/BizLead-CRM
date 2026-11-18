"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Clock,
  X,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useCRM } from "../crm/CRMProvider";
import { SmartRecommendation } from "../crm/types";

export function FollowUpIntelligence() {
  const {
    recommendations,
    dismissRecommendation,
    snoozeRecommendation,
    openTaskDrawer,
  } = useCRM();

  const [expanded, setExpanded] = useState(true);

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const handleCreateTask = (rec: SmartRecommendation) => {
    openTaskDrawer(undefined, {
      title: rec.suggestedAction,
      taskType: rec.taskType,
      priority: rec.priority,
      dueDate: rec.suggestedDueDate,
      dueTime: "10:00",
      entityType: rec.entityType === "meeting" ? "deal" : (rec.entityType as any),
      entityId: rec.entityId,
      entityName: rec.entityName,
      description: `Auto-generated follow-up recommendation: ${rec.reason}`,
    });
  };

  return (
    <div className="bl-recommendations-banner">
      <div className="bl-rec-header bl-between">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="bl-rec-icon-badge">
            <Sparkles size={16} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <strong style={{ fontSize: "14px" }}>
                Smart Follow-up Intelligence
              </strong>
              <span className="bl-rule-badge">Rule-Based Engine</span>
              <span className="bl-rec-count-pill">{recommendations.length} actionable</span>
            </div>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              Algorithmic recommendations to prevent pipeline leakage and deal decay
            </span>
          </div>
        </div>

        <button
          type="button"
          className="bl-icon"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Collapse recommendations" : "Expand recommendations"}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="bl-rec-grid">
          {recommendations.slice(0, 4).map((rec) => (
            <div key={rec.id} className="bl-rec-card">
              <div className="bl-rec-card-top bl-between">
                <span className={`bl-rec-priority-chip ${rec.priority}`}>
                  {rec.priority.toUpperCase()}
                </span>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    type="button"
                    className="bl-rec-action-btn snooze"
                    onClick={() => snoozeRecommendation(rec.id, 2)}
                    title="Snooze for 2 days"
                  >
                    <Clock size={12} />
                    <span>Snooze</span>
                  </button>
                  <button
                    type="button"
                    className="bl-rec-action-btn dismiss"
                    onClick={() => dismissRecommendation(rec.id)}
                    title="Dismiss recommendation"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              <div className="bl-rec-reason">
                <AlertCircle size={13} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{rec.reason}</span>
              </div>

              <div className="bl-rec-action-row">
                <div>
                  <strong className="bl-rec-suggested-title">
                    {rec.suggestedAction}
                  </strong>
                  <div className="bl-rec-target-chip">
                    <span>{rec.entityType.toUpperCase()}: </span>
                    <strong>{rec.entityName}</strong>
                  </div>
                </div>
              </div>

              <div className="bl-rec-card-footer bl-between">
                <span className="bl-rec-due">Due by: {rec.suggestedDueDate}</span>
                <button
                  type="button"
                  className="bl-accent bl-btn-xs bl-rec-btn"
                  onClick={() => handleCreateTask(rec)}
                >
                  <span>Create Task</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
