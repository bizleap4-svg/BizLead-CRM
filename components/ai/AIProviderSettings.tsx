"use client";

import React from "react";
import { AI_PROVIDERS, AIProviderStatus } from "./types";
import { X, ShieldCheck, CheckCircle2, Clock, Lock, Server } from "lucide-react";

interface AIProviderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIProviderSettings: React.FC<AIProviderSettingsProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-bold text-foreground text-lg">
              AI Provider Architecture & Readiness
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Current operational model and planned enterprise gateway integrations.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Compliance Disclosure Banner */}
        <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-xs text-foreground flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-semibold">Zero-Exfiltration Architecture:</strong>
            <p className="text-muted-foreground leading-relaxed">
              BizLead operates strictly on a deterministic in-browser Local CRM Assistant. Zero API keys, OAuth tokens, or customer CRM records are transmitted to third-party AI endpoints. Real LLM providers will connect through a secure server-side proxy in Phase 10.
            </p>
          </div>
        </div>

        {/* Providers List */}
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {AI_PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              className={`p-4 rounded-xl border transition-all ${
                provider.status === "active"
                  ? "border-emerald-500/40 bg-emerald-500/5 shadow-xs"
                  : "border-border bg-card/60 opacity-80"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">
                    {provider.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    ({provider.version})
                  </span>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    provider.status === "active"
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {provider.statusLabel}
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {provider.description}
              </p>

              <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  {provider.isLocal ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Local Browser Execution</span>
                    </>
                  ) : (
                    <>
                      <Server className="w-3 h-3 text-muted-foreground" />
                      <span>Phase 10 Server Gateway</span>
                    </>
                  )}
                </span>
                <span className="font-mono text-[10px]">
                  {provider.isLocal ? "Latency: < 15ms" : "Credential Security: Enforced"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
