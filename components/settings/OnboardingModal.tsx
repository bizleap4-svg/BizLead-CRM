"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Building2,
  Sliders,
  Users,
  Palette,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Target,
} from "lucide-react";
import { useControlCenter } from "./ControlCenterContext";
import { useTheme, palettes } from "../theme/ThemeProvider";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { organization, updateOrganization, crmConfig, updateCRMConfig, members } = useControlCenter();
  const { theme: currentPalette, setDraft, apply } = useTheme();

  const [step, setStep] = useState(1);

  // Step 1 state
  const [orgName, setOrgName] = useState(organization.name);
  const [industry, setIndustry] = useState(organization.industry);

  // Step 2 state
  const [timezone, setTimezone] = useState(organization.timezone);
  const [currency, setCurrency] = useState(organization.currency);

  // Step 3 state
  const [selectedPipeline, setSelectedPipeline] = useState("Growth Sales Pipeline");

  if (!isOpen) return null;

  const totalSteps = 5;

  const handleNext = () => {
    if (step === 1) {
      updateOrganization({ name: orgName, industry });
    } else if (step === 2) {
      updateOrganization({ timezone, currency });
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="bl-modal-backdrop">
      <div className="bl-onboarding-modal">
        {/* Onboarding Header */}
        <div className="bl-onboarding-top">
          <div className="bl-onboarding-brand">
            <span className="bl-onboarding-tag">WORKSPACE INITIALIZATION</span>
            <h2 className="bl-onboarding-title">Welcome to BizLead Revenue OS</h2>
            <p className="bl-onboarding-desc">
              The Intelligence Behind Growth. Complete setup in 2 minutes.
            </p>
          </div>
          <button type="button" className="bl-btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Steps Progress Indicator */}
        <div className="bl-onboarding-steps-track">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`bl-onboarding-step-pill ${
                s === step ? "is-active" : s < step ? "is-complete" : ""
              }`}
            >
              <span>{s < step ? "✓" : s}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bl-onboarding-step-body">
          {step === 1 && (
            <div className="bl-step-content">
              <div className="bl-step-header">
                <Building2 size={24} className="bl-accent-icon" />
                <div>
                  <h3>Step 1: Organization Details</h3>
                  <p>Define your company identity and legal entity name.</p>
                </div>
              </div>

              <div className="bl-form-group">
                <label className="bl-form-label">Company / Legal Business Name</label>
                <input
                  type="text"
                  className="bl-form-input"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Acme HyperGrowth"
                />
              </div>

              <div className="bl-form-group">
                <label className="bl-form-label">Industry Classification</label>
                <select
                  className="bl-form-select"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <option value="SaaS & Cloud Services">SaaS & Cloud Services</option>
                  <option value="Digital Marketing Agency">Digital Marketing Agency</option>
                  <option value="Financial Services & Fintech">Financial Services & Fintech</option>
                  <option value="Manufacturing & Logistics">Manufacturing & Logistics</option>
                  <option value="Consulting & Advisory">Consulting & Advisory</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bl-step-content">
              <div className="bl-step-header">
                <Sliders size={24} className="bl-accent-icon" />
                <div>
                  <h3>Step 2: Business & Localization Preferences</h3>
                  <p>Configure operational timezone and primary accounting currency.</p>
                </div>
              </div>

              <div className="bl-form-group">
                <label className="bl-form-label">Workspace Timezone</label>
                <select
                  className="bl-form-select"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST — UTC+05:30) [Recommended]</option>
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>

              <div className="bl-form-group">
                <label className="bl-form-label">Default Reporting Currency</label>
                <select
                  className="bl-form-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR">INR (₹ — Indian Rupee) [Recommended]</option>
                  <option value="USD">USD ($ — US Dollar)</option>
                  <option value="EUR">EUR (€ — Euro)</option>
                  <option value="GBP">GBP (£ — British Pound)</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bl-step-content">
              <div className="bl-step-header">
                <Target size={24} className="bl-accent-icon" />
                <div>
                  <h3>Step 3: CRM Pipeline & Lead Routing</h3>
                  <p>Select your default revenue pipeline model.</p>
                </div>
              </div>

              <div className="bl-pipeline-presets-grid">
                <div
                  className={`bl-preset-card ${selectedPipeline === "Growth Sales Pipeline" ? "selected" : ""}`}
                  onClick={() => setSelectedPipeline("Growth Sales Pipeline")}
                >
                  <h4>Growth Sales Pipeline (B2B)</h4>
                  <p>Stages: Discovery, Demo, Proposal, Negotiation, Closing.</p>
                </div>

                <div
                  className={`bl-preset-card ${selectedPipeline === "High Velocity Agency" ? "selected" : ""}`}
                  onClick={() => setSelectedPipeline("High Velocity Agency")}
                >
                  <h4>High Velocity Agency</h4>
                  <p>Stages: Inbound Lead, Discovery Audit, Scope Review, Retainer Won.</p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bl-step-content">
              <div className="bl-step-header">
                <Users size={24} className="bl-accent-icon" />
                <div>
                  <h3>Step 4: Initial Team Directory</h3>
                  <p>Verified seed team structure ready for collaboration.</p>
                </div>
              </div>

              <div className="bl-onboarding-team-preview">
                {members.slice(0, 4).map((m) => (
                  <div key={m.id} className="bl-onboarding-member-row">
                    <span className="bl-member-avatar-sm">{m.avatar}</span>
                    <div className="bl-member-info-sm">
                      <strong>{m.name}</strong>
                      <span>{m.roleId.replace(/_/g, " ")} • {m.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="bl-step-content">
              <div className="bl-step-header">
                <Palette size={24} className="bl-accent-icon" />
                <div>
                  <h3>Step 5: Workspace Appearance</h3>
                  <p>Choose your workspace brand accent palette.</p>
                </div>
              </div>

              <div className="bl-onboarding-palettes">
                {palettes.map((p) => {
                  const isSel = currentPalette.name === p.name;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      className={`bl-onboarding-palette-btn ${isSel ? "selected" : ""}`}
                      onClick={() => {
                        apply(p);
                      }}
                    >
                      <div className="bl-palette-dot" style={{ backgroundColor: p.accent }} />
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bl-onboarding-footer">
          <div>
            {step > 1 && (
              <button type="button" className="bl-btn-secondary" onClick={() => setStep(step - 1)}>
                <ChevronLeft size={16} /> Back
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {step < totalSteps && (
              <button type="button" className="bl-btn-secondary" onClick={handleSkip}>
                Skip Step
              </button>
            )}
            <button type="button" className="bl-btn-primary" onClick={handleNext}>
              {step === totalSteps ? (
                <>Complete Setup <CheckCircle2 size={16} /></>
              ) : (
                <>Next Step <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
