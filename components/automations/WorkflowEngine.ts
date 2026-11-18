/**
 * BizLead Revenue OS — Deterministic Workflow Execution Engine
 * Safe graph traversal, structured condition evaluation, cycle detection,
 * idempotency, and dry-run preview capabilities.
 */

import {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  AutomationEvent,
  WorkflowExecution,
  ActionExecution,
  ConditionGroup,
  ConditionRule,
} from "../crm/types";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DryRunResult {
  workflowId: string;
  workflowName: string;
  matchedTrigger: boolean;
  traversedPath: string[];
  conditionDecisions: {
    nodeId: string;
    nodeTitle: string;
    passed: boolean;
    branchTaken: "yes" | "no";
    reasons: string[];
  }[];
  proposedActions: {
    nodeId: string;
    nodeTitle: string;
    actionType: string;
    description: string;
    parameters: Record<string, any>;
    targetEntity: {
      type: string;
      id: string;
    };
  }[];
  executionLog: ActionExecution[];
}

export class WorkflowEngine {
  /**
   * Safely evaluate a condition rule against an entity record without eval.
   */
  static evaluateRule(rule: ConditionRule, record: Record<string, any>): { passed: boolean; reason: string } {
    const rawVal = record[rule.field];
    const targetVal = rule.value;

    switch (rule.operator) {
      case "equals": {
        const passed = String(rawVal ?? "").toLowerCase() === String(targetVal ?? "").toLowerCase();
        return {
          passed,
          reason: `Field '${rule.field}' (${String(rawVal)}) equals '${String(targetVal)}': ${passed}`,
        };
      }
      case "not_equals": {
        const passed = String(rawVal ?? "").toLowerCase() !== String(targetVal ?? "").toLowerCase();
        return {
          passed,
          reason: `Field '${rule.field}' (${String(rawVal)}) does not equal '${String(targetVal)}': ${passed}`,
        };
      }
      case "contains": {
        const str = Array.isArray(rawVal) ? rawVal.join(",") : String(rawVal ?? "");
        const passed = str.toLowerCase().includes(String(targetVal ?? "").toLowerCase());
        return {
          passed,
          reason: `Field '${rule.field}' contains '${String(targetVal)}': ${passed}`,
        };
      }
      case "not_contains": {
        const str = Array.isArray(rawVal) ? rawVal.join(",") : String(rawVal ?? "");
        const passed = !str.toLowerCase().includes(String(targetVal ?? "").toLowerCase());
        return {
          passed,
          reason: `Field '${rule.field}' does not contain '${String(targetVal)}': ${passed}`,
        };
      }
      case "greater_than": {
        const numA = Number(rawVal);
        const numB = Number(targetVal);
        const passed = !isNaN(numA) && !isNaN(numB) && numA > numB;
        return {
          passed,
          reason: `Field '${rule.field}' (${numA}) > ${numB}: ${passed}`,
        };
      }
      case "less_than": {
        const numA = Number(rawVal);
        const numB = Number(targetVal);
        const passed = !isNaN(numA) && !isNaN(numB) && numA < numB;
        return {
          passed,
          reason: `Field '${rule.field}' (${numA}) < ${numB}: ${passed}`,
        };
      }
      case "greater_than_or_equal": {
        const numA = Number(rawVal);
        const numB = Number(targetVal);
        const passed = !isNaN(numA) && !isNaN(numB) && numA >= numB;
        return {
          passed,
          reason: `Field '${rule.field}' (${numA}) >= ${numB}: ${passed}`,
        };
      }
      case "less_than_or_equal": {
        const numA = Number(rawVal);
        const numB = Number(targetVal);
        const passed = !isNaN(numA) && !isNaN(numB) && numA <= numB;
        return {
          passed,
          reason: `Field '${rule.field}' (${numA}) <= ${numB}: ${passed}`,
        };
      }
      case "in": {
        const list = Array.isArray(targetVal)
          ? targetVal
          : String(targetVal)
              .split(",")
              .map((s) => s.trim().toLowerCase());
        const passed = list.includes(String(rawVal ?? "").toLowerCase());
        return {
          passed,
          reason: `Field '${rule.field}' (${String(rawVal)}) is in [${list.join(", ")}]: ${passed}`,
        };
      }
      case "not_in": {
        const list = Array.isArray(targetVal)
          ? targetVal
          : String(targetVal)
              .split(",")
              .map((s) => s.trim().toLowerCase());
        const passed = !list.includes(String(rawVal ?? "").toLowerCase());
        return {
          passed,
          reason: `Field '${rule.field}' (${String(rawVal)}) is not in [${list.join(", ")}]: ${passed}`,
        };
      }
      case "is_empty": {
        const passed = rawVal === null || rawVal === undefined || rawVal === "" || (Array.isArray(rawVal) && rawVal.length === 0);
        return {
          passed,
          reason: `Field '${rule.field}' is empty: ${passed}`,
        };
      }
      case "is_not_empty": {
        const passed = rawVal !== null && rawVal !== undefined && rawVal !== "" && (!Array.isArray(rawVal) || rawVal.length > 0);
        return {
          passed,
          reason: `Field '${rule.field}' is not empty: ${passed}`,
        };
      }
      default:
        return { passed: true, reason: "Default pass (unknown operator)" };
    }
  }

  /**
   * Evaluate a condition group (with AND/OR logic)
   */
  static evaluateConditionGroup(
    group: ConditionGroup | undefined,
    record: Record<string, any>
  ): { passed: boolean; reasons: string[] } {
    if (!group || !group.rules || group.rules.length === 0) {
      return { passed: true, reasons: ["No condition rules configured (evaluates to true)"] };
    }

    const reasons: string[] = [];
    const results = group.rules.map((rule) => {
      const res = this.evaluateRule(rule, record);
      reasons.push(res.reason);
      return res.passed;
    });

    const passed =
      group.logicalOperator === "OR"
        ? results.some((r) => r === true)
        : results.every((r) => r === true);

    return { passed, reasons };
  }

  /**
   * Validate workflow graph topology for cycles, disconnected nodes, and trigger configuration.
   */
  static validateWorkflow(workflow: Workflow): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Check Trigger
    const triggerNodes = workflow.nodes.filter((n) => n.type === "trigger");
    if (triggerNodes.length === 0) {
      errors.push("Workflow must contain at least one Trigger node.");
    } else if (triggerNodes.length > 1) {
      errors.push("Workflow cannot contain more than one Trigger node.");
    }

    // 2. Node IDs uniqueness
    const nodeIds = new Set<string>();
    for (const node of workflow.nodes) {
      if (nodeIds.has(node.id)) {
        errors.push(`Duplicate node identifier found: ${node.id}`);
      }
      nodeIds.add(node.id);
    }

    // 3. Edge endpoint validity
    for (const edge of workflow.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge references missing source node: ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge references missing target node: ${edge.target}`);
      }
    }

    // 4. Cycle Detection using DFS
    const adj = new Map<string, string[]>();
    for (const node of workflow.nodes) {
      adj.set(node.id, []);
    }
    for (const edge of workflow.edges) {
      if (adj.has(edge.source)) {
        adj.get(edge.source)!.push(edge.target);
      }
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();
    let hasCycle = false;

    function dfs(nodeId: string): boolean {
      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = adj.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true; // Cycle detected
        }
      }

      recStack.delete(nodeId);
      return false;
    }

    for (const node of workflow.nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) {
          hasCycle = true;
          break;
        }
      }
    }

    if (hasCycle) {
      errors.push("Circular reference detected in workflow graph. Cycles can cause infinite execution loops.");
    }

    // 5. Unconnected nodes warning
    if (workflow.nodes.length > 1) {
      const connected = new Set<string>();
      for (const edge of workflow.edges) {
        connected.add(edge.source);
        connected.add(edge.target);
      }
      const unconnected = workflow.nodes.filter((n) => !connected.has(n.id));
      if (unconnected.length > 0) {
        warnings.push(`${unconnected.length} node(s) are disconnected from the workflow graph.`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Dry Run Mode: Simulates workflow execution against a sample CRM record
   * without mutating any actual database or CRM records.
   */
  static dryRun(workflow: Workflow, event: AutomationEvent): DryRunResult {
    const triggerNode = workflow.nodes.find((n) => n.type === "trigger");
    const matchedTrigger = triggerNode?.data.triggerType === event.eventType;

    const conditionDecisions: DryRunResult["conditionDecisions"] = [];
    const proposedActions: DryRunResult["proposedActions"] = [];
    const executionLog: ActionExecution[] = [];
    const traversedPath: string[] = [];

    if (!matchedTrigger || !triggerNode) {
      return {
        workflowId: workflow.id,
        workflowName: workflow.name,
        matchedTrigger: false,
        traversedPath: [],
        conditionDecisions: [],
        proposedActions: [],
        executionLog: [
          {
            nodeId: "none",
            nodeType: "trigger",
            nodeTitle: "Trigger mismatch",
            status: "skipped",
            detail: `Event type '${event.eventType}' does not match workflow trigger '${workflow.triggerType}'`,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }

    // Execution queue starting from trigger node
    traversedPath.push(triggerNode.id);
    executionLog.push({
      nodeId: triggerNode.id,
      nodeType: "trigger",
      nodeTitle: triggerNode.title,
      status: "success",
      detail: `Trigger matched: ${event.eventType} on ${event.entityType} ${event.entityId}`,
      timestamp: new Date().toISOString(),
    });

    let currentNodeId: string | null = triggerNode.id;
    let stepCount = 0;
    const maxSteps = 25; // recursion safeguard
    const visitedNodes = new Set<string>();

    while (currentNodeId && stepCount < maxSteps) {
      stepCount++;
      traversedPath.push(currentNodeId);
      visitedNodes.add(currentNodeId);

      const currentNode = workflow.nodes.find((n) => n.id === currentNodeId);
      if (!currentNode) break;

      const outgoingEdges = workflow.edges.filter((e) => e.source === currentNodeId);

      if (currentNode.type === "trigger") {
        executionLog.push({
          nodeId: currentNode.id,
          nodeType: "trigger",
          nodeTitle: currentNode.title,
          status: "success",
          detail: `Trigger matched: ${event.eventType} on ${event.entityType} ${event.entityId}`,
          timestamp: new Date().toISOString(),
        });
        const nextEdge = outgoingEdges[0];
        currentNodeId = nextEdge ? nextEdge.target : null;
      } else if (currentNode.type === "condition") {
        const condResult = this.evaluateConditionGroup(
          currentNode.data.conditionGroup,
          event.payload
        );
        const branchTaken = condResult.passed ? "yes" : "no";

        conditionDecisions.push({
          nodeId: currentNode.id,
          nodeTitle: currentNode.title,
          passed: condResult.passed,
          branchTaken,
          reasons: condResult.reasons,
        });

        executionLog.push({
          nodeId: currentNode.id,
          nodeType: "condition",
          nodeTitle: currentNode.title,
          status: "success",
          detail: `Evaluated ${branchTaken.toUpperCase()}: ${condResult.reasons.join("; ")}`,
          timestamp: new Date().toISOString(),
        });

        // Follow branch edge
        const branchEdge =
          outgoingEdges.find((e) => e.sourceHandle === branchTaken) ||
          outgoingEdges.find((e) => e.label?.toLowerCase() === branchTaken) ||
          outgoingEdges[0];

        currentNodeId = branchEdge ? branchEdge.target : null;
      } else if (currentNode.type === "action") {
        const actType = currentNode.data.actionType || "create_task";
        const cfg = currentNode.data.actionConfig || {};

        let actionDesc = `Execute ${actType}`;
        if (actType === "assign_lead_owner") {
          actionDesc = `Assign lead to ${cfg.owner || "Unassigned"}`;
        } else if (actType === "update_lead_priority") {
          actionDesc = `Set priority to ${cfg.priority || "high"}`;
        } else if (actType === "add_lead_tag") {
          actionDesc = `Attach tag #${cfg.tag || "automated"}`;
        } else if (actType === "create_task") {
          actionDesc = `Create task '${cfg.title || "Follow-up"}' due in ${cfg.dueDays || 1} day(s)`;
        } else if (actType === "update_deal_stage") {
          actionDesc = `Advance deal stage to '${cfg.stage || "proposal"}'`;
        } else if (actType === "create_reminder") {
          actionDesc = `Schedule notification: '${cfg.message || "Automation alert"}'`;
        } else if (actType === "add_internal_note") {
          actionDesc = `Add note: '${cfg.note || "Automated update"}'`;
        }

        proposedActions.push({
          nodeId: currentNode.id,
          nodeTitle: currentNode.title,
          actionType: actType,
          description: actionDesc,
          parameters: cfg,
          targetEntity: {
            type: event.entityType,
            id: event.entityId,
          },
        });

        executionLog.push({
          nodeId: currentNode.id,
          nodeType: "action",
          nodeTitle: currentNode.title,
          status: "success",
          detail: `[SIMULATED] ${actionDesc}`,
          timestamp: new Date().toISOString(),
        });

        const nextEdge = outgoingEdges[0];
        currentNodeId = nextEdge ? nextEdge.target : null;
      } else if (currentNode.type === "delay") {
        const mins = currentNode.data.delayMinutes || 60;
        executionLog.push({
          nodeId: currentNode.id,
          nodeType: "delay",
          nodeTitle: currentNode.title,
          status: "success",
          detail: `Wait delay: ${mins} minutes (resumes when workspace is active)`,
          timestamp: new Date().toISOString(),
        });

        const nextEdge = outgoingEdges[0];
        currentNodeId = nextEdge ? nextEdge.target : null;
      } else {
        const nextEdge = outgoingEdges[0];
        currentNodeId = nextEdge ? nextEdge.target : null;
      }

      // Cycle safeguard in traversal
      if (currentNodeId && visitedNodes.has(currentNodeId)) {
        executionLog.push({
          nodeId: currentNodeId,
          nodeType: "action",
          nodeTitle: "Cycle Detected",
          status: "skipped",
          detail: "Cycle detected during traversal; execution halted to prevent infinite loop",
          timestamp: new Date().toISOString(),
        });
        break;
      }
    }

    return {
      workflowId: workflow.id,
      workflowName: workflow.name,
      matchedTrigger,
      traversedPath,
      conditionDecisions,
      proposedActions,
      executionLog,
    };
  }
}
