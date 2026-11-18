"use client";

import React, { useState, useMemo } from "react";
import { useCRM } from "../../../components/crm/CRMProvider";
import {
  selectCampaignPerformanceList,
  selectGrowthExecutiveMetrics,
  formatINR,
  formatLakhs,
} from "../../../components/crm/selectors";
import { CampaignMetrics } from "../../../components/marketing/CampaignMetrics";
import { CampaignGrid } from "../../../components/marketing/CampaignGrid";
import { CampaignTable } from "../../../components/marketing/CampaignTable";
import { UTMBuilder } from "../../../components/marketing/UTMBuilder";
import { CampaignImportWizard } from "../../../components/marketing/CampaignImportWizard";
import { AdvertisingIntegrationCenter } from "../../../components/marketing/AdvertisingIntegrationCenter";
import { BudgetTracker } from "../../../components/marketing/BudgetTracker";
import {
  Plus,
  Upload,
  Link as LinkIcon,
  Search,
  Filter,
  LayoutGrid,
  List,
  Layers,
  Sparkles,
  Share2,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function CampaignsPage() {
  const {
    campaigns,
    dailyMetrics,
    leads,
    deals,
    touchpoints,
    openCampaignDrawer,
    importDailyMetrics,
  } = useCRM();

  // View state
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showBudgetTracker, setShowBudgetTracker] = useState(false);

  // Modals state
  const [isUTMOpen, setIsUTMOpen] = useState(false);
  const [selectedUTMCampaign, setSelectedUTMCampaign] = useState<any>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isIntegrationOpen, setIsIntegrationOpen] = useState(false);

  // Selector data
  const performanceList = useMemo(() => {
    return selectCampaignPerformanceList(
      campaigns,
      dailyMetrics,
      leads,
      deals,
      touchpoints
    );
  }, [campaigns, dailyMetrics, leads, deals, touchpoints]);

  const executiveMetrics = useMemo(() => {
    return selectGrowthExecutiveMetrics(
      campaigns,
      dailyMetrics,
      leads,
      deals,
      touchpoints
    );
  }, [campaigns, dailyMetrics, leads, deals, touchpoints]);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return performanceList.filter((camp) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = camp.name.toLowerCase().includes(q);
        const matchesAcc = (camp.accountName || "").toLowerCase().includes(q);
        const matchesObj = camp.objective.toLowerCase().includes(q);
        if (!matchesName && !matchesAcc && !matchesObj) return false;
      }
      if (platformFilter !== "all" && camp.platform !== platformFilter) return false;
      if (statusFilter !== "all" && camp.status !== statusFilter) return false;
      return true;
    });
  }, [performanceList, searchQuery, platformFilter, statusFilter]);

  const handleOpenUTM = (camp: any) => {
    setSelectedUTMCampaign(camp);
    setIsUTMOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Every campaign counts.
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Campaign Manager
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Cross-channel marketing performance bridging ad impressions, spend, CRM leads, and won deal revenue.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsIntegrationOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-card text-foreground hover:bg-muted text-xs font-semibold transition-colors shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Integrations</span>
          </button>

          <button
            onClick={() => {
              setSelectedUTMCampaign(null);
              setIsUTMOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-card text-foreground hover:bg-muted text-xs font-semibold transition-colors shadow-xs"
          >
            <LinkIcon className="w-3.5 h-3.5 text-primary" />
            <span>UTM Builder</span>
          </button>

          <button
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-card text-foreground hover:bg-muted text-xs font-semibold transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-primary" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => openCampaignDrawer()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <CampaignMetrics metrics={executiveMetrics} />

      {/* Budget Tracker Accordion */}
      <div className="border rounded-xl bg-card overflow-hidden">
        <button
          onClick={() => setShowBudgetTracker(!showBudgetTracker)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="font-semibold text-xs uppercase tracking-wider text-foreground">
              Budget & Pacing Intelligence
            </span>
          </div>
          <span className="text-xs text-primary font-medium">
            {showBudgetTracker ? "Collapse" : "Expand Budget Tracker"}
          </span>
        </button>
        {showBudgetTracker && (
          <div className="p-4 border-t bg-muted/10">
            <BudgetTracker campaigns={performanceList} />
          </div>
        )}
      </div>

      {/* Filters and View Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns, objectives, accounts..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border bg-background text-foreground text-xs"
          >
            <option value="all">All Platforms</option>
            <option value="meta">Meta Ads</option>
            <option value="google">Google Ads</option>
            <option value="linkedin">LinkedIn</option>
            <option value="organic">Organic / Direct</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border bg-background text-foreground text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-1 rounded-lg bg-muted border text-xs self-end sm:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "table"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Campaigns Listing */}
      {viewMode === "grid" ? (
        <CampaignGrid
          campaigns={filteredCampaigns}
          onSelectCampaign={(id) => openCampaignDrawer(id)}
          onEditCampaign={(id) => openCampaignDrawer(id)}
          onOpenUTMBuilder={handleOpenUTM}
        />
      ) : (
        <CampaignTable
          campaigns={filteredCampaigns}
          onSelectCampaign={(id) => openCampaignDrawer(id)}
          onEditCampaign={(id) => openCampaignDrawer(id)}
          onOpenUTMBuilder={handleOpenUTM}
        />
      )}

      {/* Modals */}
      <UTMBuilder
        isOpen={isUTMOpen}
        onClose={() => setIsUTMOpen(false)}
        initialCampaign={selectedUTMCampaign}
      />

      <CampaignImportWizard
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        campaigns={campaigns}
        onImportSuccess={(metrics) => {
          importDailyMetrics(metrics);
        }}
      />

      <AdvertisingIntegrationCenter
        isOpen={isIntegrationOpen}
        onClose={() => setIsIntegrationOpen(false)}
      />
    </div>
  );
}
