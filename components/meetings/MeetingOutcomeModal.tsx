"use client";

import React, { useState } from "react";
import {
  X,
  FileCheck,
  Smile,
  Meh,
  Frown,
  Plus,
  Trash2,
  CheckSquare,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { CRMMeeting, MeetingOutcome } from "../crm/types";
import { useCRM } from "../crm/CRMProvider";

interface MeetingOutcomeModalProps {
  meeting: CRMMeeting;
  onClose: () => void;
}

export function MeetingOutcomeModal({
  meeting,
  onClose,
}: MeetingOutcomeModalProps) {
  const { completeMeeting, deals, stages } = useCRM();

  const linkedDeal = meeting.dealId
    ? deals.find((d) => d.id === meeting.dealId)
    : null;

  const [summary, setSummary] = useState(
    meeting.outcome?.summary || ""
  );
  const [sentiment, setSentiment] = useState<"positive" | "neutral" | "cautious">(
    meeting.outcome?.sentiment || "positive"
  );
  const [shouldAdvanceStage, setShouldAdvanceStage] = useState(false);
  const [dealStage, setDealStage] = useState(
    linkedDeal ? linkedDeal.stage : "proposal"
  );
  const [nextSteps, setNextSteps] = useState<string[]>(
    meeting.outcome?.nextSteps || ["Send revised proposal and commercial quote"]
  );
  const [newStepText, setNewStepText] = useState("");
  const [createFollowUpTasks, setCreateFollowUpTasks] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepText.trim()) return;
    setNextSteps([...nextSteps, newStepText.trim()]);
    setNewStepText("");
  };

  const handleRemoveStep = (idx: number) => {
    setNextSteps(nextSteps.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) {
      alert("Please provide a brief meeting summary.");
      return;
    }

    setSaving(true);
    try {
      const outcome: MeetingOutcome = {
        summary: summary.trim(),
        sentiment,
        nextSteps,
        updatedDealStage: linkedDeal && shouldAdvanceStage ? dealStage : undefined,
      };

      await completeMeeting(meeting.id, outcome, createFollowUpTasks ? nextSteps : []);
      onClose();
    } catch (err) {
      console.error("Complete meeting error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bl-modal-backdrop" onClick={onClose}>
      <div
        className="bl-modal bl-outcome-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="outcome-modal-title"
      >
        <div className="bl-modal-header bl-between">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="bl-icon-badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
              <FileCheck size={20} />
            </div>
            <div>
              <h3 id="outcome-modal-title" style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
                Log Meeting Outcome
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
                {meeting.title} · {meeting.date}
              </p>
            </div>
          </div>
          <button type="button" className="bl-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="bl-modal-body" style={{ padding: "16px 20px" }}>
          {/* Executive Summary */}
          <div className="bl-field-group">
            <label htmlFor="outcome-summary">
              Executive Summary <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              id="outcome-summary"
              rows={3}
              required
              placeholder="What was discussed? What objections were raised? What agreement was reached?..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="bl-textarea"
            />
          </div>

          {/* Sentiment Selection */}
          <div className="bl-field-group">
            <label>Client Sentiment & Deal Momentum</label>
            <div className="bl-sentiment-row">
              <button
                type="button"
                className={`bl-sentiment-btn positive ${sentiment === "positive" ? "active" : ""}`}
                onClick={() => setSentiment("positive")}
              >
                <Smile size={16} />
                <span>Positive / High Intent</span>
              </button>

              <button
                type="button"
                className={`bl-sentiment-btn neutral ${sentiment === "neutral" ? "active" : ""}`}
                onClick={() => setSentiment("neutral")}
              >
                <Meh size={16} />
                <span>Neutral / Exploring</span>
              </button>

              <button
                type="button"
                className={`bl-sentiment-btn cautious ${sentiment === "cautious" ? "active" : ""}`}
                onClick={() => setSentiment("cautious")}
              >
                <Frown size={16} />
                <span>Cautious / Objections</span>
              </button>
            </div>
          </div>

          {/* Deal Stage Advancement (if deal linked) */}
          {linkedDeal && (
            <div className="bl-field-group">
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "6px" }}>
                <input
                  type="checkbox"
                  checked={shouldAdvanceStage}
                  onChange={(e) => setShouldAdvanceStage(e.target.checked)}
                />
                <span>Explicitly advance pipeline stage for deal: <strong>{linkedDeal.title}</strong></span>
              </label>
              {shouldAdvanceStage && (
                <select
                  id="outcome-deal-stage"
                  value={dealStage}
                  onChange={(e) => setDealStage(e.target.value)}
                  className="bl-select"
                >
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Actionable Next Steps */}
          <div className="bl-field-group">
            <div className="bl-between">
              <label>Agreed Next Steps & Action Items</label>
              <label style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={createFollowUpTasks}
                  onChange={(e) => setCreateFollowUpTasks(e.target.checked)}
                />
                <span>Auto-create follow-up tasks in Focus Center</span>
              </label>
            </div>

            <div className="bl-next-steps-list">
              {nextSteps.map((step, idx) => (
                <div key={idx} className="bl-next-step-item bl-between">
                  <span>• {step}</span>
                  <button
                    type="button"
                    className="bl-icon-xs"
                    onClick={() => handleRemoveStep(idx)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
              <input
                type="text"
                placeholder="Add next step..."
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddStep(e);
                  }
                }}
                className="bl-input bl-input-sm"
              />
              <button
                type="button"
                className="bl-secondary bl-btn-xs"
                onClick={handleAddStep}
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          <div className="bl-modal-footer bl-between" style={{ padding: "16px 0 0" }}>
            <button
              type="button"
              className="bl-secondary bl-btn-sm"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bl-accent bl-btn-sm bl-primary-btn"
              disabled={saving}
            >
              {saving ? "Saving..." : "Log Outcome & Complete Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
