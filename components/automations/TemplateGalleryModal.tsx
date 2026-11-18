"use client";

import React from "react";
import { Workflow } from "../crm/types";
import { PREBUILT_WORKFLOW_TEMPLATES } from "./AutomationRepository";
import { X, Sparkles, Copy, Layers, CheckCircle2, ArrowRight } from "lucide-react";

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (template: Workflow) => void;
}

export const TemplateGalleryModal: React.FC<TemplateGalleryModalProps> = ({
  isOpen,
  onClose,
  onUseTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 overflow-hidden backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: "var(--z-modal)", backgroundColor: "var(--color-overlay)" }}
    >
      <div className="w-full max-w-4xl bg-card border border-border rounded-xl shadow-2xl p-6 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-foreground text-lg">Prebuilt Workflow Template Library</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Battle-tested B2B CRM automation blueprints. Inactive by default until reviewed and activated.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {PREBUILT_WORKFLOW_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="p-4 rounded-xl border bg-card text-card-foreground shadow-xs hover:border-primary/50 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted border text-muted-foreground uppercase tracking-wider">
                    {tpl.category?.replace("_", " ") || "CRM Workflow"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {tpl.nodes.length} nodes · {tpl.edges.length} connections
                  </span>
                </div>

                <h4 className="font-semibold text-sm text-foreground">{tpl.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {tpl.description}
                </p>

                {/* Node flow summary */}
                <div className="mt-3 p-2 rounded-lg bg-muted/40 border border-border/50 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Trigger: </span>
                  <code>{tpl.triggerType}</code>
                </div>
              </div>

              <div className="pt-3 border-t mt-4 flex items-center justify-between">
                <span className="text-[11px] text-amber-500 font-medium">
                  Draft Mode
                </span>
                <button
                  onClick={() => {
                    onUseTemplate(tpl);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Use Template</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-muted-foreground hover:text-foreground text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
