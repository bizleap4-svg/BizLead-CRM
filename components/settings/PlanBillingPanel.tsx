"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Check,
  Zap,
  ShieldCheck,
  Users,
  Target,
  Workflow,
  Sparkles,
  HardDrive,
  AlertCircle,
} from "lucide-react";
import { useControlCenter } from "./ControlCenterContext";
import { useCRM } from "../crm/CRMProvider";

export function PlanBillingPanel() {
  const { subscription, updateSubscription, members, canAccessBilling } = useControlCenter();
  const { leads, workflows } = useCRM();

  const [notification, setNotification] = useState<string | null>(null);

  const isAllowedBilling = canAccessBilling();

  const handleSelectPlan = (plan: "Starter" | "Professional" | "Enterprise") => {
    updateSubscription(plan);
    setNotification(`Switched simulated tier to ${plan}. Notice: Billing integration pending Phase 15.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Usage meters
  const usedUsers = members.filter((m) => m.status === "active").length;
  const maxUsers = subscription.limits.users;
  const userPct = Math.min(100, Math.round((usedUsers / maxUsers) * 100));

  const usedLeads = leads.length;
  const maxLeads = subscription.limits.leads;
  const leadPct = Math.min(100, Math.round((usedLeads / maxLeads) * 100));

  const usedWorkflows = workflows.filter((w) => w.status === "active").length;
  const maxWorkflows = subscription.limits.automations;
  const wfPct = Math.min(100, Math.round((usedWorkflows / maxWorkflows) * 100));

  return (
    <div className="bl-settings-section-card">
      <div className="bl-section-header">
        <div className="bl-section-title-wrap">
          <CreditCard size={20} className="bl-accent-icon" />
          <div>
            <h2 className="bl-section-title">Plans & Workspace Quotas</h2>
            <p className="bl-section-desc">
              Manage subscription tiers, monitor resource allocations, seats, automations, and storage quotas.
            </p>
          </div>
        </div>
      </div>

      <div className="bl-alert-warning">
        <AlertCircle size={16} />
        <div>
          <strong>Phase 15 Commercial SaaS Disclosure:</strong>
          <p>
            Payment processing, invoicing, and hard billing locks are scheduled for Phase 15.
            Current plan definitions represent prototype entitlements and do not process real credit card payments.
          </p>
        </div>
      </div>

      {notification && (
        <div className="bl-alert-success">
          <Check size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* Resource Quotas Usage Bento */}
      <div className="bl-usage-bento">
        <div className="bl-quota-card">
          <div className="bl-quota-header">
            <div className="bl-quota-icon-wrap">
              <Users size={18} />
            </div>
            <div>
              <span className="bl-quota-label">Team Seats</span>
              <div className="bl-quota-numbers">
                <strong>{usedUsers}</strong> / {maxUsers} seats
              </div>
            </div>
          </div>
          <div className="bl-progress-track">
            <div className="bl-progress-fill" style={{ width: `${userPct}%` }} />
          </div>
        </div>

        <div className="bl-quota-card">
          <div className="bl-quota-header">
            <div className="bl-quota-icon-wrap">
              <Target size={18} />
            </div>
            <div>
              <span className="bl-quota-label">Active CRM Leads</span>
              <div className="bl-quota-numbers">
                <strong>{usedLeads}</strong> / {maxLeads} leads
              </div>
            </div>
          </div>
          <div className="bl-progress-track">
            <div className="bl-progress-fill" style={{ width: `${leadPct}%` }} />
          </div>
        </div>

        <div className="bl-quota-card">
          <div className="bl-quota-header">
            <div className="bl-quota-icon-wrap">
              <Workflow size={18} />
            </div>
            <div>
              <span className="bl-quota-label">Active Automations</span>
              <div className="bl-quota-numbers">
                <strong>{usedWorkflows}</strong> / {maxWorkflows} workflows
              </div>
            </div>
          </div>
          <div className="bl-progress-track">
            <div className="bl-progress-fill" style={{ width: `${wfPct}%` }} />
          </div>
        </div>

        <div className="bl-quota-card">
          <div className="bl-quota-header">
            <div className="bl-quota-icon-wrap">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="bl-quota-label">Biz AI Queries / Day</span>
              <div className="bl-quota-numbers">
                <strong>35</strong> / {subscription.limits.aiQueriesPerDay} queries
              </div>
            </div>
          </div>
          <div className="bl-progress-track">
            <div className="bl-progress-fill" style={{ width: "7%" }} />
          </div>
        </div>
      </div>

      {/* Plan Tiers Grid */}
      <div className="bl-plans-grid">
        {/* Starter Plan */}
        <div className={`bl-plan-card ${subscription.name === "Starter" ? "is-current" : ""}`}>
          <div className="bl-plan-top">
            <h3 className="bl-plan-name">Starter</h3>
            <div className="bl-plan-price">₹4,999 <span>/ month</span></div>
            <p className="bl-plan-tagline">Essential CRM for small agencies and boutique founders.</p>
          </div>

          <ul className="bl-plan-features">
            <li><Check size={14} /> Up to 3 Team Members</li>
            <li><Check size={14} /> 300 Active Leads</li>
            <li><Check size={14} /> 5 Automation Workflows</li>
            <li><Check size={14} /> 100 AI Queries / day</li>
            <li><Check size={14} /> Omnichannel Messaging</li>
          </ul>

          <div className="bl-plan-action">
            {subscription.name === "Starter" ? (
              <span className="bl-current-plan-badge">Current Selected Plan</span>
            ) : (
              <button
                type="button"
                className="bl-btn-secondary-full"
                onClick={() => handleSelectPlan("Starter")}
                disabled={!isAllowedBilling}
              >
                Switch to Starter
              </button>
            )}
          </div>
        </div>

        {/* Professional Plan */}
        <div className={`bl-plan-card is-highlighted ${subscription.name === "Professional" ? "is-current" : ""}`}>
          <div className="bl-popular-ribbon">RECOMMENDED</div>
          <div className="bl-plan-top">
            <h3 className="bl-plan-name">Professional</h3>
            <div className="bl-plan-price">₹14,999 <span>/ month</span></div>
            <p className="bl-plan-tagline">Advanced revenue acceleration, visual automations and AI copilot.</p>
          </div>

          <ul className="bl-plan-features">
            <li><Check size={14} /> Up to 10 Team Members</li>
            <li><Check size={14} /> 1,000 Leads & 5,000 Contacts</li>
            <li><Check size={14} /> 20 Visual Automation Workflows</li>
            <li><Check size={14} /> 500 Biz AI Queries / day</li>
            <li><Check size={14} /> Full Role-Based Access Control</li>
            <li><Check size={14} /> Growth Intelligence & A4 PDF Reports</li>
          </ul>

          <div className="bl-plan-action">
            {subscription.name === "Professional" ? (
              <span className="bl-current-plan-badge">Current Selected Plan</span>
            ) : (
              <button
                type="button"
                className="bl-btn-primary-full"
                onClick={() => handleSelectPlan("Professional")}
                disabled={!isAllowedBilling}
              >
                Switch to Professional
              </button>
            )}
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className={`bl-plan-card ${subscription.name === "Enterprise" ? "is-current" : ""}`}>
          <div className="bl-plan-top">
            <h3 className="bl-plan-name">Enterprise</h3>
            <div className="bl-plan-price">₹39,999 <span>/ month</span></div>
            <p className="bl-plan-tagline">Dedicated infrastructure, unlimited custom workflows and high SLAs.</p>
          </div>

          <ul className="bl-plan-features">
            <li><Check size={14} /> Up to 50 Team Members</li>
            <li><Check size={14} /> 10,000 Leads & Unlimited Contacts</li>
            <li><Check size={14} /> 100 Automation Workflows</li>
            <li><Check size={14} /> 2,500 Biz AI Queries / day</li>
            <li><Check size={14} /> Custom CRM Fields & Webhooks</li>
            <li><Check size={14} /> Priority 24/7 SLA Support</li>
          </ul>

          <div className="bl-plan-action">
            {subscription.name === "Enterprise" ? (
              <span className="bl-current-plan-badge">Current Selected Plan</span>
            ) : (
              <button
                type="button"
                className="bl-btn-secondary-full"
                onClick={() => handleSelectPlan("Enterprise")}
                disabled={!isAllowedBilling}
              >
                Switch to Enterprise
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
