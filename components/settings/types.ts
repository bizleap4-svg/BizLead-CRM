/**
 * BizLead Revenue OS — Phase 10: Control Center Types
 * Typed entities for Organization, Teams, Roles, Permissions, Audits, Integrations & Billing.
 */

export type CRMResource =
  | "dashboard"
  | "leads"
  | "pipeline"
  | "contacts"
  | "companies"
  | "inbox"
  | "tasks"
  | "calendar"
  | "meetings"
  | "campaigns"
  | "analytics"
  | "reports"
  | "automations"
  | "ai"
  | "administration"
  | "billing";

export type Operation =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "archive"
  | "assign"
  | "import"
  | "export"
  | "approve"
  | "manage";

export type AccessScope =
  | "organization"
  | "department"
  | "team"
  | "assigned"
  | "own"
  | "none";

export interface Permission {
  resource: CRMResource;
  operations: Operation[];
  scope: AccessScope;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem?: boolean;
  permissions: Permission[];
  color?: string;
}

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  industry: string;
  companySize: string;
  businessEmail: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  country: string;
  timezone: string; // default: "Asia/Kolkata"
  currency: string; // default: "INR"
  dateFormat: string; // default: "DD/MM/YYYY"
  timeFormat: "12h" | "24h"; // default: "12h"
  financialYearStart: string; // default: "April"
  updatedAt: string;
}

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  status: "active" | "archived";
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  headMemberId?: string;
  color: string;
  isSystem?: boolean;
}

export interface Team {
  id: string;
  departmentId: string;
  name: string;
  leaderId?: string;
}

export interface MemberWorkload {
  assignedLeads: number;
  assignedDeals: number;
  assignedTasks: number;
  activeConversations: number;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string;
  roleId: string; // e.g. "owner", "admin", "sales_manager", "sales_executive", "marketing_manager", "viewer"
  departmentId: string;
  reportingManagerId?: string;
  status: "active" | "inactive" | "pending_invitation";
  workloadStats: MemberWorkload;
  joinedAt: string;
  invitedAt?: string;
  phone?: string;
}

export interface Invitation {
  id: string;
  email: string;
  roleId: string;
  departmentId: string;
  status: "pending" | "accepted" | "revoked";
  invitedBy: string;
  invitedAt: string;
  note: string; // Explicitly labeled as "pending backend delivery"
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  timezone: string;
  language: string;
  themePreset: string;
  defaultView: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  browserNotifications: boolean;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  action: string;
  category:
    | "member"
    | "role"
    | "permission"
    | "crm_record"
    | "automation"
    | "ai"
    | "export"
    | "settings";
  targetEntity: string;
  targetId?: string;
  details: string;
  ipAddress?: string;
}

export interface IntegrationConfiguration {
  id: string;
  provider: string;
  name: string;
  category: "messaging" | "advertising" | "calendar" | "ai" | "webhooks" | "forms";
  status: "connected" | "disconnected" | "configuring";
  capabilities: string[];
  setupRequirements: string[];
  disclaimer: string;
  lastSyncAt?: string;
  docsUrl?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: "Starter" | "Professional" | "Enterprise";
  tagline: string;
  priceLabel: string;
  billingInterval: "monthly" | "yearly";
  features: string[];
  limits: {
    users: number;
    leads: number;
    automations: number;
    aiQueriesPerDay: number;
    storageGb: number;
  };
  isCurrent?: boolean;
}

export interface CustomFieldDefinition {
  id: string;
  module: "lead" | "contact" | "company" | "deal";
  label: string;
  key: string;
  type: "text" | "number" | "select" | "date" | "boolean";
  options?: string[];
  required?: boolean;
}

export interface CRMConfiguration {
  leadSources: string[];
  leadStatuses: string[];
  dealLostReasons: string[];
  tags: string[];
  taskCategories: string[];
  meetingCategories: string[];
  customFields: CustomFieldDefinition[];
  scoringWeights: {
    hasPhone: number;
    hasWebsite: number;
    highIntentSource: number;
    budgetAbove1Lakh: number;
    meetingBooked: number;
  };
}

export interface OnboardingState {
  completed: boolean;
  currentStep: number;
  completedAt?: string;
  skippedSteps?: number[];
}

export interface WorkspaceExportData {
  version: "bizlead_backup_v10";
  exportedAt: string;
  organization: Organization;
  members: WorkspaceMember[];
  roles: Role[];
  departments: Department[];
  crmConfig: CRMConfiguration;
  leadsCount: number;
  contactsCount: number;
  companiesCount: number;
  dealsCount: number;
  tasksCount: number;
  meetingsCount: number;
  workflowsCount: number;
  campaignsCount: number;
  records: {
    leads: any[];
    contacts: any[];
    companies: any[];
    deals: any[];
    tasks: any[];
    meetings: any[];
    campaigns: any[];
    workflows: any[];
  };
  auditLogSample: AuditEvent[];
}
