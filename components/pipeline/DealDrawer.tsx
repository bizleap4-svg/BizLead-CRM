"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  User,
  DollarSign,
  TrendingUp,
  Tag,
  Mail,
  Phone,
  Building2,
} from "lucide-react";
import { Lead, PipelineStage, DealPriority } from "@/components/crm/types";
import { formatINR } from "@/components/crm/selectors";

interface DealDrawerProps {
  deal: Lead | null;
  stages: PipelineStage[];
  owners: string[];
  sources: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Lead>) => Promise<void>;
  onCreateNew?: (leadData: Omit<Lead, "id" | "createdAt">) => Promise<void>;
}

export function DealDrawer({
  deal,
  stages,
  owners,
  sources,
  isOpen,
  onClose,
  onSave,
  onCreateNew,
}: DealDrawerProps) {
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "notes">(
    "overview"
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (deal) {
      setFormData({ ...deal });
    } else {
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        source: "Website",
        stage: "new",
        score: 70,
        owner: owners[0] || "",
        value: 50000,
        probability: 20,
        expectedCloseDate: new Date().toISOString().split("T")[0],
        priority: "medium" as DealPriority,
        nextFollowUp: "Tomorrow, 10:00 AM",
        notes: "",
        lostReason: "",
      });
    }
  }, [deal, owners]);

  if (!isOpen) return null;

  const isCreating = !deal;

  const handleChange = (field: keyof Lead, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.company?.trim()) return;

    setIsSaving(true);
    try {
      if (isCreating && onCreateNew) {
        await onCreateNew(formData as Omit<Lead, "id" | "createdAt">);
      } else if (deal) {
        await onSave(deal.id, formData);
      }
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickMarkWon = () => {
    handleChange("stage", "won");
    handleChange("probability", 100);
  };

  const handleQuickMarkLost = () => {
    handleChange("stage", "lost");
    handleChange("probability", 0);
  };

  const calculatedWeighted =
    ((formData.value || 0) * ((formData.probability || 0) / 100));

  return (
    <>
      {/* Backdrop */}
      <div
        className="bl-drawer-backdrop"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 80,
          animation: "fadeIn 200ms ease",
        }}
      />

      {/* Drawer Body */}
      <aside
        className="bl-drawer bl-deal-drawer"
        role="dialog"
        aria-label="Deal Details"
        style={{ zIndex: 90 }}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="bl-between" style={{ alignItems: "flex-start" }}>
            <div>
              <div className="bl-eyebrow">
                {isCreating ? "NEW OPPORTUNITY" : "DEAL OVERVIEW"}
              </div>
              <h2>{formData.company || (isCreating ? "New Deal" : "Untitled Opportunity")}</h2>
              <p>{formData.name ? `Contact: ${formData.name}` : "Turn deal into revenue"}</p>
            </div>

            <button
              type="button"
              className="bl-icon"
              onClick={onClose}
              aria-label="Close deal drawer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Win / Loss & Forecast strip */}
          <div className="bl-deal-drawer-strip">
            <div className="bl-strip-stat">
              <span className="bl-strip-label">Deal Value</span>
              <strong className="bl-strip-val">
                {formatINR(formData.value || 0)}
              </strong>
            </div>

            <div className="bl-strip-stat">
              <span className="bl-strip-label">Weighted Forecast</span>
              <strong className="bl-strip-val" style={{ color: "var(--accent)" }}>
                {formatINR(calculatedWeighted)}
              </strong>
            </div>

            <div className="bl-strip-actions">
              <button
                type="button"
                className={`bl-quick-stage-btn ${
                  formData.stage === "won" ? "active-won" : ""
                }`}
                onClick={handleQuickMarkWon}
                title="Mark Closed Won"
              >
                <CheckCircle2 size={13} /> Won
              </button>
              <button
                type="button"
                className={`bl-quick-stage-btn ${
                  formData.stage === "lost" ? "active-lost" : ""
                }`}
                onClick={handleQuickMarkLost}
                title="Mark Closed Lost"
              >
                <XCircle size={13} /> Lost
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bl-tabs" style={{ padding: "0 0 10px 0", margin: "18px 0 16px" }}>
            <button
              type="button"
              className={activeTab === "overview" ? "active" : ""}
              onClick={() => setActiveTab("overview")}
            >
              Deal Specs
            </button>
            <button
              type="button"
              className={activeTab === "timeline" ? "active" : ""}
              onClick={() => setActiveTab("timeline")}
            >
              Timeline & Activity
            </button>
            <button
              type="button"
              className={activeTab === "notes" ? "active" : ""}
              onClick={() => setActiveTab("notes")}
            >
              Notes
            </button>
          </div>

          {/* Tab 1: Deal Specs */}
          {activeTab === "overview" && (
            <div className="bl-form-grid">
              <label>
                Company / Organization *
                <input
                  required
                  value={formData.company || ""}
                  onChange={(e) => handleChange("company", e.target.value)}
                  placeholder="e.g. Layers Studio"
                />
              </label>

              <label>
                Contact Person *
                <input
                  required
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="aarav@layersstudio.design"
                />
              </label>

              <label>
                Phone Number
                <input
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+91 98201 44521"
                />
              </label>

              <label>
                Pipeline Stage
                <select
                  value={formData.stage || "new"}
                  onChange={(e) => handleChange("stage", e.target.value)}
                >
                  {stages.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} {st.kind === "won" ? "✓" : st.kind === "lost" ? "✗" : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Assigned Owner
                <select
                  value={formData.owner || ""}
                  onChange={(e) => handleChange("owner", e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {owners.map((ow) => (
                    <option key={ow} value={ow}>
                      {ow}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Deal Value (INR)
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.value || 0}
                  onChange={(e) =>
                    handleChange("value", Math.max(0, Number(e.target.value)))
                  }
                />
              </label>

              <label>
                Lead Source
                <select
                  value={formData.source || "Website"}
                  onChange={(e) => handleChange("source", e.target.value)}
                >
                  {sources.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Expected Closing Date
                <input
                  type="date"
                  value={formData.expectedCloseDate || ""}
                  onChange={(e) => handleChange("expectedCloseDate", e.target.value)}
                />
              </label>

              <label>
                Deal Priority
                <select
                  value={formData.priority || "medium"}
                  onChange={(e) =>
                    handleChange("priority", e.target.value as DealPriority)
                  }
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </label>

              <label className="bl-full-field">
                Win Probability: {formData.probability || 0}%
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.probability || 0}
                  onChange={(e) =>
                    handleChange("probability", Number(e.target.value))
                  }
                />
              </label>

              <label className="bl-full-field">
                Next Follow-up Action
                <input
                  value={formData.nextFollowUp || ""}
                  onChange={(e) => handleChange("nextFollowUp", e.target.value)}
                  placeholder="e.g. Schedule demo tomorrow at 3 PM"
                />
              </label>

              {formData.stage === "lost" && (
                <label className="bl-full-field">
                  Reason for Lost Opportunity
                  <input
                    value={formData.lostReason || ""}
                    onChange={(e) => handleChange("lostReason", e.target.value)}
                    placeholder="e.g. Price too high, chose competitor, budget postponed"
                  />
                </label>
              )}
            </div>
          )}

          {/* Tab 2: Activity Timeline */}
          {activeTab === "timeline" && (
            <div className="bl-drawer-timeline">
              {(formData.timeline || []).map((ev) => (
                <div key={ev.id} className="bl-timeline-item">
                  <div className="bl-timeline-dot" />
                  <div className="bl-timeline-content">
                    <strong className="bl-timeline-desc">{ev.description}</strong>
                    <small className="bl-timeline-time">{ev.timestamp}</small>
                  </div>
                </div>
              ))}
              {(!formData.timeline || formData.timeline.length === 0) && (
                <div className="bl-muted" style={{ padding: "20px 0" }}>
                  No timeline events recorded yet.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Notes */}
          {activeTab === "notes" && (
            <div style={{ marginTop: "10px" }}>
              <label className="bl-full-field" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>Opportunity Notes</span>
                <textarea
                  rows={8}
                  value={formData.notes || ""}
                  placeholder="Enter detailed scope, objection notes, stakeholder requirements..."
                  onChange={(e) => handleChange("notes", e.target.value)}
                />
              </label>
            </div>
          )}

          {/* Form Actions */}
          <div className="bl-form-actions" style={{ marginTop: "24px" }}>
            <button
              type="button"
              className="bl-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bl-primary"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : isCreating ? "Create Deal" : "Save Changes"}
              <ArrowUpRight size={16} />
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}

export default DealDrawer;
