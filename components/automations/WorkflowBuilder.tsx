"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Workflow,
  WorkflowStatus,
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeType,
  AutomationTriggerType,
  AutomationActionType,
  ConditionGroup,
} from "../crm/types";
import { WorkflowEngine } from "./WorkflowEngine";
import { DryRunModal } from "./DryRunModal";
import {
  ArrowLeft,
  Save,
  Play,
  RotateCcw,
  RotateCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Zap,
  Filter,
  Clock,
  PlayCircle,
  Eye,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  ShieldAlert,
  X,
  List,
} from "lucide-react";

interface WorkflowBuilderProps {
  workflow: Workflow;
  onSave: (workflow: Workflow) => void;
  onBack: () => void;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  workflow: initialWorkflow,
  onSave,
  onBack,
}) => {
  const [workflow, setWorkflow] = useState<Workflow>(initialWorkflow);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"visual" | "accessible">("visual");

  // Undo/Redo History
  const [history, setHistory] = useState<Workflow[]>([initialWorkflow]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Canvas Viewport Pan & Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Dry Run Modal
  const [isDryRunOpen, setIsDryRunOpen] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<any>(null);

  // Validation message toast
  const [validationToast, setValidationToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Canvas Container Ref
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedNode = workflow.nodes.find((n) => n.id === selectedNodeId) || null;

  // Push new state to history
  const updateWorkflowState = (newWf: Workflow) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newWf);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setWorkflow(newWf);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setWorkflow(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setWorkflow(history[historyIndex + 1]);
    }
  };

  // Node Dragging Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);

    const node = workflow.nodes.find((n) => n.id === nodeId);
    if (node) {
      setDragOffset({
        x: (e.clientX - pan.x) / zoom - node.position.x,
        y: (e.clientY - pan.y) / zoom - node.position.y,
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      const nextX = Math.round((e.clientX - pan.x) / zoom - dragOffset.x);
      const nextY = Math.round((e.clientY - pan.y) / zoom - dragOffset.y);

      setWorkflow((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === draggingNodeId
            ? { ...n, position: { x: Math.max(20, nextX), y: Math.max(20, nextY) } }
            : n
        ),
      }));
    } else if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
      updateWorkflowState(workflow);
    }
    if (isPanning) {
      setIsPanning(false);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === "svg") {
      setSelectedNodeId(null);
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // Add Node to Canvas
  const handleAddNode = (type: WorkflowNodeType) => {
    const newId = `node-${type}-${Date.now().toString(36)}`;
    const posX = 300 + (workflow.nodes.length % 3) * 60;
    const posY = 150 + workflow.nodes.length * 70;

    let defaultTitle = "Action Node";
    let defaultData: any = {};

    if (type === "trigger") {
      defaultTitle = "New Trigger";
      defaultData = { triggerType: "lead_created" };
    } else if (type === "condition") {
      defaultTitle = "Condition Check";
      defaultData = {
        conditionGroup: {
          id: `cg-${Date.now()}`,
          logicalOperator: "AND",
          rules: [{ id: `r-${Date.now()}`, field: "score", operator: "greater_than_or_equal", value: 50 }],
        },
      };
    } else if (type === "action") {
      defaultTitle = "Create Task";
      defaultData = {
        actionType: "create_task",
        actionConfig: { title: "Follow-up Task", priority: "high", dueDays: 1 },
      };
    } else if (type === "delay") {
      defaultTitle = "Wait Delay";
      defaultData = { delayMinutes: 60, delayLabel: "1 Hour" };
    }

    const newNode: WorkflowNode = {
      id: newId,
      type,
      title: defaultTitle,
      position: { x: posX, y: posY },
      data: defaultData,
    };

    // Auto-connect from last node if applicable
    const lastNode = workflow.nodes[workflow.nodes.length - 1];
    const newEdges = [...workflow.edges];
    if (lastNode && type !== "trigger") {
      newEdges.push({
        id: `e-${lastNode.id}-${newId}`,
        source: lastNode.id,
        target: newId,
        sourceHandle: lastNode.type === "condition" ? "yes" : "default",
        label: lastNode.type === "condition" ? "Yes" : undefined,
      });
    }

    const nextWorkflow: Workflow = {
      ...workflow,
      nodes: [...workflow.nodes, newNode],
      edges: newEdges,
      updatedAt: new Date().toISOString(),
    };

    updateWorkflowState(nextWorkflow);
    setSelectedNodeId(newId);
  };

  // Delete Node
  const handleDeleteNode = (nodeId: string) => {
    const nextWorkflow: Workflow = {
      ...workflow,
      nodes: workflow.nodes.filter((n) => n.id !== nodeId),
      edges: workflow.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      updatedAt: new Date().toISOString(),
    };
    updateWorkflowState(nextWorkflow);
    setSelectedNodeId(null);
  };

  // Validate Workflow
  const handleValidate = () => {
    const val = WorkflowEngine.validateWorkflow(workflow);
    if (val.isValid) {
      setValidationToast({
        type: "success",
        message: "Workflow graph is valid! Ready for execution.",
      });
    } else {
      setValidationToast({
        type: "error",
        message: val.errors.join(" "),
      });
    }
    setTimeout(() => setValidationToast(null), 4000);
  };

  // Test Run (Dry Run)
  const handleRunDryRun = () => {
    const sampleEvent = {
      id: `evt-sample-${Date.now()}`,
      eventType: workflow.triggerType,
      entityId: "lead-001",
      entityType: "lead" as const,
      payload: {
        id: "lead-001",
        name: "Rahul Verma",
        company: "Zomato India",
        score: 82,
        source: "Meta Ads",
        value: 150000,
        stage: "qualified",
        priority: "high",
        tags: ["enterprise", "q4_growth"],
      },
      timestamp: new Date().toISOString(),
    };

    const res = WorkflowEngine.dryRun(workflow, sampleEvent);
    setDryRunResult(res);
    setIsDryRunOpen(true);
  };

  // Node Port Coordinates Helper
  const getNodeCoordinates = (nodeId: string) => {
    const node = workflow.nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0, width: 220, height: 80 };
    return {
      x: node.position.x,
      y: node.position.y,
      width: 220,
      height: 80,
    };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-background text-foreground overflow-hidden">
      {/* Top Builder Control Header */}
      <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Back to Workflows"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <input
              type="text"
              value={workflow.name}
              onChange={(e) =>
                setWorkflow({ ...workflow, name: e.target.value })
              }
              className="font-bold text-sm bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-0.5"
            />
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-1">
              <span className="capitalize">{workflow.status}</span>
              <span>·</span>
              <span>v{workflow.version}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-muted border text-xs mr-2">
            <button
              onClick={() => setViewMode("visual")}
              className={`px-2 py-1 rounded-md transition-colors ${
                viewMode === "visual"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              Canvas
            </button>
            <button
              onClick={() => setViewMode("accessible")}
              className={`px-2 py-1 rounded-md transition-colors ${
                viewMode === "accessible"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              List View
            </button>
          </div>

          {/* Undo / Redo */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg border text-muted-foreground hover:text-foreground disabled:opacity-30"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg border text-muted-foreground hover:text-foreground disabled:opacity-30"
            title="Redo"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Validation */}
          <button
            onClick={handleValidate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card text-foreground hover:bg-muted text-xs font-semibold"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span>Validate</span>
          </button>

          {/* Dry Run */}
          <button
            onClick={handleRunDryRun}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-xs font-semibold"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Test Run (Dry Run)</span>
          </button>

          {/* Status Toggle */}
          <button
            onClick={() => {
              const nextStatus: WorkflowStatus = workflow.status === "active" ? "inactive" : "active";
              const nextWf: Workflow = { ...workflow, status: nextStatus };
              updateWorkflowState(nextWf);
              onSave(nextWf);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              workflow.status === "active"
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-muted text-muted-foreground hover:text-foreground border"
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{workflow.status === "active" ? "Active" : "Activate"}</span>
          </button>

          {/* Save Draft */}
          <button
            onClick={() => onSave(workflow)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Workflow</span>
          </button>
        </div>
      </div>

      {/* Validation Toast */}
      {validationToast && (
        <div
          className={`absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-2 ${
            validationToast.type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-rose-500 text-white"
          }`}
          style={{ zIndex: "var(--z-toast)" }}
        >
          {validationToast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{validationToast.message}</span>
        </div>
      )}

      {/* Main Builder Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Visual Graph View */}
        {viewMode === "visual" ? (
          <div
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            className="flex-1 h-full bg-muted/10 relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--border) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          >
            {/* Canvas Zoom & Add Toolbar */}
            <div
              className="absolute top-4 left-4 flex flex-col gap-2"
              style={{ zIndex: "var(--z-sticky)" }}
            >
              <div className="p-1.5 rounded-xl border bg-card/90 backdrop-blur-xs shadow-md flex items-center gap-1">
                <button
                  onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}
                  className="p-1 rounded text-muted-foreground hover:text-foreground"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono px-1">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                  className="p-1 rounded text-muted-foreground hover:text-foreground"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="p-1 rounded text-muted-foreground hover:text-foreground"
                  title="Reset View"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Add Node Pills */}
              <div className="p-2 rounded-xl border bg-card/90 backdrop-blur-xs shadow-md space-y-1.5 text-xs">
                <div className="text-[10px] uppercase font-bold text-muted-foreground px-1 mb-1">
                  Add Node
                </div>
                <button
                  onClick={() => handleAddNode("trigger")}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Trigger</span>
                </button>
                <button
                  onClick={() => handleAddNode("condition")}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 font-medium hover:bg-purple-500/20 transition-colors"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Condition</span>
                </button>
                <button
                  onClick={() => handleAddNode("action")}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium hover:bg-emerald-500/20 transition-colors"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Action</span>
                </button>
                <button
                  onClick={() => handleAddNode("delay")}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 font-medium hover:bg-amber-500/20 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Delay</span>
                </button>
              </div>
            </div>

            {/* SVG Connecting Edges Layer */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
              }}
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--muted)" />
                </marker>
              </defs>

              {workflow.edges.map((edge) => {
                const src = getNodeCoordinates(edge.source);
                const tgt = getNodeCoordinates(edge.target);

                const sourceNode = workflow.nodes.find((n) => n.id === edge.source);
                const isYesBranch = edge.sourceHandle === "yes" || edge.label?.toLowerCase() === "yes";
                const isNoBranch = edge.sourceHandle === "no" || edge.label?.toLowerCase() === "no";

                // Ports position calculation
                let x1 = src.x + src.width / 2;
                if (sourceNode?.type === "condition") {
                  x1 = isYesBranch ? src.x + 50 : isNoBranch ? src.x + src.width - 50 : x1;
                }
                const y1 = src.y + src.height;
                const x2 = tgt.x + tgt.width / 2;
                const y2 = tgt.y;

                const midY = y1 + (y2 - y1) / 2;
                const pathD = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

                return (
                  <g key={edge.id}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke={
                        isYesBranch
                          ? "#10b981"
                          : isNoBranch
                          ? "#f43f5e"
                          : "var(--border)"
                      }
                      strokeWidth="2.5"
                      markerEnd="url(#arrow)"
                    />
                    {edge.label && (
                      <text
                        x={(x1 + x2) / 2}
                        y={(y1 + y2) / 2}
                        fill={isYesBranch ? "#10b981" : isNoBranch ? "#f43f5e" : "var(--muted)"}
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="bg-card px-1"
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Canvas Transformed Node Container */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
              }}
            >
              {workflow.nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;

                const getNodeBadge = () => {
                  switch (node.type) {
                    case "trigger":
                      return "border-primary bg-primary/10 text-primary";
                    case "condition":
                      return "border-purple-500 bg-purple-500/10 text-purple-400";
                    case "delay":
                      return "border-amber-500 bg-amber-500/10 text-amber-400";
                    default:
                      return "border-emerald-500 bg-emerald-500/10 text-emerald-400";
                  }
                };

                return (
                  <div
                    key={node.id}
                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                    className={`absolute pointer-events-auto rounded-xl border bg-card text-card-foreground p-3.5 shadow-md cursor-pointer transition-shadow ${
                      isSelected
                        ? "ring-2 ring-primary border-primary shadow-xl"
                        : "hover:border-border/80"
                    }`}
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                      width: 220,
                    }}
                  >
                    {/* Node Header */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getNodeBadge()}`}
                      >
                        {node.type === "trigger" && <Zap className="w-2.5 h-2.5" />}
                        {node.type === "condition" && <Filter className="w-2.5 h-2.5" />}
                        {node.type === "action" && <PlayCircle className="w-2.5 h-2.5" />}
                        {node.type === "delay" && <Clock className="w-2.5 h-2.5" />}
                        <span>{node.type}</span>
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(node.id);
                        }}
                        className="text-muted-foreground hover:text-rose-500 p-0.5"
                        title="Delete Node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="font-semibold text-xs text-foreground line-clamp-1">
                      {node.title}
                    </div>

                    {/* Subtitle / summary */}
                    <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {node.type === "trigger" && (node.data.triggerType || "lead_created")}
                      {node.type === "condition" && "AND/OR Rules"}
                      {node.type === "action" && (node.data.actionType || "Action")}
                      {node.type === "delay" && `${node.data.delayMinutes || 60}m wait`}
                    </div>

                    {/* Port Indicators */}
                    {node.type === "condition" ? (
                      <div className="flex justify-between items-center text-[10px] font-bold mt-2 pt-1 border-t border-border/50">
                        <span className="text-emerald-500">● Yes</span>
                        <span className="text-rose-500">No ●</span>
                      </div>
                    ) : (
                      <div className="flex justify-center text-[10px] text-muted-foreground mt-1 pt-1 border-t border-border/50">
                        <span>● Out</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Accessible Sequential Mode */
          <div className="flex-1 h-full overflow-y-auto p-6 space-y-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl border bg-card text-xs space-y-2">
              <h3 className="font-bold text-sm text-foreground">
                Accessible Sequential Node Editor
              </h3>
              <p className="text-muted-foreground">
                Configure workflow nodes sequentially with full keyboard and screen reader accessibility.
              </p>
            </div>

            <div className="space-y-3">
              {workflow.nodes.map((node, idx) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-4 rounded-xl border bg-card cursor-pointer transition-all ${
                    selectedNodeId === node.id ? "ring-2 ring-primary border-primary" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs uppercase text-primary">
                      Step {idx + 1}: {node.type}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNode(node.id);
                      }}
                      className="text-rose-500 text-xs hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">{node.title}</h4>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => handleAddNode("action")}
                className="px-3 py-1.5 rounded-lg border bg-card text-xs font-medium hover:bg-muted"
              >
                + Add Action Step
              </button>
              <button
                onClick={() => handleAddNode("condition")}
                className="px-3 py-1.5 rounded-lg border bg-card text-xs font-medium hover:bg-muted"
              >
                + Add Condition Branch
              </button>
            </div>
          </div>
        )}

        {/* Selected Node Configuration Sidebar */}
        {selectedNode && (
          <div className="w-80 h-full border-l border-border bg-card p-5 overflow-y-auto flex flex-col justify-between shrink-0 shadow-lg animate-in slide-in-from-right duration-150">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Node Configuration
                </span>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Node Title
                </label>
                <input
                  type="text"
                  value={selectedNode.title}
                  onChange={(e) => {
                    const nextNodes = workflow.nodes.map((n) =>
                      n.id === selectedNode.id ? { ...n, title: e.target.value } : n
                    );
                    setWorkflow({ ...workflow, nodes: nextNodes });
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border bg-background text-foreground text-xs"
                />
              </div>

              {/* Trigger Specific Configuration */}
              {selectedNode.type === "trigger" && (
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Trigger CRM Event *
                  </label>
                  <select
                    value={selectedNode.data.triggerType || "lead_created"}
                    onChange={(e) => {
                      const nextNodes = workflow.nodes.map((n) =>
                        n.id === selectedNode.id
                          ? {
                              ...n,
                              data: {
                                ...n.data,
                                triggerType: e.target.value as AutomationTriggerType,
                              },
                            }
                          : n
                      );
                      setWorkflow({
                        ...workflow,
                        triggerType: e.target.value as AutomationTriggerType,
                        nodes: nextNodes,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs"
                  >
                    <option value="lead_created">New Lead Created</option>
                    <option value="lead_converted">Lead Converted to Deal</option>
                    <option value="lead_score_changed">Lead Score Changed</option>
                    <option value="deal_created">New Deal Created</option>
                    <option value="deal_stage_changed">Deal Stage Changed</option>
                    <option value="deal_won">Deal Closed Won</option>
                    <option value="deal_lost">Deal Closed Lost</option>
                    <option value="conversation_received">Customer Message Received</option>
                    <option value="task_completed">CRM Task Completed</option>
                    <option value="followup_overdue">Follow-up Task Overdue</option>
                    <option value="meeting_completed">Meeting Outcome Logged</option>
                    <option value="campaign_threshold_reached">Campaign Threshold Reached</option>
                  </select>
                </div>
              )}

              {/* Condition Specific Configuration */}
              {selectedNode.type === "condition" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground">Condition Group</label>
                    <select
                      value={selectedNode.data.conditionGroup?.logicalOperator || "AND"}
                      onChange={(e) => {
                        const nextNodes = workflow.nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                data: {
                                  ...n.data,
                                  conditionGroup: {
                                    ...n.data.conditionGroup,
                                    logicalOperator: e.target.value as "AND" | "OR",
                                    rules: n.data.conditionGroup?.rules || [],
                                    id: n.data.conditionGroup?.id || "cg-1",
                                  },
                                },
                              }
                            : n
                        );
                        setWorkflow({ ...workflow, nodes: nextNodes });
                      }}
                      className="px-2 py-0.5 rounded border bg-background text-xs font-bold"
                    >
                      <option value="AND">AND (All match)</option>
                      <option value="OR">OR (Any match)</option>
                    </select>
                  </div>

                  {/* Rules list */}
                  <div className="space-y-2">
                    {selectedNode.data.conditionGroup?.rules.map((rule, rIdx) => (
                      <div key={rule.id} className="p-2.5 rounded-lg border bg-muted/20 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-muted-foreground">Rule #{rIdx + 1}</span>
                          <button
                            onClick={() => {
                              const nextRules = selectedNode.data.conditionGroup?.rules.filter(
                                (r) => r.id !== rule.id
                              );
                              const nextNodes = workflow.nodes.map((n) =>
                                n.id === selectedNode.id
                                  ? {
                                      ...n,
                                      data: {
                                        ...n.data,
                                        conditionGroup: {
                                          ...n.data.conditionGroup!,
                                          rules: nextRules || [],
                                        },
                                      },
                                    }
                                  : n
                              );
                              setWorkflow({ ...workflow, nodes: nextNodes });
                            }}
                            className="text-rose-500 hover:underline"
                          >
                            ×
                          </button>
                        </div>

                        <input
                          type="text"
                          value={rule.field}
                          placeholder="field (e.g. score, value, stage)"
                          onChange={(e) => {
                            const nextRules = selectedNode.data.conditionGroup?.rules.map((r) =>
                              r.id === rule.id ? { ...r, field: e.target.value } : r
                            );
                            const nextNodes = workflow.nodes.map((n) =>
                              n.id === selectedNode.id
                                ? {
                                    ...n,
                                    data: {
                                      ...n.data,
                                      conditionGroup: {
                                        ...n.data.conditionGroup!,
                                        rules: nextRules || [],
                                      },
                                    },
                                  }
                                : n
                            );
                            setWorkflow({ ...workflow, nodes: nextNodes });
                          }}
                          className="w-full px-2 py-1 rounded border bg-background text-xs"
                        />

                        <select
                          value={rule.operator}
                          onChange={(e) => {
                            const nextRules = selectedNode.data.conditionGroup?.rules.map((r) =>
                              r.id === rule.id ? { ...r, operator: e.target.value as any } : r
                            );
                            const nextNodes = workflow.nodes.map((n) =>
                              n.id === selectedNode.id
                                ? {
                                    ...n,
                                    data: {
                                      ...n.data,
                                      conditionGroup: {
                                        ...n.data.conditionGroup!,
                                        rules: nextRules || [],
                                      },
                                    },
                                  }
                                : n
                            );
                            setWorkflow({ ...workflow, nodes: nextNodes });
                          }}
                          className="w-full px-2 py-1 rounded border bg-background text-xs"
                        >
                          <option value="equals">Equals</option>
                          <option value="not_equals">Does Not Equal</option>
                          <option value="greater_than_or_equal">&gt;= Greater than or equal</option>
                          <option value="less_than_or_equal">&lt;= Less than or equal</option>
                          <option value="contains">Contains</option>
                          <option value="in">In List</option>
                        </select>

                        <input
                          type="text"
                          value={String(rule.value ?? "")}
                          placeholder="comparison value"
                          onChange={(e) => {
                            const nextRules = selectedNode.data.conditionGroup?.rules.map((r) =>
                              r.id === rule.id ? { ...r, value: e.target.value } : r
                            );
                            const nextNodes = workflow.nodes.map((n) =>
                              n.id === selectedNode.id
                                ? {
                                    ...n,
                                    data: {
                                      ...n.data,
                                      conditionGroup: {
                                        ...n.data.conditionGroup!,
                                        rules: nextRules || [],
                                      },
                                    },
                                  }
                                : n
                            );
                            setWorkflow({ ...workflow, nodes: nextNodes });
                          }}
                          className="w-full px-2 py-1 rounded border bg-background text-xs"
                        />
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        const newRule = {
                          id: `r-${Date.now()}`,
                          field: "stage",
                          operator: "equals" as const,
                          value: "proposal",
                        };
                        const nextRules = [...(selectedNode.data.conditionGroup?.rules || []), newRule];
                        const nextNodes = workflow.nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                data: {
                                  ...n.data,
                                  conditionGroup: {
                                    id: selectedNode.data.conditionGroup?.id || `cg-${Date.now()}`,
                                    logicalOperator: selectedNode.data.conditionGroup?.logicalOperator || "AND",
                                    rules: nextRules,
                                  },
                                },
                              }
                            : n
                        );
                        setWorkflow({ ...workflow, nodes: nextNodes });
                      }}
                      className="w-full py-1.5 rounded-lg border border-dashed text-xs text-muted-foreground hover:text-foreground text-center"
                    >
                      + Add Rule
                    </button>
                  </div>
                </div>
              )}

              {/* Action Specific Configuration */}
              {selectedNode.type === "action" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Action Type *
                    </label>
                    <select
                      value={selectedNode.data.actionType || "create_task"}
                      onChange={(e) => {
                        const nextNodes = workflow.nodes.map((n) =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                data: {
                                  ...n.data,
                                  actionType: e.target.value as AutomationActionType,
                                },
                              }
                            : n
                        );
                        setWorkflow({ ...workflow, nodes: nextNodes });
                      }}
                      className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs"
                    >
                      <option value="create_task">Create Follow-up Task</option>
                      <option value="assign_lead_owner">Assign Lead Owner</option>
                      <option value="update_lead_priority">Update Lead Priority</option>
                      <option value="add_lead_tag">Attach Lead Tag</option>
                      <option value="update_deal_stage">Advance Deal Pipeline Stage</option>
                      <option value="create_reminder">Create Internal Reminder</option>
                      <option value="add_internal_note">Add Internal Note to Timeline</option>
                      <option value="send_email_external">External Email (Roadmap)</option>
                      <option value="send_whatsapp_external">External WhatsApp (Roadmap)</option>
                    </select>
                  </div>

                  {/* External Disclosure */}
                  {(selectedNode.data.actionType === "send_email_external" ||
                    selectedNode.data.actionType === "send_whatsapp_external") && (
                    <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/10 text-xs text-foreground space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-500">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Cloud Integration Required</span>
                      </div>
                      <p className="text-muted-foreground text-[11px]">
                        External provider gateways (SES, Meta WhatsApp Cloud API) require verified API credentials (Phase 10 milestone). Simulated external dispatch is prevented.
                      </p>
                    </div>
                  )}

                  {/* Specific Action Config Inputs */}
                  {selectedNode.data.actionType === "assign_lead_owner" && (
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Owner</label>
                      <input
                        type="text"
                        value={selectedNode.data.actionConfig?.owner || "Rahul Sharma"}
                        onChange={(e) => {
                          const nextNodes = workflow.nodes.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    actionConfig: { ...n.data.actionConfig, owner: e.target.value },
                                  },
                                }
                              : n
                          );
                          setWorkflow({ ...workflow, nodes: nextNodes });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border bg-background text-xs"
                      />
                    </div>
                  )}

                  {selectedNode.data.actionType === "add_lead_tag" && (
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Tag Name</label>
                      <input
                        type="text"
                        value={selectedNode.data.actionConfig?.tag || "enterprise"}
                        onChange={(e) => {
                          const nextNodes = workflow.nodes.map((n) =>
                            n.id === selectedNode.id
                              ? {
                                  ...n,
                                  data: {
                                    ...n.data,
                                    actionConfig: { ...n.data.actionConfig, tag: e.target.value },
                                  },
                                }
                              : n
                          );
                          setWorkflow({ ...workflow, nodes: nextNodes });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border bg-background text-xs"
                      />
                    </div>
                  )}

                  {selectedNode.data.actionType === "create_task" && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Task Title</label>
                        <input
                          type="text"
                          value={selectedNode.data.actionConfig?.title || "Follow-up Call"}
                          onChange={(e) => {
                            const nextNodes = workflow.nodes.map((n) =>
                              n.id === selectedNode.id
                                ? {
                                    ...n,
                                    data: {
                                      ...n.data,
                                      actionConfig: { ...n.data.actionConfig, title: e.target.value },
                                    },
                                  }
                                : n
                            );
                            setWorkflow({ ...workflow, nodes: nextNodes });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border bg-background text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1">Priority</label>
                        <select
                          value={selectedNode.data.actionConfig?.priority || "high"}
                          onChange={(e) => {
                            const nextNodes = workflow.nodes.map((n) =>
                              n.id === selectedNode.id
                                ? {
                                    ...n,
                                    data: {
                                      ...n.data,
                                      actionConfig: { ...n.data.actionConfig, priority: e.target.value },
                                    },
                                  }
                                : n
                            );
                            setWorkflow({ ...workflow, nodes: nextNodes });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border bg-background text-xs"
                        >
                          <option value="urgent">Urgent</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Delay Specific Configuration */}
              {selectedNode.type === "delay" && (
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Delay Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={selectedNode.data.delayMinutes || 60}
                    onChange={(e) => {
                      const nextNodes = workflow.nodes.map((n) =>
                        n.id === selectedNode.id
                          ? {
                              ...n,
                              data: {
                                ...n.data,
                                delayMinutes: Number(e.target.value),
                                delayLabel: `${e.target.value} mins`,
                              },
                            }
                          : n
                      );
                      setWorkflow({ ...workflow, nodes: nextNodes });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border bg-background text-xs"
                  />
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Local delay resumes when workspace session is active.
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Node Delete */}
            <div className="pt-4 border-t mt-4">
              <button
                onClick={() => handleDeleteNode(selectedNode.id)}
                className="w-full py-2 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove this Node</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dry Run Simulation Modal */}
      <DryRunModal
        isOpen={isDryRunOpen}
        onClose={() => setIsDryRunOpen(false)}
        result={dryRunResult}
        onActivateWorkflow={() => {
          const activated = { ...workflow, status: "active" as const };
          setWorkflow(activated);
          onSave(activated);
        }}
      />
    </div>
  );
};
