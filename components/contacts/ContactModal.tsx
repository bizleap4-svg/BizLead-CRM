"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowUpRight, AlertCircle, Building2 } from "lucide-react";
import { Contact, Company, ContactLifecycle, PIPELINE_OWNERS } from "@/components/crm/types";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null; // null if creating new
  companies: Company[];
  existingContacts: Contact[];
  onSave: (data: Partial<Contact>) => Promise<void>;
}

export function ContactModal({
  isOpen,
  onClose,
  contact,
  companies,
  existingContacts,
  onSave,
}: ContactModalProps) {
  const [formData, setFormData] = useState<Partial<Contact>>({});
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  useEffect(() => {
    if (contact) {
      setFormData({ ...contact });
      setTagInput((contact.tags || []).join(", "));
    } else {
      setFormData({
        name: "",
        companyId: companies[0]?.id || "",
        companyName: companies[0]?.name || "",
        designation: "Director",
        email: "",
        phone: "+91 ",
        whatsapp: "",
        location: "Mumbai, India",
        linkedin: "",
        owner: PIPELINE_OWNERS[0],
        lifecycleStatus: "prospect",
        source: "Manual",
        relationshipScore: 75,
        tags: ["New Contact"],
        notes: "",
        isFavorite: false,
      });
      setTagInput("New Contact");
    }
    setDuplicateWarning(null);
  }, [contact, companies, isOpen]);

  if (!isOpen) return null;

  const isEditing = Boolean(contact);

  const handleFieldChange = (field: keyof Contact, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Duplicate email detection
    if (field === "email" && typeof value === "string") {
      const emailTrim = value.trim().toLowerCase();
      const duplicate = existingContacts.find(
        (c) => c.email.toLowerCase() === emailTrim && c.id !== contact?.id
      );
      if (duplicate) {
        setDuplicateWarning(
          `Notice: A contact with this email already exists (${duplicate.name} @ ${duplicate.companyName}).`
        );
      } else {
        setDuplicateWarning(null);
      }
    }

    // Auto-sync companyName when companyId changes
    if (field === "companyId") {
      const comp = companies.find((c) => c.id === value);
      if (comp) {
        setFormData((prev) => ({
          ...prev,
          companyId: comp.id,
          companyName: comp.name,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.email?.trim()) return;

    setIsSaving(true);
    try {
      const tagsArray = tagInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave({
        ...formData,
        tags: tagsArray,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bl-modal-backdrop" onClick={onClose}>
      <div
        className="bl-modal-content bl-contact-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={isEditing ? "Edit Contact" : "Create New Contact"}
      >
        <div className="bl-between" style={{ marginBottom: "18px" }}>
          <div>
            <span className="bl-eyebrow">CUSTOMER 360°</span>
            <h3>{isEditing ? `Edit ${contact?.name}` : "Create New Contact"}</h3>
            <p style={{ fontSize: "12px", color: "var(--muted)" }}>
              Manage customer profile and commercial relationships
            </p>
          </div>
          <button type="button" className="bl-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {duplicateWarning && (
          <div className="bl-warning-banner">
            <AlertCircle size={15} /> {duplicateWarning}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bl-form-grid">
          <label>
            Full Name *
            <input
              required
              placeholder="e.g. Aarav Sharma"
              value={formData.name || ""}
              onChange={(e) => handleFieldChange("name", e.target.value)}
            />
          </label>

          <label>
            Designation / Job Title
            <input
              placeholder="e.g. Chief Technology Officer"
              value={formData.designation || ""}
              onChange={(e) => handleFieldChange("designation", e.target.value)}
            />
          </label>

          <label>
            Organization / Company
            <select
              value={formData.companyId || ""}
              onChange={(e) => handleFieldChange("companyId", e.target.value)}
            >
              <option value="">Independent / No Company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.city})
                </option>
              ))}
            </select>
          </label>

          <label>
            Email Address *
            <input
              required
              type="email"
              placeholder="aarav@layersstudio.design"
              value={formData.email || ""}
              onChange={(e) => handleFieldChange("email", e.target.value)}
            />
          </label>

          <label>
            Phone Number
            <input
              placeholder="+91 98201 44521"
              value={formData.phone || ""}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
            />
          </label>

          <label>
            WhatsApp Number
            <input
              placeholder="+91 98201 44521"
              value={formData.whatsapp || ""}
              onChange={(e) => handleFieldChange("whatsapp", e.target.value)}
            />
          </label>

          <label>
            City & Location
            <input
              placeholder="e.g. Mumbai, India"
              value={formData.location || ""}
              onChange={(e) => handleFieldChange("location", e.target.value)}
            />
          </label>

          <label>
            LinkedIn URL
            <input
              placeholder="https://linkedin.com/in/..."
              value={formData.linkedin || ""}
              onChange={(e) => handleFieldChange("linkedin", e.target.value)}
            />
          </label>

          <label>
            Account Owner
            <select
              value={formData.owner || PIPELINE_OWNERS[0]}
              onChange={(e) => handleFieldChange("owner", e.target.value)}
            >
              {PIPELINE_OWNERS.map((ow) => (
                <option key={ow} value={ow}>
                  {ow}
                </option>
              ))}
            </select>
          </label>

          <label>
            Lifecycle Stage
            <select
              value={formData.lifecycleStatus || "prospect"}
              onChange={(e) =>
                handleFieldChange("lifecycleStatus", e.target.value as ContactLifecycle)
              }
            >
              <option value="lead">Lead</option>
              <option value="prospect">Prospect</option>
              <option value="customer">Customer</option>
              <option value="evangelist">Evangelist</option>
              <option value="churned">Churned</option>
            </select>
          </label>

          <label className="bl-full-field">
            Relationship Tags (comma separated)
            <input
              placeholder="e.g. Decision Maker, High Intent, VIP"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
            />
          </label>

          <label className="bl-full-field">
            Strategic Notes
            <textarea
              rows={3}
              placeholder="Context about the stakeholder, preferred communication channels, background..."
              value={formData.notes || ""}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
            />
          </label>

          <div className="bl-form-actions bl-full-field" style={{ marginTop: "14px" }}>
            <button type="button" className="bl-secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="bl-primary" disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create Contact"}
              <ArrowUpRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContactModal;
