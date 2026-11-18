"use client";

import React, { useState, useMemo } from "react";
import { useCRM } from "../crm/CRMProvider";
import { selectCampaignPerformanceList } from "../crm/selectors";
import { ReportPreview } from "./ReportPreview";
import {
  FileText,
  Printer,
  Download,
  Eye,
  EyeOff,
  Sparkles,
  CheckSquare,
  Square,
  Settings,
  HelpCircle,
} from "lucide-react";

export const ReportBuilder: React.FC = () => {
  const { campaigns, dailyMetrics, leads, deals, touchpoints } = useCRM();

  const performanceList = useMemo(() => {
    return selectCampaignPerformanceList(
      campaigns,
      dailyMetrics,
      leads,
      deals,
      touchpoints
    );
  }, [campaigns, dailyMetrics, leads, deals, touchpoints]);

  // Report config state
  const [template, setTemplate] = useState<string>("executive_summary");
  const [title, setTitle] = useState("Q3 Marketing Performance & Closed-Loop Attribution Report");
  const [clientName, setClientName] = useState("Titan Retail Ventures");
  const [preparedBy, setPreparedBy] = useState("BizLead Growth Advisory");
  const [dateRangeLabel, setDateRangeLabel] = useState("Jul 1, 2026 – Sep 30, 2026");
  const [hideBudget, setHideBudget] = useState(false);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<Set<string>>(
    new Set(campaigns.map((c) => c.id))
  );

  const [executiveSummary, setExecutiveSummary] = useState(
    "During this reporting cycle, paid and organic acquisition generated ₹84.5L in closed-loop won deal value. Meta Ads delivered the highest lead qualification rate at 62%, while Google Performance Max secured the highest average deal value. We recommend reallocating 20% of underperforming budget to scale top-performing creative variants."
  );

  const [recommendations, setRecommendations] = useState<string[]>([
    "Scale ad budget on 'Meta Ads — Founder Masterclass' by ₹25,000/month given its 62% lead qualification rate.",
    "Pause low-intent Google Ads display placements to reduce blended cost per qualified lead.",
    "Integrate automated WhatsApp instant booking for inbound leads to accelerate first-response time.",
  ]);

  // Handle template selection
  const handleSelectTemplate = (t: string) => {
    setTemplate(t);
    if (t === "executive_summary") {
      setTitle("Q3 Marketing Performance & Closed-Loop Attribution Report");
      setExecutiveSummary(
        "During this reporting cycle, paid and organic acquisition generated substantial closed deal value. Multi-touch attribution connects paid ad engagement directly to downstream CRM pipeline milestones."
      );
    } else if (t === "monthly_roi") {
      setTitle("Monthly Digital Marketing ROI & Growth Analysis");
      setExecutiveSummary(
        "A detailed monthly breakdown of channel spend, audience reach, conversion velocity, and closed customer acquisition costs."
      );
    } else if (t === "lead_quality") {
      setTitle("Lead Quality Disposition & Channel Attribution Audit");
      setExecutiveSummary(
        "Evaluation of sales team qualification rates across lead sources. This audit isolates vanity volume from genuine enterprise buying intent."
      );
    }
  };

  const toggleCampaign = (id: string) => {
    const next = new Set(selectedCampaignIds);
    if (next.has(id)) {
      if (next.size > 1) next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedCampaignIds(next);
  };

  const filteredCampaigns = performanceList.filter((c) =>
    selectedCampaignIds.has(c.id)
  );

  // Print Handler
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = hideBudget
      ? ["Campaign", "Platform", "Impressions", "Clicks", "CTR", "CRM Leads", "Qualified Leads", "Won Customers", "Attributed Won Value"]
      : ["Campaign", "Platform", "Spend", "Impressions", "Clicks", "CTR", "CRM Leads", "Qualified Leads", "CPL", "CPQL", "Won Customers", "Attributed Won Value", "ROAS"];

    const rows = filteredCampaigns.map((c) => {
      const escape = (str: string | number) => `"${String(str).replace(/"/g, '""')}"`;
      if (hideBudget) {
        return [
          escape(c.name),
          escape(c.platform),
          c.impressions,
          c.clicks,
          c.ctr !== null ? `${c.ctr}%` : "N/A",
          c.crmLeads,
          c.qualifiedLeads,
          c.wonCustomers,
          c.wonValue,
        ].join(",");
      } else {
        return [
          escape(c.name),
          escape(c.platform),
          c.spend,
          c.impressions,
          c.clicks,
          c.ctr !== null ? `${c.ctr}%` : "N/A",
          c.crmLeads,
          c.qualifiedLeads,
          c.cpl !== null ? c.cpl : "N/A",
          c.cpql !== null ? c.cpql : "N/A",
          c.wonCustomers,
          c.wonValue,
          c.valueToSpend !== null ? `${c.valueToSpend}x` : "N/A",
        ].join(",");
      }
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BizLead_Report_${clientName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner (hidden during browser print) */}
      <div className="print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Performance, made clear.
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Report Studio
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Client-ready A4 reports, closed-loop attribution summaries, and agency margin protection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border bg-card text-foreground hover:bg-muted text-xs font-semibold transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="mt-6 p-5 rounded-xl border bg-card text-card-foreground shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              <span>Report Customization & Agency Controls</span>
            </h3>

            {/* Hide Budget Toggle */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="hide-budget-toggle"
                className="text-xs font-medium text-foreground cursor-pointer flex items-center gap-1.5"
              >
                {hideBudget ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>Hide Budget & Spend Figures</span>
              </label>
              <input
                id="hide-budget-toggle"
                type="checkbox"
                checked={hideBudget}
                onChange={(e) => setHideBudget(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          {/* Pre-built Templates */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Select Report Template
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: "executive_summary", label: "Executive Summary", desc: "Holistic marketing & revenue briefing" },
                { id: "monthly_roi", label: "Monthly Marketing ROI", desc: "Spend, CPL, CPQL and closed deal return" },
                { id: "lead_quality", label: "Lead Quality Audit", desc: "Qualification rate and channel efficiency" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemplate(t.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    template === t.id
                      ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="font-semibold text-xs text-foreground">{t.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Report Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Report Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border bg-background text-foreground text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Client / Partner Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border bg-background text-foreground text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Prepared By</label>
              <input
                type="text"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border bg-background text-foreground text-xs"
              />
            </div>
          </div>

          {/* Campaign Inclusion Checkboxes */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Included Campaigns in this Report ({selectedCampaignIds.size} of {campaigns.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {campaigns.map((camp) => {
                const isSelected = selectedCampaignIds.has(camp.id);
                return (
                  <button
                    key={camp.id}
                    onClick={() => toggleCampaign(camp.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-colors ${
                      isSelected
                        ? "bg-primary/10 border-primary text-primary font-medium"
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                    <span>{camp.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Executive Summary Narrative */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Executive Commentary & Observations
            </label>
            <textarea
              rows={2}
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs resize-none"
            />
          </div>
        </div>
      </div>

      {/* Live Preview Container (Prints cleanly) */}
      <div className="print:p-0">
        <div className="print:hidden flex items-center justify-between text-xs text-muted-foreground mb-2 px-1">
          <span className="font-semibold uppercase tracking-wider">Live Document Preview (A4 Formatted)</span>
          <span>Click "Print / Save PDF" above to export</span>
        </div>

        <ReportPreview
          title={title}
          clientName={clientName}
          preparedBy={preparedBy}
          dateRangeLabel={dateRangeLabel}
          executiveSummary={executiveSummary}
          campaigns={filteredCampaigns}
          hideBudget={hideBudget}
          recommendations={recommendations}
        />
      </div>
    </div>
  );
};
