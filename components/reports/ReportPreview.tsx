"use client";

import React from "react";
import { CampaignPerformanceItem, formatINR, formatLakhs } from "../crm/selectors";
import {
  formatMetricCurrency,
  formatMetricPercent,
  formatMetricNumber,
} from "../analytics/metricCalculators";
import { Award, TrendingUp, Calendar, CheckCircle2, Shield } from "lucide-react";

interface ReportPreviewProps {
  title: string;
  clientName: string;
  preparedBy: string;
  dateRangeLabel: string;
  executiveSummary: string;
  campaigns: CampaignPerformanceItem[];
  hideBudget: boolean;
  recommendations: string[];
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  title,
  clientName,
  preparedBy,
  dateRangeLabel,
  executiveSummary,
  campaigns,
  hideBudget,
  recommendations,
}) => {
  // Calculate report totals
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + c.crmLeads, 0);
  const totalQualified = campaigns.reduce((sum, c) => sum + c.qualifiedLeads, 0);
  const totalWonValue = campaigns.reduce((sum, c) => sum + c.wonValue, 0);
  const totalWonCustomers = campaigns.reduce((sum, c) => sum + c.wonCustomers, 0);

  const overallCTR =
    totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
  const overallCPL = totalLeads > 0 ? Number((totalSpend / totalLeads).toFixed(2)) : 0;
  const overallROAS = totalSpend > 0 ? Number((totalWonValue / totalSpend).toFixed(2)) : 0;

  return (
    <div className="bl-report-paper bg-card text-card-foreground border rounded-xl shadow-lg p-8 sm:p-12 max-w-4xl mx-auto my-6 print:m-0 print:p-6 print:shadow-none print:border-none print:max-w-none">
      {/* Report Header */}
      <div className="border-b pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tight text-foreground">
              BIZ<span className="text-primary">LEAD</span>
            </span>
            <span className="text-xs text-muted-foreground border-l pl-3 py-0.5">
              Marketing Performance Report
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            The Intelligence Behind Growth.
          </div>
        </div>

        <div className="text-left sm:text-right text-xs space-y-1">
          <div>
            <span className="text-muted-foreground">Client: </span>
            <span className="font-semibold text-foreground">{clientName || "Enterprise Partner"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Period: </span>
            <span className="font-medium text-foreground">{dateRangeLabel}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Prepared By: </span>
            <span className="font-medium text-foreground">{preparedBy || "Growth Strategy Team"}</span>
          </div>
        </div>
      </div>

      {/* Report Title */}
      <div className="py-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {title || "Campaign Performance & Revenue Intelligence Brief"}
        </h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-line">
          {executiveSummary ||
            "This report summarizes multi-channel digital acquisition performance, audience engagement metrics, CRM lead qualification, and closed-loop deal attribution."}
        </p>
      </div>

      {/* Executive Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl border bg-muted/30">
          <div className="text-[11px] uppercase font-semibold text-muted-foreground">
            Attributed Won Value
          </div>
          <div className="text-xl font-bold text-emerald-500 mt-1">
            {formatLakhs(totalWonValue)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {totalWonCustomers} closed {totalWonCustomers === 1 ? "deal" : "deals"}
          </div>
        </div>

        {!hideBudget ? (
          <div className="p-4 rounded-xl border bg-muted/30">
            <div className="text-[11px] uppercase font-semibold text-muted-foreground">
              Total Ad Spend
            </div>
            <div className="text-xl font-bold text-foreground mt-1">
              {formatINR(totalSpend)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              ROAS: {overallROAS}x
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border bg-muted/30">
            <div className="text-[11px] uppercase font-semibold text-muted-foreground">
              Total Impressions
            </div>
            <div className="text-xl font-bold text-foreground mt-1">
              {formatMetricNumber(totalImpressions)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              CTR: {overallCTR}%
            </div>
          </div>
        )}

        <div className="p-4 rounded-xl border bg-muted/30">
          <div className="text-[11px] uppercase font-semibold text-muted-foreground">
            CRM Captured Leads
          </div>
          <div className="text-xl font-bold text-foreground mt-1">
            {totalLeads}
          </div>
          <div className="text-[11px] text-emerald-500 font-medium mt-0.5">
            {totalQualified} Qualified ({totalLeads > 0 ? Math.round((totalQualified / totalLeads) * 100) : 0}%)
          </div>
        </div>

        {!hideBudget ? (
          <div className="p-4 rounded-xl border bg-muted/30">
            <div className="text-[11px] uppercase font-semibold text-muted-foreground">
              Cost Per Lead (CPL)
            </div>
            <div className="text-xl font-bold text-foreground mt-1">
              ₹{overallCPL.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Blended across paid channels
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border bg-muted/30">
            <div className="text-[11px] uppercase font-semibold text-muted-foreground">
              Qualified Rate
            </div>
            <div className="text-xl font-bold text-foreground mt-1">
              {totalLeads > 0 ? Math.round((totalQualified / totalLeads) * 100) : 0}%
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Sales-accepted leads
            </div>
          </div>
        )}
      </div>

      {/* Campaign Performance Table */}
      <div className="mb-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Campaign-Level Breakdown
        </h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/50 font-semibold uppercase text-muted-foreground">
                <th className="py-2.5 px-3">Campaign</th>
                <th className="py-2.5 px-2">Platform</th>
                {!hideBudget && <th className="py-2.5 px-2 text-right">Spend</th>}
                <th className="py-2.5 px-2 text-right">Clicks</th>
                <th className="py-2.5 px-2 text-right">CTR</th>
                <th className="py-2.5 px-2 text-right">Leads</th>
                <th className="py-2.5 px-2 text-right">Qualified</th>
                <th className="py-2.5 px-3 text-right">Attributed Won</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-muted/20">
                  <td className="py-2.5 px-3 font-medium text-foreground">
                    {camp.name}
                  </td>
                  <td className="py-2.5 px-2 uppercase text-muted-foreground">
                    {camp.platform}
                  </td>
                  {!hideBudget && (
                    <td className="py-2.5 px-2 text-right font-medium text-foreground">
                      {formatINR(camp.spend)}
                    </td>
                  )}
                  <td className="py-2.5 px-2 text-right text-muted-foreground">
                    {formatMetricNumber(camp.clicks)}
                  </td>
                  <td className="py-2.5 px-2 text-right font-medium">
                    {formatMetricPercent(camp.ctr)}
                  </td>
                  <td className="py-2.5 px-2 text-right font-medium">
                    {camp.crmLeads}
                  </td>
                  <td className="py-2.5 px-2 text-right text-emerald-500 font-semibold">
                    {camp.qualifiedLeads}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-500">
                    {camp.wonValue > 0 ? formatLakhs(camp.wonValue) : "₹0"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Recommendations / Next Actions */}
      {recommendations.length > 0 && (
        <div className="p-5 rounded-xl border bg-muted/20 mb-8 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Key Takeaways & Strategic Next Steps</span>
          </h3>
          <ul className="text-xs space-y-1.5 text-muted-foreground list-disc list-inside">
            {recommendations.map((rec, i) => (
              <li key={i} className="leading-relaxed">
                <span className="text-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Report Footer */}
      <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
        <span>Confidential & Proprietary · Prepared with BizLead Revenue OS</span>
        <span>Generated on {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
      </div>
    </div>
  );
};
