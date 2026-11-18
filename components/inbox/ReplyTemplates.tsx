"use client";

import React, { useState } from "react";
import {
  X,
  BookOpen,
  Search,
  Plus,
  Trash2,
  Check,
  Star,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  MessageTemplate,
  TemplateCategory,
  Conversation,
} from "@/components/crm/types";
import { resolveTemplatePlaceholders } from "@/components/crm/selectors";
import { useCRM } from "@/components/crm/CRMProvider";

interface ReplyTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  activeConversation: Conversation | null;
  onSelectTemplate: (resolvedText: string) => void;
}

const CATEGORIES: ("all" | TemplateCategory)[] = [
  "all",
  "First response",
  "Lead qualification",
  "Pricing inquiry",
  "Appointment scheduling",
  "Proposal follow-up",
  "Customer support",
  "General replies",
];

export function ReplyTemplates({
  isOpen,
  onClose,
  activeConversation,
  onSelectTemplate,
}: ReplyTemplatesProps) {
  const { templates, createMessageTemplate, deleteMessageTemplate } = useCRM();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | TemplateCategory>("all");
  const [isCreating, setIsCreating] = useState(false);

  // New Template Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<TemplateCategory>("First response");
  const [newContent, setNewContent] = useState("");

  if (!isOpen) return null;

  // Context for resolving placeholders
  const placeholderContext = {
    contactName: activeConversation?.participant.name || "Aarav",
    companyName: activeConversation?.tags[0] || "Layers Studio",
    executiveName: activeConversation?.assignedOwner || "Sales Executive",
    dealValue: 75000,
  };

  const filtered = templates.filter((tpl) => {
    const matchesCat =
      selectedCategory === "all" || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.title.toLowerCase().includes(search.toLowerCase()) ||
      tpl.content.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    await createMessageTemplate({
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      isFavorite: false,
      channel: "all",
    });

    setNewTitle("");
    setNewContent("");
    setIsCreating(false);
  };

  const handleInsert = (tpl: MessageTemplate) => {
    const resolved = resolveTemplatePlaceholders(tpl.content, placeholderContext);
    onSelectTemplate(resolved);
    onClose();
  };

  return (
    <div className="bl-modal-backdrop" onClick={onClose}>
      <div
        className="bl-modal-content bl-templates-modal"
        style={{ maxWidth: "780px" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Smart Reply Templates"
      >
        {/* Header */}
        <div className="bl-between" style={{ marginBottom: "16px" }}>
          <div>
            <span className="bl-eyebrow">SAVED RESPONSES</span>
            <h3>Smart Reply Templates</h3>
            <p style={{ fontSize: "12px", color: "var(--muted)" }}>
              Standardize executive responses with dynamic customer & deal placeholders.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              type="button"
              className="bl-secondary bl-btn-compact"
              onClick={() => setIsCreating(!isCreating)}
            >
              <Plus size={14} /> {isCreating ? "Cancel" : "New Template"}
            </button>
            <button
              type="button"
              className="bl-icon"
              onClick={onClose}
              aria-label="Close templates modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Create Template Sub-Form */}
        {isCreating && (
          <form
            onSubmit={handleCreateTemplate}
            className="bl-create-template-card"
            style={{ marginBottom: "16px" }}
          >
            <div className="bl-form-grid bl-grid-2">
              <label>
                Template Title *
                <input
                  required
                  placeholder="e.g. Inbound Qualification"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </label>

              <label>
                Category
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as TemplateCategory)}
                >
                  {CATEGORIES.filter((c) => c !== "all").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>

              <label className="bl-full-field">
                Message Content with Placeholders *
                <textarea
                  rows={3}
                  required
                  placeholder="Hello {contact_name}, thank you for contacting us regarding {company_name}..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </label>
            </div>

            <div
              className="bl-between"
              style={{ marginTop: "10px", alignItems: "center" }}
            >
              <span className="bl-label-sub" style={{ fontSize: "11px" }}>
                Allowed tags: <code>{"{contact_name}"}</code>, <code>{"{company_name}"}</code>, <code>{"{executive_name}"}</code>, <code>{"{deal_value}"}</code>
              </span>
              <button type="submit" className="bl-primary bl-btn-compact">
                Save Template
              </button>
            </div>
          </form>
        )}

        {/* Search & Category Tabs */}
        <div className="bl-template-filter-bar">
          <div className="bl-search-input-wrap" style={{ width: "240px" }}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="bl-chips-scroll">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`bl-chip-pill ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid List */}
        <div className="bl-templates-list">
          {filtered.map((tpl) => {
            const preview = resolveTemplatePlaceholders(
              tpl.content,
              placeholderContext
            );

            return (
              <article key={tpl.id} className="bl-template-item-card">
                <div className="bl-between" style={{ alignItems: "flex-start" }}>
                  <div>
                    <span className="bl-tag-pill" style={{ fontSize: "10px" }}>
                      {tpl.category}
                    </span>
                    <h4 className="bl-template-title">{tpl.title}</h4>
                  </div>
                  <button
                    type="button"
                    className="bl-icon bl-icon-sm"
                    onClick={() => deleteMessageTemplate(tpl.id)}
                    title="Delete template"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Raw placeholder text */}
                <p className="bl-template-raw-text">{tpl.content}</p>

                {/* Resolved Live Preview */}
                <div className="bl-template-preview-box">
                  <div className="bl-preview-header">
                    <Sparkles size={11} color="var(--accent)" />
                    <span>Live Preview with active context:</span>
                  </div>
                  <p className="bl-template-resolved-text">{preview}</p>
                </div>

                <div className="bl-template-footer">
                  <button
                    type="button"
                    className="bl-primary bl-btn-compact"
                    onClick={() => handleInsert(tpl)}
                  >
                    <span>Insert into Composer</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </article>
            );
          })}

          {filtered.length === 0 && (
            <div className="bl-empty-stream" style={{ padding: "40px 0" }}>
              <BookOpen size={28} opacity={0.3} />
              <p>No reply templates match your filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
