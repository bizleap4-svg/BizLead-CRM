"use client";

import React, { useState, useMemo } from "react";
import { CampaignPerformanceItem, formatINR, formatLakhs } from "../crm/selectors";
import {
  formatMetricCurrency,
  formatMetricPercent,
  formatMetricNumber,
} from "../analytics/metricCalculators";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Edit2,
  Share2,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

interface CampaignTableProps {
  campaigns: CampaignPerformanceItem[];
  onSelectCampaign: (campaignId: string) => void;
  onEditCampaign: (campaignId: string) => void;
  onOpenUTMBuilder: (campaign: CampaignPerformanceItem) => void;
  hideBudget?: boolean;
}

type SortField =
  | "name"
  | "platform"
  | "spend"
  | "impressions"
  | "clicks"
  | "ctr"
  | "crmLeads"
  | "qualifiedLeads"
  | "cpl"
  | "cpql"
  | "wonValue"
  | "valueToSpend";

export const CampaignTable: React.FC<CampaignTableProps> = ({
  campaigns,
  onSelectCampaign,
  onEditCampaign,
  onOpenUTMBuilder,
  hideBudget = false,
}) => {
  const [sortField, setSortField] = useState<SortField>("spend");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sortedCampaigns = useMemo(() => {
    return [...campaigns].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (aVal === null || aVal === undefined) aVal = -1;
      if (bVal === null || bVal === undefined) bVal = -1;

      if (typeof aVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [campaigns, sortField, sortDir]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />;
    }
    return sortDir === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-primary" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-primary" />
    );
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th
                onClick={() => handleSort("name")}
                className="py-3 px-4 cursor-pointer hover:text-foreground group select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Campaign</span>
                  {renderSortIcon("name")}
                </div>
              </th>
              <th
                onClick={() => handleSort("platform")}
                className="py-3 px-3 cursor-pointer hover:text-foreground group select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Platform</span>
                  {renderSortIcon("platform")}
                </div>
              </th>
              {!hideBudget && (
                <th
                  onClick={() => handleSort("spend")}
                  className="py-3 px-3 text-right cursor-pointer hover:text-foreground group select-none"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Spend</span>
                    {renderSortIcon("spend")}
                  </div>
                </th>
              )}
              <th
                onClick={() => handleSort("impressions")}
                className="py-3 px-3 text-right cursor-pointer hover:text-foreground group select-none"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Impressions</span>
                  {renderSortIcon("impressions")}
                </div>
              </th>
              <th
                onClick={() => handleSort("clicks")}
                className="py-3 px-3 text-right cursor-pointer hover:text-foreground group select-none"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Clicks</span>
                  {renderSortIcon("clicks")}
                </div>
              </th>
              <th
                onClick={() => handleSort("ctr")}
                className="py-3 px-3 text-right cursor-pointer hover:text-foreground group select-none"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>CTR</span>
                  {renderSortIcon("ctr")}
                </div>
              </th>
              <th
                onClick={() => handleSort("crmLeads")}
                className="py-3 px-3 text-right cursor-pointer hover:text-foreground group select-none"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Leads (QL)</span>
                  {renderSortIcon("crmLeads")}
                </div>
              </th>
              {!hideBudget && (
                <th
                  onClick={() => handleSort("cpl")}
                  className="py-3 px-3 text-right cursor-pointer hover:text-foreground group select-none"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>CPL</span>
                    {renderSortIcon("cpl")}
                  </div>
                </th>
              )}
              {!hideBudget && (
                <th
                  onClick={() => handleSort("cpql")}
                  className="py-3 px-3 text-right cursor-pointer hover:text-foreground group select-none"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>CPQL</span>
                    {renderSortIcon("cpql")}
                  </div>
                </th>
              )}
              <th
                onClick={() => handleSort("wonValue")}
                className="py-3 px-3 text-right cursor-pointer hover:text-foreground group select-none"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Attributed Won</span>
                  {renderSortIcon("wonValue")}
                </div>
              </th>
              {!hideBudget && (
                <th
                  onClick={() => handleSort("valueToSpend")}
                  className="py-3 px-3 text-right cursor-pointer hover:text-foreground group select-none"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>ROAS</span>
                    {renderSortIcon("valueToSpend")}
                  </div>
                </th>
              )}
              <th className="py-3 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedCampaigns.map((camp) => (
              <tr
                key={camp.id}
                className="hover:bg-muted/40 transition-colors group"
              >
                {/* Campaign name + status */}
                <td className="py-3 px-4">
                  <div
                    onClick={() => onSelectCampaign(camp.id)}
                    className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    {camp.name}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span className="capitalize">{camp.status}</span>
                    <span>·</span>
                    <span>{camp.objective.replace("_", " ")}</span>
                  </div>
                </td>

                {/* Platform */}
                <td className="py-3 px-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted border text-muted-foreground uppercase">
                    {camp.platform}
                  </span>
                </td>

                {/* Spend */}
                {!hideBudget && (
                  <td className="py-3 px-3 text-right font-medium text-foreground">
                    {formatINR(camp.spend)}
                  </td>
                )}

                {/* Impressions */}
                <td className="py-3 px-3 text-right text-muted-foreground">
                  {formatMetricNumber(camp.impressions)}
                </td>

                {/* Clicks */}
                <td className="py-3 px-3 text-right text-muted-foreground">
                  {formatMetricNumber(camp.clicks)}
                </td>

                {/* CTR */}
                <td className="py-3 px-3 text-right font-medium text-foreground">
                  {formatMetricPercent(camp.ctr)}
                </td>

                {/* CRM Leads (Qualified) */}
                <td className="py-3 px-3 text-right font-medium text-foreground">
                  <span>{camp.crmLeads}</span>
                  <span className="text-xs text-emerald-500 ml-1">({camp.qualifiedLeads})</span>
                </td>

                {/* CPL */}
                {!hideBudget && (
                  <td className="py-3 px-3 text-right text-muted-foreground">
                    {formatMetricCurrency(camp.cpl)}
                  </td>
                )}

                {/* CPQL */}
                {!hideBudget && (
                  <td className="py-3 px-3 text-right text-muted-foreground">
                    {formatMetricCurrency(camp.cpql)}
                  </td>
                )}

                {/* Attributed Won Value */}
                <td className="py-3 px-3 text-right font-semibold text-emerald-500">
                  {camp.wonValue > 0 ? formatLakhs(camp.wonValue) : "₹0"}
                </td>

                {/* ROAS / Value-to-Spend */}
                {!hideBudget && (
                  <td className="py-3 px-3 text-right font-bold text-foreground">
                    {camp.valueToSpend !== null ? `${camp.valueToSpend}x` : "N/A"}
                  </td>
                )}

                {/* Actions */}
                <td className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onOpenUTMBuilder(camp)}
                      title="UTM Builder"
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditCampaign(camp.id)}
                      title="Edit Campaign"
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectCampaign(camp.id)}
                      title="View Details"
                      className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
