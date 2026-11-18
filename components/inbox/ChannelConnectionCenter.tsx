"use client";

import React, { useState } from "react";
import {
  X,
  Radio,
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  Layers,
  Info,
} from "lucide-react";
import { ChannelConnection } from "@/components/crm/types";
import { useCRM } from "@/components/crm/CRMProvider";

interface ChannelConnectionCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChannelConnectionCenter({
  isOpen,
  onClose,
}: ChannelConnectionCenterProps) {
  const { channelConnections } = useCRM();
  const [selectedChannel, setSelectedChannel] = useState<ChannelConnection | null>(
    channelConnections[0] || null
  );

  if (!isOpen) return null;

  return (
    <div className="bl-modal-backdrop" onClick={onClose}>
      <div
        className="bl-modal-content bl-channel-center-modal"
        style={{ maxWidth: "880px" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Channel Connection Center"
      >
        {/* Header */}
        <div className="bl-between" style={{ marginBottom: "16px" }}>
          <div>
            <span className="bl-eyebrow">OMNICHANNEL INFRASTRUCTURE</span>
            <h3>Channel Connection Center</h3>
            <p style={{ fontSize: "12px", color: "var(--muted)" }}>
              Manage active messaging channels, provider API status, and webhook configurations.
            </p>
          </div>
          <button
            type="button"
            className="bl-icon"
            onClick={onClose}
            aria-label="Close Channel Center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Security & Architecture Reassurance Callout */}
        <div
          className="bl-warning-banner"
          style={{
            background: "var(--color-info-soft)",
            borderColor: "color-mix(in srgb, var(--color-info) 30%, transparent)",
            color: "var(--text)",
            marginBottom: "18px",
          }}
        >
          <Lock size={16} color="var(--color-info)" />
          <div style={{ fontSize: "11.5px", lineHeight: 1.5 }}>
            <strong>Enterprise Credential Security:</strong> In Phase 05, all channels run in audited <strong>Demo Mode (Local Simulation)</strong> to guarantee privacy and state integrity. Real WhatsApp/Meta API keys, webhooks, and SMTP secrets must be handled strictly on a protected backend server — never exposed in browser JavaScript.
          </div>
        </div>

        {/* Channels Grid / Master-Detail */}
        <div className="bl-channel-center-layout">
          {/* Channel Cards List */}
          <div className="bl-channel-cards-list">
            {channelConnections.map((conn) => {
              const isSelected = selectedChannel?.id === conn.id;

              return (
                <article
                  key={conn.id}
                  className={`bl-channel-conn-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedChannel(conn)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="bl-between">
                    <strong className="bl-conn-name">{conn.name}</strong>
                    <span
                      className={`bl-status-pill ${
                        conn.status === "demo_mode" ? "demo" : conn.status
                      }`}
                    >
                      {conn.status === "demo_mode"
                        ? "Demo Mode"
                        : conn.status === "connected"
                        ? "Connected"
                        : "Ready to Connect"}
                    </span>
                  </div>

                  <span className="bl-conn-account">
                    {conn.accountIdentifier}
                  </span>

                  <div className="bl-conn-capabilities-chips">
                    {conn.capabilities.slice(0, 3).map((cap) => (
                      <span key={cap} className="bl-cap-chip">
                        {cap}
                      </span>
                    ))}
                    {conn.capabilities.length > 3 && (
                      <span className="bl-cap-chip">
                        +{conn.capabilities.length - 3} more
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Detailed Connection Specs Pane */}
          {selectedChannel && (
            <div className="bl-channel-specs-pane">
              <div className="bl-specs-header">
                <div>
                  <span className="bl-tag-pill" style={{ textTransform: "uppercase" }}>
                    {selectedChannel.channel}
                  </span>
                  <h4>{selectedChannel.name}</h4>
                  <span className="bl-specs-account">
                    Account: <strong>{selectedChannel.accountIdentifier}</strong>
                  </span>
                </div>
              </div>

              {/* Supported Capabilities List */}
              <div className="bl-specs-section">
                <h5>Supported Capabilities</h5>
                <div className="bl-capabilities-list">
                  {selectedChannel.capabilities.map((cap) => (
                    <div key={cap} className="bl-cap-item">
                      <CheckCircle2 size={13} color="var(--color-success)" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Setup Guide & Integration Architecture */}
              <div className="bl-specs-section">
                <h5>Setup Guide & Webhook Requirements</h5>
                <p className="bl-specs-guide-text">{selectedChannel.setupGuide}</p>

                <div className="bl-specs-field-box">
                  <span className="bl-field-label">Production Webhook Callback URL:</span>
                  <code>https://api.bizlead.io/v1/webhooks/{selectedChannel.channel}</code>
                </div>
                <div className="bl-specs-field-box">
                  <span className="bl-field-label">Required Verification Token:</span>
                  <code>bizlead_verify_token_prod_secure</code>
                </div>
              </div>

              {/* Documentation Link */}
              {selectedChannel.docsUrl && (
                <div className="bl-specs-footer">
                  <a
                    href={selectedChannel.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bl-btn-link"
                    style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <span>Official Meta/Provider API Docs</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
