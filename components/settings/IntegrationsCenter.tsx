"use client";

import React, { useState } from "react";
import {
  Plug,
  MessageSquare,
  Share2,
  Mail,
  Calendar,
  Sparkles,
  Webhook,
  Code,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  ChevronRight,
  X,
} from "lucide-react";
import { useControlCenter } from "./ControlCenterContext";
import { IntegrationConfiguration } from "./types";

export function IntegrationsCenter() {
  const { integrations, updateIntegration, canManageAdmin } = useControlCenter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [configuringIntegration, setConfiguringIntegration] = useState<IntegrationConfiguration | null>(null);

  const isAllowedToManage = canManageAdmin();

  const filtered = integrations.filter((i) => {
    if (selectedCategory !== "all" && i.category !== selectedCategory) return false;
    return true;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "messaging":
        return <MessageSquare size={16} />;
      case "advertising":
        return <Share2 size={16} />;
      case "calendar":
        return <Calendar size={16} />;
      case "ai":
        return <Sparkles size={16} />;
      case "webhooks":
        return <Webhook size={16} />;
      case "forms":
        return <Code size={16} />;
      default:
        return <Plug size={16} />;
    }
  };

  return (
    <div className="bl-settings-section-card">
      <div className="bl-section-header">
        <div className="bl-section-title-wrap">
          <Plug size={20} className="bl-accent-icon" />
          <div>
            <h2 className="bl-section-title">Integration Center</h2>
            <p className="bl-section-desc">
              Connect external channels, ad platforms, calendar services, AI gateways, and webhook receivers.
            </p>
          </div>
        </div>
      </div>

      <div className="bl-alert-warning">
        <Lock size={16} />
        <div>
          <strong>Phase 13 Gateway Notice & Security Architecture:</strong>
          <p>
            BizLead does not store raw third-party API secrets or bearer tokens in browser localStorage.
            External production synchronization requires the Phase 13 Cloud Integration Gateway with vault encryption.
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="bl-category-pills">
        <button
          type="button"
          className={`bl-cat-pill ${selectedCategory === "all" ? "active" : ""}`}
          onClick={() => setSelectedCategory("all")}
        >
          All Integrations ({integrations.length})
        </button>
        <button
          type="button"
          className={`bl-cat-pill ${selectedCategory === "messaging" ? "active" : ""}`}
          onClick={() => setSelectedCategory("messaging")}
        >
          Messaging Channels
        </button>
        <button
          type="button"
          className={`bl-cat-pill ${selectedCategory === "advertising" ? "active" : ""}`}
          onClick={() => setSelectedCategory("advertising")}
        >
          Ad Platforms & Attribution
        </button>
        <button
          type="button"
          className={`bl-cat-pill ${selectedCategory === "calendar" ? "active" : ""}`}
          onClick={() => setSelectedCategory("calendar")}
        >
          Calendars & Meetings
        </button>
        <button
          type="button"
          className={`bl-cat-pill ${selectedCategory === "ai" ? "active" : ""}`}
          onClick={() => setSelectedCategory("ai")}
        >
          AI Gateways
        </button>
        <button
          type="button"
          className={`bl-cat-pill ${selectedCategory === "webhooks" ? "active" : ""}`}
          onClick={() => setSelectedCategory("webhooks")}
        >
          Webhooks & Developer
        </button>
      </div>

      {/* Grid of Integration Cards */}
      <div className="bl-integrations-grid">
        {filtered.map((item) => {
          let statusBadge = "Disconnected";
          let badgeClass = "status-disconnected";
          if (item.status === "connected") {
            statusBadge = "Active (Local Mock)";
            badgeClass = "status-connected";
          } else if (item.status === "configuring") {
            statusBadge = "Ready for Gateway";
            badgeClass = "status-configuring";
          }

          return (
            <div key={item.id} className="bl-integration-card">
              <div className="bl-integration-top">
                <div className="bl-integration-icon-wrap">
                  {getCategoryIcon(item.category)}
                </div>
                <span className={`bl-status-pill ${badgeClass}`}>{statusBadge}</span>
              </div>

              <h3 className="bl-integration-name">{item.name}</h3>

              <div className="bl-capabilities-list">
                {item.capabilities.map((cap, idx) => (
                  <span key={idx} className="bl-cap-chip">
                    • {cap}
                  </span>
                ))}
              </div>

              <div className="bl-integration-disclaimer">
                <AlertCircle size={13} />
                <span>{item.disclaimer}</span>
              </div>

              <div className="bl-integration-footer">
                <button
                  type="button"
                  className="bl-btn-secondary-sm"
                  onClick={() => setConfiguringIntegration(item)}
                >
                  Configure Adapter <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configure Adapter Modal */}
      {configuringIntegration && (
        <div className="bl-modal-backdrop">
          <div className="bl-modal-content">
            <div className="bl-modal-header">
              <h3 className="bl-modal-title">
                Adapter: {configuringIntegration.name}
              </h3>
              <button
                type="button"
                className="bl-btn-close"
                onClick={() => setConfiguringIntegration(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="bl-modal-body">
              <div className="bl-alert-info">
                <span>
                  <strong>Cloud Gateway Status:</strong> Scheduled for Phase 13 Cloud Infrastructure.
                </span>
              </div>

              <h4 className="bl-config-h4">Supported Capabilities</h4>
              <ul className="bl-modal-ul">
                {configuringIntegration.capabilities.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>

              <h4 className="bl-config-h4">Production Setup Requirements</h4>
              <ul className="bl-modal-ul">
                {configuringIntegration.setupRequirements.map((r, i) => (
                  <li key={i}>
                    <code>{r}</code>
                  </li>
                ))}
              </ul>

              <div className="bl-form-group" style={{ marginTop: "16px" }}>
                <label className="bl-form-label">Simulation Status</label>
                <select
                  className="bl-form-select"
                  value={configuringIntegration.status}
                  onChange={(e) => {
                    const nextStatus = e.target.value as any;
                    updateIntegration(configuringIntegration.id, { status: nextStatus });
                    setConfiguringIntegration({ ...configuringIntegration, status: nextStatus });
                  }}
                  disabled={!isAllowedToManage}
                >
                  <option value="connected">Connected (Local Prototype Simulation)</option>
                  <option value="configuring">Ready for Gateway (Phase 13 / 14)</option>
                  <option value="disconnected">Disconnected</option>
                </select>
              </div>
            </div>

            <div className="bl-modal-footer">
              <button
                type="button"
                className="bl-btn-secondary"
                onClick={() => setConfiguringIntegration(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
