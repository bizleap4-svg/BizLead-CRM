"use client";

import React, { useState } from "react";
import {
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  MoveUp,
  MoveDown,
  Tag,
  Kanban,
  Target,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { useControlCenter } from "./ControlCenterContext";
import { useCRM } from "../crm/CRMProvider";
import { PipelineStage, StageKind } from "../crm/types";

export function CRMConfigurationPanel() {
  const { crmConfig, updateCRMConfig, canManageAdmin } = useControlCenter();
  const { stages, updateStages, deals, leads } = useCRM();

  const [activeTab, setActiveTab] = useState<
    "pipeline" | "sources" | "statuses" | "lost_reasons" | "tags" | "custom_fields" | "scoring"
  >("pipeline");

  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New item inputs
  const [newSource, setNewSource] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newLostReason, setNewLostReason] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newStageName, setNewStageName] = useState("");
  const [newStageKind, setNewStageKind] = useState<StageKind>("open");

  // Custom Field Form
  const [customFieldForm, setCustomFieldForm] = useState({
    module: "lead" as "lead" | "contact" | "company" | "deal",
    label: "",
    key: "",
    type: "text" as "text" | "number" | "select" | "date" | "boolean",
    optionsText: "",
  });

  const isAllowedToManage = canManageAdmin();

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 3500);
  };

  // Pipeline Stages Handlers
  const handleAddStage = async () => {
    if (!newStageName.trim()) return;
    const newStage: PipelineStage = {
      id: `stage-${Date.now()}`,
      name: newStageName.trim(),
      order: stages.length + 1,
      kind: newStageKind,
    };
    try {
      await updateStages([...stages, newStage]);
      setNewStageName("");
      showNotification("success", `Pipeline stage "${newStage.name}" added.`);
    } catch (err: any) {
      showNotification("error", err.message || "Failed to add stage");
    }
  };

  const handleDeleteStage = async (stageId: string, stageName: string) => {
    // Safety check: verify if any existing deal is currently in this stage!
    const referencingDeals = deals.filter((d) => d.stage === stageId || d.stage.toLowerCase() === stageName.toLowerCase());
    if (referencingDeals.length > 0) {
      showNotification(
        "error",
        `Cannot delete stage "${stageName}": ${referencingDeals.length} active deal(s) currently reside in this stage. Move them first.`
      );
      return;
    }

    try {
      const updated = stages.filter((s) => s.id !== stageId).map((s, idx) => ({ ...s, order: idx + 1 }));
      await updateStages(updated);
      showNotification("success", `Stage "${stageName}" removed.`);
    } catch (err: any) {
      showNotification("error", err.message || "Failed to delete stage");
    }
  };

  const handleMoveStage = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stages.length) return;

    const reordered = [...stages];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    const updated = reordered.map((s, idx) => ({ ...s, order: idx + 1 }));

    await updateStages(updated);
  };

  // Sources
  const handleAddSource = () => {
    if (!newSource.trim()) return;
    if (crmConfig.leadSources.includes(newSource.trim())) {
      showNotification("error", "Source already exists.");
      return;
    }
    updateCRMConfig({ leadSources: [...crmConfig.leadSources, newSource.trim()] });
    setNewSource("");
    showNotification("success", "Lead source added.");
  };

  const handleDeleteSource = (source: string) => {
    // Check if leads reference this source
    const count = leads.filter((l) => l.source === source).length;
    if (count > 0) {
      showNotification("error", `Cannot remove source: ${count} lead(s) currently reference "${source}".`);
      return;
    }
    updateCRMConfig({ leadSources: crmConfig.leadSources.filter((s) => s !== source) });
    showNotification("success", `Source "${source}" removed.`);
  };

  // Lost Reasons
  const handleAddLostReason = () => {
    if (!newLostReason.trim()) return;
    if (crmConfig.dealLostReasons.includes(newLostReason.trim())) return;
    updateCRMConfig({ dealLostReasons: [...crmConfig.dealLostReasons, newLostReason.trim()] });
    setNewLostReason("");
    showNotification("success", "Deal lost reason added.");
  };

  const handleDeleteLostReason = (reason: string) => {
    updateCRMConfig({ dealLostReasons: crmConfig.dealLostReasons.filter((r) => r !== reason) });
    showNotification("success", `Reason "${reason}" removed.`);
  };

  // Tags
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    if (crmConfig.tags.includes(newTag.trim())) return;
    updateCRMConfig({ tags: [...crmConfig.tags, newTag.trim()] });
    setNewTag("");
    showNotification("success", "Tag added.");
  };

  const handleDeleteTag = (tag: string) => {
    updateCRMConfig({ tags: crmConfig.tags.filter((t) => t !== tag) });
    showNotification("success", `Tag "${tag}" removed.`);
  };

  // Custom Fields
  const handleAddCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFieldForm.label.trim() || !customFieldForm.key.trim()) return;

    const options = customFieldForm.type === "select"
      ? customFieldForm.optionsText.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined;

    const newField = {
      id: `cf-${Date.now()}`,
      module: customFieldForm.module,
      label: customFieldForm.label.trim(),
      key: customFieldForm.key.toLowerCase().replace(/\s+/g, "_"),
      type: customFieldForm.type,
      options,
    };

    updateCRMConfig({ customFields: [...crmConfig.customFields, newField] });
    setCustomFieldForm({
      module: "lead",
      label: "",
      key: "",
      type: "text",
      optionsText: "",
    });
    showNotification("success", `Custom field "${newField.label}" added to ${newField.module}.`);
  };

  const handleDeleteCustomField = (fieldId: string) => {
    updateCRMConfig({ customFields: crmConfig.customFields.filter((f) => f.id !== fieldId) });
    showNotification("success", "Custom field removed.");
  };

  return (
    <div className="bl-settings-section-card">
      <div className="bl-section-header">
        <div className="bl-section-title-wrap">
          <Sliders size={20} className="bl-accent-icon" />
          <div>
            <h2 className="bl-section-title">CRM System Configuration</h2>
            <p className="bl-section-desc">
              Centralized dictionary for pipeline stages, lead sources, conversion definitions, tags, and custom fields.
            </p>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`bl-alert-${notification.type}`}>
          {notification.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="bl-crm-config-subtabs">
        <button
          type="button"
          className={`bl-crm-subtab ${activeTab === "pipeline" ? "selected" : ""}`}
          onClick={() => setActiveTab("pipeline")}
        >
          Pipeline Stages ({stages.length})
        </button>
        <button
          type="button"
          className={`bl-crm-subtab ${activeTab === "sources" ? "selected" : ""}`}
          onClick={() => setActiveTab("sources")}
        >
          Lead Sources ({crmConfig.leadSources.length})
        </button>
        <button
          type="button"
          className={`bl-crm-subtab ${activeTab === "lost_reasons" ? "selected" : ""}`}
          onClick={() => setActiveTab("lost_reasons")}
        >
          Deal Lost Reasons ({crmConfig.dealLostReasons.length})
        </button>
        <button
          type="button"
          className={`bl-crm-subtab ${activeTab === "tags" ? "selected" : ""}`}
          onClick={() => setActiveTab("tags")}
        >
          CRM Tags ({crmConfig.tags.length})
        </button>
        <button
          type="button"
          className={`bl-crm-subtab ${activeTab === "custom_fields" ? "selected" : ""}`}
          onClick={() => setActiveTab("custom_fields")}
        >
          Custom Fields ({crmConfig.customFields.length})
        </button>
        <button
          type="button"
          className={`bl-crm-subtab ${activeTab === "scoring" ? "selected" : ""}`}
          onClick={() => setActiveTab("scoring")}
        >
          Scoring Rules
        </button>
      </div>

      {/* Tab 1: Pipeline Stages */}
      {activeTab === "pipeline" && (
        <div className="bl-config-panel-body">
          <div className="bl-alert-info">
            <span>
              <strong>Referential Integrity Guard:</strong> You cannot delete a pipeline stage if active deals are currently positioned within that stage.
            </span>
          </div>

          <div className="bl-stages-list">
            {stages.map((st, idx) => {
              const countInStage = deals.filter((d) => d.stage === st.id || d.stage === st.name.toLowerCase()).length;
              return (
                <div key={st.id} className="bl-stage-row">
                  <div className="bl-stage-order-num">{idx + 1}</div>
                  <div className="bl-stage-title-col">
                    <span className="bl-stage-name-text">{st.name}</span>
                    <span className={`bl-stage-kind-pill kind-${st.kind}`}>{st.kind.toUpperCase()}</span>
                  </div>
                  <div className="bl-stage-deals-count">
                    <span>{countInStage} active deals</span>
                  </div>
                  {isAllowedToManage && (
                    <div className="bl-stage-controls">
                      <button
                        type="button"
                        className="bl-btn-icon-xs"
                        onClick={() => handleMoveStage(idx, "up")}
                        disabled={idx === 0}
                        title="Move Up"
                      >
                        <MoveUp size={13} />
                      </button>
                      <button
                        type="button"
                        className="bl-btn-icon-xs"
                        onClick={() => handleMoveStage(idx, "down")}
                        disabled={idx === stages.length - 1}
                        title="Move Down"
                      >
                        <MoveDown size={13} />
                      </button>
                      <button
                        type="button"
                        className="bl-btn-icon-xs bl-btn-danger"
                        onClick={() => handleDeleteStage(st.id, st.name)}
                        title="Delete Stage"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isAllowedToManage && (
            <div className="bl-add-inline-row">
              <input
                type="text"
                className="bl-input-sm"
                placeholder="New stage name (e.g., Security Audit)..."
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
              />
              <select
                className="bl-select-sm"
                value={newStageKind}
                onChange={(e) => setNewStageKind(e.target.value as StageKind)}
              >
                <option value="open">Open (In Progress)</option>
                <option value="won">Won (Closed Successfully)</option>
                <option value="lost">Lost (Disqualified)</option>
              </select>
              <button type="button" className="bl-btn-primary-sm" onClick={handleAddStage}>
                <Plus size={14} /> Add Stage
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Lead Sources */}
      {activeTab === "sources" && (
        <div className="bl-config-panel-body">
          <div className="bl-tags-cloud">
            {crmConfig.leadSources.map((src) => {
              const leadCount = leads.filter((l) => l.source === src).length;
              return (
                <div key={src} className="bl-tag-item">
                  <span>{src}</span>
                  <span className="bl-tag-count">({leadCount})</span>
                  {isAllowedToManage && (
                    <button
                      type="button"
                      className="bl-tag-delete"
                      onClick={() => handleDeleteSource(src)}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {isAllowedToManage && (
            <div className="bl-add-inline-row">
              <input
                type="text"
                className="bl-input-sm"
                placeholder="New lead source (e.g. Industry Conference)..."
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
              />
              <button type="button" className="bl-btn-primary-sm" onClick={handleAddSource}>
                <Plus size={14} /> Add Source
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Deal Lost Reasons */}
      {activeTab === "lost_reasons" && (
        <div className="bl-config-panel-body">
          <div className="bl-tags-cloud">
            {crmConfig.dealLostReasons.map((reason) => (
              <div key={reason} className="bl-tag-item">
                <span>{reason}</span>
                {isAllowedToManage && (
                  <button
                    type="button"
                    className="bl-tag-delete"
                    onClick={() => handleDeleteLostReason(reason)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {isAllowedToManage && (
            <div className="bl-add-inline-row">
              <input
                type="text"
                className="bl-input-sm"
                placeholder="New lost reason (e.g. Founder Veto)..."
                value={newLostReason}
                onChange={(e) => setNewLostReason(e.target.value)}
              />
              <button type="button" className="bl-btn-primary-sm" onClick={handleAddLostReason}>
                <Plus size={14} /> Add Reason
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Tags */}
      {activeTab === "tags" && (
        <div className="bl-config-panel-body">
          <div className="bl-tags-cloud">
            {crmConfig.tags.map((tag) => (
              <div key={tag} className="bl-tag-item">
                <Tag size={12} />
                <span>#{tag}</span>
                {isAllowedToManage && (
                  <button
                    type="button"
                    className="bl-tag-delete"
                    onClick={() => handleDeleteTag(tag)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {isAllowedToManage && (
            <div className="bl-add-inline-row">
              <input
                type="text"
                className="bl-input-sm"
                placeholder="New tag label (without #)..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <button type="button" className="bl-btn-primary-sm" onClick={handleAddTag}>
                <Plus size={14} /> Add Tag
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Custom Fields */}
      {activeTab === "custom_fields" && (
        <div className="bl-config-panel-body">
          <div className="bl-table-container">
            <table className="bl-table">
              <thead>
                <tr>
                  <th>Target Module</th>
                  <th>Field Label</th>
                  <th>Field Key</th>
                  <th>Type</th>
                  <th>Options</th>
                  {isAllowedToManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {crmConfig.customFields.map((cf) => (
                  <tr key={cf.id}>
                    <td>
                      <span className="bl-badge-subtle">{cf.module.toUpperCase()}</span>
                    </td>
                    <td>
                      <strong>{cf.label}</strong>
                    </td>
                    <td>
                      <code>{cf.key}</code>
                    </td>
                    <td>
                      <span className="bl-field-type-pill">{cf.type}</span>
                    </td>
                    <td>
                      <span className="bl-options-preview">
                        {cf.options ? cf.options.join(", ") : "—"}
                      </span>
                    </td>
                    {isAllowedToManage && (
                      <td>
                        <button
                          type="button"
                          className="bl-btn-icon-xs bl-btn-danger"
                          onClick={() => handleDeleteCustomField(cf.id)}
                          title="Delete Custom Field"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isAllowedToManage && (
            <form onSubmit={handleAddCustomField} className="bl-custom-field-form">
              <h4 className="bl-form-heading">Create New Custom Field</h4>
              <div className="bl-form-grid-3">
                <div className="bl-form-group">
                  <label className="bl-form-label">Module *</label>
                  <select
                    className="bl-form-select"
                    value={customFieldForm.module}
                    onChange={(e) =>
                      setCustomFieldForm({
                        ...customFieldForm,
                        module: e.target.value as any,
                      })
                    }
                  >
                    <option value="lead">Lead</option>
                    <option value="contact">Contact</option>
                    <option value="company">Company</option>
                    <option value="deal">Pipeline Deal</option>
                  </select>
                </div>

                <div className="bl-form-group">
                  <label className="bl-form-label">Field Label *</label>
                  <input
                    type="text"
                    className="bl-form-input"
                    placeholder="e.g. Contract Signer"
                    value={customFieldForm.label}
                    onChange={(e) =>
                      setCustomFieldForm({
                        ...customFieldForm,
                        label: e.target.value,
                        key: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                      })
                    }
                    required
                  />
                </div>

                <div className="bl-form-group">
                  <label className="bl-form-label">Field Type *</label>
                  <select
                    className="bl-form-select"
                    value={customFieldForm.type}
                    onChange={(e) =>
                      setCustomFieldForm({
                        ...customFieldForm,
                        type: e.target.value as any,
                      })
                    }
                  >
                    <option value="text">Single-line Text</option>
                    <option value="number">Numeric Value</option>
                    <option value="select">Dropdown Select</option>
                    <option value="date">Date Picker</option>
                    <option value="boolean">Yes/No Boolean</option>
                  </select>
                </div>
              </div>

              {customFieldForm.type === "select" && (
                <div className="bl-form-group">
                  <label className="bl-form-label">Select Options (comma-separated)</label>
                  <input
                    type="text"
                    className="bl-form-input"
                    placeholder="Option A, Option B, Option C"
                    value={customFieldForm.optionsText}
                    onChange={(e) =>
                      setCustomFieldForm({ ...customFieldForm, optionsText: e.target.value })
                    }
                  />
                </div>
              )}

              <button type="submit" className="bl-btn-primary">
                <Plus size={15} /> Add Custom Field
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab 6: Scoring Weights */}
      {activeTab === "scoring" && (
        <div className="bl-config-panel-body">
          <div className="bl-alert-info">
            <span>
              Dynamic lead scoring calculates the 0-100 score for incoming leads across touchpoints and qualification data.
            </span>
          </div>

          <div className="bl-scoring-grid">
            <div className="bl-scoring-card">
              <label>Phone Number Provided (+points)</label>
              <input
                type="number"
                className="bl-input-sm"
                value={crmConfig.scoringWeights.hasPhone}
                onChange={(e) =>
                  updateCRMConfig({
                    scoringWeights: {
                      ...crmConfig.scoringWeights,
                      hasPhone: parseInt(e.target.value) || 0,
                    },
                  })
                }
                disabled={!isAllowedToManage}
              />
            </div>

            <div className="bl-scoring-card">
              <label>Website URL Provided (+points)</label>
              <input
                type="number"
                className="bl-input-sm"
                value={crmConfig.scoringWeights.hasWebsite}
                onChange={(e) =>
                  updateCRMConfig({
                    scoringWeights: {
                      ...crmConfig.scoringWeights,
                      hasWebsite: parseInt(e.target.value) || 0,
                    },
                  })
                }
                disabled={!isAllowedToManage}
              />
            </div>

            <div className="bl-scoring-card">
              <label>High Intent Source (+points)</label>
              <input
                type="number"
                className="bl-input-sm"
                value={crmConfig.scoringWeights.highIntentSource}
                onChange={(e) =>
                  updateCRMConfig({
                    scoringWeights: {
                      ...crmConfig.scoringWeights,
                      highIntentSource: parseInt(e.target.value) || 0,
                    },
                  })
                }
                disabled={!isAllowedToManage}
              />
            </div>

            <div className="bl-scoring-card">
              <label>Budget Above ₹1,00,000 (+points)</label>
              <input
                type="number"
                className="bl-input-sm"
                value={crmConfig.scoringWeights.budgetAbove1Lakh}
                onChange={(e) =>
                  updateCRMConfig({
                    scoringWeights: {
                      ...crmConfig.scoringWeights,
                      budgetAbove1Lakh: parseInt(e.target.value) || 0,
                    },
                  })
                }
                disabled={!isAllowedToManage}
              />
            </div>

            <div className="bl-scoring-card">
              <label>Meeting Booked (+points)</label>
              <input
                type="number"
                className="bl-input-sm"
                value={crmConfig.scoringWeights.meetingBooked}
                onChange={(e) =>
                  updateCRMConfig({
                    scoringWeights: {
                      ...crmConfig.scoringWeights,
                      meetingBooked: parseInt(e.target.value) || 0,
                    },
                  })
                }
                disabled={!isAllowedToManage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
