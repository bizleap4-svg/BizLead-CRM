"use client";

import React from "react";
import { X, ExternalLink, ShieldCheck, Info, RefreshCw, KeyRound, CheckCircle2 } from "lucide-react";

interface AdvertisingIntegrationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvertisingIntegrationCenter: React.FC<AdvertisingIntegrationCenterProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground text-lg">Advertising Platform Integrations</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary uppercase">
                Demo & Architecture
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Direct API integrations for Meta Ads, Google Ads, and LinkedIn Campaign Manager.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transparent Compliance Disclosure */}
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs text-foreground space-y-2">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Info className="w-4 h-4 shrink-0" />
            <span>Integration Disclosure & Production Boundary</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            BizLead runs in local client demo mode. External OAuth endpoints (Meta Graph API, Google Ads REST, LinkedIn Ads API)
            are designated for the Phase 10 Cloud Milestone. No simulated OAuth credentials or fake access tokens are stored in browser storage.
            To ingest campaign figures right now, use the <strong>CSV Import Wizard</strong> or native UTM parameter tracking.
          </p>
        </div>

        {/* Platform Cards */}
        <div className="space-y-3">
          {/* Meta Ads */}
          <div className="p-4 rounded-xl border bg-background/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-base">
                M
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Meta Ads Manager</h4>
                <p className="text-xs text-muted-foreground">
                  Facebook & Instagram Lead Ads, Conversions API, Ad Insights sync
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Demo Mode Active
              </span>
            </div>
          </div>

          {/* Google Ads */}
          <div className="p-4 rounded-xl border bg-background/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-base">
                G
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Google Ads & Performance Max</h4>
                <p className="text-xs text-muted-foreground">
                  Search keywords, display network, PMax conversion value, offline lead imports
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Demo Mode Active
              </span>
            </div>
          </div>

          {/* LinkedIn Marketing */}
          <div className="p-4 rounded-xl border bg-background/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-base">
                in
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">LinkedIn Campaign Manager</h4>
                <p className="text-xs text-muted-foreground">
                  Lead Gen Forms, sponsored content, account-based targeting
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Demo Mode Active
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t flex justify-between items-center text-xs text-muted-foreground">
          <span>Deterministic attribution engine is active for all manual & CSV records.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
