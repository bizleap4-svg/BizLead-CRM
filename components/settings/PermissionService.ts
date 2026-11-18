/**
 * BizLead Revenue OS — Permission Service
 * Centralized role and capability engine with deny-by-default logic,
 * record filtering, and action execution revalidation.
 *
 * Notice: This is prototype authorization logic for client-side evaluation.
 * Production security requires server-side token enforcement and tenant isolation (Phase 12).
 */

import {
  AccessScope,
  CRMResource,
  Operation,
  Permission,
  Role,
  WorkspaceMember,
} from "./types";

export const DEFAULT_ROLES: Role[] = [
  {
    id: "owner",
    name: "Workspace Owner",
    description: "Full control over organization settings, billing, subscriptions, teams, permissions, and all CRM data.",
    isSystem: true,
    color: "#E2F000",
    permissions: [
      { resource: "dashboard", operations: ["view", "export"], scope: "organization" },
      { resource: "leads", operations: ["view", "create", "edit", "delete", "archive", "assign", "import", "export", "manage"], scope: "organization" },
      { resource: "pipeline", operations: ["view", "create", "edit", "delete", "archive", "assign", "manage"], scope: "organization" },
      { resource: "contacts", operations: ["view", "create", "edit", "delete", "archive", "assign", "import", "export", "manage"], scope: "organization" },
      { resource: "companies", operations: ["view", "create", "edit", "delete", "archive", "assign", "import", "export", "manage"], scope: "organization" },
      { resource: "inbox", operations: ["view", "create", "edit", "delete", "archive", "assign", "manage"], scope: "organization" },
      { resource: "tasks", operations: ["view", "create", "edit", "delete", "archive", "assign", "manage"], scope: "organization" },
      { resource: "calendar", operations: ["view", "create", "edit", "delete", "manage"], scope: "organization" },
      { resource: "meetings", operations: ["view", "create", "edit", "delete", "archive", "manage"], scope: "organization" },
      { resource: "campaigns", operations: ["view", "create", "edit", "delete", "archive", "export", "manage"], scope: "organization" },
      { resource: "analytics", operations: ["view", "export", "manage"], scope: "organization" },
      { resource: "reports", operations: ["view", "create", "edit", "delete", "export", "manage"], scope: "organization" },
      { resource: "automations", operations: ["view", "create", "edit", "delete", "archive", "approve", "manage"], scope: "organization" },
      { resource: "ai", operations: ["view", "create", "edit", "approve", "manage"], scope: "organization" },
      { resource: "administration", operations: ["view", "create", "edit", "delete", "manage"], scope: "organization" },
      { resource: "billing", operations: ["view", "manage"], scope: "organization" },
    ],
  },
  {
    id: "admin",
    name: "Administrator",
    description: "Complete administration of CRM configurations, team members, and workflows. Billing access restricted.",
    isSystem: true,
    color: "#3B82F6",
    permissions: [
      { resource: "dashboard", operations: ["view", "export"], scope: "organization" },
      { resource: "leads", operations: ["view", "create", "edit", "delete", "archive", "assign", "import", "export", "manage"], scope: "organization" },
      { resource: "pipeline", operations: ["view", "create", "edit", "delete", "archive", "assign", "manage"], scope: "organization" },
      { resource: "contacts", operations: ["view", "create", "edit", "delete", "archive", "assign", "import", "export", "manage"], scope: "organization" },
      { resource: "companies", operations: ["view", "create", "edit", "delete", "archive", "assign", "import", "export", "manage"], scope: "organization" },
      { resource: "inbox", operations: ["view", "create", "edit", "delete", "archive", "assign", "manage"], scope: "organization" },
      { resource: "tasks", operations: ["view", "create", "edit", "delete", "archive", "assign", "manage"], scope: "organization" },
      { resource: "calendar", operations: ["view", "create", "edit", "delete", "manage"], scope: "organization" },
      { resource: "meetings", operations: ["view", "create", "edit", "delete", "archive", "manage"], scope: "organization" },
      { resource: "campaigns", operations: ["view", "create", "edit", "delete", "archive", "export", "manage"], scope: "organization" },
      { resource: "analytics", operations: ["view", "export", "manage"], scope: "organization" },
      { resource: "reports", operations: ["view", "create", "edit", "delete", "export", "manage"], scope: "organization" },
      { resource: "automations", operations: ["view", "create", "edit", "delete", "archive", "approve", "manage"], scope: "organization" },
      { resource: "ai", operations: ["view", "create", "edit", "approve", "manage"], scope: "organization" },
      { resource: "administration", operations: ["view", "create", "edit", "delete", "manage"], scope: "organization" },
      { resource: "billing", operations: [], scope: "none" },
    ],
  },
  {
    id: "sales_manager",
    name: "Sales Manager",
    description: "Manages sales department, reviews team performance, assigns pipeline records, and coordinates deals.",
    isSystem: true,
    color: "#10B981",
    permissions: [
      { resource: "dashboard", operations: ["view"], scope: "organization" },
      { resource: "leads", operations: ["view", "create", "edit", "archive", "assign", "export"], scope: "team" },
      { resource: "pipeline", operations: ["view", "create", "edit", "archive", "assign"], scope: "team" },
      { resource: "contacts", operations: ["view", "create", "edit", "archive", "assign", "export"], scope: "team" },
      { resource: "companies", operations: ["view", "create", "edit"], scope: "team" },
      { resource: "inbox", operations: ["view", "create", "edit", "assign"], scope: "team" },
      { resource: "tasks", operations: ["view", "create", "edit", "archive", "assign"], scope: "team" },
      { resource: "calendar", operations: ["view", "create", "edit"], scope: "team" },
      { resource: "meetings", operations: ["view", "create", "edit", "archive"], scope: "team" },
      { resource: "campaigns", operations: ["view"], scope: "organization" },
      { resource: "analytics", operations: ["view"], scope: "team" },
      { resource: "reports", operations: ["view", "create", "export"], scope: "team" },
      { resource: "automations", operations: ["view", "create", "edit"], scope: "own" },
      { resource: "ai", operations: ["view", "create", "edit", "approve"], scope: "team" },
      { resource: "administration", operations: [], scope: "none" },
      { resource: "billing", operations: [], scope: "none" },
    ],
  },
  {
    id: "sales_executive",
    name: "Sales Executive",
    description: "Focuses on assigned leads, personal deals pipeline, daily outreach, scheduled meetings, and tasks.",
    isSystem: true,
    color: "#F59E0B",
    permissions: [
      { resource: "dashboard", operations: ["view"], scope: "organization" },
      { resource: "leads", operations: ["view", "create", "edit", "archive"], scope: "assigned" },
      { resource: "pipeline", operations: ["view", "create", "edit", "archive"], scope: "assigned" },
      { resource: "contacts", operations: ["view", "create", "edit"], scope: "assigned" },
      { resource: "companies", operations: ["view"], scope: "organization" },
      { resource: "inbox", operations: ["view", "create", "edit"], scope: "assigned" },
      { resource: "tasks", operations: ["view", "create", "edit"], scope: "assigned" },
      { resource: "calendar", operations: ["view", "create", "edit"], scope: "assigned" },
      { resource: "meetings", operations: ["view", "create", "edit"], scope: "assigned" },
      { resource: "campaigns", operations: ["view"], scope: "organization" },
      { resource: "analytics", operations: ["view"], scope: "assigned" },
      { resource: "reports", operations: ["view"], scope: "assigned" },
      { resource: "automations", operations: [], scope: "none" },
      { resource: "ai", operations: ["view", "create"], scope: "assigned" },
      { resource: "administration", operations: [], scope: "none" },
      { resource: "billing", operations: [], scope: "none" },
    ],
  },
  {
    id: "marketing_manager",
    name: "Marketing Manager",
    description: "Owns marketing campaigns, ad platforms, growth analytics, attribution reports, and lead generation.",
    isSystem: true,
    color: "#EC4899",
    permissions: [
      { resource: "dashboard", operations: ["view"], scope: "organization" },
      { resource: "leads", operations: ["view", "create", "export"], scope: "organization" },
      { resource: "pipeline", operations: ["view"], scope: "organization" },
      { resource: "contacts", operations: ["view", "create"], scope: "organization" },
      { resource: "companies", operations: ["view", "create"], scope: "organization" },
      { resource: "inbox", operations: ["view"], scope: "department" },
      { resource: "tasks", operations: ["view", "create", "edit"], scope: "own" },
      { resource: "calendar", operations: ["view", "create", "edit"], scope: "own" },
      { resource: "meetings", operations: ["view", "create", "edit"], scope: "own" },
      { resource: "campaigns", operations: ["view", "create", "edit", "delete", "archive", "export", "manage"], scope: "organization" },
      { resource: "analytics", operations: ["view", "export", "manage"], scope: "organization" },
      { resource: "reports", operations: ["view", "create", "edit", "export", "manage"], scope: "organization" },
      { resource: "automations", operations: ["view", "create", "edit"], scope: "department" },
      { resource: "ai", operations: ["view", "create", "edit", "approve"], scope: "department" },
      { resource: "administration", operations: [], scope: "none" },
      { resource: "billing", operations: [], scope: "none" },
    ],
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only access across general CRM records and reports. Cannot modify data or execute mutations.",
    isSystem: true,
    color: "#6B7280",
    permissions: [
      { resource: "dashboard", operations: ["view"], scope: "organization" },
      { resource: "leads", operations: ["view"], scope: "organization" },
      { resource: "pipeline", operations: ["view"], scope: "organization" },
      { resource: "contacts", operations: ["view"], scope: "organization" },
      { resource: "companies", operations: ["view"], scope: "organization" },
      { resource: "inbox", operations: [], scope: "none" },
      { resource: "tasks", operations: ["view"], scope: "organization" },
      { resource: "calendar", operations: ["view"], scope: "organization" },
      { resource: "meetings", operations: ["view"], scope: "organization" },
      { resource: "campaigns", operations: ["view"], scope: "organization" },
      { resource: "analytics", operations: ["view"], scope: "organization" },
      { resource: "reports", operations: ["view"], scope: "organization" },
      { resource: "automations", operations: [], scope: "none" },
      { resource: "ai", operations: ["view"], scope: "organization" }, // Read-only query capability only
      { resource: "administration", operations: [], scope: "none" },
      { resource: "billing", operations: [], scope: "none" },
    ],
  },
];

export class PermissionService {
  /**
   * Resolves a role object by ID or custom roles list.
   */
  static getRole(roleId: string, customRoles: Role[] = []): Role {
    const foundCustom = customRoles.find((r) => r.id === roleId);
    if (foundCustom) return foundCustom;
    const foundDefault = DEFAULT_ROLES.find((r) => r.id === roleId);
    if (foundDefault) return foundDefault;

    // Deny-by-default fallback for unknown role
    return {
      id: roleId,
      name: "Unknown Role (Restricted)",
      description: "Default fallback with zero permissions",
      permissions: [],
    };
  }

  /**
   * Resolves permission rule for a specific resource under a role.
   */
  static getResourcePermission(role: Role, resource: CRMResource): Permission | null {
    return role.permissions.find((p) => p.resource === resource) || null;
  }

  /**
   * Evaluates if a role or member has permission to perform an operation on a resource.
   * Denies by default if resource or operation is not found.
   */
  static hasPermission(
    roleOrMember: Role | WorkspaceMember | string,
    resource: CRMResource,
    operation: Operation,
    context?: {
      recordOwner?: string;
      recordDepartmentId?: string;
      currentUserName?: string;
      currentUserDepartmentId?: string;
      customRoles?: Role[];
    }
  ): boolean {
    let role: Role;
    let memberName = context?.currentUserName;
    let memberDept = context?.currentUserDepartmentId;

    if (typeof roleOrMember === "string") {
      role = this.getRole(roleOrMember, context?.customRoles);
    } else if ("roleId" in roleOrMember) {
      // It's a WorkspaceMember
      role = this.getRole(roleOrMember.roleId, context?.customRoles);
      if (!memberName) memberName = roleOrMember.name;
      if (!memberDept) memberDept = roleOrMember.departmentId;
    } else {
      role = roleOrMember;
    }

    const perm = this.getResourcePermission(role, resource);
    if (!perm || perm.scope === "none") {
      return false;
    }

    if (!perm.operations.includes(operation)) {
      return false;
    }

    // Check scope applicability if a specific record owner is provided
    if (context?.recordOwner && perm.scope !== "organization") {
      const isOwner =
        memberName &&
        (context.recordOwner.toLowerCase() === memberName.toLowerCase() ||
          context.recordOwner.includes(memberName) ||
          memberName.includes(context.recordOwner));

      if (perm.scope === "assigned" || perm.scope === "own") {
        if (!isOwner) return false;
      } else if (perm.scope === "department" || perm.scope === "team") {
        // If department is known, verify department match; otherwise allow if assigned
        if (
          context.recordDepartmentId &&
          memberDept &&
          context.recordDepartmentId !== memberDept
        ) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Helper: Check if resource can be viewed.
   */
  static canView(
    roleOrMember: Role | WorkspaceMember | string,
    resource: CRMResource,
    context?: { recordOwner?: string; currentUserName?: string; customRoles?: Role[] }
  ): boolean {
    return this.hasPermission(roleOrMember, resource, "view", context);
  }

  /**
   * Helper: Check if resource can be created.
   */
  static canCreate(
    roleOrMember: Role | WorkspaceMember | string,
    resource: CRMResource,
    customRoles?: Role[]
  ): boolean {
    return this.hasPermission(roleOrMember, resource, "create", { customRoles });
  }

  /**
   * Helper: Check if resource can be edited.
   */
  static canEdit(
    roleOrMember: Role | WorkspaceMember | string,
    resource: CRMResource,
    context?: { recordOwner?: string; currentUserName?: string; customRoles?: Role[] }
  ): boolean {
    return this.hasPermission(roleOrMember, resource, "edit", context);
  }

  /**
   * Helper: Check if resource can be deleted.
   */
  static canDelete(
    roleOrMember: Role | WorkspaceMember | string,
    resource: CRMResource,
    context?: { recordOwner?: string; currentUserName?: string; customRoles?: Role[] }
  ): boolean {
    return this.hasPermission(roleOrMember, resource, "delete", context);
  }

  /**
   * Helper: Check if administration can be managed.
   */
  static canManageAdmin(
    roleOrMember: Role | WorkspaceMember | string,
    customRoles?: Role[]
  ): boolean {
    return this.hasPermission(roleOrMember, "administration", "manage", { customRoles });
  }

  /**
   * Helper: Check if billing can be viewed or managed.
   */
  static canAccessBilling(
    roleOrMember: Role | WorkspaceMember | string,
    customRoles?: Role[]
  ): boolean {
    return this.hasPermission(roleOrMember, "billing", "view", { customRoles });
  }

  /**
   * Filters a list of CRM records according to the member's access scope.
   */
  static filterRecords<T extends Record<string, any>>(
    records: T[],
    roleOrMember: Role | WorkspaceMember | string,
    resource: CRMResource,
    currentUser: { name: string; departmentId?: string },
    customRoles?: Role[]
  ): T[] {
    let role: Role;
    if (typeof roleOrMember === "string") {
      role = this.getRole(roleOrMember, customRoles);
    } else if ("roleId" in roleOrMember) {
      role = this.getRole(roleOrMember.roleId, customRoles);
    } else {
      role = roleOrMember;
    }

    const perm = this.getResourcePermission(role, resource);
    if (!perm || perm.scope === "none" || !perm.operations.includes("view")) {
      return [];
    }

    if (perm.scope === "organization") {
      return records;
    }

    if (perm.scope === "assigned" || perm.scope === "own") {
      return records.filter((r) => {
        const ownerVal = (r.owner || r.assignedTo || r.host || "") as string;
        return (
          ownerVal.toLowerCase() === currentUser.name.toLowerCase() ||
          ownerVal.includes(currentUser.name) ||
          currentUser.name.includes(ownerVal)
        );
      });
    }

    if (perm.scope === "department" || perm.scope === "team") {
      return records.filter((r) => {
        if (r.departmentId && currentUser.departmentId) {
          return r.departmentId === currentUser.departmentId;
        }
        // Fallback for demo records without explicit department ID: keep if matches owner or return all team records
        return true;
      });
    }

    return records;
  }

  /**
   * Revalidates whether an AI Action Proposal or Automation step is permitted
   * for the executing member. Used in ActionExecutor and WorkflowEngine.
   */
  static validateActionExecution(
    roleOrMember: Role | WorkspaceMember | string,
    actionType: string,
    entityType: string,
    recordOwner?: string,
    currentUserName?: string,
    customRoles?: Role[]
  ): { allowed: boolean; reason?: string } {
    let role: Role;
    let memberName = currentUserName;

    if (typeof roleOrMember === "string") {
      role = this.getRole(roleOrMember, customRoles);
    } else if ("roleId" in roleOrMember) {
      role = this.getRole(roleOrMember.roleId, customRoles);
      if (!memberName) memberName = roleOrMember.name;
    } else {
      role = roleOrMember;
    }

    // 1. Viewer role is strictly read-only
    if (role.id === "viewer") {
      return {
        allowed: false,
        reason: `Permission Denied: User role "${role.name}" is strictly read-only and cannot execute mutations.`,
      };
    }

    // 2. Check resource mapping
    let resource: CRMResource = "leads";
    let operation: Operation = "edit";

    if (actionType === "create_task" || actionType === "create_followup") {
      resource = "tasks";
      operation = "create";
    } else if (actionType === "create_meeting_draft") {
      resource = "meetings";
      operation = "create";
    } else if (actionType === "create_automation_draft") {
      resource = "automations";
      operation = "create";
    } else if (actionType === "update_deal_stage") {
      resource = "pipeline";
      operation = "edit";
    } else if (actionType === "assign_lead_owner") {
      resource = "leads";
      operation = "assign";
    } else if (actionType === "update_lead_priority" || actionType === "add_internal_note") {
      resource = "leads";
      operation = "edit";
    }

    const permitted = this.hasPermission(role, resource, operation, {
      recordOwner,
      currentUserName: memberName,
      customRoles,
    });

    if (!permitted) {
      return {
        allowed: false,
        reason: `Permission Denied: User role "${role.name}" lacks permission for operation "${operation}" on module "${resource}".`,
      };
    }

    return { allowed: true };
  }
}
