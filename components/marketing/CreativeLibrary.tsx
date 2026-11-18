"use client";

import React, { useState } from "react";
import { useCRM } from "../crm/CRMProvider";
import { AdCreative } from "../crm/types";
import { formatINR } from "../crm/selectors";
import { formatMetricNumber, formatMetricPercent, calculateCTR } from "../analytics/metricCalculators";
import {
  Image as ImageIcon,
  Video,
  Layers,
  FileText,
  Plus,
  ExternalLink,
  Sparkles,
  Eye,
  MousePointer,
  CheckCircle,
  PauseCircle,
  X,
} from "lucide-react";

export const CreativeLibrary: React.FC = () => {
  const { creatives, campaigns, createCreative } = useCRM();
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCampaign, setFilterCampaign] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New creative form state
  const [name, setName] = useState("");
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id || "");
  const [creativeType, setCreativeType] = useState<"image" | "video" | "carousel" | "text">("image");
  const [headline, setHeadline] = useState("");
  const [primaryText, setPrimaryText] = useState("");
  const [cta, setCta] = useState("Book Free Demo");
  const [landingPageUrl, setLandingPageUrl] = useState("https://bizlead.io/demo");
  const [thumbnailUrl, setThumbnailUrl] = useState("https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80");

  const filteredCreatives = creatives.filter((c) => {
    if (filterType !== "all" && c.creativeType !== filterType) return false;
    if (filterCampaign !== "all" && c.campaignId !== filterCampaign) return false;
    return true;
  });

  const getCreativeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "carousel":
        return <Layers className="w-4 h-4" />;
      case "text":
        return <FileText className="w-4 h-4" />;
      default:
        return <ImageIcon className="w-4 h-4" />;
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !campaignId) return;

    createCreative({
      name,
      campaignId,
      creativeType,
      headline: headline || "Stop Lead Leakage with BizLead AI CRM",
      primaryText: primaryText || "Auto-assign incoming leads, send WhatsApp sequences, and double pipeline conversions.",
      cta,
      landingPageUrl,
      thumbnailUrl,
      status: "active",
      metrics: {
        impressions: 0,
        clicks: 0,
        spend: 0,
        leads: 0,
      },
    });

    setIsAddModalOpen(false);
    setName("");
    setHeadline("");
    setPrimaryText("");
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Creative Asset Library</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cross-platform ad creatives, copy variants, visual assets, and creative-level attribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Campaign Filter */}
          <select
            value={filterCampaign}
            onChange={(e) => setFilterCampaign(e.target.value)}
            className="px-3 py-1.5 rounded-lg border bg-background text-foreground text-xs"
          >
            <option value="all">All Campaigns</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-lg border bg-background text-foreground text-xs"
          >
            <option value="all">All Formats</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="carousel">Carousel</option>
            <option value="text">Text / Copy</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Creative</span>
          </button>
        </div>
      </div>

      {/* Creatives Grid */}
      {filteredCreatives.length === 0 ? (
        <div className="p-12 text-center rounded-xl border bg-card text-card-foreground">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <h4 className="text-base font-medium">No creatives found</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Add ad copies or images to start measuring creative fatigue and CTR.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCreatives.map((creative) => {
            const camp = campaigns.find((c) => c.id === creative.campaignId);
            const ctr =
              creative.metrics && creative.metrics.impressions > 0
                ? calculateCTR(creative.metrics.clicks, creative.metrics.impressions)
                : null;

            return (
              <div
                key={creative.id}
                className="rounded-xl border bg-card text-card-foreground overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Creative Thumbnail / Visual */}
                  <div className="relative aspect-video w-full bg-muted overflow-hidden flex items-center justify-center">
                    {creative.thumbnailUrl ? (
                      <img
                        src={creative.thumbnailUrl}
                        alt={creative.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        {getCreativeIcon(creative.creativeType)}
                        <span className="text-xs mt-1 capitalize">{creative.creativeType} Creative</span>
                      </div>
                    )}

                    {/* Format Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-black/70 text-white backdrop-blur-xs">
                      {getCreativeIcon(creative.creativeType)}
                      <span className="capitalize">{creative.creativeType}</span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize ${
                          creative.status === "active"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {creative.status}
                      </span>
                    </div>
                  </div>

                  {/* Creative Content Details */}
                  <div className="p-4">
                    <div className="text-[11px] text-muted-foreground font-medium mb-1 line-clamp-1">
                      Campaign: {camp?.name || "Direct Asset"}
                    </div>

                    <h4 className="font-semibold text-foreground text-sm tracking-tight line-clamp-1">
                      {creative.name}
                    </h4>

                    <p className="text-xs font-medium text-primary mt-1 line-clamp-1">
                      "{creative.headline}"
                    </p>

                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {creative.primaryText}
                    </p>

                    {/* CTA Button Mock */}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">CTA Button:</span>
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-muted border text-foreground">
                        {creative.cta}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Creative Metrics Footer */}
                {creative.metrics && (
                  <div className="p-3 bg-muted/40 border-t border-border grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-muted-foreground">Impr.</div>
                      <div className="font-semibold text-foreground mt-0.5">
                        {formatMetricNumber(creative.metrics.impressions)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">Clicks</div>
                      <div className="font-semibold text-foreground mt-0.5">
                        {formatMetricNumber(creative.metrics.clicks)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">CTR</div>
                      <div className="font-semibold text-primary mt-0.5">
                        {formatMetricPercent(ctr)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">Leads</div>
                      <div className="font-semibold text-emerald-500 mt-0.5">
                        {creative.metrics.leads}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Creative Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-foreground text-base">Add New Ad Creative</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Creative Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Founder Pain Hook — Video 01"
                  className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Linked Campaign *
                  </label>
                  <select
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm"
                  >
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Format</label>
                  <select
                    value={creativeType}
                    onChange={(e) =>
                      setCreativeType(e.target.value as "image" | "video" | "carousel" | "text")
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm"
                  >
                    <option value="image">Static Image</option>
                    <option value="video">Short Video / Reel</option>
                    <option value="carousel">Carousel</option>
                    <option value="text">Copy / Text Ad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Stop Losing 60% of Your Paid Leads"
                  className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Primary Text / Copy</label>
                <textarea
                  rows={2}
                  value={primaryText}
                  onChange={(e) => setPrimaryText(e.target.value)}
                  placeholder="The first 3 lines of your ad copy..."
                  className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">CTA Button</label>
                  <input
                    type="text"
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    placeholder="Book Demo / Learn More"
                    className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Thumbnail URL</label>
                  <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
                >
                  Save Creative
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
