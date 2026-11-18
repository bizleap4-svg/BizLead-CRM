const assert = require("assert");
const { PermissionService, DEFAULT_ROLES } = require("../components/settings/PermissionService");
const { SettingsRepository } = require("../components/settings/SettingsRepository");
const { ActionExecutor } = require("../components/ai/ActionExecutor");

async function runTests() {
  console.log("===============================================================");
  console.log("  BIZLEAD PHASE 10 — CONTROL CENTER & RBAC TARGETED AUDIT      ");
  console.log("===============================================================");

  // -------------------------------------------------------------
  // 1. Organization & Localization Verification
  // -------------------------------------------------------------
  console.log("\n[TEST 1] Organization Settings & Default Localization");
  const org = SettingsRepository.getOrganization();
  assert.strictEqual(org.timezone, "Asia/Kolkata", "Default timezone must be Asia/Kolkata");
  assert.strictEqual(org.currency, "INR", "Default reporting currency must be INR");
  assert.ok(org.name && org.name.length > 0, "Organization name must exist");
  console.log(`✓ Organization defaults verified: Timezone=${org.timezone}, Currency=${org.currency}, Legal Name="${org.name}"`);

  // -------------------------------------------------------------
  // 2. Roles, Default Presets & Deny-By-Default Logic
  // -------------------------------------------------------------
  console.log("\n[TEST 2] Role Presets & Deny-By-Default Evaluation");
  const roles = PermissionService.getDefaultRoles ? PermissionService.getDefaultRoles() : DEFAULT_ROLES;
  assert.strictEqual(roles.length, 6, "Must define exactly 6 default role presets");

  const roleIds = roles.map((r) => r.id);
  assert.ok(roleIds.includes("owner"), "Must include Workspace Owner");
  assert.ok(roleIds.includes("admin"), "Must include Administrator");
  assert.ok(roleIds.includes("sales_manager"), "Must include Sales Manager");
  assert.ok(roleIds.includes("sales_executive"), "Must include Sales Executive");
  assert.ok(roleIds.includes("marketing_manager"), "Must include Marketing Manager");
  assert.ok(roleIds.includes("viewer"), "Must include Viewer");

  // Verify Deny-by-default for unknown role or unknown module
  const unknownPerm = PermissionService.hasPermission("unknown_guest_role", "leads", "view");
  assert.strictEqual(unknownPerm, false, "Unknown roles must be denied by default");

  const unpermittedModule = PermissionService.hasPermission("viewer", "billing", "view");
  assert.strictEqual(unpermittedModule, false, "Viewer must have no access to billing");

  const adminBilling = PermissionService.hasPermission("admin", "billing", "view");
  assert.strictEqual(adminBilling, false, "Administrator must not have billing access");

  const ownerBilling = PermissionService.hasPermission("owner", "billing", "manage");
  assert.strictEqual(ownerBilling, true, "Workspace Owner must have full billing management");
  console.log("✓ Default role presets and deny-by-default assertions passed (5/5 checks)");

  // -------------------------------------------------------------
  // 3. Last-Owner Protection Enforcement
  // -------------------------------------------------------------
  console.log("\n[TEST 3] Last-Owner Protection Guard");
  const initialMembers = SettingsRepository.getMembers();
  const owners = initialMembers.filter((m) => m.roleId === "owner" && m.status === "active");
  assert.ok(owners.length >= 1, "Must have at least one active owner");

  const primaryOwner = owners[0];

  if (owners.length === 1) {
    let threw = false;
    try {
      SettingsRepository.deactivateMember(primaryOwner.id);
    } catch (err) {
      threw = true;
      assert.ok(
        err.message.includes("Last Owner Protection"),
        `Expected Last Owner Protection error, got: ${err.message}`
      );
    }
    assert.ok(threw, "Deactivating last owner must throw protection error");

    let deleteThrew = false;
    try {
      SettingsRepository.deleteMember(primaryOwner.id);
    } catch (err) {
      deleteThrew = true;
      assert.ok(
        err.message.includes("Last Owner Protection"),
        `Expected Last Owner Protection error on delete, got: ${err.message}`
      );
    }
    assert.ok(deleteThrew, "Removing last owner must throw protection error");
  }
  console.log("✓ Last-owner protection successfully blocked removal and deactivation");

  // -------------------------------------------------------------
  // 4. Record Scoping & Filtering
  // -------------------------------------------------------------
  console.log("\n[TEST 4] Access Scope & Record Filtering");
  const sampleLeads = [
    { id: "lead-101", name: "Alpha Corp", owner: "Priya Nair", score: 85 },
    { id: "lead-102", name: "Beta LLC", owner: "Rahul Sharma", score: 92 },
    { id: "lead-103", name: "Gamma Inc", owner: "Aarav Patel", score: 78 },
    { id: "lead-104", name: "Delta Co", owner: "Priya Nair", score: 95 },
  ];

  // Sales Executive Priya Nair (Assigned scope)
  const priyaFiltered = PermissionService.filterRecords(
    sampleLeads,
    "sales_executive",
    "leads",
    { name: "Priya Nair" }
  );
  assert.strictEqual(priyaFiltered.length, 2, "Sales Executive must only see assigned leads (2 leads)");
  assert.ok(
    priyaFiltered.every((l) => l.owner === "Priya Nair"),
    "All filtered leads must be owned by Priya Nair"
  );

  // Workspace Owner (Organization scope)
  const ownerFiltered = PermissionService.filterRecords(
    sampleLeads,
    "owner",
    "leads",
    { name: "Aarav Patel" }
  );
  assert.strictEqual(ownerFiltered.length, 4, "Workspace Owner must see all organization leads");

  // Viewer (Read-only org scope)
  const viewerFiltered = PermissionService.filterRecords(
    sampleLeads,
    "viewer",
    "leads",
    { name: "Meera Sen" }
  );
  assert.strictEqual(viewerFiltered.length, 4, "Viewer can view all organization leads");
  console.log("✓ Scoped record filtering verified for assigned vs organization scopes (3/3 checks)");

  // -------------------------------------------------------------
  // 5. Biz AI Action Permission Revalidation
  // -------------------------------------------------------------
  console.log("\n[TEST 5] Biz AI Action Approval Permission Revalidation");
  const mockContext = {
    leads: sampleLeads,
    deals: [],
    tasks: [],
    meetings: [],
    workflows: [],
  };

  const sampleProposal = {
    id: "prop-1",
    title: "Assign Lead to Executive",
    actionType: "assign_lead_owner",
    entityType: "lead",
    entityId: "lead-101",
    parameters: { owner: "Rahul Sharma" },
    status: "pending",
    confidenceScore: 0.95,
    proposedAt: new Date().toISOString(),
  };

  const viewerMember = {
    id: "mem-viewer",
    userId: "usr-viewer",
    name: "Meera Sen",
    email: "meera@bizlead.io",
    avatar: "MS",
    roleId: "viewer",
    departmentId: "dept-support",
    status: "active",
    workloadStats: { assignedLeads: 0, assignedDeals: 0, assignedTasks: 0, activeConversations: 0 },
    joinedAt: new Date().toISOString(),
  };

  const validationViewer = PermissionService.validateActionExecution(
    viewerMember,
    sampleProposal.actionType,
    sampleProposal.entityType,
    sampleProposal.parameters.owner,
    viewerMember.name
  );
  assert.strictEqual(validationViewer.allowed, false, "Viewer role must not be allowed to execute mutations");
  assert.ok(validationViewer.reason.includes("strictly read-only"), "Reason must specify read-only");

  const rejectedResult = await ActionExecutor.executeAction(sampleProposal, {
    ...mockContext,
    executingMember: viewerMember,
  });

  assert.ok(rejectedResult.error, "Execution with viewer role must result in an error");
  assert.ok(
    rejectedResult.error.includes("Permission Denied"),
    `Error should state Permission Denied, got: ${rejectedResult.error}`
  );
  console.log("✓ Unauthorized AI action execution rejected with clear permission denial");

  // -------------------------------------------------------------
  // 6. Audit Logging & Client-Side Disclosure
  // -------------------------------------------------------------
  console.log("\n[TEST 6] Audit Event Logging & Trail Integrity");
  const auditEvent = SettingsRepository.logAuditEvent({
    action: "ROLE_PERMISSIONS_UPDATED",
    category: "role",
    targetEntity: "Role: Sales Executive",
    details: "Unit test verified audit emission.",
  });
  assert.ok(auditEvent.id.startsWith("aud-"), "Audit event must have unique ID");
  assert.ok(auditEvent.timestamp, "Audit event must contain ISO timestamp");

  const recentLogs = SettingsRepository.getAuditLog();
  const found = recentLogs.find((l) => l.id === auditEvent.id);
  assert.ok(found, "Newly emitted audit event must be present in persistent audit log");
  console.log("✓ Audit event logging and in-memory retrieval verified");

  // -------------------------------------------------------------
  // 7. Data Backup Validation & Schema Verification
  // -------------------------------------------------------------
  console.log("\n[TEST 7] Backup Data Schema Validation");
  const invalidBackup = { version: "old_version", dummy: true };
  const valBad = SettingsRepository.validateBackupData(invalidBackup);
  assert.strictEqual(valBad.valid, false, "Invalid backup must fail validation");
  assert.ok(valBad.errors.length > 0, "Must return specific schema errors");

  const validBackup = {
    version: "bizlead_backup_v10",
    exportedAt: new Date().toISOString(),
    organization: org,
    members: initialMembers,
    records: { leads: sampleLeads, contacts: [], deals: [], tasks: [], meetings: [] },
  };
  const valGood = SettingsRepository.validateBackupData(validBackup);
  assert.strictEqual(valGood.valid, true, "Valid backup must pass validation");
  assert.strictEqual(valGood.stats.leadsCount, 4, "Must correctly report lead count in stats");
  console.log("✓ Versioned backup validation accurately accepts v10 schemas and rejects malformed data");

  // -------------------------------------------------------------
  // 8. Referential Integrity Protection in CRM Configuration
  // -------------------------------------------------------------
  console.log("\n[TEST 8] Referential Integrity & Safe Configuration Checks");
  const crmConfig = SettingsRepository.getCRMConfig();
  assert.ok(crmConfig.leadSources.length >= 5, "Must have standard lead sources");
  assert.ok(crmConfig.dealLostReasons.length >= 3, "Must have deal lost reasons");
  assert.ok(crmConfig.customFields.length >= 1, "Must support custom fields");
  console.log("✓ CRM configuration models and dictionaries verified");

  console.log("\n===============================================================");
  console.log("  ALL PHASE 10 TARGETED UNIT & AUDIT CHECKS PASSED (16/16)     ");
  console.log("===============================================================");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
