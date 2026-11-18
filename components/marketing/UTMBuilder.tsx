"use client";

import React, { useState, useMemo } from "react";
import {
  Link2,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Save,
  RotateCcw,
  X,
} from "lucide-react";
import { MarketingCampaign, MarketingPlatform } from "../crm/types";
import { useCRM } from "../crm/CRMProvider";

export interface UTMBuilderProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialCampaignId?: string;
  initialCampaign?: MarketingCampaign | null;
  onSaveToCampaign?: (campaignId: string, utmUrl: string) => void;
}

export function UTMBuilder({
  isOpen,
  onClose,
  initialCampaignId,
  initialCampaign,
  onSaveToCampaign,
}: UTMBuilderProps) {
  if (isOpen !== undefined && !isOpen) return null;

  const { campaigns } = useCRM();

  const activeCampId = initialCampaign?.id || initialCampaignId || "";
  const activeCamp = initialCampaign || (activeCampId ? campaigns.find((c) => c.id === activeCampId) : null);

  const [destinationUrl, setDestinationUrl] = useState(
    activeCamp?.landingPageUrl || "https://bizlead.io/demo-landing"
  );
  const [source, setSource] = useState<string>(activeCamp?.platform || "meta");
  const [medium, setMedium] = useState(activeCamp?.utmParameters?.medium || "cpc");
  const [campaignName, setCampaignName] = useState(
    activeCamp?.utmCampaign || activeCamp?.utmParameters?.campaign || (activeCamp ? activeCamp.name.toLowerCase().replace(/\s+/g, "_") : "q4_enterprise_growth")
  );
  const [content, setContent] = useState(activeCamp?.utmParameters?.content || "carousel_ad_v2");
  const [term, setTerm] = useState(activeCamp?.utmParameters?.term || "b2b_crm_india");
  const [selectedCampaignId, setSelectedCampaignId] = useState(activeCampId);
  const [copied, setCopied] = useState(false);

  // Platform presets
  const presets: { label: string; platform: MarketingPlatform; source: string; medium: string }[] = [
    { label: "Meta Ads (Facebook/Instagram)", platform: "meta", source: "meta", medium: "cpc" },
    { label: "Google Search Ads", platform: "google", source: "google", medium: "cpc" },
    { label: "LinkedIn Sponsored InMail", platform: "linkedin", source: "linkedin", medium: "cpc" },
    { label: "Instagram Bio / Story Link", platform: "instagram_organic", source: "instagram", medium: "organic" },
    { label: "Email Newsletter / Blast", platform: "email", source: "newsletter", medium: "email" },
    { label: "WhatsApp Broadcast", platform: "whatsapp", source: "whatsapp", medium: "direct" },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setSource(preset.source);
    setMedium(preset.medium);
  };

  // Build generated URL while preserving existing query parameters
  const generatedUrl = useMemo(() => {
    if (!destinationUrl.trim()) return "";
    try {
      let base = destinationUrl.trim();
      if (!base.startsWith("http://") && !base.startsWith("https://")) {
        base = "https://" + base;
      }
      const url = new URL(base);
      if (source.trim()) url.searchParams.set("utm_source", source.trim());
      if (medium.trim()) url.searchParams.set("utm_medium", medium.trim());
      if (campaignName.trim()) {
        url.searchParams.set(
          "utm_campaign",
          campaignName.trim().toLowerCase().replace(/\s+/g, "_")
        );
      }
      if (content.trim()) url.searchParams.set("utm_content", content.trim());
      if (term.trim()) url.searchParams.set("utm_term", term.trim());
      return url.toString();
    } catch {
      return "Invalid Destination URL";
    }
  }, [destinationUrl, source, medium, campaignName, content, term]);

  const handleCopy = () => {
    if (!generatedUrl || generatedUrl.startsWith("Invalid")) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCampaignSelect = (id: string) => {
    setSelectedCampaignId(id);
    const camp = campaigns.find((c) => c.id === id);
    if (camp) {
      setCampaignName(camp.name);
      if (camp.platform) setSource(camp.platform);
      if (camp.landingPageUrl) setDestinationUrl(camp.landingPageUrl);
    }
  };

  const contentNode = (
    <div className="bl-utm-builder-card">
      <div className="bl-utm-header bl-between">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="bl-icon-badge" style={{ background: "rgba(255, 225, 59, 0.15)", color: "var(--accent)" }}>
            <Link2 size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
              UTM Campaign Link Builder
            </h3>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
              Generate tracking links with standard acquisition parameters
            </p>
          </div>
        </div>

        {/* Presets Row */}
        <div className="bl-utm-presets">
          {presets.slice(0, 3).map((p) => (
            <button
              key={p.label}
              type="button"
              className="bl-secondary bl-btn-xs"
              onClick={() => applyPreset(p)}
            >
              {p.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="bl-utm-form-grid" style={{ marginTop: "16px" }}>
        {/* Destination URL */}
        <div className="bl-field-group">
          <label htmlFor="utm-dest-url">
            Destination / Landing Page URL <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="utm-dest-url"
            type="url"
            required
            placeholder="https://example.com/landing"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            className="bl-input"
          />
        </div>

        {/* Link to Campaign */}
        <div className="bl-field-group">
          <label htmlFor="utm-campaign-select">Link to Existing Campaign (Optional)</label>
          <select
            id="utm-campaign-select"
            value={selectedCampaignId}
            onChange={(e) => handleCampaignSelect(e.target.value)}
            className="bl-select"
          >
            <option value="">-- Choose Campaign --</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.platform.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Parameters Row */}
        <div className="bl-fields-row">
          <div className="bl-field-group" style={{ flex: 1 }}>
            <label htmlFor="utm-source">
              Campaign Source (utm_source) <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              id="utm-source"
              type="text"
              required
              placeholder="meta, google, linkedin, newsletter..."
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="bl-input"
            />
          </div>

          <div className="bl-field-group" style={{ flex: 1 }}>
            <label htmlFor="utm-medium">
              Campaign Medium (utm_medium) <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              id="utm-medium"
              type="text"
              required
              placeholder="cpc, organic, email, social..."
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              className="bl-input"
            />
          </div>
        </div>

        <div className="bl-fields-row">
          <div className="bl-field-group" style={{ flex: 1 }}>
            <label htmlFor="utm-campaign">Campaign Name (utm_campaign)</label>
            <input
              id="utm-campaign"
              type="text"
              placeholder="diwali_promo, enterprise_leadgen..."
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="bl-input"
            />
          </div>

          <div className="bl-field-group" style={{ flex: 1 }}>
            <label htmlFor="utm-content">Creative / Content (utm_content)</label>
            <input
              id="utm-content"
              type="text"
              placeholder="video_v1, hero_banner, cta_top..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bl-input"
            />
          </div>

          <div className="bl-field-group" style={{ flex: 1 }}>
            <label htmlFor="utm-term">Keyword / Term (utm_term)</label>
            <input
              id="utm-term"
              type="text"
              placeholder="crm_software, b2b_leads..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="bl-input"
            />
          </div>
        </div>
      </div>

      {/* Generated URL Box */}
      <div className="bl-utm-preview-box" style={{ marginTop: "16px" }}>
        <div className="bl-between" style={{ marginBottom: "8px" }}>
          <strong style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--muted)" }}>
            Generated Tracking URL
          </strong>
          <button
            type="button"
            className="bl-accent bl-btn-xs bl-primary-btn"
            onClick={handleCopy}
            disabled={!generatedUrl || generatedUrl.startsWith("Invalid")}
          >
            {copied ? <Check size={12} color="#111111" /> : <Copy size={12} />}
            <span>{copied ? "Copied Link!" : "Copy URL"}</span>
          </button>
        </div>

        <div className="bl-utm-code-display">
          <code>{generatedUrl || "Enter destination URL above to generate tracking link..."}</code>
        </div>
      </div>

      {/* Tracking Mechanism Transparency Note */}
      <div className="bl-sync-disclaimer" style={{ marginTop: "12px" }}>
        <ShieldAlert size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
        <span>
          <strong>Tracking Disclosure:</strong> Generated UTM URLs identify traffic sources when visitors land on your website. Capturing these attributes into CRM leads requires the BizLead website capture script or form integration (Phase 11 milestone).
        </span>
      </div>
    </div>
  );

  if (onClose) {
    return (
      <div
        className="fixed inset-0 overflow-y-auto backdrop-blur-sm flex items-center justify-center p-4"
        style={{ zIndex: "var(--z-modal)", backgroundColor: "var(--color-overlay)" }}
      >
        <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {contentNode}
        </div>
      </div>
    );
  }

  return contentNode;
}
