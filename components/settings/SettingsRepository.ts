/**
 * BizLead Revenue OS — Settings & Administration Repository
 * Persistent storage facade for Organization, Members, Roles, Permissions,
 * CRM Configurations, Audit Trail, Integrations, and Subscription Plans.
 *
 * Notice: Scoped localStorage persistence is client-side prototype behavior.
 * Tenant isolation and immutable audit storage will be enforced by Phase 11-12 backends.
 */

import {
  AuditEvent,
  CRMConfiguration,
  Department,
  IntegrationConfiguration,
  Invitation,
  Organization,
  Role,
  SubscriptionPlan,
  UserProfile,
  WorkspaceExportData,
  WorkspaceMember,
} from "./types";
import { DEFAULT_ROLES } from "./PermissionService";
import * as repo from "../crm/repository";

export const STORAGE_KEY_ORG = "bizlead_org_settings_v1";
export const STORAGE_KEY_MEMBERS = "bizlead_members_v1";
export const STORAGE_KEY_ACTIVE_MEMBER_ID = "bizlead_active_member_id_v1";
export const STORAGE_KEY_DEPARTMENTS = "bizlead_departments_v1";
export const STORAGE_KEY_ROLES = "bizlead_roles_v1";
export const STORAGE_KEY_INVITATIONS = "bizlead_invitations_v1";
export const STORAGE_KEY_AUDIT_LOG = "bizlead_audit_log_v1";
export const STORAGE_KEY_INTEGRATIONS = "bizlead_integrations_v1";
export const STORAGE_KEY_CRM_CONFIG = "bizlead_crm_config_v1";
export const STORAGE_KEY_SUBSCRIPTION = "bizlead_subscription_v1";
export const STORAGE_KEY_ONBOARDING = "bizlead_onboarding_completed_v1";
export const STORAGE_KEY_USER_PROFILE = "bizlead_user_profile_v1";

// ==========================================
// 1. Initial Reference Seed Data
// ==========================================

export const INITIAL_ORG: Organization = {
  id: "org-bizlead-1",
  name: "Acme HyperGrowth Technologies",
  logoUrl: "",
  industry: "SaaS & Cloud Services",
  companySize: "50-250 Employees",
  businessEmail: "operations@bizlead.io",
  phone: "+91 98201 00000",
  website: "https://bizlead.io",
  address: "Level 9, Cyber One, Sector 30",
  city: "Navi Mumbai",
  country: "India",
  timezone: "Asia/Kolkata",
  currency: "INR",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "12h",
  financialYearStart: "April",
  updatedAt: "2026-11-18T10:00:00.000Z",
};

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: "dept-management",
    name: "Management",
    description: "Executive leadership, strategic direction, and workspace administration.",
    color: "#E2F000",
    isSystem: true,
  },
  {
    id: "dept-sales",
    name: "Sales",
    description: "Revenue generation, client acquisitions, pipeline management, and outreach.",
    color: "#10B981",
    isSystem: true,
  },
  {
    id: "dept-marketing",
    name: "Marketing",
    description: "Omnichannel campaigns, growth attribution, creative strategy, and lead generation.",
    color: "#EC4899",
    isSystem: true,
  },
  {
    id: "dept-support",
    name: "Customer Support",
    description: "Customer onboarding, issue resolution, satisfaction, and client retention.",
    color: "#3B82F6",
    isSystem: true,
  },
];

export const INITIAL_MEMBERS: WorkspaceMember[] = [
  {
    id: "mem-1",
    userId: "usr-aarav",
    name: "Aarav Patel",
    email: "aarav@bizlead.io",
    avatar: "AP",
    roleId: "owner",
    departmentId: "dept-management",
    status: "active",
    workloadStats: { assignedLeads: 8, assignedDeals: 4, assignedTasks: 5, activeConversations: 6 },
    joinedAt: "2026-08-01T09:00:00.000Z",
    phone: "+91 98201 11223",
  },
  {
    id: "mem-2",
    userId: "usr-vikram",
    name: "Vikram Malhotra",
    email: "vikram@bizlead.io",
    avatar: "VM",
    roleId: "admin",
    departmentId: "dept-management",
    status: "active",
    workloadStats: { assignedLeads: 2, assignedDeals: 1, assignedTasks: 3, activeConversations: 2 },
    joinedAt: "2026-08-15T11:00:00.000Z",
    phone: "+91 98201 33445",
  },
  {
    id: "mem-3",
    userId: "usr-rahul",
    name: "Rahul Sharma",
    email: "rahul@bizlead.io",
    avatar: "RS",
    roleId: "sales_manager",
    departmentId: "dept-sales",
    status: "active",
    workloadStats: { assignedLeads: 12, assignedDeals: 8, assignedTasks: 7, activeConversations: 9 },
    joinedAt: "2026-09-01T09:30:00.000Z",
    phone: "+91 98201 55667",
  },
  {
    id: "mem-4",
    userId: "usr-priya",
    name: "Priya Nair",
    email: "priya@bizlead.io",
    avatar: "PN",
    roleId: "sales_executive",
    departmentId: "dept-sales",
    reportingManagerId: "mem-3",
    status: "active",
    workloadStats: { assignedLeads: 9, assignedDeals: 5, assignedTasks: 6, activeConversations: 8 },
    joinedAt: "2026-09-15T10:00:00.000Z",
    phone: "+91 98201 77889",
  },
  {
    id: "mem-5",
    userId: "usr-ananya",
    name: "Ananya Iyer",
    email: "ananya@bizlead.io",
    avatar: "AI",
    roleId: "marketing_manager",
    departmentId: "dept-marketing",
    status: "active",
    workloadStats: { assignedLeads: 3, assignedDeals: 0, assignedTasks: 4, activeConversations: 1 },
    joinedAt: "2026-10-01T09:00:00.000Z",
    phone: "+91 98201 99001",
  },
  {
    id: "mem-6",
    userId: "usr-meera",
    name: "Meera Sen",
    email: "meera@bizlead.io",
    avatar: "MS",
    roleId: "viewer",
    departmentId: "dept-support",
    status: "active",
    workloadStats: { assignedLeads: 0, assignedDeals: 0, assignedTasks: 1, activeConversations: 0 },
    joinedAt: "2026-10-15T10:30:00.000Z",
    phone: "+91 98201 22334",
  },
];

export const INITIAL_INTEGRATIONS: IntegrationConfiguration[] = [
  {
    id: "int-whatsapp",
    provider: "whatsapp",
    name: "WhatsApp Business Cloud",
    category: "messaging",
    status: "connected",
    capabilities: ["Automated outreach", "Template messaging", "Live incoming chats", "Quick replies"],
    setupRequirements: ["Meta Business Manager ID", "WABA ID", "System User Permanent Token"],
    disclaimer: "External message delivery requires Phase 13 Cloud API Gateway. Local mock active.",
    lastSyncAt: "2026-11-18T18:30:00.000Z",
  },
  {
    id: "int-instagram",
    provider: "instagram",
    name: "Instagram Direct Messaging",
    category: "messaging",
    status: "connected",
    capabilities: ["Direct DM syncing", "Story mention responses", "Story ad leads"],
    setupRequirements: ["Instagram Professional Account", "Facebook Page Connection"],
    disclaimer: "Requires Meta Graph API Webhook Gateway (Phase 13).",
    lastSyncAt: "2026-11-18T18:00:00.000Z",
  },
  {
    id: "int-messenger",
    provider: "messenger",
    name: "Facebook Messenger",
    category: "messaging",
    status: "disconnected",
    capabilities: ["Page conversation inbox", "Lead ad auto-response"],
    setupRequirements: ["Facebook Page Admin Access", "Messenger Platform Subscription"],
    disclaimer: "Pending Meta App Verification (Phase 13).",
  },
  {
    id: "int-email",
    provider: "email",
    name: "Business Email (SMTP / IMAP)",
    category: "messaging",
    status: "connected",
    capabilities: ["2-way email sync", "Automated email sequences", "Email open tracking"],
    setupRequirements: ["Host server", "Port 587 (TLS)", "Secure app password"],
    disclaimer: "Outbound sending simulated locally. Real delivery pending SMTP worker (Phase 13).",
    lastSyncAt: "2026-11-18T17:45:00.000Z",
  },
  {
    id: "int-meta-ads",
    provider: "meta_ads",
    name: "Meta Ads Manager",
    category: "advertising",
    status: "connected",
    capabilities: ["Instant Form Lead sync", "Campaign spend tracking", "Cost-per-lead attribution"],
    setupRequirements: ["Meta Ads Account ID", "Lead Ads Webhook Subscription"],
    disclaimer: "Lead form sync ready for Phase 13 Webhook receiver.",
    lastSyncAt: "2026-11-18T19:00:00.000Z",
  },
  {
    id: "int-google-ads",
    provider: "google_ads",
    name: "Google Ads & YouTube",
    category: "advertising",
    status: "connected",
    capabilities: ["Offline conversion upload", "Performance Max spend sync", "Search click attribution"],
    setupRequirements: ["Google Ads Customer ID", "Developer Token", "OAuth Refresh Token"],
    disclaimer: "Conversions sync ready for Google Ads API v17 adapter (Phase 13).",
    lastSyncAt: "2026-11-18T19:15:00.000Z",
  },
  {
    id: "int-linkedin-ads",
    provider: "linkedin_ads",
    name: "LinkedIn Campaign Manager",
    category: "advertising",
    status: "disconnected",
    capabilities: ["Lead Gen Form sync", "B2B account matching", "Ad spend tracking"],
    setupRequirements: ["LinkedIn Organization ID", "Community Management API Access"],
    disclaimer: "Requires LinkedIn Marketing Partner authorization (Phase 13).",
  },
  {
    id: "int-google-calendar",
    provider: "google_calendar",
    name: "Google Calendar",
    category: "calendar",
    status: "connected",
    capabilities: ["2-way event syncing", "Google Meet auto-generation", "Availability detection"],
    setupRequirements: ["Google Cloud Console OAuth 2.0 Client", "Calendar.events Scope"],
    disclaimer: "Local calendar events synchronized. Real Google Calendar OAuth scheduled for Phase 13.",
    lastSyncAt: "2026-11-18T19:20:00.000Z",
  },
  {
    id: "int-outlook-calendar",
    provider: "outlook_calendar",
    name: "Microsoft 365 & Outlook",
    category: "calendar",
    status: "disconnected",
    capabilities: ["Outlook calendar sync", "Teams meeting link generation"],
    setupRequirements: ["Azure Entra ID App Registration", "Calendars.ReadWrite Permission"],
    disclaimer: "Requires Microsoft Graph API enterprise integration (Phase 13).",
  },
  {
    id: "int-openai",
    provider: "openai",
    name: "OpenAI GPT-4o Enterprise Gateway",
    category: "ai",
    status: "configuring",
    capabilities: ["Advanced contextual reasoning", "Semantic lead scoring", "Generative email drafts"],
    setupRequirements: ["OpenAI API Key / Azure OpenAI Endpoint", "Model deployment gpt-4o"],
    disclaimer: "Biz AI currently operates in rule-based mode. Cloud LLM gateway integration scheduled for Phase 14.",
  },
  {
    id: "int-gemini",
    provider: "gemini",
    name: "Google Gemini 2.0 Flash Gateway",
    category: "ai",
    status: "configuring",
    capabilities: ["High-speed reasoning", "Multimodal document analysis", "Omnichannel summarization"],
    setupRequirements: ["Google AI Studio / Vertex AI Project", "GEMINI_API_KEY"],
    disclaimer: "Cloud AI Gateway adapter pending Phase 14. Zero token exfiltration guaranteed.",
  },
  {
    id: "int-anthropic",
    provider: "anthropic",
    name: "Anthropic Claude 3.5 Sonnet",
    category: "ai",
    status: "disconnected",
    capabilities: ["Complex contract analysis", "Executive intelligence synthesis"],
    setupRequirements: ["Anthropic Console API Key"],
    disclaimer: "Scheduled for Phase 14 AI Gateway.",
  },
  {
    id: "int-webhooks",
    provider: "webhooks",
    name: "Incoming & Outgoing Webhooks",
    category: "webhooks",
    status: "connected",
    capabilities: ["Instant HTTP lead ingestion", "Trigger automation on CRM events", "HMAC SHA256 signing"],
    setupRequirements: ["Webhook Endpoint URL", "Shared Signing Secret"],
    disclaimer: "Local webhook dispatch tested. Dedicated cloud HTTP receiver deployed in Phase 11.",
  },
  {
    id: "int-website-forms",
    provider: "website_forms",
    name: "Website Lead Capture SDK",
    category: "forms",
    status: "connected",
    capabilities: ["Embedded embed forms", "UTM tracking capture", "Instant lead routing"],
    setupRequirements: ["BizLead JS Script Tag", "Approved Domain Whitelist"],
    disclaimer: "Embed script generator operational. Production CDN script hosted in Phase 11.",
  },
];

export const INITIAL_CRM_CONFIG: CRMConfiguration = {
  leadSources: [
    "Meta Ads",
    "Google Ads",
    "LinkedIn Ads",
    "Referral",
    "Direct Website",
    "Cold Outreach",
    "Webinar",
    "Organic Search",
  ],
  leadStatuses: ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"],
  dealLostReasons: [
    "Budget Constraints",
    "Competitor Chosen",
    "Feature Missing",
    "Timeline Delayed",
    "Unresponsive Lead",
    "Project Cancelled",
  ],
  tags: [
    "Hot Lead",
    "High Intent",
    "Enterprise",
    "Q4 Priority",
    "Founder Led",
    "VIP Account",
    "Needs Attention",
    "Fast Track",
  ],
  taskCategories: ["follow_up", "call", "email", "meeting", "review", "proposal", "other"],
  meetingCategories: [
    "Discovery Call",
    "Product Demo",
    "Technical Review",
    "Contract Negotiation",
    "Executive Closing",
    "Account Review",
  ],
  customFields: [
    {
      id: "cf-1",
      module: "lead",
      label: "Annual Software Budget",
      key: "annual_software_budget",
      type: "number",
    },
    {
      id: "cf-2",
      module: "company",
      label: "Tech Stack Category",
      key: "tech_stack_category",
      type: "select",
      options: ["Cloud Native", "Legacy Enterprise", "Hybrid", "Mobile First"],
    },
    {
      id: "cf-3",
      module: "deal",
      label: "Decision Maker Identified",
      key: "decision_maker_identified",
      type: "boolean",
    },
  ],
  scoringWeights: {
    hasPhone: 15,
    hasWebsite: 10,
    highIntentSource: 25,
    budgetAbove1Lakh: 30,
    meetingBooked: 20,
  },
};

export const INITIAL_SUBSCRIPTION: SubscriptionPlan = {
  id: "plan-pro",
  name: "Professional",
  tagline: "For scaling revenue teams requiring full CRM automation and team collaboration.",
  priceLabel: "₹14,999 / month",
  billingInterval: "monthly",
  isCurrent: true,
  features: [
    "Up to 10 Team Members",
    "1,000 Active Leads & 5,000 Contacts",
    "20 Automation Workflows with Visual Builder",
    "Biz AI Copilot & Safe Action Approvals (500 queries/day)",
    "Omnichannel Messaging (WhatsApp, Email, Instagram)",
    "Comprehensive Role-Based Access Control (RBAC)",
    "Exportable PDF Executive Reports & Growth Analytics",
  ],
  limits: {
    users: 10,
    leads: 1000,
    automations: 20,
    aiQueriesPerDay: 500,
    storageGb: 25,
  },
};

export const INITIAL_AUDIT_LOG: AuditEvent[] = [
  {
    id: "aud-001",
    timestamp: "2026-11-18T10:00:00.000Z",
    actorId: "mem-1",
    actorName: "Aarav Patel",
    actorEmail: "aarav@bizlead.io",
    action: "WORKSPACE_INITIALIZED",
    category: "settings",
    targetEntity: "Workspace",
    details: "Acme HyperGrowth Technologies initialized with default Indian currency (INR) and Asia/Kolkata timezone.",
    ipAddress: "127.0.0.1 (Local Session)",
  },
  {
    id: "aud-002",
    timestamp: "2026-11-18T11:15:00.000Z",
    actorId: "mem-1",
    actorName: "Aarav Patel",
    actorEmail: "aarav@bizlead.io",
    action: "MEMBER_ASSIGNED",
    category: "member",
    targetEntity: "WorkspaceMember: Rahul Sharma",
    details: "Assigned Rahul Sharma to Sales Manager role and appointed head of Sales department.",
    ipAddress: "127.0.0.1 (Local Session)",
  },
  {
    id: "aud-003",
    timestamp: "2026-11-18T12:00:00.000Z",
    actorId: "mem-2",
    actorName: "Vikram Malhotra",
    actorEmail: "vikram@bizlead.io",
    action: "ROLE_PERMISSIONS_VERIFIED",
    category: "permission",
    targetEntity: "Role: Sales Executive",
    details: "Verified Sales Executive scope restricted to assigned leads and own pipeline records.",
    ipAddress: "127.0.0.1 (Local Session)",
  },
  {
    id: "aud-004",
    timestamp: "2026-11-18T14:20:00.000Z",
    actorId: "mem-3",
    actorName: "Rahul Sharma",
    actorEmail: "rahul@bizlead.io",
    action: "WORKFLOW_ACTIVATED",
    category: "automation",
    targetEntity: "Workflow: High Intent Lead Routing",
    details: "Activated automated lead scoring and team assignment workflow.",
    ipAddress: "127.0.0.1 (Local Session)",
  },
  {
    id: "aud-005",
    timestamp: "2026-11-18T16:45:00.000Z",
    actorId: "mem-1",
    actorName: "Aarav Patel",
    actorEmail: "aarav@bizlead.io",
    action: "AI_ACTION_APPROVED",
    category: "ai",
    targetEntity: "Lead: Layers Studio (BL-001)",
    details: "Approved AI-generated follow-up task and priority escalation.",
    ipAddress: "127.0.0.1 (Local Session)",
  },
];

// Helper functions for safe storage access
function loadStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  } catch (err) {
    console.warn(`[SettingsRepository] Failed to read ${key}:`, err);
    return fallback;
  }
}

function persistStorage<T>(key: string, val: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`[SettingsRepository] Failed to persist ${key}:`, err);
  }
}

// In-memory singletons
let memoryOrg: Organization | null = null;
let memoryMembers: WorkspaceMember[] | null = null;
let memoryActiveMemberId: string | null = null;
let memoryDepartments: Department[] | null = null;
let memoryRoles: Role[] | null = null;
let memoryInvitations: Invitation[] | null = null;
let memoryAuditLog: AuditEvent[] | null = null;
let memoryIntegrations: IntegrationConfiguration[] | null = null;
let memoryCRMConfig: CRMConfiguration | null = null;
let memorySubscription: SubscriptionPlan | null = null;

export class SettingsRepository {
  // -------------------------------------------------------------
  // Organization Management
  // -------------------------------------------------------------
  static getOrganization(): Organization {
    if (!memoryOrg) {
      memoryOrg = loadStorage<Organization>(STORAGE_KEY_ORG, INITIAL_ORG);
    }
    return { ...memoryOrg };
  }

  static updateOrganization(updates: Partial<Organization>): Organization {
    const current = this.getOrganization();
    memoryOrg = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    persistStorage(STORAGE_KEY_ORG, memoryOrg);

    this.logAuditEvent({
      action: "ORGANIZATION_UPDATED",
      category: "settings",
      targetEntity: "Organization",
      details: `Updated organization details: ${Object.keys(updates).join(", ")}.`,
    });

    return { ...memoryOrg };
  }

  // -------------------------------------------------------------
  // Department Management
  // -------------------------------------------------------------
  static getDepartments(): Department[] {
    if (!memoryDepartments) {
      memoryDepartments = loadStorage<Department[]>(STORAGE_KEY_DEPARTMENTS, INITIAL_DEPARTMENTS);
    }
    return [...memoryDepartments];
  }

  static createDepartment(dept: Omit<Department, "id">): Department {
    const current = this.getDepartments();
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    memoryDepartments = [...current, newDept];
    persistStorage(STORAGE_KEY_DEPARTMENTS, memoryDepartments);

    this.logAuditEvent({
      action: "DEPARTMENT_CREATED",
      category: "settings",
      targetEntity: `Department: ${newDept.name}`,
      details: `Created new department "${newDept.name}".`,
    });

    return newDept;
  }

  static updateDepartment(id: string, updates: Partial<Department>): Department {
    const current = this.getDepartments();
    const target = current.find((d) => d.id === id);
    if (!target) throw new Error(`Department with ID ${id} not found.`);

    const updated = { ...target, ...updates };
    memoryDepartments = current.map((d) => (d.id === id ? updated : d));
    persistStorage(STORAGE_KEY_DEPARTMENTS, memoryDepartments);

    this.logAuditEvent({
      action: "DEPARTMENT_UPDATED",
      category: "settings",
      targetEntity: `Department: ${target.name}`,
      details: `Updated department "${target.name}".`,
    });

    return updated;
  }

  static deleteDepartment(id: string): void {
    const current = this.getDepartments();
    const target = current.find((d) => d.id === id);
    if (!target) throw new Error(`Department with ID ${id} not found.`);
    if (target.isSystem) throw new Error("Cannot delete a protected system department.");

    // Check if members are assigned
    const members = this.getMembers();
    const assignedCount = members.filter((m) => m.departmentId === id).length;
    if (assignedCount > 0) {
      throw new Error(`Cannot delete department "${target.name}" because ${assignedCount} active members are assigned to it. Reassign them first.`);
    }

    memoryDepartments = current.filter((d) => d.id !== id);
    persistStorage(STORAGE_KEY_DEPARTMENTS, memoryDepartments);

    this.logAuditEvent({
      action: "DEPARTMENT_DELETED",
      category: "settings",
      targetEntity: `Department: ${target.name}`,
      details: `Deleted department "${target.name}".`,
    });
  }

  // -------------------------------------------------------------
  // Role Management
  // -------------------------------------------------------------
  static getRoles(): Role[] {
    if (!memoryRoles) {
      memoryRoles = loadStorage<Role[]>(STORAGE_KEY_ROLES, DEFAULT_ROLES);
    }
    return [...memoryRoles];
  }

  static createRole(role: Omit<Role, "id">): Role {
    const current = this.getRoles();
    const newRole: Role = {
      ...role,
      id: `role-custom-${Date.now()}`,
      isSystem: false,
    };
    memoryRoles = [...current, newRole];
    persistStorage(STORAGE_KEY_ROLES, memoryRoles);

    this.logAuditEvent({
      action: "ROLE_CREATED",
      category: "role",
      targetEntity: `Role: ${newRole.name}`,
      details: `Created custom role "${newRole.name}".`,
    });

    return newRole;
  }

  static updateRole(id: string, updates: Partial<Role>): Role {
    const current = this.getRoles();
    const target = current.find((r) => r.id === id);
    if (!target) throw new Error(`Role with ID ${id} not found.`);
    if (target.id === "owner" && updates.permissions) {
      throw new Error("Workspace Owner role permissions cannot be downgraded.");
    }

    const updated = { ...target, ...updates };
    memoryRoles = current.map((r) => (r.id === id ? updated : r));
    persistStorage(STORAGE_KEY_ROLES, memoryRoles);

    this.logAuditEvent({
      action: "ROLE_UPDATED",
      category: "role",
      targetEntity: `Role: ${target.name}`,
      details: `Updated permissions or configuration for role "${target.name}".`,
    });

    return updated;
  }

  static deleteRole(id: string): void {
    const current = this.getRoles();
    const target = current.find((r) => r.id === id);
    if (!target) throw new Error(`Role with ID ${id} not found.`);
    if (target.isSystem) throw new Error("Cannot delete a built-in system role preset.");

    const members = this.getMembers();
    const assignedCount = members.filter((m) => m.roleId === id).length;
    if (assignedCount > 0) {
      throw new Error(`Cannot delete role "${target.name}" because ${assignedCount} members are currently assigned to it.`);
    }

    memoryRoles = current.filter((r) => r.id !== id);
    persistStorage(STORAGE_KEY_ROLES, memoryRoles);

    this.logAuditEvent({
      action: "ROLE_DELETED",
      category: "role",
      targetEntity: `Role: ${target.name}`,
      details: `Deleted custom role "${target.name}".`,
    });
  }

  // -------------------------------------------------------------
  // Member Management & Last-Owner Protection
  // -------------------------------------------------------------
  static getMembers(): WorkspaceMember[] {
    if (!memoryMembers) {
      memoryMembers = loadStorage<WorkspaceMember[]>(STORAGE_KEY_MEMBERS, INITIAL_MEMBERS);
    }
    return [...memoryMembers];
  }

  static getActiveMemberId(): string {
    memoryActiveMemberId = loadStorage<string>(STORAGE_KEY_ACTIVE_MEMBER_ID, "mem-1");
    return memoryActiveMemberId;
  }

  static setActiveMemberId(id: string): void {
    const members = this.getMembers();
    const found = members.find((m) => m.id === id);
    if (!found) throw new Error(`Member with ID ${id} not found.`);
    memoryActiveMemberId = id;
    persistStorage(STORAGE_KEY_ACTIVE_MEMBER_ID, id);

    this.logAuditEvent({
      action: "ACTIVE_USER_SWITCHED",
      category: "member",
      targetEntity: `WorkspaceMember: ${found.name}`,
      details: `Switched active testing identity to ${found.name} (${found.roleId}).`,
    });
  }

  static getActiveMember(): WorkspaceMember {
    const id = this.getActiveMemberId();
    const members = this.getMembers();
    return members.find((m) => m.id === id) || members[0] || INITIAL_MEMBERS[0];
  }

  static createMember(
    data: Omit<WorkspaceMember, "id" | "joinedAt" | "workloadStats">
  ): WorkspaceMember {
    const current = this.getMembers();
    const newMember: WorkspaceMember = {
      ...data,
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      joinedAt: new Date().toISOString(),
      workloadStats: {
        assignedLeads: 0,
        assignedDeals: 0,
        assignedTasks: 0,
        activeConversations: 0,
      },
    };

    memoryMembers = [...current, newMember];
    persistStorage(STORAGE_KEY_MEMBERS, memoryMembers);

    this.logAuditEvent({
      action: "MEMBER_CREATED",
      category: "member",
      targetEntity: `WorkspaceMember: ${newMember.name}`,
      details: `Added new member ${newMember.name} (${newMember.email}) with role ${newMember.roleId}.`,
    });

    return newMember;
  }

  static updateMember(id: string, updates: Partial<WorkspaceMember>): WorkspaceMember {
    const current = this.getMembers();
    const target = current.find((m) => m.id === id);
    if (!target) throw new Error(`Member with ID ${id} not found.`);

    // Last-owner protection if role is changed from owner
    if (target.roleId === "owner" && updates.roleId && updates.roleId !== "owner") {
      const activeOwners = current.filter(
        (m) => m.id !== id && m.roleId === "owner" && m.status === "active"
      );
      if (activeOwners.length === 0) {
        throw new Error(
          "Last Owner Protection: Cannot demote the last active Workspace Owner. Designate another active Owner first."
        );
      }
    }

    const updated = { ...target, ...updates };
    memoryMembers = current.map((m) => (m.id === id ? updated : m));
    persistStorage(STORAGE_KEY_MEMBERS, memoryMembers);

    this.logAuditEvent({
      action: "MEMBER_UPDATED",
      category: "member",
      targetEntity: `WorkspaceMember: ${target.name}`,
      details: `Updated member details: ${Object.keys(updates).join(", ")}.`,
    });

    return updated;
  }

  static deactivateMember(id: string): WorkspaceMember {
    const current = this.getMembers();
    const target = current.find((m) => m.id === id);
    if (!target) throw new Error(`Member with ID ${id} not found.`);

    // Last-owner protection
    if (target.roleId === "owner") {
      const remainingActiveOwners = current.filter(
        (m) => m.id !== id && m.roleId === "owner" && m.status === "active"
      );
      if (remainingActiveOwners.length === 0) {
        throw new Error(
          "Last Owner Protection: Cannot deactivate the last active Workspace Owner. Designate another active Owner first."
        );
      }
    }

    const updated: WorkspaceMember = { ...target, status: "inactive" };
    memoryMembers = current.map((m) => (m.id === id ? updated : m));
    persistStorage(STORAGE_KEY_MEMBERS, memoryMembers);

    this.logAuditEvent({
      action: "MEMBER_DEACTIVATED",
      category: "member",
      targetEntity: `WorkspaceMember: ${target.name}`,
      details: `Deactivated member account for ${target.name}.`,
    });

    return updated;
  }

  static deleteMember(id: string): void {
    const current = this.getMembers();
    const target = current.find((m) => m.id === id);
    if (!target) throw new Error(`Member with ID ${id} not found.`);

    // Last-owner protection
    if (target.roleId === "owner") {
      const remainingActiveOwners = current.filter(
        (m) => m.id !== id && m.roleId === "owner" && m.status === "active"
      );
      if (remainingActiveOwners.length === 0) {
        throw new Error(
          "Last Owner Protection: Cannot remove the last active Workspace Owner. Designate another active Owner first."
        );
      }
    }

    memoryMembers = current.filter((m) => m.id !== id);
    persistStorage(STORAGE_KEY_MEMBERS, memoryMembers);

    this.logAuditEvent({
      action: "MEMBER_REMOVED",
      category: "member",
      targetEntity: `WorkspaceMember: ${target.name}`,
      details: `Removed member ${target.name} from workspace.`,
    });
  }

  /**
   * Reassigns all CRM records owned by one member to another active member.
   */
  static async reassignMemberRecords(
    fromMemberName: string,
    toMemberName: string
  ): Promise<{ leads: number; deals: number; tasks: number; contacts: number }> {
    const leads = await repo.listLeads();
    const deals = await repo.listDeals();
    const tasks = await repo.listTasks();
    const contacts = await repo.listContacts();

    let reLeads = 0;
    let reDeals = 0;
    let reTasks = 0;
    let reContacts = 0;

    for (const l of leads) {
      if (l.owner === fromMemberName) {
        await repo.updateLead(l.id, { owner: toMemberName });
        reLeads++;
      }
    }

    for (const d of deals) {
      if (d.owner === fromMemberName) {
        await repo.updateDeal(d.id, { owner: toMemberName });
        reDeals++;
      }
    }

    for (const t of tasks) {
      if (t.assignedTo === fromMemberName) {
        await repo.updateTask(t.id, { assignedTo: toMemberName });
        reTasks++;
      }
    }

    for (const c of contacts) {
      if (c.owner === fromMemberName) {
        await repo.updateContact(c.id, { owner: toMemberName });
        reContacts++;
      }
    }

    this.logAuditEvent({
      action: "RECORDS_REASSIGNED",
      category: "crm_record",
      targetEntity: `Reassignment: ${fromMemberName} -> ${toMemberName}`,
      details: `Reassigned ${reLeads} leads, ${reDeals} deals, ${reTasks} tasks, and ${reContacts} contacts from ${fromMemberName} to ${toMemberName}.`,
    });

    return { leads: reLeads, deals: reDeals, tasks: reTasks, contacts: reContacts };
  }

  // -------------------------------------------------------------
  // Audit History Log
  // -------------------------------------------------------------
  static getAuditLog(): AuditEvent[] {
    if (!memoryAuditLog) {
      memoryAuditLog = loadStorage<AuditEvent[]>(STORAGE_KEY_AUDIT_LOG, INITIAL_AUDIT_LOG);
    }
    return [...memoryAuditLog];
  }

  static logAuditEvent(
    event: Omit<AuditEvent, "id" | "timestamp" | "actorId" | "actorName" | "actorEmail"> & {
      actorId?: string;
      actorName?: string;
      actorEmail?: string;
    }
  ): AuditEvent {
    const activeMember = this.getActiveMember();
    const newEvent: AuditEvent = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorId: event.actorId || activeMember.id,
      actorName: event.actorName || activeMember.name,
      actorEmail: event.actorEmail || activeMember.email,
      action: event.action,
      category: event.category,
      targetEntity: event.targetEntity,
      targetId: event.targetId,
      details: event.details,
      ipAddress: "127.0.0.1 (Local Session)",
    };

    const current = this.getAuditLog();
    // Keep up to 250 most recent events
    memoryAuditLog = [newEvent, ...current].slice(0, 250);
    persistStorage(STORAGE_KEY_AUDIT_LOG, memoryAuditLog);

    return newEvent;
  }

  // -------------------------------------------------------------
  // CRM Configuration
  // -------------------------------------------------------------
  static getCRMConfig(): CRMConfiguration {
    if (!memoryCRMConfig) {
      memoryCRMConfig = loadStorage<CRMConfiguration>(STORAGE_KEY_CRM_CONFIG, INITIAL_CRM_CONFIG);
    }
    return { ...memoryCRMConfig };
  }

  static updateCRMConfig(updates: Partial<CRMConfiguration>): CRMConfiguration {
    const current = this.getCRMConfig();
    memoryCRMConfig = { ...current, ...updates };
    persistStorage(STORAGE_KEY_CRM_CONFIG, memoryCRMConfig);

    this.logAuditEvent({
      action: "CRM_CONFIG_UPDATED",
      category: "settings",
      targetEntity: "CRMConfiguration",
      details: `Updated CRM configuration fields: ${Object.keys(updates).join(", ")}.`,
    });

    return { ...memoryCRMConfig };
  }

  // -------------------------------------------------------------
  // Integrations Center
  // -------------------------------------------------------------
  static getIntegrations(): IntegrationConfiguration[] {
    if (!memoryIntegrations) {
      memoryIntegrations = loadStorage<IntegrationConfiguration[]>(
        STORAGE_KEY_INTEGRATIONS,
        INITIAL_INTEGRATIONS
      );
    }
    return [...memoryIntegrations];
  }

  static updateIntegration(
    id: string,
    updates: Partial<IntegrationConfiguration>
  ): IntegrationConfiguration {
    const current = this.getIntegrations();
    const target = current.find((i) => i.id === id);
    if (!target) throw new Error(`Integration with ID ${id} not found.`);

    const updated = { ...target, ...updates };
    memoryIntegrations = current.map((i) => (i.id === id ? updated : i));
    persistStorage(STORAGE_KEY_INTEGRATIONS, memoryIntegrations);

    this.logAuditEvent({
      action: "INTEGRATION_UPDATED",
      category: "settings",
      targetEntity: `Integration: ${target.name}`,
      details: `Updated integration status to "${updated.status}".`,
    });

    return updated;
  }

  // -------------------------------------------------------------
  // Plan & Billing
  // -------------------------------------------------------------
  static getSubscription(): SubscriptionPlan {
    if (!memorySubscription) {
      memorySubscription = loadStorage<SubscriptionPlan>(
        STORAGE_KEY_SUBSCRIPTION,
        INITIAL_SUBSCRIPTION
      );
    }
    return { ...memorySubscription };
  }

  static updateSubscription(planId: "Starter" | "Professional" | "Enterprise"): SubscriptionPlan {
    let name = planId;
    let priceLabel = "₹14,999 / month";
    let limits = { users: 10, leads: 1000, automations: 20, aiQueriesPerDay: 500, storageGb: 25 };

    if (planId === "Starter") {
      priceLabel = "₹4,999 / month";
      limits = { users: 3, leads: 300, automations: 5, aiQueriesPerDay: 100, storageGb: 5 };
    } else if (planId === "Enterprise") {
      priceLabel = "₹39,999 / month";
      limits = { users: 50, leads: 10000, automations: 100, aiQueriesPerDay: 2500, storageGb: 200 };
    }

    memorySubscription = {
      ...this.getSubscription(),
      id: `plan-${planId.toLowerCase()}`,
      name,
      priceLabel,
      limits,
      isCurrent: true,
    };
    persistStorage(STORAGE_KEY_SUBSCRIPTION, memorySubscription);

    this.logAuditEvent({
      action: "SUBSCRIPTION_CHANGED",
      category: "settings",
      targetEntity: `Plan: ${name}`,
      details: `Plan selection changed to ${name} (${priceLabel}). Notice: Pending Phase 15 payment gateway.`,
    });

    return { ...memorySubscription };
  }

  // -------------------------------------------------------------
  // Data Export, Backup Validation & Import
  // -------------------------------------------------------------
  static async exportWorkspaceData(): Promise<WorkspaceExportData> {
    const org = this.getOrganization();
    const members = this.getMembers();
    const roles = this.getRoles();
    const departments = this.getDepartments();
    const crmConfig = this.getCRMConfig();
    const auditLog = this.getAuditLog();

    const leads = await repo.listLeads();
    const contacts = await repo.listContacts();
    const companies = await repo.listCompanies();
    const deals = await repo.listDeals();
    const tasks = await repo.listTasks();
    const meetings = await repo.listMeetings();

    // Sensitive field filtering (never export credentials or tokens)
    const exportData: WorkspaceExportData = {
      version: "bizlead_backup_v10",
      exportedAt: new Date().toISOString(),
      organization: org,
      members: members.map((m) => ({
        ...m,
        phone: m.phone ? m.phone.replace(/.(?=.{4})/g, "*") : undefined,
      })),
      roles,
      departments,
      crmConfig,
      leadsCount: leads.length,
      contactsCount: contacts.length,
      companiesCount: companies.length,
      dealsCount: deals.length,
      tasksCount: tasks.length,
      meetingsCount: meetings.length,
      workflowsCount: 0,
      campaignsCount: 0,
      records: {
        leads,
        contacts,
        companies,
        deals,
        tasks,
        meetings,
        campaigns: [],
        workflows: [],
      },
      auditLogSample: auditLog.slice(0, 20),
    };

    this.logAuditEvent({
      action: "WORKSPACE_DATA_EXPORTED",
      category: "export",
      targetEntity: "Workspace Data Backup",
      details: `Exported workspace backup JSON containing ${leads.length} leads, ${deals.length} deals, and ${members.length} members.`,
    });

    return exportData;
  }

  static validateBackupData(data: any): {
    valid: boolean;
    errors: string[];
    stats?: {
      version: string;
      exportedAt: string;
      leadsCount: number;
      contactsCount: number;
      dealsCount: number;
      membersCount: number;
    };
  } {
    const errors: string[] = [];

    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Invalid backup payload: Must be a valid JSON object."] };
    }

    if (data.version !== "bizlead_backup_v10") {
      errors.push(`Unsupported or missing backup version. Expected "bizlead_backup_v10", received "${data.version || "unknown"}".`);
    }

    if (!data.organization || typeof data.organization.name !== "string") {
      errors.push("Missing or malformed organization schema.");
    }

    if (!Array.isArray(data.members)) {
      errors.push("Missing or malformed members list.");
    }

    if (!data.records || typeof data.records !== "object") {
      errors.push("Missing records object in backup file.");
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return {
      valid: true,
      errors: [],
      stats: {
        version: data.version,
        exportedAt: data.exportedAt || "Unknown date",
        leadsCount: Array.isArray(data.records?.leads) ? data.records.leads.length : 0,
        contactsCount: Array.isArray(data.records?.contacts) ? data.records.contacts.length : 0,
        dealsCount: Array.isArray(data.records?.deals) ? data.records.deals.length : 0,
        membersCount: Array.isArray(data.members) ? data.members.length : 0,
      },
    };
  }

  /**
   * Resets only explicit BizLead keys without clearing user's normal browser session.
   */
  static async resetBizLeadDemoData(): Promise<void> {
    if (typeof window === "undefined") return;

    // 1. Reset CRM records through CRM repository
    await repo.resetCRMData();

    // 2. Reset Settings keys
    persistStorage(STORAGE_KEY_ORG, INITIAL_ORG);
    persistStorage(STORAGE_KEY_MEMBERS, INITIAL_MEMBERS);
    persistStorage(STORAGE_KEY_ACTIVE_MEMBER_ID, "mem-1");
    persistStorage(STORAGE_KEY_DEPARTMENTS, INITIAL_DEPARTMENTS);
    persistStorage(STORAGE_KEY_ROLES, DEFAULT_ROLES);
    persistStorage(STORAGE_KEY_INTEGRATIONS, INITIAL_INTEGRATIONS);
    persistStorage(STORAGE_KEY_CRM_CONFIG, INITIAL_CRM_CONFIG);
    persistStorage(STORAGE_KEY_SUBSCRIPTION, INITIAL_SUBSCRIPTION);
    persistStorage(STORAGE_KEY_AUDIT_LOG, INITIAL_AUDIT_LOG);

    memoryOrg = { ...INITIAL_ORG };
    memoryMembers = [...INITIAL_MEMBERS];
    memoryActiveMemberId = "mem-1";
    memoryDepartments = [...INITIAL_DEPARTMENTS];
    memoryRoles = [...DEFAULT_ROLES];
    memoryIntegrations = [...INITIAL_INTEGRATIONS];
    memoryCRMConfig = { ...INITIAL_CRM_CONFIG };
    memorySubscription = { ...INITIAL_SUBSCRIPTION };
    memoryAuditLog = [...INITIAL_AUDIT_LOG];

    this.logAuditEvent({
      action: "DEMO_DATA_RESET",
      category: "settings",
      targetEntity: "Workspace",
      details: "Explicitly reset BizLead prototype data to pristine initial seeds.",
    });
  }
}
