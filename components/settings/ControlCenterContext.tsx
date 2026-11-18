"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  AuditEvent,
  CRMConfiguration,
  Department,
  IntegrationConfiguration,
  Operation,
  Organization,
  CRMResource,
  Role,
  SubscriptionPlan,
  WorkspaceExportData,
  WorkspaceMember,
} from "./types";
import { SettingsRepository } from "./SettingsRepository";
import { PermissionService } from "./PermissionService";

interface ControlCenterContextType {
  organization: Organization;
  members: WorkspaceMember[];
  activeMember: WorkspaceMember;
  activeRole: Role;
  departments: Department[];
  roles: Role[];
  integrations: IntegrationConfiguration[];
  crmConfig: CRMConfiguration;
  subscription: SubscriptionPlan;
  auditLog: AuditEvent[];
  loading: boolean;

  // Active testing user switcher
  switchActiveMember: (id: string) => void;

  // Capability checks
  can: (resource: CRMResource, operation: Operation, context?: { recordOwner?: string; recordDepartmentId?: string }) => boolean;
  canView: (resource: CRMResource, recordOwner?: string) => boolean;
  canCreate: (resource: CRMResource) => boolean;
  canEdit: (resource: CRMResource, recordOwner?: string) => boolean;
  canDelete: (resource: CRMResource, recordOwner?: string) => boolean;
  canManageAdmin: () => boolean;
  canAccessBilling: () => boolean;

  // Record filtering
  filterRecords: <T extends { owner?: string; assignedTo?: string; departmentId?: string }>(records: T[], resource: CRMResource) => T[];

  // Mutations
  updateOrganization: (updates: Partial<Organization>) => void;
  createMember: (data: Omit<WorkspaceMember, "id" | "joinedAt" | "workloadStats">) => WorkspaceMember;
  updateMember: (id: string, updates: Partial<WorkspaceMember>) => WorkspaceMember;
  deactivateMember: (id: string) => WorkspaceMember;
  deleteMember: (id: string) => void;
  reassignRecords: (fromMemberName: string, toMemberName: string) => Promise<{ leads: number; deals: number; tasks: number; contacts: number }>;

  createDepartment: (dept: Omit<Department, "id">) => Department;
  updateDepartment: (id: string, updates: Partial<Department>) => Department;
  deleteDepartment: (id: string) => void;

  createRole: (role: Omit<Role, "id">) => Role;
  updateRole: (id: string, updates: Partial<Role>) => Role;
  deleteRole: (id: string) => void;

  updateCRMConfig: (updates: Partial<CRMConfiguration>) => void;
  updateIntegration: (id: string, updates: Partial<IntegrationConfiguration>) => void;
  updateSubscription: (planId: "Starter" | "Professional" | "Enterprise") => void;

  logAudit: (action: string, category: AuditEvent["category"], targetEntity: string, details: string) => void;
  exportData: () => Promise<WorkspaceExportData>;
  resetDemoData: () => Promise<void>;
  refreshAll: () => void;
}

const ControlCenterContext = createContext<ControlCenterContextType | null>(null);

export function ControlCenterProvider({ children }: { children: ReactNode }) {
  const [organization, setOrganization] = useState<Organization>(SettingsRepository.getOrganization());
  const [members, setMembers] = useState<WorkspaceMember[]>(SettingsRepository.getMembers());
  const [activeMemberId, setActiveMemberId] = useState<string>(SettingsRepository.getActiveMemberId());
  const [departments, setDepartments] = useState<Department[]>(SettingsRepository.getDepartments());
  const [roles, setRoles] = useState<Role[]>(SettingsRepository.getRoles());
  const [integrations, setIntegrations] = useState<IntegrationConfiguration[]>(SettingsRepository.getIntegrations());
  const [crmConfig, setCrmConfig] = useState<CRMConfiguration>(SettingsRepository.getCRMConfig());
  const [subscription, setSubscription] = useState<SubscriptionPlan>(SettingsRepository.getSubscription());
  const [auditLog, setAuditLog] = useState<AuditEvent[]>(SettingsRepository.getAuditLog());
  const [loading, setLoading] = useState(false);

  const reloadData = () => {
    setOrganization(SettingsRepository.getOrganization());
    setMembers(SettingsRepository.getMembers());
    setActiveMemberId(SettingsRepository.getActiveMemberId());
    setDepartments(SettingsRepository.getDepartments());
    setRoles(SettingsRepository.getRoles());
    setIntegrations(SettingsRepository.getIntegrations());
    setCrmConfig(SettingsRepository.getCRMConfig());
    setSubscription(SettingsRepository.getSubscription());
    setAuditLog(SettingsRepository.getAuditLog());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];
  const activeRole = roles.find((r) => r.id === activeMember.roleId) || PermissionService.getRole(activeMember.roleId, roles);

  const switchActiveMember = (id: string) => {
    SettingsRepository.setActiveMemberId(id);
    setActiveMemberId(id);
    reloadData();
  };

  // Permission helpers for the current active testing user
  const can = (
    resource: CRMResource,
    operation: Operation,
    context?: { recordOwner?: string; recordDepartmentId?: string }
  ) => {
    return PermissionService.hasPermission(activeRole, resource, operation, {
      recordOwner: context?.recordOwner,
      recordDepartmentId: context?.recordDepartmentId,
      currentUserName: activeMember.name,
      currentUserDepartmentId: activeMember.departmentId,
      customRoles: roles,
    });
  };

  const canView = (resource: CRMResource, recordOwner?: string) => {
    return can(resource, "view", { recordOwner });
  };

  const canCreate = (resource: CRMResource) => {
    return can(resource, "create");
  };

  const canEdit = (resource: CRMResource, recordOwner?: string) => {
    return can(resource, "edit", { recordOwner });
  };

  const canDelete = (resource: CRMResource, recordOwner?: string) => {
    return can(resource, "delete", { recordOwner });
  };

  const canManageAdmin = () => {
    return PermissionService.canManageAdmin(activeRole, roles);
  };

  const canAccessBilling = () => {
    return PermissionService.canAccessBilling(activeRole, roles);
  };

  const filterRecords = <T extends { owner?: string; assignedTo?: string; departmentId?: string }>(
    records: T[],
    resource: CRMResource
  ): T[] => {
    return PermissionService.filterRecords(records, activeRole, resource, {
      name: activeMember.name,
      departmentId: activeMember.departmentId,
    }, roles);
  };

  const handleUpdateOrg = (updates: Partial<Organization>) => {
    const updated = SettingsRepository.updateOrganization(updates);
    setOrganization(updated);
    reloadData();
  };

  const handleCreateMember = (data: Omit<WorkspaceMember, "id" | "joinedAt" | "workloadStats">) => {
    const mem = SettingsRepository.createMember(data);
    reloadData();
    return mem;
  };

  const handleUpdateMember = (id: string, updates: Partial<WorkspaceMember>) => {
    const mem = SettingsRepository.updateMember(id, updates);
    reloadData();
    return mem;
  };

  const handleDeactivateMember = (id: string) => {
    const mem = SettingsRepository.deactivateMember(id);
    reloadData();
    return mem;
  };

  const handleDeleteMember = (id: string) => {
    SettingsRepository.deleteMember(id);
    reloadData();
  };

  const handleReassign = async (fromName: string, toName: string) => {
    const res = await SettingsRepository.reassignMemberRecords(fromName, toName);
    reloadData();
    return res;
  };

  const handleCreateDept = (dept: Omit<Department, "id">) => {
    const d = SettingsRepository.createDepartment(dept);
    reloadData();
    return d;
  };

  const handleUpdateDept = (id: string, updates: Partial<Department>) => {
    const d = SettingsRepository.updateDepartment(id, updates);
    reloadData();
    return d;
  };

  const handleDeleteDept = (id: string) => {
    SettingsRepository.deleteDepartment(id);
    reloadData();
  };

  const handleCreateRole = (role: Omit<Role, "id">) => {
    const r = SettingsRepository.createRole(role);
    reloadData();
    return r;
  };

  const handleUpdateRole = (id: string, updates: Partial<Role>) => {
    const r = SettingsRepository.updateRole(id, updates);
    reloadData();
    return r;
  };

  const handleDeleteRole = (id: string) => {
    SettingsRepository.deleteRole(id);
    reloadData();
  };

  const handleUpdateCRMConfig = (updates: Partial<CRMConfiguration>) => {
    const cfg = SettingsRepository.updateCRMConfig(updates);
    setCrmConfig(cfg);
    reloadData();
  };

  const handleUpdateIntegration = (id: string, updates: Partial<IntegrationConfiguration>) => {
    const intg = SettingsRepository.updateIntegration(id, updates);
    reloadData();
    return intg;
  };

  const handleUpdateSubscription = (planId: "Starter" | "Professional" | "Enterprise") => {
    const sub = SettingsRepository.updateSubscription(planId);
    setSubscription(sub);
    reloadData();
  };

  const handleLogAudit = (
    action: string,
    category: AuditEvent["category"],
    targetEntity: string,
    details: string
  ) => {
    SettingsRepository.logAuditEvent({ action, category, targetEntity, details });
    reloadData();
  };

  const handleResetDemoData = async () => {
    setLoading(true);
    await SettingsRepository.resetBizLeadDemoData();
    reloadData();
    setLoading(false);
  };

  return (
    <ControlCenterContext.Provider
      value={{
        organization,
        members,
        activeMember,
        activeRole,
        departments,
        roles,
        integrations,
        crmConfig,
        subscription,
        auditLog,
        loading,
        switchActiveMember,
        can,
        canView,
        canCreate,
        canEdit,
        canDelete,
        canManageAdmin,
        canAccessBilling,
        filterRecords,
        updateOrganization: handleUpdateOrg,
        createMember: handleCreateMember,
        updateMember: handleUpdateMember,
        deactivateMember: handleDeactivateMember,
        deleteMember: handleDeleteMember,
        reassignRecords: handleReassign,
        createDepartment: handleCreateDept,
        updateDepartment: handleUpdateDept,
        deleteDepartment: handleDeleteDept,
        createRole: handleCreateRole,
        updateRole: handleUpdateRole,
        deleteRole: handleDeleteRole,
        updateCRMConfig: handleUpdateCRMConfig,
        updateIntegration: handleUpdateIntegration,
        updateSubscription: handleUpdateSubscription,
        logAudit: handleLogAudit,
        exportData: () => SettingsRepository.exportWorkspaceData(),
        resetDemoData: handleResetDemoData,
        refreshAll: reloadData,
      }}
    >
      {children}
    </ControlCenterContext.Provider>
  );
}

export function useControlCenter() {
  const context = useContext(ControlCenterContext);
  if (!context) {
    throw new Error("useControlCenter must be used within a ControlCenterProvider");
  }
  return context;
}
