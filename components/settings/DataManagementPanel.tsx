"use client";

import React, { useState } from "react";
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ShieldCheck,
  X,
  FileCheck,
} from "lucide-react";
import { useControlCenter } from "./ControlCenterContext";
import { SettingsRepository } from "./SettingsRepository";

export function DataManagementPanel() {
  const { exportData, resetDemoData, canManageAdmin } = useControlCenter();

  const [importJsonText, setImportJsonText] = useState("");
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
    stats?: any;
  } | null>(null);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmWord, setResetConfirmWord] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isAllowedToManage = canManageAdmin();

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDownloadBackup = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bizlead_backup_v10_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification("success", "Workspace backup generated and downloaded successfully.");
    } catch (err: any) {
      showNotification("error", err.message || "Failed to export data");
    }
  };

  const handleValidateImport = () => {
    if (!importJsonText.trim()) {
      setValidationResult({ valid: false, errors: ["Please paste or select a JSON backup payload."] });
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);
      const res = SettingsRepository.validateBackupData(parsed);
      setValidationResult(res);
    } catch (err: any) {
      setValidationResult({
        valid: false,
        errors: [`Invalid JSON Syntax: ${err.message}`],
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportJsonText(text);
      try {
        const parsed = JSON.parse(text);
        const res = SettingsRepository.validateBackupData(parsed);
        setValidationResult(res);
      } catch (err: any) {
        setValidationResult({
          valid: false,
          errors: [`Invalid JSON Syntax: ${err.message}`],
        });
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = async () => {
    if (resetConfirmWord !== "RESET") return;
    setIsResetting(true);
    try {
      await resetDemoData();
      setIsResetModalOpen(false);
      setResetConfirmWord("");
      showNotification("success", "BizLead CRM data and settings reset to initial clean demo seeds.");
    } catch (err: any) {
      showNotification("error", err.message || "Failed to reset data");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="bl-settings-section-card">
      <div className="bl-section-header">
        <div className="bl-section-title-wrap">
          <Database size={20} className="bl-accent-icon" />
          <div>
            <h2 className="bl-section-title">Data Management & Schema Migration</h2>
            <p className="bl-section-desc">
              Validated workspace backups, versioned restore validation, safe schema migration, and demo seed resets.
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

      <div className="bl-data-cards-grid">
        {/* Card 1: Backup Export */}
        <div className="bl-data-card">
          <div className="bl-data-card-header">
            <Download size={22} className="bl-accent-icon" />
            <h3 className="bl-data-card-title">Validated Workspace Backup</h3>
          </div>
          <p className="bl-data-card-desc">
            Export all organization settings, member directories, roles, pipeline stages, leads, contacts, deals, tasks, and audit logs into a versioned JSON archive.
          </p>
          <div className="bl-data-card-meta">
            <ShieldCheck size={14} />
            <span>Format: <code>bizlead_backup_v10</code> • Secret stripping enabled</span>
          </div>
          <div className="bl-data-card-footer">
            <button
              type="button"
              className="bl-btn-primary"
              onClick={handleDownloadBackup}
            >
              <Download size={16} /> Download Full Backup (JSON)
            </button>
          </div>
        </div>

        {/* Card 2: Demo Data Reset */}
        <div className="bl-data-card bl-data-card-warn">
          <div className="bl-data-card-header">
            <RotateCcw size={22} className="bl-danger-icon" />
            <h3 className="bl-data-card-title">Selective Demo Data Reset</h3>
          </div>
          <p className="bl-data-card-desc">
            Reset all CRM records and configuration keys back to pristine initial demo seeds without affecting your browser session or other website data.
          </p>
          <div className="bl-data-card-meta">
            <AlertTriangle size={14} />
            <span>Safe Scoped Reset: Scoped to <code>bizlead_*</code> localStorage keys only</span>
          </div>
          <div className="bl-data-card-footer">
            <button
              type="button"
              className="bl-btn-danger"
              onClick={() => setIsResetModalOpen(true)}
              disabled={!isAllowedToManage}
              title={isAllowedToManage ? "Reset CRM Data" : "Admin access required"}
            >
              <RotateCcw size={16} /> Reset Workspace to Demo Seeds
            </button>
          </div>
        </div>
      </div>

      {/* Card 3: Validated Backup Import */}
      <div className="bl-import-container">
        <h3 className="bl-import-title">Restore & Import Backup</h3>
        <p className="bl-import-desc">
          Upload or paste a valid <code>bizlead_backup_v10</code> file. The schema validator will verify structural integrity and preview record counts before confirmation.
        </p>

        <div className="bl-import-controls">
          <label className="bl-file-upload-btn">
            <Upload size={15} /> Upload JSON Backup File
            <input
              type="file"
              accept=".json,application/json"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
          </label>
        </div>

        <div className="bl-form-group" style={{ marginTop: "14px" }}>
          <label className="bl-form-label">Or paste raw backup JSON:</label>
          <textarea
            className="bl-form-textarea"
            rows={5}
            placeholder='Paste {"version": "bizlead_backup_v10", ...} here'
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
          <button
            type="button"
            className="bl-btn-secondary"
            onClick={handleValidateImport}
          >
            <FileCheck size={16} /> Validate Backup Schema
          </button>
        </div>

        {/* Validation Result Preview */}
        {validationResult && (
          <div
            className={`bl-validation-box ${
              validationResult.valid ? "box-valid" : "box-invalid"
            }`}
          >
            {validationResult.valid ? (
              <>
                <div className="bl-val-header">
                  <CheckCircle2 size={18} className="bl-accent-icon" />
                  <strong>Backup Schema Valid & Compatible</strong>
                </div>
                <div className="bl-val-stats">
                  <span>Version: <code>{validationResult.stats?.version}</code></span>
                  <span>Exported: {validationResult.stats?.exportedAt}</span>
                  <span>Leads: {validationResult.stats?.leadsCount}</span>
                  <span>Contacts: {validationResult.stats?.contactsCount}</span>
                  <span>Deals: {validationResult.stats?.dealsCount}</span>
                  <span>Members: {validationResult.stats?.membersCount}</span>
                </div>
                <p className="bl-val-note">
                  Backup verified. Data matches BizLead v10 specifications.
                </p>
              </>
            ) : (
              <>
                <div className="bl-val-header">
                  <AlertTriangle size={18} className="bl-danger-icon" />
                  <strong>Validation Failed</strong>
                </div>
                <ul className="bl-val-errors">
                  {validationResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      {/* Demo Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="bl-modal-backdrop">
          <div className="bl-modal-content">
            <div className="bl-modal-header">
              <h3 className="bl-modal-title">Confirm Demo Data Reset</h3>
              <button
                type="button"
                className="bl-btn-close"
                onClick={() => setIsResetModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="bl-modal-body">
              <div className="bl-alert-warning">
                <AlertTriangle size={20} />
                <div>
                  <strong>Destructive Action:</strong>
                  <p>
                    This will replace your current workspace leads, contacts, deals, tasks, meetings, and configurations with pristine factory seeds.
                  </p>
                </div>
              </div>

              <p style={{ fontSize: "13px", color: "var(--muted)", margin: "16px 0 8px" }}>
                To proceed, type <strong>RESET</strong> in the confirmation box below:
              </p>

              <input
                type="text"
                className="bl-form-input"
                placeholder="Type RESET"
                value={resetConfirmWord}
                onChange={(e) => setResetConfirmWord(e.target.value)}
              />
            </div>

            <div className="bl-modal-footer">
              <button
                type="button"
                className="bl-btn-secondary"
                onClick={() => setIsResetModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bl-btn-danger"
                disabled={resetConfirmWord !== "RESET" || isResetting}
                onClick={handleConfirmReset}
              >
                {isResetting ? "Resetting..." : "Confirm Data Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
