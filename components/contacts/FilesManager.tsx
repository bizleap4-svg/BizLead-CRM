"use client";

import React, { useState, useEffect, useRef } from "react";
import { UploadCloud, Paperclip, Trash2, FileText, File, AlertCircle, Info, X } from "lucide-react";
import { CRMFile } from "@/components/crm/types";
import { useCRM } from "@/components/crm/CRMProvider";

interface FilesManagerProps {
  entityType: "contact" | "company" | "lead" | "deal";
  entityId: string;
  entityName: string;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "image/png",
  "image/jpeg",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function FilesManager({
  entityType,
  entityId,
  entityName,
}: FilesManagerProps) {
  const { getFilesFor, addFile, deleteFile } = useCRM();
  const [files, setFiles] = useState<CRMFile[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    const list = await getFilesFor(entityType, entityId);
    setFiles(list);
  };

  useEffect(() => {
    fetchFiles();
  }, [entityId, entityType]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > MAX_FILE_SIZE) {
      setErrorMsg("File exceeds the maximum 10 MB limit.");
      return;
    }

    if (!ALLOWED_TYPES.includes(selected.type) && !selected.name.endsWith(".pdf") && !selected.name.endsWith(".docx")) {
      setErrorMsg("Allowed formats: PDF, DOCX, XLSX, CSV, PNG, JPG.");
      return;
    }

    await addFile({
      entityType,
      entityId,
      name: selected.name,
      size: selected.size,
      type: selected.type || "application/octet-stream",
      uploader: "Current User",
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
    await fetchFiles();
  };

  const [inspectedFile, setInspectedFile] = useState<CRMFile | null>(null);

  const handleDelete = async (fileId: string) => {
    await deleteFile(fileId);
    if (inspectedFile?.id === fileId) setInspectedFile(null);
    await fetchFiles();
  };

  const handleInspectFile = (file: CRMFile) => {
    setInspectedFile(file);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="bl-files-container">
      {/* Upload Zone */}
      <div
        className="bl-upload-dropzone"
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <UploadCloud size={28} className="bl-upload-icon" />
        <div style={{ marginTop: "8px" }}>
          <strong>Click to attach a document or agreement</strong>
          <p style={{ fontSize: "11px", color: "var(--muted)", margin: "4px 0 0" }}>
            PDF, DOCX, XLSX, CSV, PNG or JPG (up to 10 MB). Stored locally in prototype mode.
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleFileSelect}
          accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg"
        />
      </div>

      {errorMsg && (
        <div className="bl-error-banner">
          <AlertCircle size={14} /> {errorMsg}
        </div>
      )}

      {/* Attached Files List */}
      <div className="bl-files-list">
        {files.map((file) => (
          <article key={file.id} className="bl-file-card">
            <div className="bl-file-icon-box">
              <File size={16} />
            </div>

            <div className="bl-file-info">
              <h4 className="bl-file-name">{file.name}</h4>
              <span className="bl-file-meta">
                {formatBytes(file.size)} · Uploaded by <strong>{file.uploader}</strong> on {file.uploadedAt}
              </span>
            </div>

            <div className="bl-file-actions">
              <button
                type="button"
                className="bl-icon bl-icon-sm"
                onClick={() => handleInspectFile(file)}
                title="View document metadata & validation"
                aria-label={`Inspect ${file.name}`}
              >
                <Info size={14} />
              </button>
              <button
                type="button"
                className="bl-icon bl-icon-sm"
                onClick={() => handleDelete(file.id)}
                title="Remove attachment"
                aria-label={`Remove ${file.name}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </article>
        ))}

        {/* Metadata Inspection Dialog */}
        {inspectedFile && (
          <div className="bl-modal-backdrop" onClick={() => setInspectedFile(null)}>
            <div
              className="bl-modal-content"
              style={{ maxWidth: "480px" }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Document Metadata"
            >
              <div className="bl-between" style={{ marginBottom: "14px" }}>
                <div>
                  <span className="bl-eyebrow">DOCUMENT ARCHITECTURE</span>
                  <h3>{inspectedFile.name}</h3>
                </div>
                <button
                  type="button"
                  className="bl-icon"
                  onClick={() => setInspectedFile(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="bl-warning-banner" style={{ background: "var(--color-info-soft)", borderColor: "color-mix(in srgb, var(--color-info) 30%, transparent)", color: "var(--text)" }}>
                <Info size={15} color="var(--color-info)" />
                <span style={{ fontSize: "11px" }}>
                  <strong>Prototype Document Record (Metadata Only):</strong> Binary files are validated client-side and tracked with metadata. Production cloud storage (S3/GCS) integration is provisioned in the backend phase to prevent storing large binaries in browser storage.
                </span>
              </div>

              <div className="bl-field-list" style={{ marginTop: "12px" }}>
                <div className="bl-field-item">
                  <span className="bl-field-label">File Type</span>
                  <span className="bl-field-value">{inspectedFile.type}</span>
                </div>
                <div className="bl-field-item">
                  <span className="bl-field-label">Validated Size</span>
                  <span className="bl-field-value">{formatBytes(inspectedFile.size)}</span>
                </div>
                <div className="bl-field-item">
                  <span className="bl-field-label">Associated Entity</span>
                  <span className="bl-field-value">{entityName} ({inspectedFile.entityType})</span>
                </div>
                <div className="bl-field-item">
                  <span className="bl-field-label">Uploader</span>
                  <span className="bl-field-value">{inspectedFile.uploader}</span>
                </div>
                <div className="bl-field-item">
                  <span className="bl-field-label">Recorded Timestamp</span>
                  <span className="bl-field-value">{inspectedFile.uploadedAt}</span>
                </div>
              </div>

              <div className="bl-form-actions" style={{ marginTop: "18px" }}>
                <button
                  type="button"
                  className="bl-secondary"
                  onClick={() => setInspectedFile(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {files.length === 0 && (
          <div className="bl-empty-stream">
            <Paperclip size={24} opacity={0.4} />
            <p>No files attached yet to {entityName}.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FilesManager;
