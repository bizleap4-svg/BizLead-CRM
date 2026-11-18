"use client";

import React, { useState, useEffect } from "react";
import { useCRM } from "../crm/CRMProvider";
import {
  MarketingCampaign,
  MarketingPlatform,
  CampaignObjective,
  CampaignStatus,
  BudgetType,
} from "../crm/types";
import { X, Sparkles, AlertCircle, Save, Calendar, Globe, DollarSign, Tag } from "lucide-react";

interface CampaignDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: string | null;
}

export const CampaignDrawer: React.FC<CampaignDrawerProps> = ({
  isOpen,
  onClose,
  campaignId,
}) => {
  const { campaigns, createCampaign, updateCampaign } = useCRM();

  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<MarketingPlatform>("meta");
  const [accountName, setAccountName] = useState("BizLead Growth Account");
  const [objective, setObjective] = useState<CampaignObjective>("lead_generation");
  const [status, setStatus] = useState<CampaignStatus>("active");
  const [budgetType, setBudgetType] = useState<BudgetType>("lifetime");
  const [plannedBudget, setPlannedBudget] = useState(50000);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [landingPageUrl, setLandingPageUrl] = useState("https://bizlead.io/growth");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [targetLocation, setTargetLocation] = useState("India (Top Metros)");
  const [targetAudience, setTargetAudience] = useState("B2B Founders, Marketing Directors, Sales VPs");
  const [tags, setTags] = useState<string[]>(["b2b", "performance"]);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // If editing, populate state
  useEffect(() => {
    if (campaignId) {
      const camp = campaigns.find((c) => c.id === campaignId);
      if (camp) {
        setName(camp.name);
        setPlatform(camp.platform);
        setAccountName(camp.accountName || "BizLead Growth Account");
        setObjective(camp.objective);
        setStatus(camp.status);
        setBudgetType(camp.budgetType || "lifetime");
        setPlannedBudget(camp.plannedBudget || camp.budget || 50000);
        setStartDate(camp.startDate || new Date().toISOString().split("T")[0]);
        setEndDate(camp.endDate || "");
        setLandingPageUrl(camp.landingPageUrl || "https://bizlead.io/growth");
        setUtmSource(camp.utmParameters?.source || "");
        setUtmMedium(camp.utmParameters?.medium || "");
        setUtmCampaign(camp.utmParameters?.campaign || camp.utmCampaign || "");
        setTargetLocation(camp.targetLocation || "");
        setTargetAudience(camp.targetAudience || "");
        setTags(camp.tags || []);
        setNotes(camp.notes || "");
      }
    } else {
      // Reset for create
      setName("");
      setPlatform("meta");
      setAccountName("BizLead Growth Account");
      setObjective("lead_generation");
      setStatus("active");
      setBudgetType("lifetime");
      setPlannedBudget(50000);
      setStartDate(new Date().toISOString().split("T")[0]);
      setEndDate("");
      setLandingPageUrl("https://bizlead.io/growth");
      setUtmSource("meta");
      setUtmMedium("cpc");
      setUtmCampaign("");
      setTargetLocation("India (Tier 1 Metros)");
      setTargetAudience("B2B Founders, CEOs, Growth Heads");
      setTags(["q4_growth", "b2b"]);
      setNotes("");
      setError(null);
    }
  }, [campaignId, campaigns, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a campaign name");
      return;
    }
    if (plannedBudget <= 0) {
      setError("Budget must be greater than zero");
      return;
    }

    try {
      if (campaignId) {
        updateCampaign(campaignId, {
          name,
          platform,
          accountName,
          objective,
          status,
          budgetType,
          plannedBudget,
          budget: plannedBudget,
          startDate,
          endDate: endDate || undefined,
          landingPageUrl,
          targetLocation,
          targetAudience,
          tags,
          notes,
          utmCampaign: utmCampaign || undefined,
          utmParameters: {
            source: utmSource || platform,
            medium: utmMedium || "cpc",
            campaign: utmCampaign || name.toLowerCase().replace(/\s+/g, "_"),
          },
        });
      } else {
        createCampaign({
          name,
          platform,
          accountId: `acc-${platform}-001`,
          accountName,
          objective,
          status,
          budgetType,
          plannedBudget,
          budget: plannedBudget,
          currency: "INR",
          startDate,
          endDate: endDate || undefined,
          owner: "Rahul Sharma",
          landingPageUrl,
          targetLocation,
          targetAudience,
          tags,
          notes,
          utmCampaign: utmCampaign || name.toLowerCase().replace(/\s+/g, "_"),
          utmParameters: {
            source: utmSource || platform,
            medium: utmMedium || "cpc",
            campaign: utmCampaign || name.toLowerCase().replace(/\s+/g, "_"),
          },
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save campaign");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl h-full bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {campaignId ? "Edit Campaign" : "New Marketing Campaign"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {campaignId
                ? "Update campaign configuration and attribution parameters."
                : "Create a cross-channel marketing campaign tracked to deals & revenue."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Campaign Name */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Campaign Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!utmCampaign) {
                  setUtmCampaign(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "_"));
                }
              }}
              placeholder="e.g. Q4 B2B SaaS Scale Meta Ads"
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Platform & Objective */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Platform *
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as MarketingPlatform)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="meta">Meta Ads (FB/IG)</option>
                <option value="google">Google Ads</option>
                <option value="linkedin">LinkedIn Ads</option>
                <option value="organic">Organic / Direct</option>
                <option value="website">Website Direct</option>
                <option value="email">Email Outreach</option>
                <option value="whatsapp">WhatsApp Broadcast</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Objective *
              </label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value as CampaignObjective)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="lead_generation">Lead Generation</option>
                <option value="conversions">Conversions / Purchases</option>
                <option value="traffic">Traffic / Website Visits</option>
                <option value="messages">Direct Messages / WhatsApp</option>
                <option value="brand_awareness">Brand Awareness</option>
                <option value="sales">Pipeline & Sales</option>
              </select>
            </div>
          </div>

          {/* Status & Account */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CampaignStatus)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="scheduled">Scheduled</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Account Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Budget & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Planned Budget (INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={plannedBudget}
                  onChange={(e) => setPlannedBudget(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Budget Type
              </label>
              <select
                value={budgetType}
                onChange={(e) => setBudgetType(e.target.value as BudgetType)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="lifetime">Lifetime Budget</option>
                <option value="daily">Daily Budget</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Landing Page URL */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Destination / Landing Page URL
            </label>
            <input
              type="url"
              value={landingPageUrl}
              onChange={(e) => setLandingPageUrl(e.target.value)}
              placeholder="https://bizlead.io/landing-page"
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Attribution UTM Parameters */}
          <div className="p-3.5 rounded-lg border bg-muted/30 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Attribution & UTM Parameters</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">utm_source</label>
                <input
                  type="text"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  placeholder={platform}
                  className="w-full px-2.5 py-1.5 rounded-md border bg-background text-foreground text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">utm_medium</label>
                <input
                  type="text"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  placeholder="cpc"
                  className="w-full px-2.5 py-1.5 rounded-md border bg-background text-foreground text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">utm_campaign</label>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  placeholder="campaign_slug"
                  className="w-full px-2.5 py-1.5 rounded-md border bg-background text-foreground text-xs"
                />
              </div>
            </div>
          </div>

          {/* Target Audience & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Target Location</label>
              <input
                type="text"
                value={targetLocation}
                onChange={(e) => setTargetLocation(e.target.value)}
                placeholder="India / Delhi NCR / Mumbai"
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Audience Segment</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="B2B Executives, Sales Leaders"
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-muted border text-foreground"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag and press Enter"
                className="flex-1 px-3 py-1.5 rounded-lg border bg-background text-foreground text-sm"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-lg border bg-muted text-foreground text-xs font-medium hover:bg-muted/80"
              >
                Add
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Strategy & Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key messaging angle, creative hook, and target customer persona..."
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          {/* Drawer Footer inside Form */}
          <div className="p-4 border-t border-border flex items-center justify-end gap-3 bg-muted/20 -mx-5 -mb-5 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border bg-background text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-campaign"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{campaignId ? "Update Campaign" : "Launch Campaign"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
