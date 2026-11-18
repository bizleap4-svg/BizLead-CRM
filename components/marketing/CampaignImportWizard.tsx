"use client";

import React, { useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  Download,
  X,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { CampaignDailyMetric, MarketingPlatform, MarketingImport, MarketingCampaign } from "../crm/types";
import { useCRM } from "../crm/CRMProvider";

export interface CampaignImportWizardProps {
  isOpen?: boolean;
  onClose: () => void;
  campaigns?: MarketingCampaign[];
  onImportSuccess?: (metrics: CampaignDailyMetric[]) => void;
  onImportComplete?: (importRecord: MarketingImport) => void;
}

export function CampaignImportWizard({
  isOpen,
  onClose,
  campaigns: propsCampaigns,
  onImportSuccess,
  onImportComplete,
}: CampaignImportWizardProps) {
  if (isOpen !== undefined && !isOpen) return null;

  const { campaigns: contextCampaigns, importDailyMetrics } = useCRM();
  const campaigns = propsCampaigns || contextCampaigns;

  const [step, setStep] = useState<"upload" | "map" | "preview" | "summary">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [csvRawText, setCsvRawText] = useState<string>("");
  const [platform, setPlatform] = useState<MarketingPlatform>("meta");
  const [dateFormat, setDateFormat] = useState<"YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY">("YYYY-MM-DD");
  const [currency, setCurrency] = useState("INR");

  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<{
    date: string;
    campaignName: string;
    impressions: string;
    clicks: string;
    spend: string;
    leads: string;
  }>({
    date: "",
    campaignName: "",
    impressions: "",
    clicks: "",
    spend: "",
    leads: "",
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importedCount, setImportedCount] = useState(0);

  // Download Sample CSV
  const handleDownloadSample = () => {
    const sampleContent =
      "Date,Campaign Name,Impressions,Clicks,Spend,Leads\n" +
      "2026-11-10,Q4 High Intent Search,12450,420,5400,18\n" +
      "2026-11-11,Q4 High Intent Search,14100,510,6200,24\n" +
      "2026-11-12,Meta Enterprise Video,28500,890,8500,32\n";

    const blob = new Blob([sampleContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bizlead_campaign_metrics_sample.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const selected = e.target.files[0];

    if (!selected.name.endsWith(".csv")) {
      setValidationErrors(["Please select a valid CSV (.csv) file."]);
      return;
    }

    setFile(selected);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvRawText(text);
      parseCSV(text);
    };
    reader.readAsText(selected);
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setValidationErrors(["CSV file must contain a header row and at least one data row."]);
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
    setParsedHeaders(headers);

    // Auto-map common header names
    const newMapping = {
      date: headers.find((h) => /date|day/i.test(h)) || headers[0] || "",
      campaignName: headers.find((h) => /campaign/i.test(h)) || headers[1] || "",
      impressions: headers.find((h) => /impression/i.test(h)) || "",
      clicks: headers.find((h) => /click/i.test(h)) || "",
      spend: headers.find((h) => /spend|cost|amount/i.test(h)) || "",
      leads: headers.find((h) => /lead|conversion/i.test(h)) || "",
    };
    setColumnMapping(newMapping);

    const rows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
      const rowObj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        // Prevent formula injection: prefix =, +, -, @ with single quote
        let val = parts[idx] || "";
        if (/^[=+\-@]/.test(val)) {
          val = `'${val}`;
        }
        rowObj[h] = val;
      });
      rows.push(rowObj);
    }

    setParsedRows(rows);
    setValidationErrors([]);
    setStep("map");
  };

  const handleValidateAndPreview = () => {
    const errors: string[] = [];
    if (!columnMapping.date) errors.push("Please map the Date column.");
    if (!columnMapping.campaignName) errors.push("Please map the Campaign Name column.");
    if (!columnMapping.spend) errors.push("Please map the Spend column.");

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setStep("preview");
  };

  const handleConfirmImport = async () => {
    const dailyMetrics: CampaignDailyMetric[] = [];

    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      const campName = row[columnMapping.campaignName] || "Imported Campaign";

      // Match or resolve campaign
      const matchedCamp = campaigns.find(
        (c) => c.name.toLowerCase() === campName.toLowerCase() || c.id === campName
      );
      const targetCampId = matchedCamp ? matchedCamp.id : campaigns[0]?.id || "camp_default";

      // Parse date safely
      let dateVal = row[columnMapping.date];
      if (dateFormat === "DD/MM/YYYY") {
        const parts = dateVal.split(/[/.-]/);
        if (parts.length === 3) dateVal = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      } else if (dateFormat === "MM/DD/YYYY") {
        const parts = dateVal.split(/[/.-]/);
        if (parts.length === 3) dateVal = `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
      }

      const metric: CampaignDailyMetric = {
        id: `imp_${Date.now()}_${i}`,
        campaignId: targetCampId,
        date: dateVal,
        impressions: parseInt(row[columnMapping.impressions] || "0", 10) || 0,
        clicks: parseInt(row[columnMapping.clicks] || "0", 10) || 0,
        spend: parseFloat(row[columnMapping.spend] || "0") || 0,
        currency,
        providerLeads: parseInt(row[columnMapping.leads] || "0", 10) || 0,
        providerConversions: parseInt(row[columnMapping.leads] || "0", 10) || 0,
        providerConversionValue: 0,
        source: "csv_import",
      };
      dailyMetrics.push(metric);
    }

    if (importDailyMetrics) {
      await importDailyMetrics(dailyMetrics);
    }

    setImportedCount(dailyMetrics.length);
    setStep("summary");
  };

  return (
    <div className="bl-modal-backdrop" onClick={onClose}>
      <div
        className="bl-modal bl-import-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="import-wizard-title"
      >
        <div className="bl-modal-header bl-between">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="bl-icon-badge" style={{ background: "rgba(255, 225, 59, 0.15)", color: "var(--accent)" }}>
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h3 id="import-wizard-title" style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
                Campaign Data Import Wizard
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
                Import performance metrics from Meta, Google, or agency CSV exports
              </p>
            </div>
          </div>
          <button type="button" className="bl-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="bl-modal-body" style={{ padding: "16px 20px" }}>
          {/* STEP 1: UPLOAD */}
          {step === "upload" && (
            <div className="bl-import-step-upload">
              <div className="bl-sync-export-box bl-between" style={{ marginBottom: "16px" }}>
                <div>
                  <strong style={{ fontSize: "13px", display: "block" }}>Download Template CSV</strong>
                  <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>
                    Standard schema for daily campaign impressions, spend, and leads
                  </span>
                </div>
                <button
                  type="button"
                  className="bl-secondary bl-btn-xs"
                  onClick={handleDownloadSample}
                >
                  <Download size={13} />
                  <span>Sample Template</span>
                </button>
              </div>

              <div className="bl-file-dropzone" style={{ border: "2px dashed var(--border)", borderRadius: "12px", padding: "32px 20px", textAlign: "center" }}>
                <UploadCloud size={32} style={{ color: "var(--accent)", margin: "0 auto 10px" }} />
                <h4 style={{ margin: "0 0 6px 0", fontSize: "14px" }}>Select or Drag Provider CSV</h4>
                <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "var(--muted)" }}>
                  Supports exports from Ads Manager, Google Ads, or custom sheets
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  style={{ display: "inline-block" }}
                />
              </div>

              {validationErrors.length > 0 && (
                <div className="bl-error-box" style={{ marginTop: "12px", padding: "8px 12px", background: "var(--color-danger-soft)", borderRadius: "6px", color: "var(--color-danger)", fontSize: "12px" }}>
                  {validationErrors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: MAP COLUMNS */}
          {step === "map" && (
            <div className="bl-import-step-map">
              <div className="bl-fields-row" style={{ marginBottom: "16px" }}>
                <div className="bl-field-group" style={{ flex: 1 }}>
                  <label>Advertising Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="bl-select"
                  >
                    <option value="meta">Meta Ads</option>
                    <option value="google">Google Ads</option>
                    <option value="linkedin">LinkedIn Ads</option>
                    <option value="custom">Custom / Other</option>
                  </select>
                </div>

                <div className="bl-field-group" style={{ flex: 1 }}>
                  <label>Date Format in CSV</label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value as any)}
                    className="bl-select"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-11-18)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 18/11/2026)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 11/18/2026)</option>
                  </select>
                </div>
              </div>

              <div className="bl-eyebrow" style={{ marginBottom: "10px" }}>COLUMN MAPPINGS</div>

              <div className="bl-mapping-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="bl-field-group">
                  <label>Date Column *</label>
                  <select
                    value={columnMapping.date}
                    onChange={(e) => setColumnMapping({ ...columnMapping, date: e.target.value })}
                    className="bl-select"
                  >
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div className="bl-field-group">
                  <label>Campaign Name Column *</label>
                  <select
                    value={columnMapping.campaignName}
                    onChange={(e) => setColumnMapping({ ...columnMapping, campaignName: e.target.value })}
                    className="bl-select"
                  >
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div className="bl-field-group">
                  <label>Spend Column *</label>
                  <select
                    value={columnMapping.spend}
                    onChange={(e) => setColumnMapping({ ...columnMapping, spend: e.target.value })}
                    className="bl-select"
                  >
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div className="bl-field-group">
                  <label>Clicks Column</label>
                  <select
                    value={columnMapping.clicks}
                    onChange={(e) => setColumnMapping({ ...columnMapping, clicks: e.target.value })}
                    className="bl-select"
                  >
                    <option value="">-- Optional --</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div className="bl-field-group">
                  <label>Impressions Column</label>
                  <select
                    value={columnMapping.impressions}
                    onChange={(e) => setColumnMapping({ ...columnMapping, impressions: e.target.value })}
                    className="bl-select"
                  >
                    <option value="">-- Optional --</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div className="bl-field-group">
                  <label>Provider Leads Column</label>
                  <select
                    value={columnMapping.leads}
                    onChange={(e) => setColumnMapping({ ...columnMapping, leads: e.target.value })}
                    className="bl-select"
                  >
                    <option value="">-- Optional --</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              {validationErrors.length > 0 && (
                <div className="bl-error-box" style={{ marginTop: "12px", padding: "8px 12px", background: "var(--color-danger-soft)", borderRadius: "6px", color: "var(--color-danger)", fontSize: "12px" }}>
                  {validationErrors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PREVIEW */}
          {step === "preview" && (
            <div className="bl-import-step-preview">
              <div className="bl-between" style={{ marginBottom: "10px" }}>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Previewing first 3 of {parsedRows.length} rows (Duplicates on overlapping dates will be updated):
                </span>
                <span className="bl-status-chip deal">{platform.toUpperCase()}</span>
              </div>

              <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "8px" }}>
                <table style={{ width: "100%", fontSize: "11.5px", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(0,0,0,0.03)", borderBottom: "1px solid var(--border)" }}>
                      <th style={{ padding: "6px 10px", textAlign: "left" }}>Date</th>
                      <th style={{ padding: "6px 10px", textAlign: "left" }}>Campaign</th>
                      <th style={{ padding: "6px 10px", textAlign: "right" }}>Spend</th>
                      <th style={{ padding: "6px 10px", textAlign: "right" }}>Clicks</th>
                      <th style={{ padding: "6px 10px", textAlign: "right" }}>Leads</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 3).map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "6px 10px" }}>{r[columnMapping.date]}</td>
                        <td style={{ padding: "6px 10px", fontWeight: 600 }}>{r[columnMapping.campaignName]}</td>
                        <td style={{ padding: "6px 10px", textAlign: "right" }}>₹{r[columnMapping.spend]}</td>
                        <td style={{ padding: "6px 10px", textAlign: "right" }}>{r[columnMapping.clicks] || "-"}</td>
                        <td style={{ padding: "6px 10px", textAlign: "right" }}>{r[columnMapping.leads] || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 4: SUMMARY */}
          {step === "summary" && (
            <div className="bl-import-step-summary" style={{ textAlign: "center", padding: "20px 0" }}>
              <CheckCircle size={40} style={{ color: "var(--color-success)", margin: "0 auto 12px" }} />
              <h4 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>Import Complete!</h4>
              <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "var(--muted)" }}>
                Successfully processed <strong>{importedCount}</strong> performance metric records without duplicating overlapping dates.
              </p>
            </div>
          )}
        </div>

        <div className="bl-modal-footer bl-between" style={{ padding: "12px 20px" }}>
          {step === "upload" && (
            <>
              <button type="button" className="bl-secondary bl-btn-sm" onClick={onClose}>
                Cancel
              </button>
              <div />
            </>
          )}

          {step === "map" && (
            <>
              <button type="button" className="bl-secondary bl-btn-sm" onClick={() => setStep("upload")}>
                Back
              </button>
              <button type="button" className="bl-accent bl-btn-sm bl-primary-btn" onClick={handleValidateAndPreview}>
                Next: Preview Rows <ArrowRight size={13} />
              </button>
            </>
          )}

          {step === "preview" && (
            <>
              <button type="button" className="bl-secondary bl-btn-sm" onClick={() => setStep("map")}>
                Back
              </button>
              <button type="button" className="bl-accent bl-btn-sm bl-primary-btn" onClick={handleConfirmImport}>
                Confirm & Import {parsedRows.length} Rows
              </button>
            </>
          )}

          {step === "summary" && (
            <button
              type="button"
              className="bl-accent bl-btn-sm bl-primary-btn"
              style={{ marginLeft: "auto" }}
              onClick={onClose}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
