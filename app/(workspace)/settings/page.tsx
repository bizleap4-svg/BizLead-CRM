"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Users,
  Shield,
  Building,
  Sliders,
  Plug,
  History,
  Database,
  CreditCard,
  User,
} from "lucide-react";
import { ControlCenterHeader } from "../../../components/settings/ControlCenterHeader";
import { OrganizationSettings } from "../../../components/settings/OrganizationSettings";
import { TeamManagement } from "../../../components/settings/TeamManagement";
import { RolesPermissionsMatrix } from "../../../components/settings/RolesPermissionsMatrix";
import { DepartmentManagement } from "../../../components/settings/DepartmentManagement";
import { CRMConfigurationPanel } from "../../../components/settings/CRMConfigurationPanel";
import { IntegrationsCenter } from "../../../components/settings/IntegrationsCenter";
import { AuditHistoryPanel } from "../../../components/settings/AuditHistoryPanel";
import { DataManagementPanel } from "../../../components/settings/DataManagementPanel";
import { PlanBillingPanel } from "../../../components/settings/PlanBillingPanel";
import { AccountPreferencesPanel } from "../../../components/settings/AccountPreferencesPanel";
import { OnboardingModal } from "../../../components/settings/OnboardingModal";

type SettingsTab =
  | "org"
  | "team"
  | "roles"
  | "departments"
  | "crm_config"
  | "integrations"
  | "audit"
  | "data"
  | "billing"
  | "preferences";

const SETTINGS_NAV_ITEMS: { id: SettingsTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "org", label: "Organization", icon: Building2 },
  { id: "team", label: "Team & Workload", icon: Users },
  { id: "roles", label: "Roles & Permissions", icon: Shield },
  { id: "departments", label: "Departments", icon: Building },
  { id: "crm_config", label: "CRM Configuration", icon: Sliders },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "audit", label: "Audit History", icon: History },
  { id: "data", label: "Data Management", icon: Database },
  { id: "billing", label: "Plans & Quotas", icon: CreditCard },
  { id: "preferences", label: "Preferences", icon: User },
];

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams?.get("tab") as SettingsTab) || "org";

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // If search query matches a tab label or keyword, switch to it or highlight
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) return;

    const lower = q.toLowerCase();
    if (lower.includes("team") || lower.includes("member") || lower.includes("workload")) {
      setActiveTab("team");
    } else if (lower.includes("role") || lower.includes("permission") || lower.includes("matrix")) {
      setActiveTab("roles");
    } else if (lower.includes("dept") || lower.includes("department")) {
      setActiveTab("departments");
    } else if (lower.includes("stage") || lower.includes("source") || lower.includes("tag") || lower.includes("scoring") || lower.includes("field")) {
      setActiveTab("crm_config");
    } else if (lower.includes("integration") || lower.includes("webhook") || lower.includes("whatsapp") || lower.includes("openai") || lower.includes("gemini")) {
      setActiveTab("integrations");
    } else if (lower.includes("audit") || lower.includes("log") || lower.includes("history")) {
      setActiveTab("audit");
    } else if (lower.includes("export") || lower.includes("backup") || lower.includes("reset") || lower.includes("import")) {
      setActiveTab("data");
    } else if (lower.includes("plan") || lower.includes("billing") || lower.includes("pricing") || lower.includes("quota")) {
      setActiveTab("billing");
    } else if (lower.includes("theme") || lower.includes("profile") || lower.includes("appearance") || lower.includes("notification")) {
      setActiveTab("preferences");
    } else if (lower.includes("org") || lower.includes("currency") || lower.includes("timezone") || lower.includes("business")) {
      setActiveTab("org");
    }
  };

  return (
    <div className="bl-settings-page-container">
      {/* Header with Search, Role Switcher and Tagline */}
      <ControlCenterHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onLaunchOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Main Settings Body: Categorized Sidebar + Content Area */}
      <div className="bl-settings-body-layout">
        <aside className="bl-settings-sidebar">
          <div className="bl-settings-sidebar-group">
            <span className="bl-sidebar-group-heading">GOVERNANCE & TEAM</span>
            {SETTINGS_NAV_ITEMS.slice(0, 4).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`bl-settings-nav-btn ${activeTab === id ? "active" : ""}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={17} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="bl-settings-sidebar-group">
            <span className="bl-sidebar-group-heading">CRM ENGINE & LOGS</span>
            {SETTINGS_NAV_ITEMS.slice(4, 8).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`bl-settings-nav-btn ${activeTab === id ? "active" : ""}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={17} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="bl-settings-sidebar-group">
            <span className="bl-sidebar-group-heading">COMMERCIAL & ACCOUNT</span>
            {SETTINGS_NAV_ITEMS.slice(8).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`bl-settings-nav-btn ${activeTab === id ? "active" : ""}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={17} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="bl-settings-main-viewport">
          {activeTab === "org" && <OrganizationSettings />}
          {activeTab === "team" && <TeamManagement />}
          {activeTab === "roles" && <RolesPermissionsMatrix />}
          {activeTab === "departments" && <DepartmentManagement />}
          {activeTab === "crm_config" && <CRMConfigurationPanel />}
          {activeTab === "integrations" && <IntegrationsCenter />}
          {activeTab === "audit" && <AuditHistoryPanel />}
          {activeTab === "data" && <DataManagementPanel />}
          {activeTab === "billing" && <PlanBillingPanel />}
          {activeTab === "preferences" && <AccountPreferencesPanel />}
        </section>
      </div>

      {/* Onboarding Tour Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="bl-loading">Loading Control Center...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
